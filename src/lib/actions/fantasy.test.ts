import { GameStatus, GameType } from "@/generated/prisma/client";

const {
  auth,
  revalidatePath,
  userProfileFindUnique,
  userProfileFindMany,
  predictionFindMany,
  gameFindMany,
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
  gameFindMany: vi.fn(),
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
      findMany: gameFindMany,
      findUnique: gameFindUnique,
      update: gameUpdate,
    },
  },
}));

vi.mock("@/lib/fantasy", () => ({
  scoreGameWeekPredictions,
  previewGameWeekScoring,
}));

import {
  getFantasyGames,
  getLeaderboardParticipantPredictions,
} from "@/lib/actions/fantasy";

describe("getFantasyGames", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("attaches up to five completed results per team in oldest-to-newest order", async () => {
    gameFindMany
      .mockResolvedValueOnce([
        {
          id: "upcoming-1",
          date: new Date("2026-05-16T14:00:00.000Z"),
          division: "PREMIER_T20",
          league: "MichCA",
          gameType: "LEAGUE",
          status: "SCHEDULED",
          venue: "Ground A",
          team1Code: "AAA",
          team2Code: "BBB",
          team1: { teamName: "Alpha CC", teamShortCode: "ALP", logo: null },
          team2: { teamName: "Beta CC", teamShortCode: "BET", logo: null },
        },
        {
          id: "upcoming-2",
          date: new Date("2026-05-17T14:00:00.000Z"),
          division: "DIV1_T20",
          league: "MichCA",
          gameType: "LEAGUE",
          status: "SCHEDULED",
          venue: "Ground B",
          team1Code: "CCC",
          team2Code: "AAA",
          team1: { teamName: "Central CC", teamShortCode: "CEN", logo: null },
          team2: { teamName: "Alpha CC", teamShortCode: "ALP", logo: null },
        },
      ])
      .mockResolvedValueOnce([
        {
          date: new Date("2026-05-12T14:00:00.000Z"),
          team1Code: "AAA",
          team2Code: "GGG",
          winnerCode: "AAA",
          isDraw: false,
        },
        {
          date: new Date("2026-05-11T14:00:00.000Z"),
          team1Code: "HHH",
          team2Code: "AAA",
          winnerCode: "HHH",
          isDraw: false,
        },
        {
          date: new Date("2026-05-10T14:00:00.000Z"),
          team1Code: "AAA",
          team2Code: "III",
          winnerCode: null,
          isDraw: true,
        },
        {
          date: new Date("2026-05-09T14:00:00.000Z"),
          team1Code: "JJJ",
          team2Code: "AAA",
          winnerCode: "AAA",
          isDraw: false,
        },
        {
          date: new Date("2026-05-08T14:00:00.000Z"),
          team1Code: "AAA",
          team2Code: "KKK",
          winnerCode: "KKK",
          isDraw: false,
        },
        {
          date: new Date("2026-05-07T14:00:00.000Z"),
          team1Code: "AAA",
          team2Code: "LLL",
          winnerCode: "AAA",
          isDraw: false,
        },
        {
          date: new Date("2026-05-06T14:00:00.000Z"),
          team1Code: "BBB",
          team2Code: "MMM",
          winnerCode: "BBB",
          isDraw: false,
        },
        {
          date: new Date("2026-05-05T14:00:00.000Z"),
          team1Code: "NNN",
          team2Code: "BBB",
          winnerCode: null,
          isDraw: true,
        },
        {
          date: new Date("2026-05-04T14:00:00.000Z"),
          team1Code: "CCC",
          team2Code: "OOO",
          winnerCode: "OOO",
          isDraw: false,
        },
      ]);

    const result = await getFantasyGames();

    expect(gameFindMany).toHaveBeenNthCalledWith(1, {
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
    expect(gameFindMany).toHaveBeenNthCalledWith(2, {
      where: {
        status: GameStatus.COMPLETED,
        OR: [
          { team1Code: { in: ["AAA", "BBB", "CCC"] } },
          { team2Code: { in: ["AAA", "BBB", "CCC"] } },
        ],
      },
      orderBy: { date: "desc" },
      select: {
        date: true,
        team1Code: true,
        team2Code: true,
        winnerCode: true,
        isDraw: true,
      },
    });
    expect(result).toEqual([
      expect.objectContaining({
        id: "upcoming-1",
        team1Form: ["L", "W", "D", "L", "W"],
        team2Form: ["D", "W"],
      }),
      expect.objectContaining({
        id: "upcoming-2",
        team1Form: ["L"],
        team2Form: ["L", "W", "D", "L", "W"],
      }),
    ]);
  });
});

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
