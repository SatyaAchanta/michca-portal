const {
  userProfileFindUnique,
  userProfileCount,
  predictionFindMany,
  fantasyAnalysisReportFindUnique,
  fantasyAnalysisReportUpsert,
  responsesCreate,
} = vi.hoisted(() => ({
  userProfileFindUnique: vi.fn(),
  userProfileCount: vi.fn(),
  predictionFindMany: vi.fn(),
  fantasyAnalysisReportFindUnique: vi.fn(),
  fantasyAnalysisReportUpsert: vi.fn(),
  responsesCreate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userProfile: {
      findUnique: userProfileFindUnique,
      count: userProfileCount,
    },
    prediction: {
      findMany: predictionFindMany,
    },
    fantasyAnalysisReport: {
      findUnique: fantasyAnalysisReportFindUnique,
      upsert: fantasyAnalysisReportUpsert,
    },
  },
}));

vi.mock("openai", () => ({
  default: class OpenAI {
    responses = {
      create: responsesCreate,
    };
  },
}));

import {
  FANTASY_ANALYSIS_MIN_SCORED_PREDICTIONS,
  computeFantasyAnalysisData,
  getFantasyAnalysisForUser,
} from "@/lib/fantasy-analysis";

function createPrediction(overrides: Partial<{
  userProfileId: string;
  predictedWinnerCode: string | null;
  isBoosted: boolean;
  isCorrect: boolean | null;
  pointsEarned: number | null;
  gameId: string;
  date: string;
  division: "PREMIER_T20" | "DIV1_T20";
  gameType: "LEAGUE" | "PLAYOFF";
}> = {}) {
  return {
    userProfileId: overrides.userProfileId ?? "user-1",
    predictedWinnerCode:
      overrides.predictedWinnerCode === undefined
        ? "AAA"
        : overrides.predictedWinnerCode,
    isBoosted: overrides.isBoosted ?? false,
    isCorrect: overrides.isCorrect ?? true,
    pointsEarned: overrides.pointsEarned ?? 1,
    game: {
      id: overrides.gameId ?? "game-1",
      date: new Date(overrides.date ?? "2026-05-10T15:00:00.000Z"),
      division: overrides.division ?? "PREMIER_T20",
      gameType: overrides.gameType ?? "LEAGUE",
    },
  };
}

describe("computeFantasyAnalysisData", () => {
  it("computes season, trend, and comparison metrics from scored predictions", () => {
    const userProfile = {
      id: "user-1",
      fantasyPoints: 16,
      boostersRemaining: 7,
      fullParticipationWeeks: 2,
    };
    const userPredictions = [
      createPrediction({ gameId: "g1", date: "2026-05-03T15:00:00.000Z", isCorrect: true, pointsEarned: 1 }),
      createPrediction({ gameId: "g2", date: "2026-05-03T18:00:00.000Z", predictedWinnerCode: "BBB", isCorrect: false, pointsEarned: 0 }),
      createPrediction({ gameId: "g3", date: "2026-05-10T15:00:00.000Z", isBoosted: true, isCorrect: true, pointsEarned: 3 }),
      createPrediction({ gameId: "g4", date: "2026-05-10T18:00:00.000Z", predictedWinnerCode: null, isCorrect: false, pointsEarned: 0, division: "DIV1_T20" }),
    ];
    const communityPredictions = [
      ...userPredictions,
      createPrediction({ userProfileId: "user-2", gameId: "g1", date: "2026-05-03T15:00:00.000Z", predictedWinnerCode: "AAA", isCorrect: true, pointsEarned: 1 }),
      createPrediction({ userProfileId: "user-2", gameId: "g2", date: "2026-05-03T18:00:00.000Z", predictedWinnerCode: "AAA", isCorrect: true, pointsEarned: 1 }),
      createPrediction({ userProfileId: "user-2", gameId: "g3", date: "2026-05-10T15:00:00.000Z", predictedWinnerCode: "AAA", isBoosted: true, isCorrect: false, pointsEarned: 0 }),
      createPrediction({ userProfileId: "user-2", gameId: "g4", date: "2026-05-10T18:00:00.000Z", predictedWinnerCode: "AAA", isCorrect: true, pointsEarned: 1, division: "DIV1_T20" }),
    ];

    const result = computeFantasyAnalysisData({
      userProfile,
      userPredictions,
      communityPredictions,
      totalProfiles: 4,
      higherScoringProfiles: 1,
    });

    expect(result.scoredPredictionCount).toBe(4);
    expect(result.metrics.season.accuracy).toBe(0.5);
    expect(result.metrics.season.rank).toBe(2);
    expect(result.metrics.season.percentile).toBe(75);
    expect(result.metrics.boosters.used).toBe(1);
    expect(result.metrics.boosters.accuracy).toBe(1);
    expect(result.metrics.recentTrend.weeksAnalyzed).toBe(2);
    expect(result.metrics.recentTrend.weeklyPoints).toEqual([1, 3]);
    expect(result.metrics.recentTrend.direction).toBe("flat");
    expect(result.metrics.comparisons.overallAccuracyDelta).toBe(-0.125);
    expect(result.metrics.strengthsByDivision[0]?.division).toBe("PREMIER_T20");
    expect(result.analyticsFingerprint).toHaveLength(64);
  });
});

