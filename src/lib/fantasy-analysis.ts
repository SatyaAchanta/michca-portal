import { createHash } from "node:crypto";

import OpenAI from "openai";

import { GameResult, GameType, type Division } from "@/generated/prisma/client";
import { toSaturdayKey } from "@/lib/fantasy-dates";
import { isAbandonedResult } from "@/lib/game-results";
import { prisma } from "@/lib/prisma";

export const FANTASY_ANALYSIS_MIN_SCORED_PREDICTIONS = 10;
const FANTASY_ANALYSIS_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const FANTASY_ANALYSIS_DEFAULT_MODEL = "gpt-5-mini";
const RECENT_WEEK_WINDOW = 5;

export type FantasyAnalysisReportPayload = {
  goingWell: string[];
  canImprove: string[];
  howToImprove: string[];
};

export type FantasyAnalysisMetrics = {
  season: {
    scoredPredictions: number;
    accuracy: number;
    totalPoints: number;
    rank: number | null;
    percentile: number | null;
    participationRate: number | null;
    averagePointsPerPrediction: number;
  };
  recentTrend: {
    weeksAnalyzed: number;
    weeklyAccuracy: number[];
    weeklyPoints: number[];
    labels: string[];
    direction: "up" | "down" | "flat";
  };
  boosters: {
    used: number;
    remaining: number;
    accuracy: number | null;
    averagePoints: number | null;
  };
  comparisons: {
    overallAccuracyDelta: number;
    averagePointsDelta: number;
    boosterAccuracyDelta: number | null;
    majorityAccuracyDelta: number | null;
    contrarianAccuracyDelta: number | null;
  };
  tendencies: {
    majorityPickRate: number | null;
    majorityAccuracy: number | null;
    contrarianPickRate: number | null;
    contrarianAccuracy: number | null;
  };
  strengthsByDivision: Array<{ division: string; accuracy: number; deltaVsField: number }>;
  weaknessesByDivision: Array<{ division: string; accuracy: number; deltaVsField: number }>;
  strengthsByGameType: Array<{ gameType: "LEAGUE" | "PLAYOFF"; accuracy: number; deltaVsField: number }>;
  weaknessesByGameType: Array<{ gameType: "LEAGUE" | "PLAYOFF"; accuracy: number; deltaVsField: number }>;
};

export type FantasyAnalysisResponse =
  | {
      status: "ready";
      report: FantasyAnalysisReportPayload;
      metrics: FantasyAnalysisMetrics;
      generatedAt: string;
      expiresAt: string;
      modelName: string;
      source: "cache" | "generated";
      scoredPredictionCount: number;
    }
  | {
      status: "insufficient_data";
      scoredPredictionCount: number;
      minimumRequired: number;
      message: string;
    }
  | {
      status: "error";
      message: string;
    };

type UserProfileSnapshot = {
  id: string;
  fantasyPoints: number;
  boostersRemaining: number;
  fullParticipationWeeks: number;
};

type PredictionSnapshot = {
  userProfileId: string;
  predictedWinnerCode: string | null;
  isBoosted: boolean;
  isCorrect: boolean | null;
  pointsEarned: number | null;
  game: {
    id: string;
    date: Date;
    division: Division;
    gameType: GameType;
    resultType: GameResult;
    isDraw: boolean;
  };
};

type AggregatedStats = {
  total: number;
  correct: number;
  points: number;
};

type TrendWeek = {
  weekKey: string;
  total: number;
  correct: number;
  points: number;
};

type AnalysisComputation = {
  scoredPredictionCount: number;
  metrics: FantasyAnalysisMetrics;
  promptPayload: Record<string, unknown>;
  analyticsFingerprint: string;
};

function ratio(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return numerator / denominator;
}

function nullableRatio(numerator: number, denominator: number) {
  if (denominator <= 0) return null;
  return numerator / denominator;
}

function round(value: number, precision = 3) {
  return Number(value.toFixed(precision));
}

function sortByDeltaDescending<T extends { deltaVsField: number }>(rows: T[]) {
  return [...rows].sort((a, b) => b.deltaVsField - a.deltaVsField);
}

function getTrendDirection(weeklyAccuracy: number[]) {
  if (weeklyAccuracy.length < 2) return "flat" as const;
  const first = weeklyAccuracy[0] ?? 0;
  const last = weeklyAccuracy[weeklyAccuracy.length - 1] ?? 0;
  const delta = last - first;
  if (delta > 0.05) return "up" as const;
  if (delta < -0.05) return "down" as const;
  return "flat" as const;
}

