import {
  UMPIRING_ALL_DATE_OPTIONS,
  UMPIRING_LOCATION_OPTIONS,
  type UmpiringTrainingDateOptionValue,
  type UmpiringTrainingResultValue,
} from "@/components/umpiring-training/validation";

export function formatPreferredDates(values: UmpiringTrainingDateOptionValue[]) {
  if (values.length === 0) {
    return "-";
  }

  return values
    .map((value) => UMPIRING_ALL_DATE_OPTIONS.find((option) => option.value === value)?.label ?? value)
    .join(", ");
}

export function parseDateFilterParam(input: string | undefined) {
  if (!input) {
    return [];
  }

  const values = input
    .split(",")
    .map((value) => value.trim())
    .filter((value): value is UmpiringTrainingDateOptionValue =>
      UMPIRING_ALL_DATE_OPTIONS.some((option) => option.value === value)
    );

  return Array.from(new Set(values));
}

export function parseLocationFilterParam(input: string | undefined) {
  if (!input) {
    return [];
  }

  const values = input
    .split(",")
    .map((value) => value.trim())
    .filter((value): value is (typeof UMPIRING_LOCATION_OPTIONS)[number] =>
      UMPIRING_LOCATION_OPTIONS.some((option) => option === value)
    );

  return Array.from(new Set(values));
}

export function serializeFilterValues(values: string[]) {
  return values.join(",");
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
  if (result === "REAPPEAR") {
    return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
  }

  return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
}

export function formatResultLabel(result: UmpiringTrainingResultValue) {
  if (result === "PASS") {
    return "Pass";
  }
  if (result === "FAIL") {
    return "Fail";
  }
  if (result === "REAPPEAR") {
    return "ReAppear";
  }

  return "Pending";
}

export function getUmpiringResultDescription(result: UmpiringTrainingResultValue) {
  if (result === "PASS") {
    return "You passed the umpiring exam.";
  }
  if (result === "FAIL") {
    return "You failed the umpiring exam.";
  }
  if (result === "REAPPEAR") {
    return "You need to retake the umpiring test, but do not need to repeat the full training.";
  }

  return "Your umpiring exam result is still pending.";
}
