"use server";

import { GameStatus, Prisma } from "@prisma/client";
import { addHours, format } from "date-fns";

import { prisma } from "@/lib/prisma";
import {
  DIVISION_LABELS,
  DIVISIONS,
  PAGE_SIZE,
  SCHEDULE_STATUSES,
  type DivisionCode,
  type ScheduleFilters,
  type ScheduleQueryResult,
  type ScheduleSortOrder,
  type ScheduleStatusFilter,
} from "@/app/schedule/types";

const DISPLAY_HOUR_OFFSET = 4;

function toUtcDateAtTime(dateValue: string, timeValue: string) {
  return new Date(`${dateValue}T${timeValue}Z`);
}

function normalizeStatus(input: string): ScheduleStatusFilter {
  return SCHEDULE_STATUSES.includes(input as ScheduleStatusFilter)
    ? (input as ScheduleStatusFilter)
    : "SCHEDULED";
}

function normalizeDivision(input?: string): DivisionCode | undefined {
  if (!input || input === "all") {
    return undefined;
  }

  return DIVISIONS.includes(input as DivisionCode)
    ? (input as DivisionCode)
    : undefined;
}

function normalizePage(input: number) {
  return Number.isFinite(input) && input > 0 ? Math.floor(input) : 1;
}

function getCurrentYear() {
  return new Date().getUTCFullYear();
}

function getSeasonDateBounds(season: number) {
  const start = toUtcDateAtTime(`${season}-01-01`, "00:00:00.000");
  const end = toUtcDateAtTime(`${season}-12-31`, "23:59:59.999");

  return { start, end };
}

function getClampedDateRange(
  seasonStart: Date,
  seasonEnd: Date,
  startDate?: string,
  endDate?: string
) {
  const requestedStart = startDate
    ? toUtcDateAtTime(startDate, "00:00:00.000")
    : undefined;
  const requestedEnd = endDate
    ? toUtcDateAtTime(endDate, "23:59:59.999")
    : undefined;

  const gte = requestedStart && requestedStart > seasonStart ? requestedStart : seasonStart;
  const lte = requestedEnd && requestedEnd < seasonEnd ? requestedEnd : seasonEnd;

  return { gte, lte };
}

function parseYear(date: Date) {
  return date.getUTCFullYear();
}

export async function getScheduleSeasons(): Promise<number[]> {
  const rows = await prisma.game.findMany({
    select: { date: true },
    orderBy: { date: "desc" },
  });

  const uniqueYears = new Set<number>();
  for (const row of rows) {
    uniqueYears.add(parseYear(row.date));
  }

  return Array.from(uniqueYears).sort((a, b) => b - a);
}

export async function getScheduleGames(
  filters: ScheduleFilters
): Promise<ScheduleQueryResult> {
  const status = normalizeStatus(filters.status);
  const division = normalizeDivision(filters.division);
  const page = normalizePage(filters.page);
  const pageSize = PAGE_SIZE;
  const teamQuery = filters.teamQuery?.trim();

  const currentYear = getCurrentYear();
  const season = Number.isFinite(filters.season) ? Math.floor(filters.season) : currentYear;
  const isPastSeason = season < currentYear;
  const sortOrder: ScheduleSortOrder = isPastSeason ? "desc" : "asc";

  const seasonBounds = getSeasonDateBounds(season);
  const dateRange = getClampedDateRange(
    seasonBounds.start,
    seasonBounds.end,
    filters.startDate,
    filters.endDate
  );

  const where: Prisma.GameWhereInput = {
    date: dateRange,
  };

  if (!isPastSeason) {
    where.status = status === "SCHEDULED" ? GameStatus.SCHEDULED : GameStatus.COMPLETED;
  }

  if (division) {
    where.division = division;
  }

  if (teamQuery) {
    where.OR = [
      {
        team1: {
          name: {
            contains: teamQuery,
            mode: "insensitive",
          },
        },
      },
      {
        team2: {
          name: {
            contains: teamQuery,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const totalCount = await prisma.game.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const games = await prisma.game.findMany({
    where,
    orderBy: { date: sortOrder },
    include: {
      team1: { select: { name: true, shortCode: true } },
      team2: { select: { name: true, shortCode: true } },
      winner: { select: { name: true } },
    },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  return {
    items: games.map((game) => ({
      id: game.id,
      date: game.date.toISOString(),
      displayDateTime: format(
        addHours(game.date, DISPLAY_HOUR_OFFSET),
        "EEE, MMM d, HH:mm"
      ),
      division: DIVISION_LABELS[game.division],
      gameType: game.gameType,
      status: game.status,
      venue: game.venue ?? "Venue TBD",
      homeTeam: game.team1.name,
      awayTeam: game.team2.name,
      winnerTeamName: game.winner?.name,
      isDraw: game.isDraw,
      isCancelled: game.isCancelled,
    })),
    season,
    isPastSeason,
    sortOrder,
    totalCount,
    page: currentPage,
    pageSize,
    totalPages,
  };
}
