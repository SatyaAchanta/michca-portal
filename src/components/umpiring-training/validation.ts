export const UMPIRING_DATE_OPTIONS = [
  { value: "2026-03-28", label: "March 28, 2026" },
  { value: "2026-03-29", label: "March 29, 2026" },
] as const;

export const UMPIRING_LOCATION_OPTIONS = [
  "Troy",
  "Farmington Hills",
] as const;

export const CERTIFICATION_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

export const RESULT_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PASS", label: "Pass" },
  { value: "FAIL", label: "Fail" },
] as const;
export type UmpiringTrainingResultValue = (typeof RESULT_OPTIONS)[number]["value"];

export type RegistrationFieldErrors = Partial<
  Record<
    | "contactNumber"
    | "previouslyCertified"
    | "preferredDate"
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
  previouslyCertified: boolean;
  affiliation: string | null;
  preferredDate: string;
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
  const previouslyCertifiedRaw = normalizeOptionalText(
    formData.get("previouslyCertified")
  );
  const preferredDate = normalizeOptionalText(formData.get("preferredDate"));
  const preferredLocation = normalizeOptionalText(
    formData.get("preferredLocation")
  );
  const affiliation = normalizeOptionalText(formData.get("affiliation"));
  const questions = normalizeOptionalText(formData.get("questions"));

  if (!contactNumber) {
    fieldErrors.contactNumber = "Contact number is required.";
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

  if (!preferredDate) {
    fieldErrors.preferredDate = "Preferred date is required.";
  } else if (!UMPIRING_DATE_OPTIONS.some((option) => option.value === preferredDate)) {
    fieldErrors.preferredDate = "Preferred date must be March 28 or March 29, 2026.";
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
      previouslyCertified: previouslyCertified as boolean,
      affiliation,
      preferredDate: preferredDate as string,
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
