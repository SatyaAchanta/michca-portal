import { formatInTimeZone } from "date-fns-tz";

export const FANTASY_TIME_ZONE = "America/Detroit";

function dateKeyToUtcDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function utcDateToDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDetroitDateKey(date: Date): string {
  return formatInTimeZone(date, FANTASY_TIME_ZONE, "yyyy-MM-dd");
}

function getDetroitIsoWeekday(date: Date): number {
  return Number(formatInTimeZone(date, FANTASY_TIME_ZONE, "i"));
}

export function toSaturdayKey(date: Date): string {
  const localDateKey = getDetroitDateKey(date);
  const localDate = dateKeyToUtcDate(localDateKey);
  const isoWeekday = getDetroitIsoWeekday(date); // 1=Mon ... 7=Sun
  const diffToSaturday = isoWeekday === 7 ? -1 : 6 - isoWeekday;

  localDate.setUTCDate(localDate.getUTCDate() + diffToSaturday);
  return utcDateToDateKey(localDate);
}

export function getGameWeekKey(date: Date): string {
  const localDate = dateKeyToUtcDate(getDetroitDateKey(date));
  const isoWeekday = localDate.getUTCDay() || 7; // 1=Mon ... 7=Sun

  const targetThursday = new Date(localDate);
  targetThursday.setUTCDate(localDate.getUTCDate() + 4 - isoWeekday);

  const isoYear = targetThursday.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(isoYear, 0, 4, 12));
  const firstThursdayIsoWeekday = firstThursday.getUTCDay() || 7;
  firstThursday.setUTCDate(
    firstThursday.getUTCDate() + 4 - firstThursdayIsoWeekday,
  );
  const weekNumber =
    1 +
    Math.round(
      (targetThursday.getTime() - firstThursday.getTime()) / 604800000,
    );

  return `${isoYear}-W${String(weekNumber).padStart(2, "0")}`;
}

export function formatWeekendLabel(saturdayKey: string): string {
  const saturday = dateKeyToUtcDate(saturdayKey);
  const sunday = new Date(saturday);
  sunday.setUTCDate(saturday.getUTCDate() + 1);

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: FANTASY_TIME_ZONE,
  });

  return `${formatter.format(saturday)} – ${formatter.format(sunday)}`;
}

export function formatWeekLabel(weekKey: string): string {
  const [yearStr, weekStr] = weekKey.split("-W");
  const year = Number(yearStr);
  const week = Number(weekStr);

  const jan4 = new Date(Date.UTC(year, 0, 4, 12));
  const startOfWeek1 = new Date(jan4);
  const jan4IsoWeekday = jan4.getUTCDay() || 7;
  startOfWeek1.setUTCDate(jan4.getUTCDate() + 1 - jan4IsoWeekday);

  const weekStart = new Date(startOfWeek1);
  weekStart.setUTCDate(startOfWeek1.getUTCDate() + (week - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: FANTASY_TIME_ZONE,
  });

  return `${formatter.format(weekStart)} – ${formatter.format(weekEnd)}`;
}
