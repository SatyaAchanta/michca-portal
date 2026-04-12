"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { deleteWaiverSubmission } from "@/app/admin/waiver-actions";
import { Button } from "@/components/ui/button";

type DeleteWaiverButtonProps = {
  waiverId: string;
};

type DeleteWaiverState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const INITIAL_STATE: DeleteWaiverState = {
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

export function DeleteWaiverButton({ waiverId }: DeleteWaiverButtonProps) {
  const [state, formAction] = useActionState(deleteWaiverSubmission, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-1">
      <input type="hidden" name="id" value={waiverId} />
      <SubmitButton />
      {state.status === "error" && state.message ? (
        <p className="text-xs text-destructive">{state.message}</p>
      ) : null}
    </form>
  );
}
