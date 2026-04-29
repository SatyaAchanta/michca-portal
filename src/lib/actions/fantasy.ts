"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { GameStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getGameWeekKey, scoreGameWeekPredictions } from "@/lib/fantasy";

// ─── Submit or update a prediction ───────────────────────────────────────────

export async function submitPrediction(
  gameId: string,
  predictedWinnerCode: string | null, // null = predicting a draw
  isBoosted: boolean
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    select: {
      id: true,
      fantasyLevel: true,
      boostersRemaining: true,
    },
  });
  if (!profile) {
    return { success: false, error: "Profile not found" };
  }

  // Validate the game exists and is still open for predictions
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { id: true, status: true, team1Code: true, team2Code: true },
  });

  if (!game) {
    return { success: false, error: "Game not found" };
  }

  if (
    game.status === GameStatus.COMPLETED ||
    game.status === GameStatus.CANCELLED
  ) {
    return { success: false, error: "Predictions are locked for this game" };
  }

  // Lock 1 hour before kickoff
  const kickoffLock = new Date(game.date).getTime() - 60 * 60 * 1000;
  if (Date.now() >= kickoffLock) {
    return { success: false, error: "Predictions are locked for this game" };
  }

  // Validate the predicted winner is one of the two teams (or null for draw)
  if (
    predictedWinnerCode !== null &&
    predictedWinnerCode !== game.team1Code &&
    predictedWinnerCode !== game.team2Code
  ) {
    return { success: false, error: "Invalid team selection" };
  }

  // Validate booster eligibility
  if (isBoosted) {
    if (profile.fantasyLevel < 1) {
      return { success: false, error: "Boosters are unlocked at Level 1" };
    }
    // Check if they already have a booster on a different prediction this week;
    // also enforce the boostersRemaining limit only on NEW boosted predictions.
    const existingPrediction = await prisma.prediction.findUnique({
      where: { userProfileId_gameId: { userProfileId: profile.id, gameId } },
      select: { isBoosted: true },
    });

    const wasAlreadyBoosted = existingPrediction?.isBoosted ?? false;
    if (!wasAlreadyBoosted && profile.boostersRemaining <= 0) {
      return { success: false, error: "No boosters remaining this season" };
    }

    // If toggling OFF a booster, refund it; if toggling ON, spend one
    const boosterDelta = wasAlreadyBoosted ? 0 : -1;
    if (boosterDelta !== 0) {
      await prisma.userProfile.update({
        where: { id: profile.id },
        data: { boostersRemaining: { increment: boosterDelta } },
      });
    }
  } else {
    // If switching from boosted → not boosted, refund the booster
    const existingPrediction = await prisma.prediction.findUnique({
      where: { userProfileId_gameId: { userProfileId: profile.id, gameId } },
      select: { isBoosted: true },
    });
    if (existingPrediction?.isBoosted) {
      await prisma.userProfile.update({
        where: { id: profile.id },
        data: { boostersRemaining: { increment: 1 } },
      });
    }
  }

  await prisma.prediction.upsert({
    where: { userProfileId_gameId: { userProfileId: profile.id, gameId } },
    create: {
      userProfileId: profile.id,
      gameId,
      predictedWinnerCode,
      isBoosted,
    },
    update: {
      predictedWinnerCode,
      isBoosted,
    },
  });

  revalidatePath("/fantasy");
  return { success: true };
}

// ─── Get user fantasy stats + predictions ────────────────────────────────────

export async function getUserFantasyData() {
  const { userId } = await auth();
  if (!userId) return null;

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    select: {
      id: true,
      fantasyPoints: true,
      fantasyLevel: true,
      boostersRemaining: true,
      fullParticipationWeeks: true,
      predictions: {
        select: {
          gameId: true,
          predictedWinnerCode: true,
          isBoosted: true,
          isScored: true,
          isCorrect: true,
          pointsEarned: true,
        },
      },
    },
  });

  return profile;
}

// ─── Get upcoming games for prediction ───────────────────────────────────────

export async function getUpcomingGamesForPrediction() {
  const games = await prisma.game.findMany({
    where: { status: GameStatus.SCHEDULED },
    orderBy: { date: "asc" },
    select: {
      id: true,
      date: true,
      division: true,
      league: true,
      gameType: true,
      status: true,
      venue: true,
      team1Code: true,
      team2Code: true,
      team1: { select: { teamName: true, teamShortCode: true, logo: true } },
      team2: { select: { teamName: true, teamShortCode: true, logo: true } },
    },
  });

  return games;
}

// ─── Get community prediction counts per game ────────────────────────────────

export async function getGamePredictionCounts(gameIds: string[]) {
  if (gameIds.length === 0) return [];

  const rows = await prisma.prediction.groupBy({
    by: ["gameId", "predictedWinnerCode"],
    where: { gameId: { in: gameIds } },
    _count: { id: true },
  });

  return rows.map((r) => ({
    gameId: r.gameId,
    predictedWinnerCode: r.predictedWinnerCode,
    count: r._count.id,
  }));
}

// ─── Get leaderboard ─────────────────────────────────────────────────────────

export async function getLeaderboard() {
  return prisma.userProfile.findMany({
    where: { fantasyPoints: { gt: 0 } },
    orderBy: { fantasyPoints: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      fantasyPoints: true,
      fantasyLevel: true,
      fullParticipationWeeks: true,
      t20TeamCode: true,
    },
    take: 100,
  });
}

// ─── Admin: calculate points for a game week ─────────────────────────────────

export async function adminScoreGameWeek(
  gameWeekKey: string
): Promise<{ success: boolean; usersScored?: number; totalPointsAwarded?: number; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not authenticated" };

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    select: { role: true },
  });

  if (!["ADMIN", "FANTASY_ADMIN"].includes(profile?.role ?? "")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const result = await scoreGameWeekPredictions(gameWeekKey);
    revalidatePath("/admin/fantasy");
    revalidatePath("/fantasy/leaderboard");
    return { success: true, ...result };
  } catch (err) {
    console.error("scoreGameWeekPredictions failed:", err);
    return { success: false, error: "Scoring failed. Please try again." };
  }
}

// ─── Admin: set game result (and mark as COMPLETED) ──────────────────────────

export async function adminSetGameResult(
  gameId: string,
  winnerCode: string | null, // null = draw/no result
  isDraw: boolean
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not authenticated" };

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    select: { role: true },
  });

  if (!["ADMIN", "FANTASY_ADMIN"].includes(profile?.role ?? "")) {
    return { success: false, error: "Unauthorized" };
  }

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { id: true, status: true },
  });

  if (!game) return { success: false, error: "Game not found" };

  if (game.status === GameStatus.COMPLETED) {
    return { success: false, error: "Game is already completed" };
  }

  await prisma.game.update({
    where: { id: gameId },
    data: {
      status: GameStatus.COMPLETED,
      winnerCode: isDraw ? null : winnerCode,
      isDraw,
      isCancelled: false,
    },
  });

  revalidatePath("/admin/fantasy");
  return { success: true };
}

// ─── Admin: get upcoming scheduled games ─────────────────────────────────────

export async function getScheduledGamesForAdmin() {
  const games = await prisma.game.findMany({
    where: { status: GameStatus.SCHEDULED },
    orderBy: { date: "asc" },
    select: {
      id: true,
      date: true,
      division: true,
      league: true,
      gameType: true,
      venue: true,
      team1Code: true,
      team2Code: true,
      team1: { select: { teamName: true, teamShortCode: true } },
      team2: { select: { teamName: true, teamShortCode: true } },
    },
  });

  return games;
}
