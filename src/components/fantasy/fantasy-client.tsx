"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { PredictionCard } from "@/components/fantasy/prediction-card";
import { formatWeekendLabel, toSaturdayKey } from "@/lib/fantasy-dates";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

type Game = {
  id: string;
  date: Date;
  status: string;
  division: string;
  gameType: "LEAGUE" | "PLAYOFF";
  venue: string | null;
  team1Code: string;
  team2Code: string;
  team1: { teamName: string; teamShortCode: string; logo: string | null };
  team2: { teamName: string; teamShortCode: string; logo: string | null };
};

type ExistingPrediction = {
  gameId: string;
  predictedWinnerCode: string | null;
  isBoosted: boolean;
  isScored: boolean;
  isCorrect: boolean | null;
  pointsEarned: number | null;
};

export type PredictionCount = {
  team1Count: number;
  drawCount: number;
  team2Count: number;
  total: number;
};

type FantasyClientProps = {
  games: Game[];
  predictionMap: Map<string, ExistingPrediction>;
  countMap: Map<string, PredictionCount>;
  canBoost: boolean;
  boostersRemaining: number;
};

// ─── Division labels ────────────────────────────────────────────────────────

const DIVISION_LABELS: Record<string, string> = {
  PREMIER_T20: "Premier T20",
  DIV1_T20: "Division 1",
  DIV2_T20: "Division 2",
  DIV3_T20: "Division 3",
  F40: "F40",
  T30: "T30",
  U15: "U15",
  GLT: "GLT",
};

/** Returns the upcoming (or current) weekend's Saturday key relative to today. */
function getUpcomingWeekendKey(weekendKeys: string[]): string | null {
  const todaySatKey = toSaturdayKey(new Date());
  // Pick the first available weekend key >= today's sat key
  const upcoming = weekendKeys.find((k) => k >= todaySatKey);
  return upcoming ?? weekendKeys[0] ?? null;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function FantasyClient({
  games,
  predictionMap,
  countMap,
  canBoost,
  boostersRemaining,
}: FantasyClientProps) {
  // Derive available weekends from game dates (sorted)
  const weekendKeys = Array.from(
    new Set(games.map((g) => toSaturdayKey(new Date(g.date)))),
  ).sort();

  // Derive available divisions from game data (in a preferred display order)
  const divisionOrder = [
    "PREMIER_T20",
    "DIV1_T20",
    "DIV2_T20",
    "DIV3_T20",
    "F40",
    "T30",
    "U15",
    "GLT",
  ];
  const availableDivisions = divisionOrder.filter((d) =>
    games.some((g) => g.division === d),
  );

  // Default to the upcoming weekend, not "All weeks"
  const [selectedWeek, setSelectedWeek] = useState<string | null>(() =>
    getUpcomingWeekendKey(weekendKeys),
  );
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null); // null = All

  // Filter games
  const filtered = games.filter((g) => {
    const matchWeek =
      selectedWeek === null || toSaturdayKey(new Date(g.date)) === selectedWeek;
    const matchDiv =
      selectedDivision === null || g.division === selectedDivision;
    return matchWeek && matchDiv;
  });

  // Group filtered games by weekend
  const weekGroups: { satKey: string; label: string; games: Game[] }[] = [];
  for (const satKey of weekendKeys) {
    if (selectedWeek !== null && selectedWeek !== satKey) continue;
    const weekGames = filtered.filter(
      (g) => toSaturdayKey(new Date(g.date)) === satKey,
    );
    if (weekGames.length > 0) {
      weekGroups.push({
        satKey,
        label: formatWeekendLabel(satKey),
        games: weekGames,
      });
    }
  }

  // Progress: count predictions made within the current filter scope
  // (week filter applied, division filter applied)
  const filteredTotal = filtered.length;
  const filteredPredicted = filtered.filter((g) =>
    predictionMap.has(g.id),
  ).length;
  const filteredRemaining = filteredTotal - filteredPredicted;

  return (
    <div className="space-y-6">
      {/* ── Filters ── */}
      {(weekendKeys.length > 1 || availableDivisions.length > 1) && (
        <div className="space-y-3">
          {/* ── Mobile: native selects ── */}
          <div className="flex gap-3 md:hidden">
            {weekendKeys.length > 1 && (
              <div className="flex-1 min-w-0">
                <label className="sr-only">Game Week</label>
                <select
                  value={selectedWeek ?? ""}
                  onChange={(e) => setSelectedWeek(e.target.value || null)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All weeks</option>
                  {weekendKeys.map((key) => (
                    <option key={key} value={key}>
                      {formatWeekendLabel(key)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {availableDivisions.length > 1 && (
              <div className="flex-1 min-w-0">
                <label className="sr-only">Division</label>
                <select
                  value={selectedDivision ?? ""}
                  onChange={(e) => setSelectedDivision(e.target.value || null)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All divisions</option>
                  {availableDivisions.map((div) => (
                    <option key={div} value={div}>
                      {DIVISION_LABELS[div] ?? div}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ── Desktop: pill toggles ── */}
          <div className="hidden md:block space-y-3">
            {/* Game week filter */}
            {weekendKeys.length > 1 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Game Week
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedWeek(null)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                      selectedWeek === null
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                    )}
                  >
                    All weeks
                  </button>
                  {weekendKeys.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedWeek(key)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                        selectedWeek === key
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                      )}
                    >
                      {formatWeekendLabel(key)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Division filter */}
            {availableDivisions.length > 1 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Division
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDivision(null)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                      selectedDivision === null
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                    )}
                  >
                    All
                  </button>
                  {availableDivisions.map((div) => (
                    <button
                      key={div}
                      type="button"
                      onClick={() => setSelectedDivision(div)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                        selectedDivision === div
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                      )}
                    >
                      {DIVISION_LABELS[div] ?? div}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Prediction progress ── */}
      {filteredTotal > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {selectedDivision
                ? `${DIVISION_LABELS[selectedDivision] ?? selectedDivision} predictions`
                : "Predictions"}
            </span>
            <span className="font-medium text-foreground">
              {filteredPredicted}/{filteredTotal}{" "}
              {filteredRemaining > 0 ? (
                <span className="text-muted-foreground font-normal">
                  ({filteredRemaining} remaining)
                </span>
              ) : (
                <span className="text-emerald-600 font-normal">All done!</span>
              )}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${Math.round((filteredPredicted / filteredTotal) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* ── Games ── */}
      {weekGroups.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No games match the selected filters.
        </Card>
      ) : (
        <div className="space-y-10">
          {weekGroups.map(({ satKey, label, games: wGames }) => (
            <div key={satKey} className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-foreground">
                  {label}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {wGames.length} game{wGames.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {wGames.map((game) => (
                  <PredictionCard
                    key={game.id}
                    game={{ ...game, date: new Date(game.date) }}
                    existing={predictionMap.get(game.id)}
                    picks={countMap.get(game.id)}
                    canBoost={canBoost}
                    boostersRemaining={boostersRemaining}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
