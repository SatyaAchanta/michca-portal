import "server-only";

import type { TeamFormat } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import type { TeamDivision } from "@/lib/team-data";
import {
  WAIVER_PRIMARY_DIVISIONS,
  WAIVER_SECONDARY_DIVISIONS,
} from "@/lib/waiver-constants";

export async function getTeams(filters?: {
  format?: TeamFormat | "all";
  division?: TeamDivision | "all";
  search?: string;
}) {
  const rawSearch = filters?.search?.trim();
  const search = rawSearch && rawSearch.length >= 2 ? rawSearch : undefined;

  return prisma.team.findMany({
    where: {
      ...(filters?.format && filters.format !== "all" ? { format: filters.format } : {}),
      ...(filters?.division && filters.division !== "all"
        ? { division: filters.division }
        : {}),
      ...(search
        ? {
            OR: [
              { teamName: { contains: search, mode: "insensitive" } },
              { teamShortCode: { contains: search.toUpperCase(), mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      captain: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      viceCaptain: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: [{ format: "asc" }, { division: "asc" }, { teamName: "asc" }],
  });
}

export async function getTeamByCode(teamCode: string) {
  const now = new Date();
  const team = await prisma.team.findUnique({
    where: { teamCode },
    include: {
      captain: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      viceCaptain: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!team) {
    return null;
  }

  const gameInclude = {
    team1: {
      select: {
        teamCode: true,
        teamName: true,
      },
    },
    team2: {
      select: {
        teamCode: true,
        teamName: true,
      },
    },
  };

  const [players, upcomingGames, recentGames] = await Promise.all([
    prisma.userProfile.findMany({
      where:
        team.format === "T20"
          ? { t20TeamCode: team.teamCode }
          : { secondaryTeamCode: team.teamCode },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }, { email: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        playingRole: true,
      },
    }),
    prisma.game.findMany({
      where: {
        date: { gte: now },
        OR: [{ team1Code: team.teamCode }, { team2Code: team.teamCode }],
      },
      orderBy: { date: "asc" },
      take: 5,
      include: gameInclude,
    }),
    prisma.game.findMany({
      where: {
        date: { lt: now },
        OR: [{ team1Code: team.teamCode }, { team2Code: team.teamCode }],
      },
      orderBy: { date: "desc" },
      take: 5,
      include: gameInclude,
    }),
  ]);

  return {
    ...team,
    upcomingGames,
    recentGames,
    players,
  };
}

export async function getTeamAdminOptions() {
  const [teams, profiles] = await Promise.all([
    prisma.team.findMany({
      orderBy: [{ format: "asc" }, { division: "asc" }, { teamName: "asc" }],
      select: {
        teamCode: true,
        teamName: true,
        teamShortCode: true,
        format: true,
        division: true,
        captainId: true,
        viceCaptainId: true,
      },
    }),
    prisma.userProfile.findMany({
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }, { email: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    }),
  ]);

  return { teams, profiles };
}

export async function getWaiverTeamOptions() {
  const teams = await prisma.team.findMany({
    where: {
      OR: [
        {
          format: "T20",
          division: {
            in: [...WAIVER_PRIMARY_DIVISIONS],
          },
        },
        {
          format: {
            in: ["F40", "T30"],
          },
          division: {
            in: [...WAIVER_SECONDARY_DIVISIONS],
          },
        },
      ],
    },
    orderBy: [{ format: "asc" }, { division: "asc" }, { teamName: "asc" }],
    select: {
      teamCode: true,
      teamName: true,
      division: true,
      format: true,
    },
  });

  return teams;
}
