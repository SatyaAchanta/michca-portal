"use client";

import { useActionState, useMemo, useRef, useState } from "react";

import { upsertMyYouth15Registration } from "@/app/y15-registration/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Youth15RegistrationFields } from "@/components/y15-registration/registration-fields";
import {
  INITIAL_YOUTH15_REGISTRATION_FORM_STATE,
  type Youth15RegistrationFormState,
} from "@/components/y15-registration/validation";

type RegistrationSnapshot = {
  clubName: string;
  presidentName: string;
  presidentEmail: string;
  presidentPhoneNumber: string;
  secretaryName: string | null;
  secretaryEmail: string | null;
  secretaryPhoneNumber: string;
};

type RegistrationFormProps = {
  registration: RegistrationSnapshot | null;
};

const DECLARATION_TEXT =
  "DECLARATION: On behalf of the Club, I, hereby waive the rights to file any legal action in the court of law or ask for any monetary damages for any known or unknown reasons/conflicts that may arise from the activities of Mich-CA and its members.";

export function Youth15RegistrationForm({ registration }: RegistrationFormProps) {
  const [state, formAction] = useActionState<Youth15RegistrationFormState, FormData>(
    upsertMyYouth15Registration,
    INITIAL_YOUTH15_REGISTRATION_FORM_STATE
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const values = useMemo(
    () => ({
      clubName: registration?.clubName ?? "",
      presidentName: registration?.presidentName ?? "",
      presidentEmail: registration?.presidentEmail ?? "",
      presidentPhoneNumber: registration?.presidentPhoneNumber ?? "",
      secretaryName: registration?.secretaryName ?? "",
      secretaryEmail: registration?.secretaryEmail ?? "",
      secretaryPhoneNumber: registration?.secretaryPhoneNumber ?? "",
    }),
    [registration]
  );

  const handleOpenConfirmation = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const form = formRef.current;
    if (!form) {
      return;
    }

    if (!form.reportValidity()) {
      return;
    }

    setIsDialogOpen(true);
  };

  const handleConfirm = () => {
    const form = formRef.current;
    if (!form) {
      return;
    }

    if (!form.reportValidity()) {
      setIsDialogOpen(false);
      return;
    }

    setIsDialogOpen(false);
    form.requestSubmit();
  };

  return (
    <>
      <form ref={formRef} action={formAction} className="space-y-4">
        <Youth15RegistrationFields values={values} fieldErrors={state.fieldErrors} />

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

        <Button type="button" onClick={handleOpenConfirmation}>
          {registration ? "Review & Resubmit" : "Review & Submit"}
        </Button>
      </form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="border-b border-border/70 px-6 py-5">
            <DialogTitle>Confirm declaration</DialogTitle>
            <DialogDescription>
              Review the declaration below. Clicking Confirm will submit this registration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 py-5 text-sm leading-7 text-muted-foreground">
            <p>{DECLARATION_TEXT}</p>
            <p>
              By clicking Confirm, you acknowledge and accept this declaration for your Youth 15
              registration. This confirmation is required every time you submit or resubmit.
            </p>
          </div>
          <DialogFooter className="border-t border-border/70 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirm}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
