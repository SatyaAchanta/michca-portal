import { parseISO } from "date-fns";

const DISPLAY_TIMEZONE = "America/Detroit";

export function formatMatchDateTime(value: string) {
  const date = parseISO(value);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: DISPLAY_TIMEZONE,
  }).format(date);
}

export function formatMatchDate(value: string) {
  const date = parseISO(value);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: DISPLAY_TIMEZONE,
  }).format(date);
}
