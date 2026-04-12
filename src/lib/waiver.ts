import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentWaiverYear } from "@/lib/waiver-constants";

export function buildWaiverSortValue(waiver: {
  t20Division: string;
  secondaryDivision: string;
  t20Team?: { teamName: string } | null;
  secondaryTeam?: { teamName: string } | null;
  playerName: string;
}) {
  return [
    waiver.t20Division,
    waiver.secondaryDivision,
    waiver.t20Team?.teamName ?? "",
    waiver.secondaryTeam?.teamName ?? "",
    waiver.playerName.toLowerCase(),
  ].join("|");
}

export function compareWaiverRows<T extends {
  t20Division: string;
  secondaryDivision: string;
  t20Team?: { teamName: string } | null;
  secondaryTeam?: { teamName: string } | null;
  playerName: string;
}>(left: T, right: T) {
  const divisionComparison = right.t20Division.localeCompare(left.t20Division);
  if (divisionComparison !== 0) {
    return divisionComparison;
  }

  const teamComparison = (left.t20Team?.teamName ?? "").localeCompare(right.t20Team?.teamName ?? "");
  if (teamComparison !== 0) {
    return teamComparison;
  }

  const playerComparison = left.playerName.localeCompare(right.playerName, undefined, {
    sensitivity: "base",
  });
  if (playerComparison !== 0) {
    return playerComparison;
  }

  return (left.secondaryTeam?.teamName ?? "").localeCompare(right.secondaryTeam?.teamName ?? "");
}

export function parseWaiverAdminSearch(input?: string) {
  return input?.trim() ?? "";
}

export async function getWaiverAdminData(filters?: {
  division?: string;
  teamCode?: string;
  playerName?: string;
}) {
  const year = getCurrentWaiverYear();
  const playerName = parseWaiverAdminSearch(filters?.playerName);

  const where: Prisma.WaiverSubmissionWhereInput = {
    year,
    ...(filters?.division
      ? {
          OR: [
            { t20Division: filters.division },
            { secondaryDivision: filters.division },
          ],
        }
      : {}),
    ...(filters?.teamCode
      ? {
          AND: [
            {
              OR: [
                { t20TeamCode: filters.teamCode },
                { secondaryTeamCode: filters.teamCode },
              ],
            },
          ],
        }
      : {}),
    ...(playerName
      ? {
          playerName: {
            contains: playerName,
            mode: "insensitive",
          },
        }
      : {}),
  };

  const waivers = await prisma.waiverSubmission.findMany({
    where,
    select: {
      id: true,
      playerName: true,
      cricclubsId: true,
      city: true,
      socialMediaHandle: true,
      t20Division: true,
      secondaryDivision: true,
      year: true,
      submittedAt: true,
      userProfile: {
        select: {
          email: true,
        },
      },
      t20TeamCode: true,
      secondaryTeamCode: true,
    },
  });

  const teamCodes = Array.from(
    new Set(waivers.flatMap((waiver) => [waiver.t20TeamCode, waiver.secondaryTeamCode]))
  );

  const teams = teamCodes.length
    ? await prisma.team.findMany({
        where: { teamCode: { in: teamCodes } },
        select: {
          teamCode: true,
          teamName: true,
        },
      })
    : [];

  const teamMap = new Map(teams.map((team) => [team.teamCode, team]));

  const rows = waivers
    .map((waiver) => ({
      ...waiver,
      t20Team: teamMap.get(waiver.t20TeamCode) ?? null,
      secondaryTeam: teamMap.get(waiver.secondaryTeamCode) ?? null,
    }))
    .sort(compareWaiverRows);

  return {
    year,
    rows,
    count: rows.length,
  };
}