function buildFingerprint(payload: Record<string, unknown>) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function isValidReportPayload(value: unknown): value is FantasyAnalysisReportPayload {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  const stringArray = (entry: unknown) =>
    Array.isArray(entry) && entry.every((item) => typeof item === "string");

  return (
    stringArray(candidate.goingWell) &&
    stringArray(candidate.canImprove) &&
    stringArray(candidate.howToImprove)
  );
}

export function computeFantasyAnalysisData(input: {
  userProfile: UserProfileSnapshot;
  userPredictions: PredictionSnapshot[];
  communityPredictions: PredictionSnapshot[];
  totalProfiles: number;
  higherScoringProfiles: number;
}): AnalysisComputation {
  const { userProfile, userPredictions, communityPredictions, totalProfiles, higherScoringProfiles } =
    input;

  const scoredPredictionCount = userPredictions.filter(
    (prediction) => !isAbandonedResult(prediction.game),
  ).length;

  const distinctLeagueWeeks = new Set(
    communityPredictions.map((prediction) => toSaturdayKey(new Date(prediction.game.date))),
  );
  const userWeeks = new Map<string, TrendWeek>();

  const userStats: AggregatedStats = { total: 0, correct: 0, points: 0 };
  const boosterStats: AggregatedStats = { total: 0, correct: 0, points: 0 };
  const majorityStats: AggregatedStats = { total: 0, correct: 0, points: 0 };
  const contrarianStats: AggregatedStats = { total: 0, correct: 0, points: 0 };

  const communityOverall: AggregatedStats = { total: 0, correct: 0, points: 0 };
  const communityBooster: AggregatedStats = { total: 0, correct: 0, points: 0 };
  const communityMajority: AggregatedStats = { total: 0, correct: 0, points: 0 };
  const communityContrarian: AggregatedStats = { total: 0, correct: 0, points: 0 };

  const divisionCommunity = new Map<string, AggregatedStats>();
  const divisionUser = new Map<string, AggregatedStats>();
  const gameTypeCommunity = new Map<string, AggregatedStats>();
  const gameTypeUser = new Map<string, AggregatedStats>();
  const gamePickPopularity = new Map<
    string,
    {
      counts: Map<string, number>;
      maxCount: number;
    }
  >();

  for (const prediction of communityPredictions) {
    if (isAbandonedResult(prediction.game)) {
      continue;
    }

    const divisionKey = prediction.game.division;
    const gameTypeKey = prediction.game.gameType;
    const isCorrect = Boolean(prediction.isCorrect);
    const pointsEarned = prediction.pointsEarned ?? 0;

    communityOverall.total += 1;
    communityOverall.correct += isCorrect ? 1 : 0;
    communityOverall.points += pointsEarned;

    if (prediction.isBoosted) {
      communityBooster.total += 1;
      communityBooster.correct += isCorrect ? 1 : 0;
      communityBooster.points += pointsEarned;
    }

    const divisionStats = divisionCommunity.get(divisionKey) ?? { total: 0, correct: 0, points: 0 };
    divisionStats.total += 1;
    divisionStats.correct += isCorrect ? 1 : 0;
    divisionStats.points += pointsEarned;
    divisionCommunity.set(divisionKey, divisionStats);

    const gameTypeStats = gameTypeCommunity.get(gameTypeKey) ?? { total: 0, correct: 0, points: 0 };
    gameTypeStats.total += 1;
    gameTypeStats.correct += isCorrect ? 1 : 0;
    gameTypeStats.points += pointsEarned;
    gameTypeCommunity.set(gameTypeKey, gameTypeStats);

    const popularity = gamePickPopularity.get(prediction.game.id) ?? {
      counts: new Map<string, number>(),
      maxCount: 0,
    };
    const pickKey = prediction.predictedWinnerCode ?? "__DRAW__";
    const nextCount = (popularity.counts.get(pickKey) ?? 0) + 1;
    popularity.counts.set(pickKey, nextCount);
    popularity.maxCount = Math.max(popularity.maxCount, nextCount);
    gamePickPopularity.set(prediction.game.id, popularity);
  }

  for (const prediction of communityPredictions) {
    if (isAbandonedResult(prediction.game)) {
      continue;
    }

    const popularity = gamePickPopularity.get(prediction.game.id);
    const pickKey = prediction.predictedWinnerCode ?? "__DRAW__";
    const isMajorityPick =
      popularity !== undefined &&
      (popularity.counts.get(pickKey) ?? 0) === popularity.maxCount;
    const isCorrect = Boolean(prediction.isCorrect);
    const pointsEarned = prediction.pointsEarned ?? 0;

    if (isMajorityPick) {
      communityMajority.total += 1;
      communityMajority.correct += isCorrect ? 1 : 0;
      communityMajority.points += pointsEarned;
    } else {
      communityContrarian.total += 1;
      communityContrarian.correct += isCorrect ? 1 : 0;
      communityContrarian.points += pointsEarned;
    }
  }

  for (const prediction of userPredictions) {
    if (isAbandonedResult(prediction.game)) {
      continue;
    }

    const weekKey = toSaturdayKey(new Date(prediction.game.date));
    const existingWeek = userWeeks.get(weekKey) ?? {
      weekKey,
      total: 0,
      correct: 0,
      points: 0,
    };
    const divisionKey = prediction.game.division;
    const gameTypeKey = prediction.game.gameType;
    const isCorrect = Boolean(prediction.isCorrect);
    const pointsEarned = prediction.pointsEarned ?? 0;

    userStats.total += 1;
    userStats.correct += isCorrect ? 1 : 0;
    userStats.points += pointsEarned;

    existingWeek.total += 1;
    existingWeek.correct += isCorrect ? 1 : 0;
    existingWeek.points += pointsEarned;
    userWeeks.set(weekKey, existingWeek);

    if (prediction.isBoosted) {
      boosterStats.total += 1;
      boosterStats.correct += isCorrect ? 1 : 0;
      boosterStats.points += pointsEarned;
    }

    const divisionStats = divisionUser.get(divisionKey) ?? { total: 0, correct: 0, points: 0 };
    divisionStats.total += 1;
    divisionStats.correct += isCorrect ? 1 : 0;
    divisionStats.points += pointsEarned;
    divisionUser.set(divisionKey, divisionStats);

    const gameTypeStats = gameTypeUser.get(gameTypeKey) ?? { total: 0, correct: 0, points: 0 };
    gameTypeStats.total += 1;
    gameTypeStats.correct += isCorrect ? 1 : 0;
    gameTypeStats.points += pointsEarned;
    gameTypeUser.set(gameTypeKey, gameTypeStats);

    const popularity = gamePickPopularity.get(prediction.game.id);
    const pickKey = prediction.predictedWinnerCode ?? "__DRAW__";
    const isMajorityPick =
      popularity !== undefined &&
      (popularity.counts.get(pickKey) ?? 0) === popularity.maxCount;

    if (isMajorityPick) {
      majorityStats.total += 1;
      majorityStats.correct += isCorrect ? 1 : 0;
      majorityStats.points += pointsEarned;
    } else {
      contrarianStats.total += 1;
      contrarianStats.correct += isCorrect ? 1 : 0;
      contrarianStats.points += pointsEarned;
    }
  }

  const recentWeeks = [...userWeeks.values()]
    .sort((a, b) => a.weekKey.localeCompare(b.weekKey))
    .slice(-RECENT_WEEK_WINDOW);
  const weeklyAccuracy = recentWeeks.map((week) => round(ratio(week.correct, week.total)));
  const weeklyPoints = recentWeeks.map((week) => week.points);
  const weekLabels = recentWeeks.map((week) => week.weekKey);

  const communityAccuracy = ratio(communityOverall.correct, communityOverall.total);
  const communityAvgPoints = ratio(communityOverall.points, communityOverall.total);
  const userAccuracy = ratio(userStats.correct, userStats.total);
  const userAvgPoints = ratio(userStats.points, userStats.total);

  const divisions = [...divisionUser.entries()].map(([division, stats]) => {
    const field = divisionCommunity.get(division) ?? { total: 0, correct: 0, points: 0 };
    return {
      division,
      accuracy: round(ratio(stats.correct, stats.total)),
      deltaVsField: round(ratio(stats.correct, stats.total) - ratio(field.correct, field.total)),
    };
  });
  const gameTypes = [...gameTypeUser.entries()].map(([gameType, stats]) => {
    const field = gameTypeCommunity.get(gameType) ?? { total: 0, correct: 0, points: 0 };
    return {
      gameType: gameType as "LEAGUE" | "PLAYOFF",
      accuracy: round(ratio(stats.correct, stats.total)),
      deltaVsField: round(ratio(stats.correct, stats.total) - ratio(field.correct, field.total)),
    };
  });

  const metrics: FantasyAnalysisMetrics = {
    season: {
      scoredPredictions: scoredPredictionCount,
      accuracy: round(userAccuracy),
      totalPoints: userProfile.fantasyPoints,
      rank: userProfile.fantasyPoints > 0 ? higherScoringProfiles + 1 : null,
      percentile:
        totalProfiles > 0 && userProfile.fantasyPoints > 0
          ? Math.max(0, Math.round(((totalProfiles - higherScoringProfiles) / totalProfiles) * 100))
          : null,
      participationRate:
        distinctLeagueWeeks.size > 0
          ? round(userWeeks.size / distinctLeagueWeeks.size)
          : null,
      averagePointsPerPrediction: round(userAvgPoints),
    },
    recentTrend: {
      weeksAnalyzed: recentWeeks.length,
      weeklyAccuracy,
      weeklyPoints,
      labels: weekLabels,
      direction: getTrendDirection(weeklyAccuracy),
    },
    boosters: {
      used: boosterStats.total,
      remaining: userProfile.boostersRemaining,
      accuracy: boosterStats.total > 0 ? round(ratio(boosterStats.correct, boosterStats.total)) : null,
      averagePoints: boosterStats.total > 0 ? round(ratio(boosterStats.points, boosterStats.total)) : null,
    },
    comparisons: {
      overallAccuracyDelta: round(userAccuracy - communityAccuracy),
      averagePointsDelta: round(userAvgPoints - communityAvgPoints),
      boosterAccuracyDelta:
        boosterStats.total > 0 && communityBooster.total > 0
          ? round(ratio(boosterStats.correct, boosterStats.total) - ratio(communityBooster.correct, communityBooster.total))
          : null,
      majorityAccuracyDelta:
        majorityStats.total > 0 && communityMajority.total > 0
          ? round(ratio(majorityStats.correct, majorityStats.total) - ratio(communityMajority.correct, communityMajority.total))
          : null,
      contrarianAccuracyDelta:
        contrarianStats.total > 0 && communityContrarian.total > 0
          ? round(ratio(contrarianStats.correct, contrarianStats.total) - ratio(communityContrarian.correct, communityContrarian.total))
          : null,
    },
    tendencies: {
      majorityPickRate: nullableRatio(majorityStats.total, userStats.total),
      majorityAccuracy: nullableRatio(majorityStats.correct, majorityStats.total),
      contrarianPickRate: nullableRatio(contrarianStats.total, userStats.total),
      contrarianAccuracy: nullableRatio(contrarianStats.correct, contrarianStats.total),
    },
    strengthsByDivision: sortByDeltaDescending(divisions).slice(0, 2),
    weaknessesByDivision: sortByDeltaDescending(divisions).slice(-2).reverse(),
    strengthsByGameType: sortByDeltaDescending(gameTypes).slice(0, 2),
    weaknessesByGameType: sortByDeltaDescending(gameTypes).slice(-2).reverse(),
  };

  const promptPayload = {
    minimumScoredPredictions: FANTASY_ANALYSIS_MIN_SCORED_PREDICTIONS,
    season: metrics.season,
    recentTrend: metrics.recentTrend,
    boosters: metrics.boosters,
    comparisons: metrics.comparisons,
    tendencies: {
      majorityPickRate:
        metrics.tendencies.majorityPickRate === null
          ? null
          : round(metrics.tendencies.majorityPickRate),
      majorityAccuracy:
        metrics.tendencies.majorityAccuracy === null
          ? null
          : round(metrics.tendencies.majorityAccuracy),
      contrarianPickRate:
        metrics.tendencies.contrarianPickRate === null
          ? null
          : round(metrics.tendencies.contrarianPickRate),
      contrarianAccuracy:
        metrics.tendencies.contrarianAccuracy === null
          ? null
          : round(metrics.tendencies.contrarianAccuracy),
    },
    strengthsByDivision: metrics.strengthsByDivision,
    weaknessesByDivision: metrics.weaknessesByDivision,
    strengthsByGameType: metrics.strengthsByGameType,
    weaknessesByGameType: metrics.weaknessesByGameType,
    fullParticipationWeeks: userProfile.fullParticipationWeeks,
  };

  return {
    scoredPredictionCount,
    metrics,
    promptPayload,
    analyticsFingerprint: buildFingerprint(promptPayload),
  };
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  return new OpenAI({ apiKey });
}

