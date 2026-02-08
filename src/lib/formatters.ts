import { addHours, parseISO } from "date-fns";

const DISPLAY_HOUR_OFFSET = 4;

function withDisplayOffset(value: string) {
  return addHours(parseISO(value), DISPLAY_HOUR_OFFSET);
}

export function formatMatchDateTime(value: string) {
  const date = withDisplayOffset(value);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

export function formatMatchDate(value: string) {
  const date = withDisplayOffset(value);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
