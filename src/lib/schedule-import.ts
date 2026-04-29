import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

import type { Division, GameType } from "../generated/prisma/client";
import { grounds } from "./data";

export const DETROIT_TIMEZONE = "America/Detroit";
export const DEFAULT_SCHEDULE_CSV_PATH = "instructions/michca-2026-schedule.csv";
export const UNKNOWN_VENUE = "N/A";

export type ScheduleImportRow = {
  rowNumber: number;
  matchType: string;
  date: string;
  time: string;
  teamOne: string;
  teamTwo: string;
  venue: string;
  league: string;
  divisionName: string;
};

export type ScheduleImportGame = {
  rowNumber: number;
  date: Date;
  division: Division;
  league: string;
  venue: string;
  team1Code: string;
  team2Code: string;
  team1Name: string;
  team2Name: string;
  gameType: GameType;
};

export type ExistingScheduleGame = {
  id: string;
  date: Date;
  division: Division;
  gameType: GameType;
  team1Code: string;
  team2Code: string;
};

export type ScheduleValidationResult = {
  errors: string[];
};

export type ScheduleImportPlan = {
  games: ScheduleImportGame[];
  creates: ScheduleImportGame[];
  updates: Array<{
    existing: ExistingScheduleGame;
    incoming: ScheduleImportGame;
  }>;
};

const REQUIRED_HEADERS = [
  "Match Type",
  "Date",
  "Time (EST)",
  "Team One",
  "Team two",
  "Venue",
  "League",
  "Division Name",
] as const;

const exactGroundNames = new Set(grounds.map((ground) => ground.name));

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (inQuotes) {
      if (char === "\"" && nextChar === "\"") {
        current += "\"";
        index += 1;
      } else if (char === "\"") {
        inQuotes = false;
      } else {
        current += char;
      }
      continue;
    }

    if (char === "\"") {
      inQuotes = true;
    } else if (char === ",") {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values.map((value) => value.trim());
}

export function parseScheduleCsv(csvContent: string): ScheduleImportRow[] {
  const lines = csvContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);
  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required schedule CSV headers: ${missingHeaders.join(", ")}`);
  }

  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, i) => [header, values[i] ?? ""]));

    return {
      rowNumber: index + 2,
      matchType: row["Match Type"],
      date: row.Date,
      time: row["Time (EST)"],
      teamOne: row["Team One"],
      teamTwo: row["Team two"],
      venue: row.Venue,
      league: row.League,
      divisionName: row["Division Name"],
    };
  });
}

export function normalizeGameType(input: string): GameType {
  switch (input.trim().toLowerCase()) {
    case "league":
      return "LEAGUE";
    case "playoff":
      return "PLAYOFF";
    default:
      throw new Error(`Unsupported match type: ${input}`);
  }
}

export function normalizeGameDivision(input: string): Division {
  switch (input.trim()) {
    case "Premier":
      return "PREMIER_T20";
    case "Division I":
      return "DIV1_T20";
    case "Division II":
      return "DIV2_T20";
    case "Division III":
      return "DIV3_T20";
    case "F40":
      return "F40";
    case "T30":
      return "T30";
    default:
      throw new Error(`Unsupported division value: ${input}`);
  }
}

export function extractTeamShortCode(teamName: string) {
  const tokens = teamName.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    throw new Error("Team name is required");
  }

  return tokens[tokens.length - 1].toUpperCase();
}

export function getTeamCodePrefix(league: string, divisionName: string) {
  return league.toUpperCase().includes("T20")
    ? "T20"
    : divisionName.trim().toUpperCase();
}

export function buildScheduleTeamCode(league: string, divisionName: string, teamName: string) {
  return `${getTeamCodePrefix(league, divisionName)}-${extractTeamShortCode(teamName)}`;
}

export function normalizeVenue(input: string) {
  const venue = input.trim();
  return exactGroundNames.has(venue) ? venue : UNKNOWN_VENUE;
}

export function parseDetroitDateTime(dateValue: string, timeValue: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    throw new Error(`Invalid date value: ${dateValue}`);
  }

  if (!/^\d{2}:\d{2}:\d{2}$/.test(timeValue)) {
    throw new Error(`Invalid time value: ${timeValue}`);
  }

  return fromZonedTime(`${dateValue}T${timeValue}`, DETROIT_TIMEZONE);
}

export function parseScheduleRow(row: ScheduleImportRow): ScheduleImportGame {
  return {
    rowNumber: row.rowNumber,
    date: parseDetroitDateTime(row.date, row.time),
    division: normalizeGameDivision(row.divisionName),
    league: row.league.trim(),
    venue: normalizeVenue(row.venue),
    team1Code: buildScheduleTeamCode(row.league, row.divisionName, row.teamOne),
    team2Code: buildScheduleTeamCode(row.league, row.divisionName, row.teamTwo),
    team1Name: row.teamOne.trim(),
    team2Name: row.teamTwo.trim(),
    gameType: normalizeGameType(row.matchType),
  };
}

export function parseScheduleRows(rows: ScheduleImportRow[]) {
  return rows.map((row) => parseScheduleRow(row));
}

export function getScheduleNaturalKey(game: ScheduleImportGame | ExistingScheduleGame) {
  return [
    game.date.getTime(),
    game.division,
    game.gameType,
    game.team1Code,
    game.team2Code,
  ].join("|");
}

export function validateScheduleGames(
  games: ScheduleImportGame[],
  existingTeamCodes: Set<string>
): ScheduleValidationResult {
  const errors: string[] = [];
  const seenNaturalKeys = new Map<string, number>();

  for (const game of games) {
    if (game.team1Code === game.team2Code) {
      errors.push(`Row ${game.rowNumber}: Team One and Team two resolve to ${game.team1Code}.`);
    }

    for (const teamCode of [game.team1Code, game.team2Code]) {
      if (!existingTeamCodes.has(teamCode)) {
        errors.push(`Row ${game.rowNumber}: Team code ${teamCode} does not exist.`);
      }
    }

    const naturalKey = getScheduleNaturalKey(game);
    const firstSeenRow = seenNaturalKeys.get(naturalKey);
    if (firstSeenRow) {
      errors.push(
        `Row ${game.rowNumber}: Duplicate game also appears on row ${firstSeenRow}.`
      );
    } else {
      seenNaturalKeys.set(naturalKey, game.rowNumber);
    }
  }

  return { errors };
}

export function buildScheduleImportPlan(
  games: ScheduleImportGame[],
  existingGames: ExistingScheduleGame[]
): ScheduleImportPlan {
  const existingByNaturalKey = new Map(
    existingGames.map((game) => [getScheduleNaturalKey(game), game])
  );

  const creates: ScheduleImportGame[] = [];
  const updates: ScheduleImportPlan["updates"] = [];

  for (const game of games) {
    const existing = existingByNaturalKey.get(getScheduleNaturalKey(game));
    if (existing) {
      updates.push({ existing, incoming: game });
    } else {
      creates.push(game);
    }
  }

  return { games, creates, updates };
}

export function formatDryRunPreview(games: ScheduleImportGame[], limit = 5) {
  return games
    .toSorted((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit)
    .map((game) => ({
      row: game.rowNumber,
      dateTime: formatInTimeZone(game.date, DETROIT_TIMEZONE, "yyyy-MM-dd HH:mm:ss zzz"),
      division: game.division,
      gameType: game.gameType,
      venue: game.venue,
      team1: `${game.team1Name} (${game.team1Code})`,
      team2: `${game.team2Name} (${game.team2Code})`,
    }));
}