function summarizeResponseOutput(output: unknown) {
  if (!Array.isArray(output)) {
    return [];
  }

  return output.map((item) => {
    if (!item || typeof item !== "object") {
      return { type: "unknown" };
    }

    const candidate = item as {
      type?: string;
      role?: string;
      content?: Array<{ type?: string }>;
    };

    return {
      type: candidate.type ?? "unknown",
      role: candidate.role ?? null,
      contentTypes: Array.isArray(candidate.content)
        ? candidate.content.map((entry) => entry?.type ?? "unknown")
        : [],
    };
  });
}

function extractResponseRefusal(output: unknown) {
  if (!Array.isArray(output)) {
    return null;
  }

  for (const item of output) {
    if (!item || typeof item !== "object") continue;

    const candidate = item as {
      content?: Array<{ type?: string; refusal?: string }>;
    };

    if (!Array.isArray(candidate.content)) continue;

    for (const contentItem of candidate.content) {
      if (contentItem?.type === "refusal" && typeof contentItem.refusal === "string") {
        return contentItem.refusal;
      }
    }
  }

  return null;
}

async function generateFantasyAnalysisReport(
  promptPayload: Record<string, unknown>,
  modelName: string,
) {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: modelName,
    max_output_tokens: 1500,
    reasoning: {
      effort: 'minimal',
    },
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "You write compact, read-only fantasy cricket performance guidance. Use only the supplied analytics payload. Base the analysis primarily on division-level performance. Translate metrics into plain user-facing cricket and fantasy language. Do not mention technical analytics terms such as delta, percentile, rank percentile, standard deviation, correlation, or raw field-comparison labels. Do not invent missing facts. Keep the tone direct, practical, and non-chatty. Each section must have a distinct purpose: goingWell is only for positive observations, canImprove is only for the specific division or pick pattern that needs attention, and howToImprove is only for concrete next actions. Do not repeat the same sentence or same advice across sections. When naming a division, start the item with the division name. If there is no meaningful issue for a division, say: Keep up the good work here.",
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Generate concise fantasy guidance from this analytics payload.

Rules:
- Return exactly three sections: goingWell, canImprove, howToImprove.
- Focus on divisions first.
- goingWell: mention divisions or patterns that are working.
- canImprove: mention only where performance can improve; do not include advice here.
- howToImprove: give specific next actions; do not restate the problem.
- Avoid repeating the same division insight in multiple sections.
- Prefer 1-2 clear bullets per section unless the data strongly supports 3.
- Use recent trend, boosters, and pick tendencies only when they explain division performance.
- If everything looks good, use: Keep up the good work here.

Analytics payload:
${JSON.stringify(promptPayload, null, 2)}`,
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "fantasy_analysis_report",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            goingWell: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
              maxItems: 3,
            },
            canImprove: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
              maxItems: 3,
            },
            howToImprove: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
              maxItems: 3,
            },
          },
          required: [
            "goingWell",
            "canImprove",
            "howToImprove",
          ],
        },
      },
    },
  });

  const refusal = extractResponseRefusal(response.output);
  if (refusal) {
    console.error("OpenAI refused fantasy AI analysis request:", {
      modelName,
      refusal,
      status: response.status,
      responseId: response.id,
    });
    throw new Error("OpenAI refused to generate fantasy analysis.");
  }

  if (response.status === "incomplete") {
    console.error("OpenAI returned incomplete fantasy AI analysis:", {
      modelName,
      responseId: response.id,
      incompleteDetails: response.incomplete_details,
      error: response.error,
      outputSummary: summarizeResponseOutput(response.output),
    });
    throw new Error("OpenAI returned an incomplete fantasy analysis response.");
  }

  const content = response.output_text?.trim();
  if (!content) {
    console.error("OpenAI returned empty fantasy AI analysis output:", {
      modelName,
      responseId: response.id,
      status: response.status,
      error: response.error,
      incompleteDetails: response.incomplete_details,
      outputSummary: summarizeResponseOutput(response.output),
    });
    throw new Error("OpenAI returned an empty fantasy analysis response.");
  }

  const parsed = JSON.parse(content);
  if (!isValidReportPayload(parsed)) {
    console.error("OpenAI returned invalid fantasy AI analysis payload:", {
      modelName,
      responseId: response.id,
      content,
    });
    throw new Error("OpenAI returned an invalid fantasy analysis payload.");
  }

  return parsed;
}

export async function getFantasyAnalysisForUser(
  userProfileId: string,
): Promise<FantasyAnalysisResponse> {
  try {
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userProfileId },
      select: {
        id: true,
        fantasyPoints: true,
        boostersRemaining: true,
        fullParticipationWeeks: true,
      },
    });

    if (!userProfile) {
      return { status: "error", message: "Profile not found." };
    }

    const [userPredictions, communityPredictions, totalProfiles, higherScoringProfiles] =
      await Promise.all([
        prisma.prediction.findMany({
          where: {
            userProfileId,
            isScored: true,
            game: {
              resultType: { not: GameResult.ABANDONED },
            },
          },
          orderBy: { game: { date: "asc" } },
          select: {
            userProfileId: true,
            predictedWinnerCode: true,
            isBoosted: true,
            isCorrect: true,
            pointsEarned: true,
            game: {
              select: {
                id: true,
                date: true,
                division: true,
                gameType: true,
                resultType: true,
                isDraw: true,
              },
            },
          },
        }),
        prisma.prediction.findMany({
          where: {
            isScored: true,
            game: {
              resultType: { not: GameResult.ABANDONED },
            },
          },
          select: {
            userProfileId: true,
            predictedWinnerCode: true,
            isBoosted: true,
            isCorrect: true,
            pointsEarned: true,
            game: {
              select: {
                id: true,
                date: true,
                division: true,
                gameType: true,
                resultType: true,
                isDraw: true,
              },
            },
          },
        }),
        prisma.userProfile.count(),
        userProfile.fantasyPoints > 0
          ? prisma.userProfile.count({
              where: {
                fantasyPoints: { gt: userProfile.fantasyPoints },
              },
            })
          : Promise.resolve(0),
      ]);

    if (userPredictions.length < FANTASY_ANALYSIS_MIN_SCORED_PREDICTIONS) {
      return {
        status: "insufficient_data",
        scoredPredictionCount: userPredictions.length,
        minimumRequired: FANTASY_ANALYSIS_MIN_SCORED_PREDICTIONS,
        message:
          "AI Analysis becomes available after 10 scored predictions. Keep making picks and return once more results are locked in.",
      };
    }

    const computation = computeFantasyAnalysisData({
      userProfile,
      userPredictions,
      communityPredictions,
      totalProfiles,
      higherScoringProfiles,
    });
    const modelName = process.env.OPENAI_MODEL?.trim() || FANTASY_ANALYSIS_DEFAULT_MODEL;
    const now = new Date();

    const cached = await prisma.fantasyAnalysisReport.findUnique({
      where: { userProfileId },
      select: {
        modelName: true,
        analyticsFingerprint: true,
        reportPayload: true,
        generatedAt: true,
        expiresAt: true,
      },
    });

    if (
      cached &&
      cached.modelName === modelName &&
      cached.analyticsFingerprint === computation.analyticsFingerprint &&
      cached.expiresAt > now &&
      isValidReportPayload(cached.reportPayload)
    ) {
      return {
        status: "ready",
        report: cached.reportPayload,
        metrics: computation.metrics,
        generatedAt: cached.generatedAt.toISOString(),
        expiresAt: cached.expiresAt.toISOString(),
        modelName: cached.modelName,
        source: "cache",
        scoredPredictionCount: computation.scoredPredictionCount,
      };
    }

    const report = await generateFantasyAnalysisReport(computation.promptPayload, modelName);
    const expiresAt = new Date(now.getTime() + FANTASY_ANALYSIS_CACHE_TTL_MS);

    const persisted = await prisma.fantasyAnalysisReport.upsert({
      where: { userProfileId },
      update: {
        modelName,
        analyticsFingerprint: computation.analyticsFingerprint,
        reportPayload: report,
        generatedAt: now,
        expiresAt,
      },
      create: {
        userProfileId,
        modelName,
        analyticsFingerprint: computation.analyticsFingerprint,
        reportPayload: report,
        generatedAt: now,
        expiresAt,
      },
      select: {
        modelName: true,
        reportPayload: true,
        generatedAt: true,
        expiresAt: true,
      },
    });

    return {
      status: "ready",
      report: persisted.reportPayload as FantasyAnalysisReportPayload,
      metrics: computation.metrics,
      generatedAt: persisted.generatedAt.toISOString(),
      expiresAt: persisted.expiresAt.toISOString(),
      modelName: persisted.modelName,
      source: "generated",
      scoredPredictionCount: computation.scoredPredictionCount,
    };
  } catch (error) {
    console.error("Failed to generate fantasy AI analysis:", error);
    return {
      status: "error",
      message:
        "AI Analysis is unavailable right now. Please try again shortly.",
    };
  }
}
