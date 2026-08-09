import type { GameStatus } from "@/generated/prisma/client";

export type CompletedVenueGame = {
  venue: string | null;
  division: string;
  team1Code: string;
  team2Code: string;
  winnerCode: string | null;
  status: GameStatus;
};

export type TeamVenueStats = {
  gamesPlayed: number;
  gamesWon: number;
};

export type MatchVenueTarget = {
  venue: string | null;
  division: string;
  team1Code: string;
  team2Code: string;
};

/**
 * Computes venue performance statistics for target teams per division and venue.
 */
export function buildTeamVenueStatsMap(
  completedGames: CompletedVenueGame[],
  targetMatches: MatchVenueTarget[],
): Map<string, TeamVenueStats> {
  const statsMap = new Map<string, TeamVenueStats>();

  for (const match of targetMatches) {
    if (!match.venue) continue;
    const normVenue = match.venue.trim().toLowerCase();

    for (const teamCode of [match.team1Code, match.team2Code]) {
      const key = `${teamCode}:${match.division}:${normVenue}`;
      if (statsMap.has(key)) continue;

      let gamesPlayed = 0;
      let gamesWon = 0;

      for (const game of completedGames) {
        if (!game.venue) continue;
        if (
          game.division === match.division &&
          game.venue.trim().toLowerCase() === normVenue
        ) {
          if (game.team1Code === teamCode || game.team2Code === teamCode) {
            gamesPlayed++;
            if (game.winnerCode === teamCode) {
              gamesWon++;
            }
          }
        }
      }

      statsMap.set(key, { gamesPlayed, gamesWon });
    }
  }

  return statsMap;
}
