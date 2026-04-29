"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { adminScoreGameWeek } from "@/lib/actions/fantasy";

type ScoreWeekButtonProps = {
  weekKey: string;
  weekLabel: string;
  gameCount: number;
  predictionCount: number;
};

export function ScoreWeekButton({
  weekKey,
  weekLabel,
  gameCount,
  predictionCount,
}: ScoreWeekButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    usersScored?: number;
    totalPointsAwarded?: number;
    error?: string;
  } | null>(null);

  function handleScore() {
    startTransition(async () => {
      const res = await adminScoreGameWeek(weekKey);
      if (res.success) {
        setResult({
          usersScored: res.usersScored,
          totalPointsAwarded: res.totalPointsAwarded,
        });
      } else {
        setResult({ error: res.error });
      }
    });
  }

  if (result && !result.error) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="h-4 w-4" />
        <span>
          Scored {result.usersScored} player
          {result.usersScored !== 1 ? "s" : ""}, {result.totalPointsAwarded} pts
          awarded
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {result?.error && (
        <p className="text-sm text-destructive">{result.error}</p>
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Calculating…
              </>
            ) : (
              "Calculate Points"
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Calculate points for {weekLabel}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will score all {predictionCount} prediction
              {predictionCount !== 1 ? "s" : ""} across {gameCount} completed
              game{gameCount !== 1 ? "s" : ""} for this week. Make sure all
              games for this weekend are marked as completed before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleScore}>
              Yes, Calculate Points
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
