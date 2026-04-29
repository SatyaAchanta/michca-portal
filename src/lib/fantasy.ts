import { GameType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

// ─── Point values ────────────────────────────────────────────────────────────

const POINTS = {
  LEAGUE_CORRECT: 1,
  PLAYOFF_CORRECT: 3,
  BOOSTER_MULTIPLIER: 3,
} as const;

// ─── Level system ─────────────────────────────────────────────────────────────
// Level is earned by fully participating (predicting every game) in game-weeks.
// Every 3 full weeks = +1 level, capped at 5.

const LEVEL_BONUS_POINTS: Record<number, number> = {
  1: 5,
  2: 10,
  3: 15,
  4: 20,
  5: 25,
};

export function getLevelFromWeeks(weeks: number): number {
  return Math.min(Math.floor(weeks / 3), 5);
}

// ─── Game week key ────────────────────────────────────────────────────────────
// Returns an ISO week string like "2026-W18" derived from the game date.

export function getGameWeekKey(date: Date): string {
  const jan4 = new Date(date.getFullYear(), 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));

  const diff = date.getTime() - startOfWeek1.getTime();
  const week = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
  return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
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

// ─── Scoring engine ───────────────────────────────────────────────────────────

export async function scoreGameWeekPredictions(
  gameWeekKey: string
): Promise<{ usersScored: number; totalPointsAwarded: number }> {
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

  // Filter to only games in the target week
  const weekGames = games.filter(
    (g) => getGameWeekKey(new Date(g.date)) === gameWeekKey
  );

  if (weekGames.length === 0) {
    return { usersScored: 0, totalPointsAwarded: 0 };
  }

  const gameIds = weekGames.map((g) => g.id);

  // Collect all unscored predictions across all users for this week
  const allPredictions = weekGames.flatMap((g) =>
    g.predictions.map((p) => ({ ...p, game: g }))
  );

  if (allPredictions.length === 0) {
    return { usersScored: 0, totalPointsAwarded: 0 };
  }

  // Build per-user point totals
  const userPointsMap = new Map<string, number>();
  const predictionUpdates: Array<{
    id: string;
    isCorrect: boolean;
    pointsEarned: number;
  }> = [];

  for (const pred of allPredictions) {
    const { game } = pred;

    // Determine correctness
    let isCorrect: boolean;
    if (game.isDraw) {
      isCorrect = pred.predictedWinnerCode === null;
    } else {
      isCorrect = pred.predictedWinnerCode === game.winnerCode;
    }

    const pointsEarned = isCorrect
      ? getPointsForGame(game.gameType, pred.isBoosted)
      : 0;

    predictionUpdates.push({ id: pred.id, isCorrect, pointsEarned });

    if (pointsEarned > 0) {
      userPointsMap.set(
        pred.userProfileId,
        (userPointsMap.get(pred.userProfileId) ?? 0) + pointsEarned
      );
    }
  }

  // Get all unique users who had predictions this week
  const affectedUserIds = [
    ...new Set(allPredictions.map((p) => p.userProfileId)),
  ];

  // For each user, check full participation (predicted every game this week)
  const fullParticipants = new Set<string>();
  for (const userId of affectedUserIds) {
    const userPredCountThisWeek = allPredictions.filter(
      (p) => p.userProfileId === userId
    ).length;
    if (userPredCountThisWeek === weekGames.length) {
      fullParticipants.add(userId);
    }
  }

  // Load current user profile data for level/booster calculations
  const profiles = await prisma.userProfile.findMany({
    where: { id: { in: affectedUserIds } },
    select: {
      id: true,
      fantasyPoints: true,
      fullParticipationWeeks: true,
      levelBonusesAwarded: true,
      fantasyLevel: true,
      boostersRemaining: true,
    },
  });

  // Apply all updates in a transaction
  let totalPointsAwarded = 0;

  await prisma.$transaction(async (tx) => {
    // 1. Mark all predictions as scored
    for (const update of predictionUpdates) {
      await tx.prediction.update({
        where: { id: update.id },
        data: {
          isScored: true,
          isCorrect: update.isCorrect,
          pointsEarned: update.pointsEarned,
        },
      });
      totalPointsAwarded += update.pointsEarned;
    }

    // 2. Update each user's points, level, and boosters
    for (const profile of profiles) {
      const earnedPoints = userPointsMap.get(profile.id) ?? 0;
      const isFullParticipant = fullParticipants.has(profile.id);

      const newFullWeeks = profile.fullParticipationWeeks + (isFullParticipant ? 1 : 0);
      const newLevel = getLevelFromWeeks(newFullWeeks);
      const levelIncreased = newLevel > profile.levelBonusesAwarded;

      let bonusPoints = 0;
      let newLevelBonusesAwarded = profile.levelBonusesAwarded;
      let newBoostersRemaining = profile.boostersRemaining;

      if (levelIncreased) {
        // Award bonus points for each new level reached
        for (
          let lvl = profile.levelBonusesAwarded + 1;
          lvl <= newLevel;
          lvl++
        ) {
          bonusPoints += LEVEL_BONUS_POINTS[lvl] ?? 0;
        }
        newLevelBonusesAwarded = newLevel;

        // Unlock boosters when first reaching Level 1
        if (profile.levelBonusesAwarded < 1 && newLevel >= 1) {
          newBoostersRemaining = 10;
        }
      }

      await tx.userProfile.update({
        where: { id: profile.id },
        data: {
          fantasyPoints: { increment: earnedPoints + bonusPoints },
          fullParticipationWeeks: newFullWeeks,
          fantasyLevel: newLevel,
          levelBonusesAwarded: newLevelBonusesAwarded,
          boostersRemaining: newBoostersRemaining,
        },
      });

      totalPointsAwarded += bonusPoints;
    }
  });

  return { usersScored: affectedUserIds.length, totalPointsAwarded };
}

// ─── Get unscored game weeks ──────────────────────────────────────────────────
// Returns game-weeks that have completed, unscored predictions.

export async function getUnscoredGameWeeks(): Promise<
  Array<{ weekKey: string; gameCount: number; predictionCount: number }>
> {
  const games = await prisma.game.findMany({
    where: {
      status: "COMPLETED",
      predictions: { some: { isScored: false } },
    },
    select: {
      id: true,
      date: true,
      _count: { select: { predictions: { where: { isScored: false } } } },
    },
  });

  const weekMap = new Map<
    string,
    { gameCount: number; predictionCount: number }
  >();

  for (const game of games) {
    const key = getGameWeekKey(new Date(game.date));
    const existing = weekMap.get(key) ?? { gameCount: 0, predictionCount: 0 };
    weekMap.set(key, {
      gameCount: existing.gameCount + 1,
      predictionCount:
        existing.predictionCount + game._count.predictions,
    });
  }

  return Array.from(weekMap.entries())
    .map(([weekKey, counts]) => ({ weekKey, ...counts }))
    .sort((a, b) => a.weekKey.localeCompare(b.weekKey));
}
