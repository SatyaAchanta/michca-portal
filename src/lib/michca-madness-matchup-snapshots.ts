import type { Division, GameResult } from "@/generated/prisma/client";
import { hasWinningResult, isDrawResult } from "@/lib/game-results";

export type TeamFormResult = "W" | "L" | "D";

export type MichcaMadnessSnapshotGame = {
  date: Date;
  division: Division;
  team1Code: string;
  team2Code: string;
  winnerCode: string | null;
  resultType: GameResult;
  isDraw: boolean;
};

export type MichcaMadnessSnapshotSeed = {
  seedKey: string;
  label: string;
  teamCode: string | null;
};

export type MichcaMadnessSnapshotSlot = {
  key: string;
  team1Code: string | null;
  team2Code: string | null;
};

export type MichcaMadnessSnapshotPick = {
  slotKey: string;
  predictedWinnerCode: string;
};

export type MichcaMadnessMatchupSnapshot = {
  slotKey: string;
  team1Code: string;
  team2Code: string;
  team1SeedLabel: string | null;
  team2SeedLabel: string | null;
  team1Form: TeamFormResult[];
  team2Form: TeamFormResult[];
  headToHead: {
    team1Wins: number;
    team2Wins: number;
    draws: number;
    total: number;
  };
  guidance: string;
  communityPicks: {
    total: number;
    team1Count: number;
    team2Count: number;
    team1Percentage: number | null;
    team2Percentage: number | null;
  } | null;
};

function getTeamResult(
  game: MichcaMadnessSnapshotGame,
  teamCode: string,
): TeamFormResult | null {
  if (isDrawResult(game)) return "D";
  if (!hasWinningResult(game)) return null;
  return game.winnerCode === teamCode ? "W" : "L";
}

function getTeamForm(games: MichcaMadnessSnapshotGame[], teamCode: string) {
  const recent = games
    .filter((game) => game.team1Code === teamCode || game.team2Code === teamCode)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .flatMap((game) => {
      const result = getTeamResult(game, teamCode);
      return result ? [result] : [];
    })
    .slice(0, 5);

  return recent.reverse();
}

function getHeadToHead(
  games: MichcaMadnessSnapshotGame[],
  team1Code: string,
  team2Code: string,
) {
  return games
    .filter(
      (game) =>
        (game.team1Code === team1Code && game.team2Code === team2Code) ||
        (game.team1Code === team2Code && game.team2Code === team1Code),
    )
    .reduce(
      (record, game) => {
        if (isDrawResult(game)) {
          record.draws += 1;
          record.total += 1;
        } else if (hasWinningResult(game)) {
          if (game.winnerCode === team1Code) record.team1Wins += 1;
          if (game.winnerCode === team2Code) record.team2Wins += 1;
          record.total += 1;
        }
        return record;
      },
      { team1Wins: 0, team2Wins: 0, draws: 0, total: 0 },
    );
}

function countWins(form: TeamFormResult[]) {
  return form.filter((result) => result === "W").length;
}

function formatTeamCode(code: string) {
  return code.replace(/^(T20|F40|T30)-/i, "");
}

function buildGuidance({
  team1Code,
  team2Code,
  team1Form,
  team2Form,
  headToHead,
}: {
  team1Code: string;
  team2Code: string;
  team1Form: TeamFormResult[];
  team2Form: TeamFormResult[];
  headToHead: MichcaMadnessMatchupSnapshot["headToHead"];
}) {
  const team1Label = formatTeamCode(team1Code);
  const team2Label = formatTeamCode(team2Code);

  if (headToHead.total > 0) {
    if (headToHead.team1Wins > headToHead.team2Wins) {
      return `${team1Label} leads recent head-to-head ${headToHead.team1Wins}-${headToHead.team2Wins}.`;
    }
    if (headToHead.team2Wins > headToHead.team1Wins) {
      return `${team2Label} leads recent head-to-head ${headToHead.team2Wins}-${headToHead.team1Wins}.`;
    }
    return `Head-to-head is even across ${headToHead.total} recent meeting${headToHead.total === 1 ? "" : "s"}.`;
  }

  const team1Wins = countWins(team1Form);
  const team2Wins = countWins(team2Form);
  if (team1Wins > team2Wins) {
    return `${team1Label} has the stronger recent form.`;
  }
  if (team2Wins > team1Wins) {
    return `${team2Label} has the stronger recent form.`;
  }
  return "Recent form is close; compare seeds and matchup history.";
}

function getCommunityPicks(
  slotKey: string,
  team1Code: string,
  team2Code: string,
  communityPicks: MichcaMadnessSnapshotPick[] | null,
) {
  if (!communityPicks) return null;

  const slotPicks = communityPicks.filter((pick) => pick.slotKey === slotKey);
  const team1Count = slotPicks.filter(
    (pick) => pick.predictedWinnerCode === team1Code,
  ).length;
  const team2Count = slotPicks.filter(
    (pick) => pick.predictedWinnerCode === team2Code,
  ).length;
  const total = slotPicks.length;

  return {
    total,
    team1Count,
    team2Count,
    team1Percentage: total > 0 ? Math.round((team1Count / total) * 100) : null,
    team2Percentage: total > 0 ? Math.round((team2Count / total) * 100) : null,
  };
}

export function buildMichcaMadnessMatchupSnapshots({
  division,
  slots,
  seeds,
  completedGames,
  communityPicks,
}: {
  division: Division;
  slots: MichcaMadnessSnapshotSlot[];
  seeds: MichcaMadnessSnapshotSeed[];
  completedGames: MichcaMadnessSnapshotGame[];
  communityPicks: MichcaMadnessSnapshotPick[] | null;
}) {
  const divisionGames = completedGames.filter((game) => game.division === division);
  const seedLabelByTeamCode = new Map(
    seeds
      .filter((seed) => seed.teamCode)
      .map((seed) => [seed.teamCode as string, seed.label]),
  );

  return slots.flatMap((slot): MichcaMadnessMatchupSnapshot[] => {
    if (!slot.team1Code || !slot.team2Code) return [];

    const team1Form = getTeamForm(divisionGames, slot.team1Code);
    const team2Form = getTeamForm(divisionGames, slot.team2Code);
    const headToHead = getHeadToHead(
      divisionGames,
      slot.team1Code,
      slot.team2Code,
    );

    return [
      {
        slotKey: slot.key,
        team1Code: slot.team1Code,
        team2Code: slot.team2Code,
        team1SeedLabel: seedLabelByTeamCode.get(slot.team1Code) ?? null,
        team2SeedLabel: seedLabelByTeamCode.get(slot.team2Code) ?? null,
        team1Form,
        team2Form,
        headToHead,
        guidance: buildGuidance({
          team1Code: slot.team1Code,
          team2Code: slot.team2Code,
          team1Form,
          team2Form,
          headToHead,
        }),
        communityPicks: getCommunityPicks(
          slot.key,
          slot.team1Code,
          slot.team2Code,
          communityPicks,
        ),
      },
    ];
  });
}
