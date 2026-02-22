export const UMPIRING_DATE_OPTIONS = [
  { value: "MARCH_28_2026", label: "March 28, 2026" },
  { value: "MARCH_29_2026", label: "March 29, 2026" },
] as const;
export type UmpiringTrainingDateOptionValue =
  (typeof UMPIRING_DATE_OPTIONS)[number]["value"];

export const UMPIRING_LOCATION_OPTIONS = [
  "Troy",
  "Farmington Hills",
] as const;

export const CERTIFICATION_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

export const DIETARY_PREFERENCE_OPTIONS = [
  { value: "VEGETARIAN", label: "Vegetarian" },
  { value: "NON_VEGETARIAN", label: "Non-Vegetarian" },
] as const;
export type DietaryPreferenceValue =
  (typeof DIETARY_PREFERENCE_OPTIONS)[number]["value"];

export const RESULT_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PASS", label: "Pass" },
  { value: "FAIL", label: "Fail" },
] as const;
export type UmpiringTrainingResultValue = (typeof RESULT_OPTIONS)[number]["value"];

export type RegistrationFieldErrors = Partial<
  Record<
    | "contactNumber"
    | "dietaryPreference"
    | "previouslyCertified"
    | "preferredDates"
    | "preferredLocation"
    | "form",
    string
  >
>;

export type RegistrationFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors: RegistrationFieldErrors;
};

export const INITIAL_REGISTRATION_FORM_STATE: RegistrationFormState = {
  status: "idle",
  fieldErrors: {},
};

export type ParsedRegistrationInput = {
  contactNumber: string;
  dietaryPreference: DietaryPreferenceValue;
  previouslyCertified: boolean;
  affiliation: string | null;
  preferredDates: UmpiringTrainingDateOptionValue[];
  preferredLocation: string;
  questions: string | null;
};

function normalizeOptionalText(input: FormDataEntryValue | null) {
  if (typeof input !== "string") {
    return null;
  }

  const value = input.trim();
  return value.length > 0 ? value : null;
}

export function parseRegistrationForm(
  formData: FormData
): { data?: ParsedRegistrationInput; fieldErrors: RegistrationFieldErrors } {
  const fieldErrors: RegistrationFieldErrors = {};
  const contactNumber = normalizeOptionalText(formData.get("contactNumber"));
  const dietaryPreferenceRaw = normalizeOptionalText(
    formData.get("dietaryPreference")
  );
  const previouslyCertifiedRaw = normalizeOptionalText(
    formData.get("previouslyCertified")
  );
  const preferredDatesRaw = formData
    .getAll("preferredDates")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
  const preferredLocation = normalizeOptionalText(
    formData.get("preferredLocation")
  );
  const affiliation = normalizeOptionalText(formData.get("affiliation"));
  const questions = normalizeOptionalText(formData.get("questions"));

  if (!contactNumber) {
    fieldErrors.contactNumber = "Contact number is required.";
  }

  let dietaryPreference: DietaryPreferenceValue | undefined;
  if (!dietaryPreferenceRaw) {
    fieldErrors.dietaryPreference = "Dietary preference is required.";
  } else if (
    DIETARY_PREFERENCE_OPTIONS.some((option) => option.value === dietaryPreferenceRaw)
  ) {
    dietaryPreference = dietaryPreferenceRaw as DietaryPreferenceValue;
  } else {
    fieldErrors.dietaryPreference = "Dietary preference must be Vegetarian or Non-Vegetarian.";
  }

  let previouslyCertified: boolean | undefined;
  if (!previouslyCertifiedRaw) {
    fieldErrors.previouslyCertified = "Please select yes or no.";
  } else if (previouslyCertifiedRaw === "yes") {
    previouslyCertified = true;
  } else if (previouslyCertifiedRaw === "no") {
    previouslyCertified = false;
  } else {
    fieldErrors.previouslyCertified = "Invalid certification value.";
  }

  if (preferredDatesRaw.length === 0) {
    fieldErrors.preferredDates = "Select at least one preferred date.";
  }

  const invalidPreferredDate = preferredDatesRaw.some(
    (dateValue) =>
      !UMPIRING_DATE_OPTIONS.some((option) => option.value === dateValue)
  );
  if (invalidPreferredDate) {
    fieldErrors.preferredDates = "Preferred dates must be March 28 or March 29, 2026.";
  }

  if (!preferredLocation) {
    fieldErrors.preferredLocation = "Preferred location is required.";
  } else if (!UMPIRING_LOCATION_OPTIONS.some((option) => option === preferredLocation)) {
    fieldErrors.preferredLocation = "Preferred location must be Troy or Farmington Hills.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    fieldErrors: {},
    data: {
      contactNumber: contactNumber as string,
      dietaryPreference: dietaryPreference as DietaryPreferenceValue,
      previouslyCertified: previouslyCertified as boolean,
      affiliation,
      preferredDates: preferredDatesRaw as UmpiringTrainingDateOptionValue[],
      preferredLocation: preferredLocation as string,
      questions,
    },
  };
}

export function parseResultValue(rawResult: string) {
  if (!RESULT_OPTIONS.some((option) => option.value === rawResult)) {
    return null;
  }

  return rawResult as UmpiringTrainingResultValue;
}

export function toIsoDateString(value: Date) {
  return value.toISOString().slice(0, 10);
}
