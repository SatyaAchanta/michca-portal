const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Youth15RegistrationFieldErrors = Partial<
  Record<
    | "clubName"
    | "presidentName"
    | "presidentEmail"
    | "presidentPhoneNumber"
    | "secretaryName"
    | "secretaryEmail"
    | "secretaryPhoneNumber"
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
  secretaryName: string;
  secretaryEmail: string;
  secretaryPhoneNumber: string;
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
  const secretaryName = normalizeRequiredText(
    formData.get("secretaryName"),
    fieldErrors,
    "secretaryName",
    "Secretary name"
  );
  const secretaryEmail = normalizeRequiredText(
    formData.get("secretaryEmail"),
    fieldErrors,
    "secretaryEmail",
    "Secretary email"
  );
  const secretaryPhoneNumber = normalizeRequiredText(
    formData.get("secretaryPhoneNumber"),
    fieldErrors,
    "secretaryPhoneNumber",
    "Secretary phone number"
  );

  if (presidentEmail && !EMAIL_PATTERN.test(presidentEmail)) {
    fieldErrors.presidentEmail = "President email must be a valid email address.";
  }

  if (secretaryEmail && !EMAIL_PATTERN.test(secretaryEmail)) {
    fieldErrors.secretaryEmail = "Secretary email must be a valid email address.";
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
      secretaryName: secretaryName as string,
      secretaryEmail: secretaryEmail as string,
      secretaryPhoneNumber: secretaryPhoneNumber as string,
    },
  };
}
