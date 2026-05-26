export const GAME_RESULTS = {
  PENDING: "PENDING",
  WIN: "WIN",
  DRAW: "DRAW",
  ABANDONED: "ABANDONED",
  CANCELLED: "CANCELLED",
} as const;

export type GameResultValue = (typeof GAME_RESULTS)[keyof typeof GAME_RESULTS];

type ResultShape = {
  resultType?: GameResultValue;
  isDraw?: boolean;
  isCancelled?: boolean;
  winnerCode?: string | null;
};

export function getGameResult(game: ResultShape): GameResultValue {
  if (game.resultType && game.resultType !== GAME_RESULTS.PENDING) {
    return game.resultType;
  }

  if (game.isCancelled) {
    return GAME_RESULTS.CANCELLED;
  }

  if (game.isDraw) {
    // Legacy rows historically used isDraw for no-result/abandoned games.
    return GAME_RESULTS.ABANDONED;
  }

  if (game.winnerCode) {
    return GAME_RESULTS.WIN;
  }

  return GAME_RESULTS.PENDING;
}

export function isDrawResult(game: ResultShape): boolean {
  return getGameResult(game) === GAME_RESULTS.DRAW;
}

export function isAbandonedResult(game: ResultShape): boolean {
  return getGameResult(game) === GAME_RESULTS.ABANDONED;
}

export function isCancelledResult(game: ResultShape): boolean {
  return getGameResult(game) === GAME_RESULTS.CANCELLED;
}

export function hasWinningResult(game: ResultShape): boolean {
  return getGameResult(game) === GAME_RESULTS.WIN;
}

export function getGameResultLabel(game: ResultShape): string | null {
  switch (getGameResult(game)) {
    case GAME_RESULTS.DRAW:
      return "Draw";
    case GAME_RESULTS.ABANDONED:
      return "Abandoned";
    case GAME_RESULTS.CANCELLED:
      return "Cancelled";
    default:
      return null;
  }
}
