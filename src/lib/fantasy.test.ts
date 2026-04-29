import { GameType } from "@/generated/prisma/client";

const {
  gameFindManyMock,
  predictionUpdateMock,
  userProfileFindManyMock,
  userProfileUpdateMock,
  transactionMock,
} = vi.hoisted(() => {
  const gameFindManyMock = vi.fn();
  const predictionUpdateMock = vi.fn();
  const userProfileFindManyMock = vi.fn();
  const userProfileUpdateMock = vi.fn();
  const transactionMock = vi.fn(async (callback) =>
    callback({
      prediction: { update: predictionUpdateMock },
      userProfile: { update: userProfileUpdateMock },
    }),
  );
  return {
    gameFindManyMock,
    predictionUpdateMock,
    userProfileFindManyMock,
    userProfileUpdateMock,
    transactionMock,
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    game: { findMany: gameFindManyMock },
    userProfile: { findMany: userProfileFindManyMock },
    $transaction: transactionMock,
  },
}));

import {
  MAX_FANTASY_LEVEL,
  WEEKS_PER_FANTASY_LEVEL,
  getLevelBonusPoints,
  getLevelFromWeeks,
  getPointsForGame,
  scoreGameWeekPredictions,
} from "@/lib/fantasy";

describe("fantasy level helpers", () => {
  it("levels up every 2 full league weeks and caps at Level 8", () => {
    expect(WEEKS_PER_FANTASY_LEVEL).toBe(2);
    expect(MAX_FANTASY_LEVEL).toBe(8);
    expect(getLevelFromWeeks(0)).toBe(0);
    expect(getLevelFromWeeks(1)).toBe(0);
    expect(getLevelFromWeeks(2)).toBe(1);
    expect(getLevelFromWeeks(3)).toBe(1);
    expect(getLevelFromWeeks(4)).toBe(2);
    expect(getLevelFromWeeks(5)).toBe(2);
    expect(getLevelFromWeeks(16)).toBe(8);
    expect(getLevelFromWeeks(20)).toBe(8);
  });

  it("awards bonus points as level times 2", () => {
    expect(getLevelBonusPoints(0)).toBe(0);
    expect(getLevelBonusPoints(1)).toBe(2);
    expect(getLevelBonusPoints(5)).toBe(10);
    expect(getLevelBonusPoints(8)).toBe(16);
    expect(getLevelBonusPoints(9)).toBe(0);
  });
});

describe("fantasy points helpers", () => {
  it("calculates league, playoff, and boosted points", () => {
    expect(getPointsForGame(GameType.LEAGUE, false)).toBe(1);
    expect(getPointsForGame(GameType.LEAGUE, true)).toBe(3);
    expect(getPointsForGame(GameType.PLAYOFF, false)).toBe(3);
    expect(getPointsForGame(GameType.PLAYOFF, true)).toBe(9);
  });
});

describe("scoreGameWeekPredictions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transactionMock.mockImplementation(async (callback) =>
      callback({
        prediction: { update: predictionUpdateMock },
        userProfile: { update: userProfileUpdateMock },
      }),
    );
  });

  it("increments level progress from full league-week participation", async () => {
    gameFindManyMock.mockResolvedValue([
      {
        id: "league-1",
        date: new Date("2026-05-02T14:00:00.000Z"),
        gameType: GameType.LEAGUE,
        winnerCode: "A",
        isDraw: false,
        predictions: [
          {
            id: "pred-1",
            userProfileId: "user-1",
            predictedWinnerCode: "A",
            isBoosted: false,
          },
        ],
      },
    ]);
    userProfileFindManyMock.mockResolvedValue([
      {
        id: "user-1",
        fantasyPoints: 0,
        fullParticipationWeeks: 1,
        levelBonusesAwarded: 0,
        fantasyLevel: 0,
        boostersRemaining: 0,
      },
    ]);

    const result = await scoreGameWeekPredictions("2026-W18");

    expect(result).toEqual({ usersScored: 1, totalPointsAwarded: 3 });
    expect(userProfileUpdateMock).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        fantasyPoints: { increment: 3 },
        fullParticipationWeeks: 2,
        fantasyLevel: 1,
        levelBonusesAwarded: 1,
        boostersRemaining: 10,
      },
    });
  });

  it("scores playoff-only weeks without level progress", async () => {
    gameFindManyMock.mockResolvedValue([
      {
        id: "playoff-1",
        date: new Date("2026-08-29T14:00:00.000Z"),
        gameType: GameType.PLAYOFF,
        winnerCode: "A",
        isDraw: false,
        predictions: [
          {
            id: "pred-1",
            userProfileId: "user-1",
            predictedWinnerCode: "A",
            isBoosted: true,
          },
        ],
      },
    ]);
    userProfileFindManyMock.mockResolvedValue([
      {
        id: "user-1",
        fantasyPoints: 20,
        fullParticipationWeeks: 6,
        levelBonusesAwarded: 3,
        fantasyLevel: 3,
        boostersRemaining: 4,
      },
    ]);

    const result = await scoreGameWeekPredictions("2026-W35");

    expect(result).toEqual({ usersScored: 1, totalPointsAwarded: 9 });
    expect(userProfileUpdateMock).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        fantasyPoints: { increment: 9 },
        fullParticipationWeeks: 6,
        fantasyLevel: 3,
        levelBonusesAwarded: 3,
        boostersRemaining: 4,
      },
    });
  });

  it("requires all league games in a mixed week for level progress", async () => {
    gameFindManyMock.mockResolvedValue([
      {
        id: "league-1",
        date: new Date("2026-08-22T14:00:00.000Z"),
        gameType: GameType.LEAGUE,
        winnerCode: "A",
        isDraw: false,
        predictions: [
          {
            id: "pred-1",
            userProfileId: "user-1",
            predictedWinnerCode: "A",
            isBoosted: false,
          },
        ],
      },
      {
        id: "league-2",
        date: new Date("2026-08-22T18:00:00.000Z"),
        gameType: GameType.LEAGUE,
        winnerCode: "C",
        isDraw: false,
        predictions: [],
      },
      {
        id: "playoff-1",
        date: new Date("2026-08-23T14:00:00.000Z"),
        gameType: GameType.PLAYOFF,
        winnerCode: "E",
        isDraw: false,
        predictions: [
          {
            id: "pred-2",
            userProfileId: "user-1",
            predictedWinnerCode: "E",
            isBoosted: false,
          },
        ],
      },
    ]);
    userProfileFindManyMock.mockResolvedValue([
      {
        id: "user-1",
        fantasyPoints: 10,
        fullParticipationWeeks: 3,
        levelBonusesAwarded: 1,
        fantasyLevel: 1,
        boostersRemaining: 8,
      },
    ]);

    const result = await scoreGameWeekPredictions("2026-W34");

    expect(result).toEqual({ usersScored: 1, totalPointsAwarded: 4 });
    expect(userProfileUpdateMock).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        fantasyPoints: { increment: 4 },
        fullParticipationWeeks: 3,
        fantasyLevel: 1,
        levelBonusesAwarded: 1,
        boostersRemaining: 8,
      },
    });
  });
});
