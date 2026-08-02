import type { GameResult } from "@/generated/prisma/client";
import { hasWinningResult, isDrawResult } from "@/lib/game-results";

export type TeamFormResult = "W" | "L" | "D";

export type TeamFormGame = {
  date: Date;
  team1Code: string;
  team2Code: string;
  winnerCode: string | null;
  resultType: GameResult;
  isDraw: boolean;
  isCancelled?: boolean;
};

export function getTeamFormResult(
  game: Omit<TeamFormGame, "date">,
  teamCode: string,
): TeamFormResult | null {
  if (isDrawResult(game)) return "D";
  if (!hasWinningResult(game)) return null;
  return game.winnerCode === teamCode ? "W" : "L";
}

export function buildTeamFormMap(
  games: TeamFormGame[],
  teamCodes: string[],
  limit = 5,
) {
  const targetTeamCodes = new Set(teamCodes);
  const formMap = new Map<string, TeamFormResult[]>(
    teamCodes.map((teamCode) => [teamCode, []]),
  );

  const sortedGames = [...games].sort(
    (left, right) => right.date.getTime() - left.date.getTime(),
  );

  for (const game of sortedGames) {
    for (const teamCode of [game.team1Code, game.team2Code]) {
      if (!targetTeamCodes.has(teamCode)) continue;

      const existing = formMap.get(teamCode) ?? [];
      if (existing.length >= limit) continue;

      const result = getTeamFormResult(game, teamCode);
      if (result === null) continue;

      existing.push(result);
      formMap.set(teamCode, existing);
    }
  }

  return new Map(
    Array.from(formMap.entries()).map(([teamCode, form]) => [
      teamCode,
      form.slice().reverse(),
    ]),
  );
}
