"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { GameStatus } from "@/generated/prisma/client";
import { formatWeekendLabel, toSaturdayKey } from "@/lib/fantasy-dates";
import { prisma } from "@/lib/prisma";
import { previewGameWeekScoring, scoreGameWeekPredictions } from "@/lib/fantasy";

function getDisplayName(profile: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  return profile.firstName && profile.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : (profile.firstName ?? profile.email.split("@")[0]);
}

function getTeamLabel(
  code: string | null,
  teams: {
    team1Code: string;
    team2Code: string;
    team1: { teamName: string; teamShortCode: string };
    team2: { teamName: string; teamShortCode: string };
  },
) {
  if (code === null) return "Tie";
  if (code === teams.team1Code) return teams.team1.teamShortCode || teams.team1.teamName;
  if (code === teams.team2Code) return teams.team2.teamShortCode || teams.team2.teamName;
  return code;
}

export type LeaderboardParticipantPredictionResponse = {
  success: boolean;
  participant?: {
    id: string;
    displayName: string;
  };
  weeks?: Array<{
    weekKey: string;
    label: string;
    predictions: Array<{
      id: string;
      gameId: string;
      date: Date;
      division: string;
      gameType: "LEAGUE" | "PLAYOFF";
      matchupLabel: string;
      pickLabel: string;
      resultLabel: string;
      isBoosted: boolean;
      isCorrect: boolean;
      pointsEarned: number;
    }>;
  }>;
  error?: string;
};

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
      fullParticipationWeeks: true,
      boostersRemaining: true,
    },
  });
  if (!profile) {
    return { success: false, error: "Profile not found" };
  }

  // Validate the game exists and is still open for predictions
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { id: true, status: true, team1Code: true, team2Code: true, date: true },
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
    if (profile.fullParticipationWeeks < 2) {
      return {
        success: false,
        error: "Boosters unlock after 2 full prediction weeks",
      };
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

  if (!profile) return null;

  const fantasyRank =
    profile.fantasyPoints > 0
      ? (await prisma.userProfile.count({
          where: { fantasyPoints: { gt: profile.fantasyPoints } },
        })) + 1
      : null;

  return {
    ...profile,
    fantasyRank,
  };
}

// ─── Get fantasy games for prediction/history ────────────────────────────────

export async function getFantasyGames() {
  const games = await prisma.game.findMany({
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
    orderBy: [{ fantasyPoints: "desc" }, { email: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      fantasyPoints: true,
      fullParticipationWeeks: true,
      t20TeamCode: true,
    },
    take: 100,
  });
}

export async function getLeaderboardParticipantPredictions(
  userProfileId: string,
): Promise<LeaderboardParticipantPredictionResponse> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not authenticated" };

  const participant = await prisma.userProfile.findUnique({
    where: { id: userProfileId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  if (!participant) {
    return { success: false, error: "Participant not found" };
  }

  const predictions = await prisma.prediction.findMany({
    where: {
      userProfileId,
      isScored: true,
      game: {
        status: GameStatus.COMPLETED,
      },
    },
    select: {
      id: true,
      gameId: true,
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
          team1Code: true,
          team2Code: true,
          winnerCode: true,
          isDraw: true,
          team1: {
            select: {
              teamName: true,
              teamShortCode: true,
            },
          },
          team2: {
            select: {
              teamName: true,
              teamShortCode: true,
            },
          },
        },
      },
    },
  });

  const sortedPredictions = [...predictions].sort(
    (a, b) => new Date(a.game.date).getTime() - new Date(b.game.date).getTime(),
  );

  const grouped = new Map<
    string,
    LeaderboardParticipantPredictionResponse["weeks"][number]
  >();

  for (const prediction of sortedPredictions) {
    const weekKey = toSaturdayKey(new Date(prediction.game.date));
    const existingWeek = grouped.get(weekKey) ?? {
      weekKey,
      label: formatWeekendLabel(weekKey),
      predictions: [],
    };

    existingWeek.predictions.push({
      id: prediction.id,
      gameId: prediction.gameId,
      date: prediction.game.date,
      division: prediction.game.division,
      gameType: prediction.game.gameType,
      matchupLabel: `${prediction.game.team1.teamShortCode} vs ${prediction.game.team2.teamShortCode}`,
      pickLabel: getTeamLabel(prediction.predictedWinnerCode, prediction.game),
      resultLabel: prediction.game.isDraw
        ? "Tie"
        : getTeamLabel(prediction.game.winnerCode, prediction.game),
      isBoosted: prediction.isBoosted,
      isCorrect: prediction.isCorrect ?? false,
      pointsEarned: prediction.pointsEarned ?? 0,
    });

    grouped.set(weekKey, existingWeek);
  }

  const weeks = Array.from(grouped.values()).sort((a, b) =>
    b.weekKey.localeCompare(a.weekKey),
  );

  return {
    success: true,
    participant: {
      id: participant.id,
      displayName: getDisplayName(participant),
    },
    weeks,
  };
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

export async function adminPreviewGameWeek(
  gameWeekKey: string,
): Promise<{
  success: boolean;
  usersScored?: number;
  totalPointsAwarded?: number;
  rankings?: Array<{
    userProfileId: string;
    displayName: string;
    weeklyPoints: number;
    correctPredictions: number;
    totalPredictions: number;
  }>;
  error?: string;
}> {
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
    const preview = await previewGameWeekScoring(gameWeekKey);

    if (preview.rankings.length === 0) {
      return { success: true, usersScored: 0, totalPointsAwarded: 0, rankings: [] };
    }

    const profiles = await prisma.userProfile.findMany({
      where: { id: { in: preview.rankings.map((entry) => entry.userProfileId) } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    const profileMap = new Map(
      profiles.map((entry) => {
        return [entry.id, getDisplayName(entry)] as const;
      }),
    );

    return {
      success: true,
      usersScored: preview.usersScored,
      totalPointsAwarded: preview.totalPointsAwarded,
      rankings: preview.rankings.slice(0, 10).map((entry) => ({
        ...entry,
        displayName: profileMap.get(entry.userProfileId) ?? "Unknown player",
      })),
    };
  } catch (err) {
    console.error("previewGameWeekScoring failed:", err);
    return { success: false, error: "Preview failed. Please try again." };
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

  if (game.status === GameStatus.CANCELLED) {
    return { success: false, error: "Game is already canceled" };
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
