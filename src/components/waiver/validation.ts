export const WAIVER_SECONDARY_DIVISION_OPTIONS = [
  { value: "F40", label: "F40" },
  { value: "T30", label: "T30" },
] as const;

export type SecondaryDivisionValue =
  (typeof WAIVER_SECONDARY_DIVISION_OPTIONS)[number]["value"];

export type WaiverFieldErrors = Partial<
  Record<
    | "playerName"
    | "cricclubsId"
    | "city"
    | "address"
    | "t20Division"
    | "t20TeamCode"
    | "secondaryDivision"
    | "secondaryTeamCode"
    | "signatureName"
    | "submitAcknowledgement"
    | "form",
    string
  >
>;

export type WaiverFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors: WaiverFieldErrors;
};

export const INITIAL_WAIVER_FORM_STATE: WaiverFormState = {
  status: "idle",
  fieldErrors: {},
};

export type ParsedWaiverInput = {
  playerName: string;
  cricclubsId: string;
  city: string;
  address: string;
  t20Division: string | null;
  t20TeamCode: string | null;
  secondaryDivision: SecondaryDivisionValue | null;
  secondaryTeamCode: string | null;
  signatureName: string;
  submitAcknowledgement: true;
};

function namesMatch(left: string, right: string) {
  return left.trim().localeCompare(right.trim(), undefined, { sensitivity: "base" }) === 0;
}

function normalizeRequiredText(
  input: FormDataEntryValue | null,
  fieldErrors: Record<string, string>,
  field: keyof WaiverFieldErrors,
  label: string
) {
  if (typeof input !== "string" || input.trim().length === 0) {
    fieldErrors[field] = `${label} is required.`;
    return null;
  }

  return input.trim();
}

export function parseWaiverForm(formData: FormData): {
  data?: ParsedWaiverInput;
  fieldErrors: WaiverFieldErrors;
} {
  const fieldErrors: WaiverFieldErrors = {};

  const playerName = normalizeRequiredText(formData.get("playerName"), fieldErrors, "playerName", "Player name");
  const cricclubsId = normalizeRequiredText(formData.get("cricclubsId"), fieldErrors, "cricclubsId", "CricClubs ID");
  const city = normalizeRequiredText(formData.get("city"), fieldErrors, "city", "City");
  const address = normalizeRequiredText(formData.get("address"), fieldErrors, "address", "Address");
  const signatureName = normalizeRequiredText(
    formData.get("signatureName"),
    fieldErrors,
    "signatureName",
    "Signature name"
  );
  const submitAcknowledgement = formData.get("submitAcknowledgement");

  // T20 division — "N/A" means null, otherwise required non-empty string
  const t20DivisionRaw = formData.get("t20Division");
  const t20DivisionString = typeof t20DivisionRaw === "string" ? t20DivisionRaw.trim() : "";
  const t20DivisionIsNA = t20DivisionString === "N/A";
  let t20Division: string | null = null;
  let t20TeamCode: string | null = null;
  if (!t20DivisionIsNA) {
    if (!t20DivisionString) {
      fieldErrors.t20Division = "T20 division is required.";
    } else {
      t20Division = t20DivisionString;
      const t20TeamRaw = formData.get("t20TeamCode");
      if (typeof t20TeamRaw !== "string" || !t20TeamRaw.trim()) {
        fieldErrors.t20TeamCode = "T20 team is required.";
      } else {
        t20TeamCode = t20TeamRaw.trim();
      }
    }
  }

  // Secondary division — "N/A" means null, otherwise required F40 or T30
  const secondaryDivisionRaw = formData.get("secondaryDivision");
  const secondaryDivisionString =
    typeof secondaryDivisionRaw === "string" ? secondaryDivisionRaw.trim() : "";
  const secondaryDivisionIsNA = secondaryDivisionString === "N/A";
  let secondaryDivision: SecondaryDivisionValue | null = null;
  let secondaryTeamCode: string | null = null;
  if (!secondaryDivisionIsNA) {
    if (!secondaryDivisionString) {
      fieldErrors.secondaryDivision = "F40 or T30 division is required.";
    } else if (secondaryDivisionString === "F40" || secondaryDivisionString === "T30") {
      secondaryDivision = secondaryDivisionString;
      const secondaryTeamRaw = formData.get("secondaryTeamCode");
      if (typeof secondaryTeamRaw !== "string" || !secondaryTeamRaw.trim()) {
        fieldErrors.secondaryTeamCode = "F40 or T30 team is required.";
      } else {
        secondaryTeamCode = secondaryTeamRaw.trim();
      }
    } else {
      fieldErrors.secondaryDivision = "Secondary division must be F40 or T30.";
    }
  }

  // At least one division must be selected
  if (t20DivisionIsNA && secondaryDivisionIsNA) {
    fieldErrors.form = "At least one of T20 or F40/T30 division must be selected.";
  }

  if (submitAcknowledgement !== "yes") {
    fieldErrors.submitAcknowledgement = "You must acknowledge the waiver before submitting.";
  }

  if (playerName && signatureName && !namesMatch(playerName, signatureName)) {
    fieldErrors.signatureName = "Signature full name must exactly match the player name.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    fieldErrors: {},
    data: {
      playerName: playerName as string,
      cricclubsId: cricclubsId as string,
      city: city as string,
      address: address as string,
      t20Division,
      t20TeamCode,
      secondaryDivision,
      secondaryTeamCode,
      signatureName: signatureName as string,
      submitAcknowledgement: true,
    },
  };
}
