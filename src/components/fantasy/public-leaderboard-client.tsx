"use client";

import { useMemo, useState } from "react";

import {
  type SeasonLeaderboardEntry,
  type WeeklyLeaderboardWeek,
} from "@/lib/actions/fantasy";
import { LeaderboardTable } from "@/components/fantasy/leaderboard-table";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PublicLeaderboardClientProps = {
  seasonEntries: SeasonLeaderboardEntry[];
  weeklyLeaderboards: WeeklyLeaderboardWeek[];
  currentUserId: string | null;
  canViewPredictions: boolean;
};

export function PublicLeaderboardClient({
  seasonEntries,
  weeklyLeaderboards,
  currentUserId,
  canViewPredictions,
}: PublicLeaderboardClientProps) {
  const [view, setView] = useState<"season" | "weekly">("season");
  const [selectedWeekKey, setSelectedWeekKey] = useState<string>(
    weeklyLeaderboards[0]?.weekKey ?? "",
  );

  const selectedWeek = useMemo(
    () =>
      weeklyLeaderboards.find((week) => week.weekKey === selectedWeekKey) ??
      weeklyLeaderboards[0] ??
      null,
    [selectedWeekKey, weeklyLeaderboards],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="inline-flex rounded-full border border-border bg-muted/40 p-1">
          {(["season", "weekly"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setView(option)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                view === option
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option === "season" ? "Season" : "Weekly"}
            </button>
          ))}
        </div>

        {view === "weekly" && weeklyLeaderboards.length > 0 ? (
          <div className="space-y-3">
            <div className="sm:hidden">
              <label htmlFor="leaderboard-week" className="sr-only">
                Select scored weekend
              </label>
              <select
                id="leaderboard-week"
                value={selectedWeek?.weekKey ?? ""}
                onChange={(event) => setSelectedWeekKey(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {weeklyLeaderboards.map((week) => (
                  <option key={week.weekKey} value={week.weekKey}>
                    {week.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden flex-wrap gap-2 sm:flex">
              {weeklyLeaderboards.map((week) => (
                <button
                  key={week.weekKey}
                  type="button"
                  onClick={() => setSelectedWeekKey(week.weekKey)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    selectedWeek?.weekKey === week.weekKey
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  )}
                >
                  {week.label}
                </button>
              ))}
            </div>

          </div>
        ) : null}
      </div>

      {view === "season" ? (
        seasonEntries.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            No scores yet — be the first to make a prediction!
          </Card>
        ) : (
          <LeaderboardTable
            key="season"
            entries={seasonEntries}
            currentUserId={currentUserId}
            canViewPredictions={canViewPredictions}
            mode="season"
          />
        )
      ) : selectedWeek ? (
        selectedWeek.entries.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            No scored picks for this weekend yet.
          </Card>
        ) : (
          <LeaderboardTable
            key={selectedWeek.weekKey}
            entries={selectedWeek.entries}
            currentUserId={currentUserId}
            canViewPredictions={canViewPredictions}
            mode="weekly"
          />
        )
      ) : (
        <Card className="p-10 text-center text-muted-foreground">
          Weekly standings will appear after the first scored weekend.
        </Card>
      )}
    </div>
  );
}
