import { prisma } from "@/lib/prisma";

export function parseClubInfoAdminSearch(input?: string) {
  return input?.trim() ?? "";
}

export async function getClubInfoAdminData(filters?: { teamName?: string; division?: string }) {
  const teamName = parseClubInfoAdminSearch(filters?.teamName);
  const division = filters?.division?.trim() ?? "";

  const submissions = await prisma.clubInfoSubmission.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      accountEmail: true,
      captainName: true,
      cricclubsId: true,
      contactNumber: true,
      t20Division: true,
      t20TeamCode: true,
      secondaryDivision: true,
      secondaryTeamCode: true,
      createdAt: true,
      updatedAt: true,
      userProfile: {
        select: {
          email: true,
        },
      },
    },
  });

  const teamCodes = Array.from(
    new Set(
      submissions.flatMap((submission) =>
        [submission.t20TeamCode, submission.secondaryTeamCode].filter(
          (code): code is string => code !== null,
        ),
      ),
    ),
  );

  const teams = teamCodes.length
    ? await prisma.team.findMany({
        where: { teamCode: { in: teamCodes } },
        select: {
          teamCode: true,
          teamName: true,
          division: true,
          format: true,
        },
      })
    : [];

  const teamMap = new Map(teams.map((team) => [team.teamCode, team]));

  const rows = submissions
    .map((submission) => ({
      ...submission,
      t20Team: submission.t20TeamCode
        ? (teamMap.get(submission.t20TeamCode) ?? null)
        : null,
      secondaryTeam: submission.secondaryTeamCode
        ? (teamMap.get(submission.secondaryTeamCode) ?? null)
        : null,
    }))
    .filter((submission) => {
      if (division) {
        const divisions = [submission.t20Team?.division, submission.secondaryTeam?.division].filter(
          Boolean,
        );
        if (!divisions.includes(division)) {
          return false;
        }
      }

      if (!teamName) {
        return true;
      }

      return [submission.t20Team?.teamName, submission.secondaryTeam?.teamName].some((name) =>
        name?.toLowerCase().includes(teamName.toLowerCase()),
      );
    })
    .sort((left, right) => {
      const leftName = left.t20Team?.teamName ?? left.secondaryTeam?.teamName ?? "";
      const rightName = right.t20Team?.teamName ?? right.secondaryTeam?.teamName ?? "";
      const teamComparison = leftName.localeCompare(rightName, undefined, {
        sensitivity: "base",
      });
      if (teamComparison !== 0) {
        return teamComparison;
      }

      return left.captainName.localeCompare(right.captainName, undefined, {
        sensitivity: "base",
      });
    });

  return {
    rows,
    count: rows.length,
  };
}

export async function findConflictingCaptainAssignments(
  profileId: string,
  teamCodes: string[],
) {
  if (teamCodes.length === 0) {
    return [];
  }

  return prisma.team.findMany({
    where: {
      teamCode: { in: teamCodes },
      captainId: {
        not: null,
      },
      NOT: {
        captainId: profileId,
      },
    },
    select: {
      teamCode: true,
      teamName: true,
      captain: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
}
