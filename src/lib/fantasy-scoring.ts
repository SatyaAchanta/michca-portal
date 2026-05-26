import { GameResult, GameType } from "../generated/prisma/client";
import { getGameWeekKey } from "./fantasy-dates";
import { getGameResult } from "./game-results";

const POINTS = {
  LEAGUE_CORRECT: 1,
  PLAYOFF_CORRECT: 3,
  BOOSTER_MULTIPLIER: 3,
} as const;

export const FULL_WEEKS_FOR_BOOSTERS = 2;
export const SEASON_BOOSTER_COUNT = 10;

export function canUseBoosters(fullParticipationWeeks: number): boolean {
  return fullParticipationWeeks >= FULL_WEEKS_FOR_BOOSTERS;
}

export function getBasePointsForGame(gameType: GameType): number {
  return gameType === GameType.PLAYOFF
    ? POINTS.PLAYOFF_CORRECT
    : POINTS.LEAGUE_CORRECT;
}

export function getPointsForGame(gameType: GameType, isBoosted: boolean): number {
  const base = getBasePointsForGame(gameType);
  return isBoosted ? base * POINTS.BOOSTER_MULTIPLIER : base;
}

export function isFantasyScorableGame(game: {
  resultType?: GameResult;
  isDraw?: boolean;
  isCancelled?: boolean;
  winnerCode?: string | null;
}): boolean {
  const result = getGameResult(game);
  return result === GameResult.WIN || result === GameResult.DRAW;
}

type PredictionForPoints = {
  isScored: boolean;
  pointsEarned: number | null;
  isBoosted: boolean;
  game: {
    id: string;
    date: Date;
    gameType: GameType;
    resultType: GameResult;
    isDraw: boolean;
  };
};

type LeagueGameForParticipation = {
  id: string;
  date: Date;
  gameType: GameType;
  resultType: GameResult;
  isDraw: boolean;
};

export function calculateFantasyPointsFromPredictions(
  predictions: PredictionForPoints[],
): number {
  return predictions.reduce((total, prediction) => {
    if (!prediction.isScored || !isFantasyScorableGame(prediction.game)) {
      return total;
    }

    return total + (prediction.pointsEarned ?? 0);
  }, 0);
}

export function calculateFullParticipationWeeks(
  predictions: Array<{
    userProfileId: string;
    game: {
      id: string;
      date: Date;
      gameType: GameType;
      resultType: GameResult;
      isDraw: boolean;
    };
  }>,
  completedGames: LeagueGameForParticipation[],
): number {
  const eligibleLeagueGamesByWeek = new Map<string, Set<string>>();

  for (const game of completedGames) {
    if (game.gameType !== GameType.LEAGUE || !isFantasyScorableGame(game)) {
      continue;
    }

    const weekKey = getGameWeekKey(new Date(game.date));
    const ids = eligibleLeagueGamesByWeek.get(weekKey) ?? new Set<string>();
    ids.add(game.id);
    eligibleLeagueGamesByWeek.set(weekKey, ids);
  }

  const predictedLeagueGamesByWeek = new Map<string, Set<string>>();

  for (const prediction of predictions) {
    if (
      prediction.game.gameType !== GameType.LEAGUE ||
      !isFantasyScorableGame(prediction.game)
    ) {
      continue;
    }

    const weekKey = getGameWeekKey(new Date(prediction.game.date));
    const ids = predictedLeagueGamesByWeek.get(weekKey) ?? new Set<string>();
    ids.add(prediction.game.id);
    predictedLeagueGamesByWeek.set(weekKey, ids);
  }

  let fullWeeks = 0;

  for (const [weekKey, eligibleGameIds] of eligibleLeagueGamesByWeek.entries()) {
    const predictedGameIds = predictedLeagueGamesByWeek.get(weekKey);
    if (!predictedGameIds) {
      continue;
    }

    if (predictedGameIds.size === eligibleGameIds.size) {
      fullWeeks += 1;
    }
  }

  return fullWeeks;
}

export function calculateBoostersRemaining(input: {
  fullParticipationWeeks: number;
  boostedPredictionCount: number;
}): number {
  if (!canUseBoosters(input.fullParticipationWeeks)) {
    return 0;
  }

  return Math.max(0, SEASON_BOOSTER_COUNT - input.boostedPredictionCount);
}
