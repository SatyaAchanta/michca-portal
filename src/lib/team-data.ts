import type { Division, TeamFormat } from "@/generated/prisma/client";

export const TEAM_DIVISIONS = [
  "Division-1",
  "Division-2",
  "Division-3",
  "Premier",
  "F40",
  "T30",
  "YOUTH",
  "GLT",
] as const;

export type TeamDivision = (typeof TEAM_DIVISIONS)[number];

export type TeamSeedRow = {
  format: TeamFormat;
  division: TeamDivision;
  teamShortCode: string;
  teamCode: string;
  teamName: string;
};

export const TEAM_FORMAT_OPTIONS = ["T20", "F40", "T30", "YOUTH", "GLT"] as const;

export function normalizeTeamDivision(input: string): TeamDivision {
  const value = input.trim();

  switch (value) {
    case "Division-1":
      return "Division-1";
    case "Division-2":
      return "Division-2";
    case "Division-3":
    case "Divison-3":
      return "Division-3";
    case "Premier":
      return "Premier";
    case "F40":
      return "F40";
    case "T30":
      return "T30";
    case "YOUTH":
      return "YOUTH";
    case "GLT":
      return "GLT";
    default:
      throw new Error(`Unsupported division value: ${input}`);
  }
}

export function normalizeTeamFormat(input: string): TeamFormat {
  const value = input.trim();

  switch (value) {
    case "T20":
    case "F40":
    case "T30":
    case "GLT":
      return value;
    case "YOUTH":
      return "YOUTH";
    default:
      throw new Error(`Unsupported format value: ${input}`);
  }
}

export function buildTeamCode(format: TeamFormat, teamShortCode: string) {
  return `${format}-${teamShortCode.trim().toUpperCase()}`;
}

export function parseTeamsCsv(csvContent: string): TeamSeedRow[] {
  const lines = csvContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  return lines.slice(1).map((line) => {
    const [rawFormat = "", rawDivision = "", rawShortCode = "", ...nameParts] = line.split(",");
    const teamShortCode = rawShortCode.trim().toUpperCase();
    const format = normalizeTeamFormat(rawFormat);
    const division = normalizeTeamDivision(rawDivision);
    const teamName = nameParts.join(",").trim().replace(/\s{2,}/g, " ");

    return {
      format,
      division,
      teamShortCode,
      teamCode: buildTeamCode(format, teamShortCode),
      teamName,
    };
  });
}

export function getFormatForTeamDivision(division: TeamDivision): TeamFormat {
  switch (division) {
    case "Division-1":
    case "Division-2":
    case "Division-3":
    case "Premier":
      return "T20";
    case "F40":
      return "F40";
    case "T30":
      return "T30";
    case "YOUTH":
      return "YOUTH";
    case "GLT":
      return "GLT";
  }
}

export function getFormatForGameDivision(division: Division): TeamFormat {
  switch (division) {
    case "DIV1_T20":
    case "DIV2_T20":
    case "DIV3_T20":
    case "PREMIER_T20":
      return "T20";
    case "F40":
      return "F40";
    case "T30":
      return "T30";
    case "U15":
      return "YOUTH";
    case "GLT":
      return "GLT";
  }
}

export const TEAM_FORMAT_LABELS: Record<TeamFormat, string> = {
  T20: "T20",
  F40: "F40",
  T30: "T30",
  YOUTH: "Youth",
  GLT: "GLT",
};

export const TEAM_DIVISION_LABELS: Record<TeamDivision, string> = {
  "Division-1": "Division-1",
  "Division-2": "Division-2",
  "Division-3": "Division-3",
  Premier: "Premier",
  F40: "F40",
  T30: "T30",
  YOUTH: "YOUTH",
  GLT: "GLT",
};

export function getTeamDivisionLabel(division: string) {
  return TEAM_DIVISION_LABELS[division as TeamDivision] ?? division;
}
