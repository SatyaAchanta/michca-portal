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
  FULL_WEEKS_FOR_BOOSTERS,
  SEASON_BOOSTER_COUNT,
  canUseBoosters,
  getPointsForGame,
  scoreGameWeekPredictions,
} from "@/lib/fantasy";

describe("fantasy booster eligibility helpers", () => {
  it("unlocks boosters after 2 full league weeks", () => {
    expect(FULL_WEEKS_FOR_BOOSTERS).toBe(2);
    expect(SEASON_BOOSTER_COUNT).toBe(10);
    expect(canUseBoosters(0)).toBe(false);
    expect(canUseBoosters(1)).toBe(false);
    expect(canUseBoosters(2)).toBe(true);
    expect(canUseBoosters(3)).toBe(true);
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

  it("increments full-week participation and unlocks boosters after 2 full weeks", async () => {
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
        boostersRemaining: 0,
      },
    ]);

    const result = await scoreGameWeekPredictions("2026-W18");

    expect(result).toEqual({ usersScored: 1, totalPointsAwarded: 1 });
    expect(userProfileUpdateMock).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        fantasyPoints: { increment: 1 },
        fullParticipationWeeks: 2,
        boostersRemaining: 10,
      },
    });
  });

  it("scores playoff-only weeks without full-week progress", async () => {
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
        boostersRemaining: 4,
      },
    });
  });

  it("requires all league games in a mixed week for full-week progress", async () => {
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
        boostersRemaining: 8,
      },
    });
  });

  it("ignores canceled league games when counting full-week participation", async () => {
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
        predictions: [
          {
            id: "pred-2",
            userProfileId: "user-1",
            predictedWinnerCode: "C",
            isBoosted: false,
          },
          {
            id: "pred-3",
            userProfileId: "user-2",
            predictedWinnerCode: "D",
            isBoosted: false,
          },
        ],
      },
    ]);
    userProfileFindManyMock.mockResolvedValue([
      {
        id: "user-1",
        fantasyPoints: 1,
        fullParticipationWeeks: 1,
        boostersRemaining: 0,
      },
      {
        id: "user-2",
        fantasyPoints: 0,
        fullParticipationWeeks: 1,
        boostersRemaining: 0,
      },
    ]);

    const result = await scoreGameWeekPredictions("2026-W34");

    expect(result).toEqual({ usersScored: 2, totalPointsAwarded: 2 });
    expect(userProfileUpdateMock).toHaveBeenNthCalledWith(1, {
      where: { id: "user-1" },
      data: {
        fantasyPoints: { increment: 2 },
        fullParticipationWeeks: 2,
        boostersRemaining: 10,
      },
    });
    expect(userProfileUpdateMock).toHaveBeenNthCalledWith(2, {
      where: { id: "user-2" },
      data: {
        fantasyPoints: { increment: 0 },
        fullParticipationWeeks: 1,
        boostersRemaining: 0,
      },
    });
  });
});
