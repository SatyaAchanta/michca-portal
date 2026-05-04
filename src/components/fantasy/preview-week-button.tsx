"use client";

import { useState, useTransition } from "react";
import { Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminPreviewGameWeek } from "@/lib/actions/fantasy";

type PreviewWeekButtonProps = {
  weekKey: string;
  weekLabel: string;
};

type PreviewResult = {
  usersScored?: number;
  totalPointsAwarded?: number;
  rankings?: Array<{
    userProfileId: string;
    displayName: string;
    weeklyPoints: number;
    correctPredictions: number;
    totalPredictions: number;
  }>;
  error?: string;
};

export function PreviewWeekButton({
  weekKey,
  weekLabel,
}: PreviewWeekButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<PreviewResult | null>(null);

  function handlePreview() {
    startTransition(async () => {
      const res = await adminPreviewGameWeek(weekKey);
      if (res.success) {
        setResult({
          usersScored: res.usersScored,
          totalPointsAwarded: res.totalPointsAwarded,
          rankings: res.rankings,
        });
      } else {
        setResult({ error: res.error });
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {result?.error && (
          <p className="text-sm text-destructive">{result.error}</p>
        )}
        <Button size="sm" variant="outline" disabled={isPending} onClick={handlePreview}>
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Previewing…
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              Preview Top 10
            </>
          )}
        </Button>
      </div>

      {result && !result.error && (
        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Weekly preview for {weekLabel}
            </p>
            <p className="text-xs text-muted-foreground">
              No changes saved. {result.usersScored ?? 0} player
              {(result.usersScored ?? 0) !== 1 ? "s" : ""} would be scored and{" "}
              {result.totalPointsAwarded ?? 0} total points would be awarded.
            </p>
          </div>

          {!result.rankings || result.rankings.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No unscored predictions found for this week.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Rank</th>
                    <th className="py-2 pr-4 font-medium">Player</th>
                    <th className="py-2 pr-4 font-medium text-right">Weekly Pts</th>
                    <th className="py-2 font-medium text-right">Correct Picks</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {result.rankings.map((entry, index) => (
                    <tr key={entry.userProfileId}>
                      <td className="py-2 pr-4 font-semibold text-foreground">
                        {index + 1}
                      </td>
                      <td className="py-2 pr-4 text-foreground">
                        {entry.displayName}
                      </td>
                      <td className="py-2 pr-4 text-right font-semibold text-foreground">
                        {entry.weeklyPoints}
                      </td>
                      <td className="py-2 text-right text-muted-foreground">
                        {entry.correctPredictions}/{entry.totalPredictions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
