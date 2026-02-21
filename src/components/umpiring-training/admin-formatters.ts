import { UMPIRING_DATE_OPTIONS, toIsoDateString, type UmpiringTrainingResultValue } from "@/components/umpiring-training/validation";

export function formatPreferredDate(value: Date) {
  const isoDate = toIsoDateString(value);
  const option = UMPIRING_DATE_OPTIONS.find((entry) => entry.value === isoDate);
  return option?.label ?? isoDate;
}

export function formatSubmittedDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Detroit",
  }).format(value);
}

export function formatName(firstName: string | null, lastName: string | null) {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name.length > 0 ? name : "-";
}

export function resultBadgeClass(result: UmpiringTrainingResultValue) {
  if (result === "PASS") {
    return "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300";
  }
  if (result === "FAIL") {
    return "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300";
  }

  return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
}

