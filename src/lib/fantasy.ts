import { GameType } from "@/generated/prisma/client";
import { getGameWeekKey } from "@/lib/fantasy-dates";
import { prisma } from "@/lib/prisma";

// ─── Point values ────────────────────────────────────────────────────────────

const POINTS = {
  LEAGUE_CORRECT: 1,
  PLAYOFF_CORRECT: 3,
  BOOSTER_MULTIPLIER: 3,
} as const;

// ─── Booster eligibility ─────────────────────────────────────────────────────
// Boosters unlock after 2 full league weeks of predictions.

export const FULL_WEEKS_FOR_BOOSTERS = 2;
export const SEASON_BOOSTER_COUNT = 10;

export function canUseBoosters(fullParticipationWeeks: number): boolean {
  return fullParticipationWeeks >= FULL_WEEKS_FOR_BOOSTERS;
}

// ─── Base points for a game ───────────────────────────────────────────────────

export function getBasePointsForGame(gameType: GameType): number {
  return gameType === GameType.PLAYOFF
    ? POINTS.PLAYOFF_CORRECT
    : POINTS.LEAGUE_CORRECT;
}

export function getPointsForGame(gameType: GameType, isBoosted: boolean): number {
  const base = getBasePointsForGame(gameType);
  return isBoosted ? base * POINTS.BOOSTER_MULTIPLIER : base;
}

type PredictionUpdate = {
  id: string;
  userProfileId: string;
  isCorrect: boolean;
  pointsEarned: number;
};

type GameWeekScoringData = {
  predictionUpdates: PredictionUpdate[];
  userPointsMap: Map<string, number>;
  affectedUserIds: string[];
  fullParticipants: Set<string>;
  totalPointsAwarded: number;
};

