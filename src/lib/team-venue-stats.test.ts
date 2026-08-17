import { describe, expect, it } from "vitest";
import { GameStatus } from "@/generated/prisma/client";
import { buildTeamVenueStatsMap } from "@/lib/team-venue-stats";

describe("buildTeamVenueStatsMap", () => {
  it("calculates games played and won at a specific venue and division for each team", () => {
    const completedGames = [
      {
        venue: "Lyon Oaks",
        division: "PREMIER_T20",
        team1Code: "TEAM_A",
        team2Code: "TEAM_B",
        winnerCode: "TEAM_A",
        status: GameStatus.COMPLETED,
      },
      {
        venue: "Lyon Oaks",
        division: "PREMIER_T20",
        team1Code: "TEAM_A",
        team2Code: "TEAM_C",
        winnerCode: "TEAM_A",
        status: GameStatus.COMPLETED,
      },
      {
        venue: "Lyon Oaks",
        division: "PREMIER_T20",
        team1Code: "TEAM_B",
        team2Code: "TEAM_C",
        winnerCode: "TEAM_C",
        status: GameStatus.COMPLETED,
      },
      {
        venue: "Jayne Field",
        division: "PREMIER_T20",
        team1Code: "TEAM_A",
        team2Code: "TEAM_B",
        winnerCode: "TEAM_B",
        status: GameStatus.COMPLETED,
      },
      {
        venue: "Lyon Oaks",
        division: "DIV1_T20", // Different division
        team1Code: "TEAM_A",
        team2Code: "TEAM_B",
        winnerCode: "TEAM_A",
        status: GameStatus.COMPLETED,
      },
    ];

    const targetMatches = [
      {
        venue: "Lyon Oaks ",
        division: "PREMIER_T20",
        team1Code: "TEAM_A",
        team2Code: "TEAM_B",
      },
    ];

    const statsMap = buildTeamVenueStatsMap(completedGames, targetMatches);

    expect(statsMap.get("TEAM_A:PREMIER_T20:lyon oaks")).toEqual({
      gamesPlayed: 2,
      gamesWon: 2,
    });
    expect(statsMap.get("TEAM_B:PREMIER_T20:lyon oaks")).toEqual({
      gamesPlayed: 2,
      gamesWon: 0,
    });
  });

  it("handles null or empty venue gracefully", () => {
    const completedGames = [
      {
        venue: null,
        division: "PREMIER_T20",
        team1Code: "TEAM_A",
        team2Code: "TEAM_B",
        winnerCode: "TEAM_A",
        status: GameStatus.COMPLETED,
      },
    ];

    const targetMatches = [
      {
        venue: null,
        division: "PREMIER_T20",
        team1Code: "TEAM_A",
        team2Code: "TEAM_B",
      },
    ];

    const statsMap = buildTeamVenueStatsMap(completedGames, targetMatches);
    expect(statsMap.size).toBe(0);
  });
});
