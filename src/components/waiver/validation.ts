import {
  WAIVER_ROLE_OPTIONS,
  WAIVER_US_STATES,
  type WaiverRoleValue,
  type WaiverUsStateValue,
} from "@/lib/waiver-constants";

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
    | "state"
    | "city"
    | "address"
    | "t20Division"
    | "t20TeamCode"
    | "secondaryDivision"
    | "secondaryTeamCode"
    | "role"
    | "signatureName"
    | "submitAcknowledgement"
    | "rulebookAcknowledgement"
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
  state: WaiverUsStateValue;
  city: string;
  address: string;
  t20Division: string | null;
  t20TeamCode: string | null;
  secondaryDivision: SecondaryDivisionValue | null;
  secondaryTeamCode: string | null;
  role: WaiverRoleValue;
  signatureName: string;
  submitAcknowledgement: true;
  rulebookAcknowledgement: true;
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
  const stateRaw = normalizeRequiredText(formData.get("state"), fieldErrors, "state", "State");
  const city = normalizeRequiredText(formData.get("city"), fieldErrors, "city", "City");
  const address = normalizeRequiredText(formData.get("address"), fieldErrors, "address", "Address");
  const signatureName = normalizeRequiredText(
    formData.get("signatureName"),
    fieldErrors,
    "signatureName",
    "Signature name"
  );
  const roleRaw = normalizeRequiredText(formData.get("role"), fieldErrors, "role", "Role");
  const submitAcknowledgement = formData.get("submitAcknowledgement");
  const rulebookAcknowledgement = formData.get("rulebookAcknowledgement");

  let state: WaiverUsStateValue | null = null;
  if (stateRaw) {
    if (WAIVER_US_STATES.includes(stateRaw as WaiverUsStateValue)) {
      state = stateRaw as WaiverUsStateValue;
    } else {
      fieldErrors.state = "Select a valid U.S. state.";
    }
  }

  let role: WaiverRoleValue | null = null;
  if (roleRaw) {
    if (WAIVER_ROLE_OPTIONS.includes(roleRaw as WaiverRoleValue)) {
      role = roleRaw as WaiverRoleValue;
    } else {
      fieldErrors.role = "Select a valid playing role.";
    }
  }

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
  if (rulebookAcknowledgement !== "yes") {
    fieldErrors.rulebookAcknowledgement = "You must acknowledge the Mich-CA rulebook before submitting.";
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
      state: state as WaiverUsStateValue,
      city: city as string,
      address: address as string,
      t20Division,
      t20TeamCode,
      secondaryDivision,
      secondaryTeamCode,
      role: role as WaiverRoleValue,
      signatureName: signatureName as string,
      submitAcknowledgement: true,
      rulebookAcknowledgement: true,
    },
  };
}
