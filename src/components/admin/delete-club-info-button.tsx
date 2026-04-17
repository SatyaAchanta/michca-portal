"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { deleteClubInfoSubmission } from "@/app/admin/club-info-actions";
import { Button } from "@/components/ui/button";

type DeleteClubInfoButtonProps = {
  submissionId: string;
};

type DeleteClubInfoState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const INITIAL_STATE: DeleteClubInfoState = {
  status: "idle",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" variant="destructive" disabled={pending}>
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}

export function DeleteClubInfoButton({ submissionId }: DeleteClubInfoButtonProps) {
  const [state, formAction] = useActionState(deleteClubInfoSubmission, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-1">
      <input type="hidden" name="id" value={submissionId} />
      <SubmitButton />
      {state.status === "error" && state.message ? (
        <p className="text-xs text-destructive">{state.message}</p>
      ) : null}
    </form>
  );
}
