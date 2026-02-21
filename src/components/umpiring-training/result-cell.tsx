"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateUmpiringTrainingResult } from "@/app/umpiring-training/actions";
import { RESULT_OPTIONS, type UmpiringTrainingResultValue } from "@/components/umpiring-training/validation";

type ResultCellProps = {
  id: string;
  initialResult: UmpiringTrainingResultValue;
};

const INITIAL_RESULT_UPDATE_STATE = {
  status: "idle" as const,
};

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" variant="outline" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}

export function ResultCell({ id, initialResult }: ResultCellProps) {
  const [state, formAction] = useActionState(
    updateUmpiringTrainingResult,
    INITIAL_RESULT_UPDATE_STATE
  );
  const [result, setResult] = useState(initialResult);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="result" value={result} />

      <Select value={result} onValueChange={(value) => setResult(value as UmpiringTrainingResultValue)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Result" />
        </SelectTrigger>
        <SelectContent>
          {RESULT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <SaveButton />
      {state.message ? (
        <p className={`text-xs ${state.status === "success" ? "text-green-700 dark:text-green-300" : "text-destructive"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
