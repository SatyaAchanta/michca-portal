import {
  WAIVER_US_STATES,
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
    | "additionalT20TeamCode"
    | "primaryT20TeamCode"
    | "secondaryDivision"
    | "secondaryTeamCode"
    | "parentName"
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
  additionalT20Division: string | null;
  additionalT20TeamCode: string | null;
  secondaryDivision: SecondaryDivisionValue | null;
  secondaryTeamCode: string | null;
  isUnder18: boolean;
  parentName: string;
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
  const isUnder18 = formData.get("isUnder18") === "yes";

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

  let t20Division: string | null = null;
  let t20TeamCode: string | null = null;
  let additionalT20Division: string | null = null;
  let additionalT20TeamCode: string | null = null;
  let hasT20Selection = false;

  if (isUnder18) {
    const under18TeamCode1Raw = formData.get("under18T20TeamCode1");
    const under18TeamCode2Raw = formData.get("under18T20TeamCode2");
    const under18TeamCode1 =
      typeof under18TeamCode1Raw === "string" && under18TeamCode1Raw.trim() && under18TeamCode1Raw.trim() !== "NONE"
        ? under18TeamCode1Raw.trim()
        : null;
    const under18TeamCode2 =
      typeof under18TeamCode2Raw === "string" && under18TeamCode2Raw.trim() && under18TeamCode2Raw.trim() !== "NONE"
        ? under18TeamCode2Raw.trim()
        : null;
    const selectedT20Teams = [under18TeamCode1, under18TeamCode2].filter(
      (value): value is string => value !== null
    );

    hasT20Selection = selectedT20Teams.length > 0;

    if (under18TeamCode1 && under18TeamCode2 && under18TeamCode1 === under18TeamCode2) {
      fieldErrors.additionalT20TeamCode = "Under-18 players must choose two different T20 teams.";
    }

    if (selectedT20Teams.length === 1) {
      t20TeamCode = selectedT20Teams[0];
    } else if (selectedT20Teams.length === 2) {
      const primaryT20TeamCodeRaw = formData.get("primaryT20TeamCode");
      const primaryT20TeamCode =
        typeof primaryT20TeamCodeRaw === "string" && primaryT20TeamCodeRaw.trim()
          ? primaryT20TeamCodeRaw.trim()
          : null;

      if (!primaryT20TeamCode) {
        fieldErrors.primaryT20TeamCode = "Choose the primary T20 team.";
      } else if (!selectedT20Teams.includes(primaryT20TeamCode)) {
        fieldErrors.primaryT20TeamCode = "Primary T20 team must match one of the selected teams.";
      } else {
        t20TeamCode = primaryT20TeamCode;
        additionalT20TeamCode =
          selectedT20Teams.find((teamCode) => teamCode !== primaryT20TeamCode) ?? null;
      }
    }
  } else {
    // T20 division — "N/A" means null, otherwise required non-empty string
    const t20DivisionRaw = formData.get("t20Division");
    const t20DivisionString = typeof t20DivisionRaw === "string" ? t20DivisionRaw.trim() : "";
    const t20DivisionIsNA = t20DivisionString === "N/A";
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
          hasT20Selection = true;
        }
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
  if (!hasT20Selection && secondaryDivisionIsNA) {
    fieldErrors.form = "At least one of T20 or F40/T30 division must be selected.";
  }

  let parentName = "";
  if (isUnder18) {
    const parsedParentName = normalizeRequiredText(
      formData.get("parentName"),
      fieldErrors,
      "parentName",
      "Parent's name"
    );
    parentName = parsedParentName ?? "";
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
      additionalT20Division,
      additionalT20TeamCode,
      secondaryDivision,
      secondaryTeamCode,
      isUnder18,
      parentName,
      signatureName: signatureName as string,
      submitAcknowledgement: true,
      rulebookAcknowledgement: true,
    },
  };
}
