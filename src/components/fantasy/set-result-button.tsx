"use client";

import { useState } from "react";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminSetGameResult } from "@/lib/actions/fantasy";

type Props = {
  gameId: string;
  team1Code: string;
  team2Code: string;
  team1Name: string;
  team2Name: string;
};

type Status = "idle" | "loading" | "success" | "error";

export function SetResultButton({
  gameId,
  team1Code,
  team2Code,
  team1Name,
  team2Name,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleResult(winnerCode: string | null, isDraw: boolean) {
    setStatus("loading");
    setMessage("");
    const res = await adminSetGameResult(gameId, winnerCode, isDraw);
    if (res.success) {
      setStatus("success");
      setMessage(
        isDraw
          ? "Marked as Draw / No Result"
          : `Winner: ${winnerCode === team1Code ? team1Name : team2Name}`,
      );
    } else {
      setStatus("error");
      setMessage(res.error ?? "Failed to update result.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-green-600">
        <CheckCircle className="h-4 w-4 shrink-0" />
        {message}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {message}
        </div>
        <Button variant="outline" size="sm" onClick={() => setStatus("idle")}>
          Try again
        </Button>
      </div>
    );
  }

  const isLoading = status === "loading";

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={isLoading}
        onClick={() => handleResult(team1Code, false)}
        className="text-xs"
      >
        {isLoading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
        {team1Name} Won
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={isLoading}
        onClick={() => handleResult(null, true)}
        className="text-xs"
      >
        Draw / No Result
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={isLoading}
        onClick={() => handleResult(team2Code, false)}
        className="text-xs"
      >
        {team2Name} Won
      </Button>
    </div>
  );
}
