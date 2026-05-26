import { GameResult } from "../generated/prisma/client";

type ResultShape = {
  resultType?: GameResult;
  isDraw?: boolean;
  isCancelled?: boolean;
  winnerCode?: string | null;
};

export function getGameResult(game: ResultShape): GameResult {
  if (game.resultType && game.resultType !== GameResult.PENDING) {
    return game.resultType;
  }

  if (game.isCancelled) {
    return GameResult.CANCELLED;
  }

  if (game.isDraw) {
    // Legacy rows historically used isDraw for no-result/abandoned games.
    return GameResult.ABANDONED;
  }

  if (game.winnerCode) {
    return GameResult.WIN;
  }

  return GameResult.PENDING;
}

export function isDrawResult(game: ResultShape): boolean {
  return getGameResult(game) === GameResult.DRAW;
}

export function isAbandonedResult(game: ResultShape): boolean {
  return getGameResult(game) === GameResult.ABANDONED;
}

export function isCancelledResult(game: ResultShape): boolean {
  return getGameResult(game) === GameResult.CANCELLED;
}

export function hasWinningResult(game: ResultShape): boolean {
  return getGameResult(game) === GameResult.WIN;
}

export function getGameResultLabel(game: ResultShape): string | null {
  switch (getGameResult(game)) {
    case GameResult.DRAW:
      return "Draw";
    case GameResult.ABANDONED:
      return "Abandoned";
    case GameResult.CANCELLED:
      return "Cancelled";
    default:
      return null;
  }
}
