import {
  WAIVER_PRIMARY_DIVISIONS,
  WAIVER_SECONDARY_DIVISIONS,
} from "@/lib/waiver-constants";
import { CLUB_INFO_PHONE_PATTERN } from "@/lib/club-info-constants";

export type ClubInfoFieldErrors = Partial<
  Record<
    | "captainName"
    | "cricclubsId"
    | "contactNumber"
    | "t20Division"
    | "t20TeamCode"
    | "secondaryDivision"
    | "secondaryTeamCode"
    | "form",
    string
  >
>;

export type ClubInfoFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors: ClubInfoFieldErrors;
};

export const INITIAL_CLUB_INFO_FORM_STATE: ClubInfoFormState = {
  status: "idle",
  fieldErrors: {},
};

export type ParsedClubInfoInput = {
  captainName: string;
  cricclubsId: string;
  contactNumber: string;
  t20Division: string | null;
  t20TeamCode: string | null;
  secondaryDivision: string | null;
  secondaryTeamCode: string | null;
};

function normalizeRequiredText(
  input: FormDataEntryValue | null,
  fieldErrors: Record<string, string>,
  field: keyof ClubInfoFieldErrors,
  label: string,
) {
  if (typeof input !== "string" || input.trim().length === 0) {
    fieldErrors[field] = `${label} is required.`;
    return null;
  }

  return input.trim();
}

export function parseClubInfoForm(
  formData: FormData,
): {
  data?: ParsedClubInfoInput;
  fieldErrors: ClubInfoFieldErrors;
} {
  const fieldErrors: ClubInfoFieldErrors = {};

  const captainName = normalizeRequiredText(
    formData.get("captainName"),
    fieldErrors,
    "captainName",
    "Captain name",
  );
  const cricclubsId = normalizeRequiredText(
    formData.get("cricclubsId"),
    fieldErrors,
    "cricclubsId",
    "CricClubs ID",
  );
  const contactNumber = normalizeRequiredText(
    formData.get("contactNumber"),
    fieldErrors,
    "contactNumber",
    "Contact number",
  );

  if (contactNumber && !CLUB_INFO_PHONE_PATTERN.test(contactNumber)) {
    fieldErrors.contactNumber = "Enter a valid U.S. phone number.";
  }

  const t20DivisionRaw = formData.get("t20Division");
  const t20DivisionString =
    typeof t20DivisionRaw === "string" ? t20DivisionRaw.trim() : "";
  const t20DivisionIsNA = t20DivisionString === "N/A";
  let t20Division: string | null = null;
  let t20TeamCode: string | null = null;
  if (!t20DivisionIsNA) {
    if (!t20DivisionString) {
      fieldErrors.t20Division = "T20 division is required.";
    } else if (!WAIVER_PRIMARY_DIVISIONS.includes(t20DivisionString as (typeof WAIVER_PRIMARY_DIVISIONS)[number])) {
      fieldErrors.t20Division = "Select a valid T20 division.";
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

  const secondaryDivisionRaw = formData.get("secondaryDivision");
  const secondaryDivisionString =
    typeof secondaryDivisionRaw === "string" ? secondaryDivisionRaw.trim() : "";
  const secondaryDivisionIsNA = secondaryDivisionString === "N/A";
  let secondaryDivision: string | null = null;
  let secondaryTeamCode: string | null = null;
  if (!secondaryDivisionIsNA) {
    if (!secondaryDivisionString) {
      fieldErrors.secondaryDivision = "F40 or T30 division is required.";
    } else if (
      !WAIVER_SECONDARY_DIVISIONS.includes(
        secondaryDivisionString as (typeof WAIVER_SECONDARY_DIVISIONS)[number],
      )
    ) {
      fieldErrors.secondaryDivision = "Secondary division must be F40 or T30.";
    } else {
      secondaryDivision = secondaryDivisionString;
      const secondaryTeamRaw = formData.get("secondaryTeamCode");
      if (typeof secondaryTeamRaw !== "string" || !secondaryTeamRaw.trim()) {
        fieldErrors.secondaryTeamCode = "F40 or T30 team is required.";
      } else {
        secondaryTeamCode = secondaryTeamRaw.trim();
      }
    }
  }

  if (t20DivisionIsNA && secondaryDivisionIsNA) {
    fieldErrors.form = "At least one of T20 or F40/T30 team must be selected.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    fieldErrors: {},
    data: {
      captainName: captainName as string,
      cricclubsId: cricclubsId as string,
      contactNumber: contactNumber as string,
      t20Division,
      t20TeamCode,
      secondaryDivision,
      secondaryTeamCode,
    },
  };
}
