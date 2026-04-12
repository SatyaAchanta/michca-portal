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
    | "socialMediaHandle"
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
  socialMediaHandle: string | null;
  t20Division: string;
  t20TeamCode: string;
  secondaryDivision: SecondaryDivisionValue;
  secondaryTeamCode: string;
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

function normalizeOptionalText(input: FormDataEntryValue | null) {
  if (typeof input !== "string") {
    return null;
  }

  const value = input.trim();
  return value.length > 0 ? value : null;
}

export function parseWaiverForm(formData: FormData): {
  data?: ParsedWaiverInput;
  fieldErrors: WaiverFieldErrors;
} {
  const fieldErrors: WaiverFieldErrors = {};

  const playerName = normalizeRequiredText(formData.get("playerName"), fieldErrors, "playerName", "Player name");
  const cricclubsId = normalizeRequiredText(formData.get("cricclubsId"), fieldErrors, "cricclubsId", "CricClubs ID");
  const city = normalizeRequiredText(formData.get("city"), fieldErrors, "city", "City");
  const socialMediaHandle = normalizeOptionalText(formData.get("socialMediaHandle"));
  const t20Division = normalizeRequiredText(formData.get("t20Division"), fieldErrors, "t20Division", "T20 division");
  const t20TeamCode = normalizeRequiredText(formData.get("t20TeamCode"), fieldErrors, "t20TeamCode", "T20 team");
  const secondaryDivisionRaw = normalizeRequiredText(
    formData.get("secondaryDivision"),
    fieldErrors,
    "secondaryDivision",
    "F40 or T30 division"
  );
  const secondaryTeamCode = normalizeRequiredText(
    formData.get("secondaryTeamCode"),
    fieldErrors,
    "secondaryTeamCode",
    "F40 or T30 team"
  );
  const signatureName = normalizeRequiredText(
    formData.get("signatureName"),
    fieldErrors,
    "signatureName",
    "Signature name"
  );
  const submitAcknowledgement = formData.get("submitAcknowledgement");

  let secondaryDivision: SecondaryDivisionValue | undefined;
  if (secondaryDivisionRaw) {
    if (secondaryDivisionRaw === "F40" || secondaryDivisionRaw === "T30") {
      secondaryDivision = secondaryDivisionRaw;
    } else {
      fieldErrors.secondaryDivision = "Secondary division must be F40 or T30.";
    }
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
      socialMediaHandle,
      t20Division: t20Division as string,
      t20TeamCode: t20TeamCode as string,
      secondaryDivision: secondaryDivision as SecondaryDivisionValue,
      secondaryTeamCode: secondaryTeamCode as string,
      signatureName: signatureName as string,
      submitAcknowledgement: true,
    },
  };
}