function groupPredictionUpdates(predictionUpdates: PredictionUpdate[]) {
  const grouped = new Map<
    string,
    { ids: string[]; isCorrect: boolean; pointsEarned: number }
  >();

  for (const update of predictionUpdates) {
    const key = `${update.isCorrect}:${update.pointsEarned}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.ids.push(update.id);
      continue;
    }
    grouped.set(key, {
      ids: [update.id],
      isCorrect: update.isCorrect,
      pointsEarned: update.pointsEarned,
    });
  }

  return Array.from(grouped.values());
}

async function buildGameWeekScoringData(
  gameWeekKey: string,
): Promise<GameWeekScoringData> {
  // Find all COMPLETED games in this week that have unscored predictions
  const games = await prisma.game.findMany({
    where: { status: "COMPLETED" },
    select: {
      id: true,
      date: true,
      gameType: true,
      winnerCode: true,
      isDraw: true,
      predictions: {
        where: { isScored: false },
        select: {
          id: true,
          userProfileId: true,
          predictedWinnerCode: true,
          isBoosted: true,
        },
      },
    },
  });

  const weekGames = games.filter(
    (g) => getGameWeekKey(new Date(g.date)) === gameWeekKey,
  );

  if (weekGames.length === 0) {
    return {
      predictionUpdates: [],
      userPointsMap: new Map(),
      affectedUserIds: [],
      fullParticipants: new Set(),
      totalPointsAwarded: 0,
    };
  }

  const leagueGames = weekGames.filter((g) => g.gameType === GameType.LEAGUE);
  const leagueGameIds = new Set(leagueGames.map((g) => g.id));

  const allPredictions = weekGames.flatMap((g) =>
    g.predictions.map((p) => ({ ...p, game: g })),
  );

  if (allPredictions.length === 0) {
    return {
      predictionUpdates: [],
      userPointsMap: new Map(),
      affectedUserIds: [],
      fullParticipants: new Set(),
      totalPointsAwarded: 0,
    };
  }

  const userPointsMap = new Map<string, number>();
  const predictionUpdates: PredictionUpdate[] = [];

  for (const pred of allPredictions) {
    const { game } = pred;

    const isCorrect = game.isDraw
      ? pred.predictedWinnerCode === null
      : pred.predictedWinnerCode === game.winnerCode;

    const pointsEarned = isCorrect
      ? getPointsForGame(game.gameType, pred.isBoosted)
      : 0;

    predictionUpdates.push({
      id: pred.id,
      userProfileId: pred.userProfileId,
      isCorrect,
      pointsEarned,
    });

    if (pointsEarned > 0) {
      userPointsMap.set(
        pred.userProfileId,
        (userPointsMap.get(pred.userProfileId) ?? 0) + pointsEarned,
      );
    }
  }

  const affectedUserIds = [
    ...new Set(allPredictions.map((p) => p.userProfileId)),
  ];

  const fullParticipants = new Set<string>();
  if (leagueGames.length > 0) {
    for (const userId of affectedUserIds) {
      const userLeaguePredCountThisWeek = allPredictions.filter(
        (p) => p.userProfileId === userId && leagueGameIds.has(p.game.id),
      ).length;
      if (userLeaguePredCountThisWeek === leagueGames.length) {
        fullParticipants.add(userId);
      }
    }
  }

  return {
    predictionUpdates,
    userPointsMap,
    affectedUserIds,
    fullParticipants,
    totalPointsAwarded: predictionUpdates.reduce(
      (total, update) => total + update.pointsEarned,
      0,
    ),
  };
}

export async function previewGameWeekScoring(gameWeekKey: string): Promise<{
  usersScored: number;
  totalPointsAwarded: number;
  rankings: Array<{
    userProfileId: string;
    weeklyPoints: number;
    correctPredictions: number;
    totalPredictions: number;
  }>;
}> {
  const { predictionUpdates, affectedUserIds, userPointsMap, totalPointsAwarded } =
    await buildGameWeekScoringData(gameWeekKey);

  if (predictionUpdates.length === 0) {
    return { usersScored: 0, totalPointsAwarded: 0, rankings: [] };
  }

  const rankings = affectedUserIds
    .map((userProfileId) => {
      const userUpdates = predictionUpdates.filter(
        (update) => update.userProfileId === userProfileId,
      );
      return {
        userProfileId,
        weeklyPoints: userPointsMap.get(userProfileId) ?? 0,
        correctPredictions: userUpdates.filter((update) => update.isCorrect)
          .length,
        totalPredictions: userUpdates.length,
      };
    })
    .sort((a, b) => {
      if (b.weeklyPoints !== a.weeklyPoints) {
        return b.weeklyPoints - a.weeklyPoints;
      }
      if (b.correctPredictions !== a.correctPredictions) {
        return b.correctPredictions - a.correctPredictions;
      }
      if (b.totalPredictions !== a.totalPredictions) {
        return b.totalPredictions - a.totalPredictions;
      }
      return a.userProfileId.localeCompare(b.userProfileId);
    });

  return {
    usersScored: affectedUserIds.length,
    totalPointsAwarded,
    rankings,
  };
}

// ─── Scoring engine ───────────────────────────────────────────────────────────

export async function scoreGameWeekPredictions(
  gameWeekKey: string
): Promise<{ usersScored: number; totalPointsAwarded: number }> {
  const {
    predictionUpdates,
    userPointsMap,
    affectedUserIds,
    fullParticipants,
    totalPointsAwarded,
  } = await buildGameWeekScoringData(gameWeekKey);

  if (predictionUpdates.length === 0) {
    return { usersScored: 0, totalPointsAwarded: 0 };
  }

  // Load current user profile data for participation and booster calculations
  const profiles = await prisma.userProfile.findMany({
    where: { id: { in: affectedUserIds } },
    select: {
      id: true,
      fantasyPoints: true,
      fullParticipationWeeks: true,
      boostersRemaining: true,
    },
  });

  const predictionOperations = groupPredictionUpdates(predictionUpdates).map(
    (group) =>
      prisma.prediction.updateMany({
        where: { id: { in: group.ids } },
      data: {
        isScored: true,
        isCorrect: group.isCorrect,
        pointsEarned: group.pointsEarned,
      },
      }),
  );

  const profileOperations = profiles.map((profile) => {
    const earnedPoints = userPointsMap.get(profile.id) ?? 0;
    const isFullParticipant = fullParticipants.has(profile.id);
    const newFullWeeks =
      profile.fullParticipationWeeks + (isFullParticipant ? 1 : 0);

    let newBoostersRemaining = profile.boostersRemaining;
    if (
      !canUseBoosters(profile.fullParticipationWeeks) &&
      canUseBoosters(newFullWeeks)
    ) {
      newBoostersRemaining = SEASON_BOOSTER_COUNT;
    }

    return prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        fantasyPoints: { increment: earnedPoints },
        fullParticipationWeeks: newFullWeeks,
        boostersRemaining: newBoostersRemaining,
      },
    });
  });

  await prisma.$transaction([...predictionOperations, ...profileOperations]);

  return { usersScored: affectedUserIds.length, totalPointsAwarded };
}

// ─── Get admin game week summaries ────────────────────────────────────────────

export async function getAdminGameWeeks(): Promise<
  Array<{
    weekKey: string;
    gameCount: number;
    completedGameCount: number;
    predictionCount: number;
  }>
> {
  const games = await prisma.game.findMany({
    where: {
      status: { in: ["SCHEDULED", "LIVE", "COMPLETED", "CANCELLED"] },
    },
    select: {
      id: true,
      date: true,
      status: true,
      _count: { select: { predictions: { where: { isScored: false } } } },
    },
  });

  const weekMap = new Map<
    string,
    { gameCount: number; completedGameCount: number; predictionCount: number }
  >();

  for (const game of games) {
    const key = getGameWeekKey(new Date(game.date));
    const existing = weekMap.get(key) ?? {
      gameCount: 0,
      completedGameCount: 0,
      predictionCount: 0,
    };
    weekMap.set(key, {
      gameCount: existing.gameCount + 1,
      completedGameCount:
        existing.completedGameCount + (game.status === "COMPLETED" ? 1 : 0),
      predictionCount: existing.predictionCount + game._count.predictions,
    });
  }

  return Array.from(weekMap.entries())
    .map(([weekKey, counts]) => ({ weekKey, ...counts }))
    .sort((a, b) => a.weekKey.localeCompare(b.weekKey));
}
