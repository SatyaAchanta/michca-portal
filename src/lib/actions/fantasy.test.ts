import { GameStatus, GameType } from "@/generated/prisma/client";

const {
  auth,
  revalidatePath,
  userProfileFindUnique,
  userProfileFindMany,
  predictionFindMany,
  gameFindUnique,
  gameUpdate,
  scoreGameWeekPredictions,
  previewGameWeekScoring,
} = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  userProfileFindUnique: vi.fn(),
  userProfileFindMany: vi.fn(),
  predictionFindMany: vi.fn(),
  gameFindUnique: vi.fn(),
  gameUpdate: vi.fn(),
  scoreGameWeekPredictions: vi.fn(),
  previewGameWeekScoring: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth,
}));

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userProfile: {
      findUnique: userProfileFindUnique,
      findMany: userProfileFindMany,
    },
    prediction: {
      findMany: predictionFindMany,
    },
    game: {
      findUnique: gameFindUnique,
      update: gameUpdate,
    },
  },
}));

vi.mock("@/lib/fantasy", () => ({
  scoreGameWeekPredictions,
  previewGameWeekScoring,
}));

import { getLeaderboardParticipantPredictions } from "@/lib/actions/fantasy";

describe("getLeaderboardParticipantPredictions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects signed-out viewers", async () => {
    auth.mockResolvedValue({ userId: null });

    const result = await getLeaderboardParticipantPredictions("user-1");

    expect(result).toEqual({
      success: false,
      weeks: [],
      error: "Not authenticated",
    });
    expect(userProfileFindUnique).not.toHaveBeenCalled();
    expect(predictionFindMany).not.toHaveBeenCalled();
  });

  it("returns completed scored picks grouped by weekend", async () => {
    auth.mockResolvedValue({ userId: "clerk-1" });
    userProfileFindUnique.mockResolvedValue({
      id: "user-1",
      firstName: "Aarav",
      lastName: "Patel",
      email: "aarav@example.com",
    });
    predictionFindMany.mockResolvedValue([
      {
        id: "pred-2",
        gameId: "game-2",
        predictedWinnerCode: null,
        isBoosted: false,
        isCorrect: false,
        pointsEarned: 0,
        game: {
          id: "game-2",
          date: new Date("2026-05-10T16:00:00.000Z"),
          division: "DIV1_T20",
          gameType: GameType.LEAGUE,
          team1Code: "AAA",
          team2Code: "BBB",
          winnerCode: "BBB",
          isDraw: false,
          team1: { teamName: "Alpha CC", teamShortCode: "ALP" },
          team2: { teamName: "Beta CC", teamShortCode: "BET" },
        },
      },
      {
        id: "pred-1",
        gameId: "game-1",
        predictedWinnerCode: "MOCC",
        isBoosted: true,
        isCorrect: true,
        pointsEarned: 3,
        game: {
          id: "game-1",
          date: new Date("2026-05-03T14:00:00.000Z"),
          division: "PREMIER_T20",
          gameType: GameType.PLAYOFF,
          team1Code: "MOCC",
          team2Code: "LCC",
          winnerCode: "MOCC",
          isDraw: false,
          team1: { teamName: "Michigan OCC", teamShortCode: "MOCC" },
          team2: { teamName: "Lansing CC", teamShortCode: "LCC" },
        },
      },
      {
        id: "pred-3",
        gameId: "game-3",
        predictedWinnerCode: null,
        isBoosted: false,
        isCorrect: true,
        pointsEarned: 1,
        game: {
          id: "game-3",
          date: new Date("2026-05-09T14:00:00.000Z"),
          division: "DIV2_T20",
          gameType: GameType.LEAGUE,
          team1Code: "CCC",
          team2Code: "DDD",
          winnerCode: null,
          isDraw: true,
          team1: { teamName: "Central CC", teamShortCode: "CEN" },
          team2: { teamName: "Delta CC", teamShortCode: "DEL" },
        },
      },
    ]);

    const result = await getLeaderboardParticipantPredictions("user-1");

    expect(userProfileFindUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });
    expect(predictionFindMany).toHaveBeenCalledWith({
      where: {
        userProfileId: "user-1",
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
    expect(result).toEqual({
      success: true,
      participant: {
        id: "user-1",
        displayName: "Aarav Patel",
      },
      weeks: [
        {
          weekKey: "2026-05-09",
          label: "May 9 – May 10",
          predictions: [
            expect.objectContaining({
              id: "pred-3",
              matchupLabel: "CEN vs DEL",
              pickLabel: "Tie",
              resultLabel: "Tie",
              isBoosted: false,
              isCorrect: true,
              pointsEarned: 1,
            }),
            expect.objectContaining({
              id: "pred-2",
              matchupLabel: "ALP vs BET",
              pickLabel: "Tie",
              resultLabel: "BET",
              isBoosted: false,
              isCorrect: false,
              pointsEarned: 0,
            }),
          ],
        },
        {
          weekKey: "2026-05-02",
          label: "May 2 – May 3",
          predictions: [
            expect.objectContaining({
              id: "pred-1",
              matchupLabel: "MOCC vs LCC",
              pickLabel: "MOCC",
              resultLabel: "MOCC",
              isBoosted: true,
              isCorrect: true,
              pointsEarned: 3,
            }),
          ],
        },
      ],
    });
  });
});