describe("getFantasyAnalysisForUser", () => {
  const userProfile = {
    id: "user-1",
    fantasyPoints: 24,
    boostersRemaining: 4,
    fullParticipationWeeks: 3,
  };
  const userPredictions = Array.from({ length: 10 }, (_, index) =>
    createPrediction({
      gameId: `g${index + 1}`,
      date: index < 5 ? "2026-05-03T15:00:00.000Z" : "2026-05-10T15:00:00.000Z",
      predictedWinnerCode: index % 3 === 0 ? "AAA" : "BBB",
      isBoosted: index === 2 || index === 7,
      isCorrect: index % 2 === 0,
      pointsEarned: index % 2 === 0 ? (index === 2 || index === 7 ? 3 : 1) : 0,
      division: index % 2 === 0 ? "PREMIER_T20" : "DIV1_T20",
      gameType: index === 9 ? "PLAYOFF" : "LEAGUE",
    }),
  );
  const communityPredictions = [
    ...userPredictions,
    ...Array.from({ length: 10 }, (_, index) =>
      createPrediction({
        userProfileId: "user-2",
        gameId: `g${index + 1}`,
        date: index < 5 ? "2026-05-03T15:00:00.000Z" : "2026-05-10T15:00:00.000Z",
        predictedWinnerCode: index % 2 === 0 ? "AAA" : "BBB",
        isBoosted: index === 1,
        isCorrect: true,
        pointsEarned: index === 1 ? 3 : 1,
        division: index % 2 === 0 ? "PREMIER_T20" : "DIV1_T20",
        gameType: index === 9 ? "PLAYOFF" : "LEAGUE",
      }),
    ),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "test-key";
    delete process.env.OPENAI_MODEL;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns insufficient data when the user lacks enough scored predictions", async () => {
    userProfileFindUnique.mockResolvedValue(userProfile);
    predictionFindMany.mockResolvedValueOnce(userPredictions.slice(0, 2));
    predictionFindMany.mockResolvedValueOnce(communityPredictions);
    userProfileCount.mockResolvedValueOnce(12);
    userProfileCount.mockResolvedValueOnce(2);

    const result = await getFantasyAnalysisForUser("user-1");

    expect(result).toEqual({
      status: "insufficient_data",
      scoredPredictionCount: 2,
      minimumRequired: FANTASY_ANALYSIS_MIN_SCORED_PREDICTIONS,
      message:
        "AI Analysis becomes available after 10 scored predictions. Keep making picks and return once more results are locked in.",
    });
    expect(fantasyAnalysisReportFindUnique).not.toHaveBeenCalled();
    expect(responsesCreate).not.toHaveBeenCalled();
  });

  it("reuses a cached report when the fingerprint and expiry still match", async () => {
    userProfileFindUnique.mockResolvedValue(userProfile);
    predictionFindMany.mockResolvedValueOnce(userPredictions);
    predictionFindMany.mockResolvedValueOnce(communityPredictions);
    userProfileCount.mockResolvedValueOnce(12);
    userProfileCount.mockResolvedValueOnce(2);

    const computation = computeFantasyAnalysisData({
      userProfile,
      userPredictions,
      communityPredictions,
      totalProfiles: 12,
      higherScoringProfiles: 2,
    });
    const cachedReport = {
      summary: "Cached summary",
      strengths: ["Strong recent form", "Good playoff reads"],
      weaknesses: ["Boosters need work", "Division 1 has slipped"],
      recommendations: ["Stay selective with boosts", "Lean into Premier form"],
      confidenceNote: "Sample size is now stable.",
    };

    fantasyAnalysisReportFindUnique.mockResolvedValue({
      modelName: "gpt-5-mini",
      analyticsFingerprint: computation.analyticsFingerprint,
      reportPayload: cachedReport,
      generatedAt: new Date("2026-05-15T12:00:00.000Z"),
      expiresAt: new Date("2026-05-22T12:00:00.000Z"),
    });

    const result = await getFantasyAnalysisForUser("user-1");

    expect(result.status).toBe("ready");
    if (result.status !== "ready") {
      throw new Error("Expected cached fantasy analysis result.");
    }

    expect(result.source).toBe("cache");
    expect(result.report.summary).toBe("Cached summary");
    expect(responsesCreate).not.toHaveBeenCalled();
    expect(fantasyAnalysisReportUpsert).not.toHaveBeenCalled();
  });

  it("generates and persists a new report when no valid cache exists", async () => {
    userProfileFindUnique.mockResolvedValue(userProfile);
    predictionFindMany.mockResolvedValueOnce(userPredictions);
    predictionFindMany.mockResolvedValueOnce(communityPredictions);
    userProfileCount.mockResolvedValueOnce(12);
    userProfileCount.mockResolvedValueOnce(2);
    fantasyAnalysisReportFindUnique.mockResolvedValue(null);
    responsesCreate.mockResolvedValue({
      output_text: JSON.stringify({
        summary: "You are above average overall but too volatile on boosted picks.",
        strengths: ["Season accuracy remains solid.", "Premier T20 reads are ahead of the field."],
        weaknesses: ["Boosted picks are not converting enough.", "Recent contrarian shots have cooled."],
        recommendations: ["Use boosts only on your strongest edges.", "Scale back low-confidence contrarian picks."],
        confidenceNote: "The advice is based on a meaningful scored sample.",
      }),
    });
    fantasyAnalysisReportUpsert.mockImplementation(async ({ update }: { update: Record<string, unknown> }) => ({
      modelName: update.modelName,
      reportPayload: update.reportPayload,
      generatedAt: update.generatedAt,
      expiresAt: update.expiresAt,
    }));

    const result = await getFantasyAnalysisForUser("user-1");

    expect(result.status).toBe("ready");
    if (result.status !== "ready") {
      throw new Error("Expected generated fantasy analysis result.");
    }

    expect(result.source).toBe("generated");
    expect(result.report.recommendations).toHaveLength(2);
    expect(responsesCreate).toHaveBeenCalledTimes(1);
    expect(fantasyAnalysisReportUpsert).toHaveBeenCalledTimes(1);
  });

  it("returns a graceful error when OpenAI responds without output text", async () => {
    userProfileFindUnique.mockResolvedValue(userProfile);
    predictionFindMany.mockResolvedValueOnce(userPredictions);
    predictionFindMany.mockResolvedValueOnce(communityPredictions);
    userProfileCount.mockResolvedValueOnce(12);
    userProfileCount.mockResolvedValueOnce(2);
    fantasyAnalysisReportFindUnique.mockResolvedValue(null);
    responsesCreate.mockResolvedValue({
      id: "resp_empty",
      status: "completed",
      output_text: "",
      output: [
        {
          type: "message",
          role: "assistant",
          content: [],
        },
      ],
      error: null,
      incomplete_details: null,
    });

    const result = await getFantasyAnalysisForUser("user-1");

    expect(result).toEqual({
      status: "error",
      message: "AI Analysis is unavailable right now. Please try again shortly.",
    });
    expect(fantasyAnalysisReportUpsert).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });
});
