"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { RegistrationFields } from "@/components/umpiring-training/registration-fields";
import {
  INITIAL_REGISTRATION_FORM_STATE,
  toIsoDateString,
  type RegistrationFormState,
} from "@/components/umpiring-training/validation";
import { upsertMyUmpiringTrainingRegistration } from "@/app/umpiring-training/actions";

type RegistrationSnapshot = {
  contactNumber: string;
  previouslyCertified: boolean;
  affiliation: string | null;
  preferredDate: Date;
  preferredLocation: string;
  questions: string | null;
};

type RegistrationFormProps = {
  profile: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  registration: RegistrationSnapshot | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Registration"}
    </Button>
  );
}

export function RegistrationForm({ profile, registration }: RegistrationFormProps) {
  const [state, formAction] = useActionState<RegistrationFormState, FormData>(
    upsertMyUmpiringTrainingRegistration,
    INITIAL_REGISTRATION_FORM_STATE
  );

  const defaults = useMemo(
    () => ({
      previouslyCertified: registration ? (registration.previouslyCertified ? "yes" : "no") : "",
      preferredDate: registration ? toIsoDateString(registration.preferredDate) : "",
      preferredLocation: registration?.preferredLocation ?? "",
    }),
    [registration]
  );

  const [previouslyCertified, setPreviouslyCertified] = useState(defaults.previouslyCertified);
  const [preferredDate, setPreferredDate] = useState(defaults.preferredDate);
  const [preferredLocation, setPreferredLocation] = useState(defaults.preferredLocation);

  return (
    <form action={formAction} className="space-y-4">
      <RegistrationFields
        profile={{
          firstName: profile.firstName ?? "",
          lastName: profile.lastName ?? "",
          email: profile.email,
        }}
        values={{
          contactNumber: registration?.contactNumber ?? "",
          affiliation: registration?.affiliation ?? "",
          preferredDate,
          preferredLocation,
          previouslyCertified,
          questions: registration?.questions ?? "",
        }}
        fieldErrors={state.fieldErrors}
        onPreferredDateChange={setPreferredDate}
        onPreferredLocationChange={setPreferredLocation}
        onPreviouslyCertifiedChange={setPreviouslyCertified}
      />

      {state.fieldErrors.form ? (
        <p className="text-sm text-destructive">{state.fieldErrors.form}</p>
      ) : null}
      {state.message ? (
        <p
          className={`text-sm ${
            state.status === "success" ? "text-green-700 dark:text-green-300" : "text-destructive"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

