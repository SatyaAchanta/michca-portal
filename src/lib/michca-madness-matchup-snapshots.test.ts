import { describe, expect, it } from "vitest";
import { Division, GameResult } from "@/generated/prisma/client";

import { buildMichcaMadnessMatchupSnapshots } from "@/lib/michca-madness-matchup-snapshots";

const baseSlot = {
  key: "QF1",
  team1Code: "AAA",
  team2Code: "BBB",
};

function game(overrides: {
  date: string;
  team1Code: string;
  team2Code: string;
  winnerCode: string | null;
  resultType?: GameResult;
  isDraw?: boolean;
  division?: Division;
}) {
  return {
    date: new Date(overrides.date),
    division: overrides.division ?? Division.PREMIER_T20,
    team1Code: overrides.team1Code,
    team2Code: overrides.team2Code,
    winnerCode: overrides.winnerCode,
    resultType: overrides.resultType ?? GameResult.WIN,
    isDraw: overrides.isDraw ?? false,
  };
}

describe("buildMichcaMadnessMatchupSnapshots", () => {
  it("returns no snapshot for unresolved matchups", () => {
    const snapshots = buildMichcaMadnessMatchupSnapshots({
      division: Division.PREMIER_T20,
      slots: [{ key: "SF1", team1Code: "AAA", team2Code: null }],
      seeds: [],
      completedGames: [],
      communityPicks: null,
    });

    expect(snapshots).toEqual([]);
  });

  it("attaches seed labels and last five form in oldest-to-newest order", () => {
    const snapshots = buildMichcaMadnessMatchupSnapshots({
      division: Division.PREMIER_T20,
      slots: [baseSlot],
      seeds: [
        { seedKey: "S1", label: "Rank 1", teamCode: "AAA" },
        { seedKey: "S8", label: "Rank 8", teamCode: "BBB" },
      ],
      completedGames: [
        game({
          date: "2026-06-06T14:00:00.000Z",
          team1Code: "AAA",
          team2Code: "T6",
          winnerCode: "AAA",
        }),
        game({
          date: "2026-06-05T14:00:00.000Z",
          team1Code: "T5",
          team2Code: "AAA",
          winnerCode: "T5",
        }),
        game({
          date: "2026-06-04T14:00:00.000Z",
          team1Code: "AAA",
          team2Code: "T4",
          winnerCode: null,
          resultType: GameResult.DRAW,
          isDraw: true,
        }),
        game({
          date: "2026-06-03T14:00:00.000Z",
          team1Code: "T3",
          team2Code: "AAA",
          winnerCode: "AAA",
        }),
        game({
          date: "2026-06-02T14:00:00.000Z",
          team1Code: "AAA",
          team2Code: "T2",
          winnerCode: "T2",
        }),
        game({
          date: "2026-06-01T14:00:00.000Z",
          team1Code: "AAA",
          team2Code: "T1",
          winnerCode: "AAA",
        }),
      ],
      communityPicks: null,
    });

    expect(snapshots[0]).toMatchObject({
      team1SeedLabel: "Rank 1",
      team2SeedLabel: "Rank 8",
      team1Form: ["L", "W", "D", "L", "W"],
      team2Form: [],
      communityPicks: null,
    });
  });

  it("counts same-season head-to-head wins and draws", () => {
    const snapshots = buildMichcaMadnessMatchupSnapshots({
      division: Division.PREMIER_T20,
      slots: [baseSlot],
      seeds: [],
      completedGames: [
        game({
          date: "2026-06-01T14:00:00.000Z",
          team1Code: "AAA",
          team2Code: "BBB",
          winnerCode: "AAA",
        }),
        game({
          date: "2026-06-08T14:00:00.000Z",
          team1Code: "BBB",
          team2Code: "AAA",
          winnerCode: "BBB",
        }),
        game({
          date: "2026-06-15T14:00:00.000Z",
          team1Code: "AAA",
          team2Code: "BBB",
          winnerCode: null,
          resultType: GameResult.DRAW,
          isDraw: true,
        }),
        game({
          date: "2026-06-22T14:00:00.000Z",
          team1Code: "AAA",
          team2Code: "BBB",
          winnerCode: null,
          resultType: GameResult.ABANDONED,
        }),
      ],
      communityPicks: null,
    });

    expect(snapshots[0].headToHead).toEqual({
      team1Wins: 1,
      team2Wins: 1,
      draws: 1,
      total: 3,
    });
    expect(snapshots[0].guidance).toBe(
      "Head-to-head is even across 3 recent meetings.",
    );
  });

  it("keeps community pick percentages hidden when picks are not supplied", () => {
    const snapshots = buildMichcaMadnessMatchupSnapshots({
      division: Division.PREMIER_T20,
      slots: [baseSlot],
      seeds: [],
      completedGames: [],
      communityPicks: null,
    });

    expect(snapshots[0].communityPicks).toBeNull();
  });

  it("computes community pick percentages when locked picks are supplied", () => {
    const snapshots = buildMichcaMadnessMatchupSnapshots({
      division: Division.PREMIER_T20,
      slots: [baseSlot],
      seeds: [],
      completedGames: [],
      communityPicks: [
        { slotKey: "QF1", predictedWinnerCode: "AAA" },
        { slotKey: "QF1", predictedWinnerCode: "AAA" },
        { slotKey: "QF1", predictedWinnerCode: "BBB" },
        { slotKey: "SF1", predictedWinnerCode: "AAA" },
      ],
    });

    expect(snapshots[0].communityPicks).toEqual({
      total: 3,
      team1Count: 2,
      team2Count: 1,
      team1Percentage: 67,
      team2Percentage: 33,
    });
  });

  it("removes format prefixes from generated guidance", () => {
    const snapshots = buildMichcaMadnessMatchupSnapshots({
      division: Division.PREMIER_T20,
      slots: [{ key: "QF1", team1Code: "T20-RKCC", team2Code: "T20-MACC" }],
      seeds: [],
      completedGames: [
        game({
          date: "2026-06-01T14:00:00.000Z",
          team1Code: "T20-RKCC",
          team2Code: "T20-MACC",
          winnerCode: "T20-RKCC",
        }),
      ],
      communityPicks: null,
    });

    expect(snapshots[0].guidance).toBe("RKCC leads recent head-to-head 1-0.");
  });
});
