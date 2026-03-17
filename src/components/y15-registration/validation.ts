const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Youth15RegistrationFieldErrors = Partial<
  Record<
    | "clubName"
    | "presidentName"
    | "presidentEmail"
    | "presidentPhoneNumber"
    | "secretaryEmail"
    | "form",
    string
  >
>;

export type Youth15RegistrationFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors: Youth15RegistrationFieldErrors;
};

export const INITIAL_YOUTH15_REGISTRATION_FORM_STATE: Youth15RegistrationFormState = {
  status: "idle",
  fieldErrors: {},
};

export type ParsedYouth15RegistrationInput = {
  clubName: string;
  presidentName: string;
  presidentEmail: string;
  presidentPhoneNumber: string;
  secretaryName: string | null;
  secretaryEmail: string | null;
};

function normalizeRequiredText(
  input: FormDataEntryValue | null,
  fieldErrors: Record<string, string>,
  field: keyof Youth15RegistrationFieldErrors,
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

  const trimmed = input.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isNotApplicableValue(value: string | null) {
  return value?.trim().toUpperCase() === "N/A";
}

export function parseYouth15RegistrationForm(
  formData: FormData
): {
  data?: ParsedYouth15RegistrationInput;
  fieldErrors: Youth15RegistrationFieldErrors;
} {
  const fieldErrors: Youth15RegistrationFieldErrors = {};

  const clubName = normalizeRequiredText(formData.get("clubName"), fieldErrors, "clubName", "Club name");
  const presidentName = normalizeRequiredText(
    formData.get("presidentName"),
    fieldErrors,
    "presidentName",
    "President name"
  );
  const presidentEmail = normalizeRequiredText(
    formData.get("presidentEmail"),
    fieldErrors,
    "presidentEmail",
    "President email"
  );
  const presidentPhoneNumber = normalizeRequiredText(
    formData.get("presidentPhoneNumber"),
    fieldErrors,
    "presidentPhoneNumber",
    "President phone number"
  );
  const secretaryName = normalizeOptionalText(formData.get("secretaryName"));
  const secretaryEmailRaw = normalizeOptionalText(formData.get("secretaryEmail"));

  if (presidentEmail && !EMAIL_PATTERN.test(presidentEmail)) {
    fieldErrors.presidentEmail = "President email must be a valid email address.";
  }

  let secretaryEmail: string | null = secretaryEmailRaw;
  if (!secretaryEmailRaw) {
    fieldErrors.secretaryEmail = "Secretary email is required.";
  } else if (isNotApplicableValue(secretaryEmailRaw)) {
    secretaryEmail = null;
  } else if (!EMAIL_PATTERN.test(secretaryEmailRaw)) {
    fieldErrors.secretaryEmail = "Secretary email must be a valid email address or N/A.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    fieldErrors: {},
    data: {
      clubName: clubName as string,
      presidentName: presidentName as string,
      presidentEmail: presidentEmail as string,
      presidentPhoneNumber: presidentPhoneNumber as string,
      secretaryName,
      secretaryEmail,
    },
  };
}
