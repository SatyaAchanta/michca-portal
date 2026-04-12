import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  buildTeamCode,
  getFormatForGameDivision,
  parseTeamsCsv,
  type TeamSeedRow,
} from "@/lib/team-data";

const TEAM_CSV_PATH = path.join(process.cwd(), "instructions", "michca-2026-all-teams.csv");

type ExistingTeamRow = {
  teamCode: string;
  format: Prisma.TeamCreateInput["format"];
  division: Prisma.TeamCreateInput["division"];
  teamShortCode: string;
  teamName: string;
  description: string | null;
  captainId: string | null;
  viceCaptainId: string | null;
  facebookPage: string | null;
  instagramPage: string | null;
  logo: string | null;
};

async function readTeamSeedRows() {
  const csvContent = await readFile(TEAM_CSV_PATH, "utf8");
  return parseTeamsCsv(csvContent);
}

export async function syncTeamsFromInstructions() {
  const seedRows = await readTeamSeedRows();
  const existingTeams = await prisma.team.findMany({
    select: {
      teamCode: true,
      format: true,
      division: true,
      teamShortCode: true,
      teamName: true,
      description: true,
      captainId: true,
      viceCaptainId: true,
      facebookPage: true,
      instagramPage: true,
      logo: true,
    },
  });

  const existingByCode = new Map(existingTeams.map((team) => [team.teamCode, team]));
  const writes: Prisma.PrismaPromise<unknown>[] = [];

  for (const row of seedRows) {
    const existing = existingByCode.get(row.teamCode);

    if (!existing) {
      writes.push(
        prisma.team.create({
          data: {
            teamCode: row.teamCode,
            format: row.format,
            division: row.division,
            teamShortCode: row.teamShortCode,
            teamName: row.teamName,
          },
        })
      );
      continue;
    }

    const needsUpdate =
      existing.format !== row.format ||
      existing.division !== row.division ||
      existing.teamShortCode !== row.teamShortCode ||
      existing.teamName !== row.teamName;

    if (!needsUpdate) {
      continue;
    }

    writes.push(
      prisma.team.update({
        where: { teamCode: row.teamCode },
        data: {
          format: row.format,
          division: row.division,
          teamShortCode: row.teamShortCode,
          teamName: row.teamName,
        },
      })
    );
  }

  if (writes.length === 0) {
    return;
  }

  await prisma.$transaction(writes);
}

export async function getTeamSeedRowsForTests() {
  return readTeamSeedRows();
}

export function mergeSeedRowWithExisting(
  existingTeams: ExistingTeamRow[],
  seedRows: TeamSeedRow[]
) {
  const merged = new Map(existingTeams.map((team) => [team.teamCode, team]));

  for (const row of seedRows) {
    const existing = merged.get(row.teamCode);
    merged.set(row.teamCode, {
      teamCode: row.teamCode,
      format: row.format,
      division: row.division,
      teamShortCode: row.teamShortCode,
      teamName: row.teamName,
      description: existing?.description ?? null,
      captainId: existing?.captainId ?? null,
      viceCaptainId: existing?.viceCaptainId ?? null,
      facebookPage: existing?.facebookPage ?? null,
      instagramPage: existing?.instagramPage ?? null,
      logo: existing?.logo ?? null,
    });
  }

  return Array.from(merged.values()).sort((a, b) =>
    a.teamCode.localeCompare(b.teamCode)
  );
}

export function buildTeamCodeForGame(division: Prisma.GameCreateInput["division"], shortCode: string) {
  return buildTeamCode(getFormatForGameDivision(division), shortCode);
}
