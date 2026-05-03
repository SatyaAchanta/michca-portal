"use server";

import { revalidatePath } from "next/cache";
import { GameStatus, type Division, type GameType } from "@/generated/prisma/client";
import { grounds } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { parseDetroitDateTime } from "@/lib/schedule-import";
import { requireAdminAllowlistedProfile } from "@/lib/user-profile";
import { getFormatForGameDivision } from "@/lib/team-data";

export type AdminGameActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const DIVISION_VALUES = [
  "PREMIER_T20",
  "DIV1_T20",
  "DIV2_T20",
  "DIV3_T20",
  "F40",
  "T30",
  "U15",
  "GLT",
] as const satisfies readonly Division[];

const GAME_TYPE_VALUES = ["LEAGUE", "PLAYOFF"] as const satisfies readonly GameType[];
const KNOWN_VENUES = new Set(grounds.map((ground) => ground.name));

function normalizeRequiredString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalString(value: FormDataEntryValue | null) {
  const normalized = normalizeRequiredString(value);
  return normalized.length > 0 ? normalized : null;
}

function isDivision(value: string): value is Division {
  return DIVISION_VALUES.includes(value as Division);
}

function isGameType(value: string): value is GameType {
  return GAME_TYPE_VALUES.includes(value as GameType);
}

function getLeagueForDivision(division: Division) {
  switch (division) {
    case "PREMIER_T20":
    case "DIV1_T20":
    case "DIV2_T20":
    case "DIV3_T20":
      return "2026 T20";
    case "F40":
    case "T30":
      return "2026 F40 & T30";
    case "U15":
      return "2026 U15";
    case "GLT":
      return "2026 GLT";
  }
}

function getTeamDivisionForGameDivision(division: Division) {
  switch (division) {
    case "PREMIER_T20":
      return "Premier";
    case "DIV1_T20":
      return "Division-1";
    case "DIV2_T20":
      return "Division-2";
    case "DIV3_T20":
      return "Division-3";
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

function revalidateGameAdminPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/games");
  revalidatePath("/admin/fantasy");
  revalidatePath("/fantasy");
}

export async function createAdminGame(
  _prevState: AdminGameActionState,
  formData: FormData
): Promise<AdminGameActionState> {
  await requireAdminAllowlistedProfile();

  const date = normalizeRequiredString(formData.get("date"));
  const time = normalizeRequiredString(formData.get("time"));
  const divisionInput = normalizeRequiredString(formData.get("division"));
  const gameTypeInput = normalizeRequiredString(formData.get("gameType"));
  const venue = normalizeOptionalString(formData.get("venue"));
  const team1Code = normalizeRequiredString(formData.get("team1Code"));
  const team2Code = normalizeRequiredString(formData.get("team2Code"));

  if (!date || !time || !divisionInput || !gameTypeInput || !team1Code || !team2Code) {
    return { status: "error", message: "Date, time, division, game type, and both teams are required." };
  }

  if (!/^\d{2}:\d{2}$/.test(time)) {
    return { status: "error", message: "Time must use HH:MM format." };
  }

  if (!isDivision(divisionInput)) {
    return { status: "error", message: "Invalid division selected." };
  }

  if (!isGameType(gameTypeInput)) {
    return { status: "error", message: "Invalid game type selected." };
  }

  if (venue && !KNOWN_VENUES.has(venue)) {
    return { status: "error", message: "Invalid venue selected." };
  }

  if (team1Code === team2Code) {
    return { status: "error", message: "A game must have two different teams." };
  }

  let scheduledAt: Date;
  try {
    scheduledAt = parseDetroitDateTime(date, `${time}:00`);
  } catch (error) {
    return { status: "error", message: (error as Error).message };
  }

  const [team1, team2] = await Promise.all([
    prisma.team.findUnique({
      where: { teamCode: team1Code },
      select: { teamCode: true, teamName: true, format: true, division: true },
    }),
    prisma.team.findUnique({
      where: { teamCode: team2Code },
      select: { teamCode: true, teamName: true, format: true, division: true },
    }),
  ]);

  if (!team1 || !team2) {
    return { status: "error", message: "Both teams must exist before creating a game." };
  }

  const expectedFormat = getFormatForGameDivision(divisionInput);
  const expectedDivision = getTeamDivisionForGameDivision(divisionInput);
  const league = getLeagueForDivision(divisionInput);

  if (team1.format !== expectedFormat || team2.format !== expectedFormat) {
    return { status: "error", message: "Selected teams do not match the chosen game format." };
  }

  if (team1.division !== expectedDivision || team2.division !== expectedDivision) {
    return { status: "error", message: "Selected teams do not match the chosen division." };
  }

  if (!league) {
    return { status: "error", message: "Unable to derive league for the selected division." };
  }

  await prisma.game.create({
    data: {
      date: scheduledAt,
      division: divisionInput,
      league,
      status: GameStatus.SCHEDULED,
      venue,
      team1Code,
      team2Code,
      gameType: gameTypeInput,
    },
  });

  revalidateGameAdminPages();
  return { status: "success", message: `${team1.teamName} vs ${team2.teamName} created.` };
}

export async function cancelAdminGame(
  _prevState: AdminGameActionState,
  formData: FormData
): Promise<AdminGameActionState> {
  await requireAdminAllowlistedProfile();

  const gameId = normalizeRequiredString(formData.get("gameId"));
  if (!gameId) {
    return { status: "error", message: "Game id is required." };
  }

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { id: true, status: true },
  });

  if (!game) {
    return { status: "error", message: "Game not found." };
  }

  if (game.status === GameStatus.COMPLETED) {
    return { status: "error", message: "Completed games cannot be canceled." };
  }

  if (game.status === GameStatus.CANCELLED) {
    return { status: "error", message: "Game is already canceled." };
  }

  await prisma.game.update({
    where: { id: gameId },
    data: {
      status: GameStatus.CANCELLED,
      winnerCode: null,
      isDraw: false,
      isCancelled: true,
    },
  });

  revalidateGameAdminPages();
  return { status: "success", message: "Game canceled." };
}
