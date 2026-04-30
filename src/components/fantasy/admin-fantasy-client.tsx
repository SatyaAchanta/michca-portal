"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreWeekButton } from "@/components/fantasy/score-week-button";
import { SetResultButton } from "@/components/fantasy/set-result-button";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

type ScheduledGame = {
  id: string;
  date: Date;
  division: string;
  gameType: string;
  venue: string | null;
  team1Code: string;
  team2Code: string;
  team1: { teamName: string; teamShortCode: string | null };
  team2: { teamName: string; teamShortCode: string | null };
};

type UnscoredWeek = {
  weekKey: string;
  gameCount: number;
  predictionCount: number;
};

type AdminFantasyClientProps = {
  scheduledGames: ScheduledGame[];
  unscoredWeeks: UnscoredWeek[];
};

// ─── Division labels ─────────────────────────────────────────────────────────

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

// ─── Date formatters ─────────────────────────────────────────────────────────

const GAME_DATE_FMT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Detroit",
});

// ─── Weekend helpers ──────────────────────────────────────────────────────────

/** Returns the ISO date string (YYYY-MM-DD) of the Saturday of the weekend
 *  the given date falls in. Saturday stays as-is, Sunday goes back 1 day. */
function toSaturdayKey(date: Date): string {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun,6=Sat
  const diffToSat = day === 0 ? -1 : 6 - day;
  d.setDate(d.getDate() + diffToSat);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${dayOfMonth}`;
}

function formatWeekendLabel(satKey: string): string {
  const sat = new Date(satKey + "T12:00:00Z");
  const sun = new Date(sat);
  sun.setUTCDate(sat.getUTCDate() + 1);
  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${fmt.format(sat)} – ${fmt.format(sun)}`;
}

function getUpcomingWeekendKey(keys: string[]): string | null {
  const todaySatKey = toSaturdayKey(new Date());
  return keys.find((k) => k >= todaySatKey) ?? keys[0] ?? null;
}

/** Returns the ISO week key (YYYY-Www) for a given date. */
function toWeekKey(date: Date): string {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const day = d.getUTCDay() || 7; // 1=Mon … 7=Sun
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function formatWeekLabel(weekKey: string): string {
  const [yearStr, wStr] = weekKey.split("-W");
  const year = parseInt(yearStr, 10);
  const week = parseInt(wStr, 10);
  const jan4 = new Date(year, 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const weekStart = new Date(startOfWeek1);
  weekStart.setDate(startOfWeek1.getDate() + (week - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/Detroit",
  });
  return `${fmt.format(weekStart)} – ${fmt.format(weekEnd)}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AdminFantasyClient({
  scheduledGames,
  unscoredWeeks,
}: AdminFantasyClientProps) {
  // Derive available weekends from scheduled games
  const allGamesForWeekends = scheduledGames;
  const weekendKeys = Array.from(
    new Set(allGamesForWeekends.map((g) => toSaturdayKey(new Date(g.date)))),
  ).sort();

  // Derive available divisions
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
    scheduledGames.some((g) => g.division === d),
  );

  const [selectedWeek, setSelectedWeek] = useState<string | null>(() =>
    getUpcomingWeekendKey(weekendKeys),
  );
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);

  // Filter scheduled games
  const filteredGames = scheduledGames.filter((g) => {
    const matchWeek =
      selectedWeek === null || toSaturdayKey(new Date(g.date)) === selectedWeek;
    const matchDiv =
      selectedDivision === null || g.division === selectedDivision;
    return matchWeek && matchDiv;
  });

  // Filter unscored weeks: if a weekend is selected, keep only weeks whose
  // Saturday falls within that weekend (i.e. the week key covers that Saturday).
  // A simpler approach: a week "matches" the selected weekend if its ISO week
  // contains the selected Saturday date.
  const filteredWeeks = unscoredWeeks.filter((w) => {
    if (selectedWeek === null) return true;
    // The Saturday key represents a date — compute its ISO week key
    const sat = new Date(selectedWeek + "T12:00:00Z");
    const sun = new Date(sat);
    sun.setUTCDate(sat.getUTCDate() + 1);
    return w.weekKey === toWeekKey(sat) || w.weekKey === toWeekKey(sun);
  });

  const showFilters = weekendKeys.length > 1 || availableDivisions.length > 1;

  return (
    <div className="space-y-10">
      {/* ── Filters ── */}
      {showFilters && (
        <div className="space-y-3">
          {/* Mobile: native selects */}
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

          {/* Desktop: pill toggles */}
          <div className="hidden md:block space-y-3">
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

      {/* ── Section 1: Set Game Results ── */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Upcoming Games</h2>
          <p className="text-sm text-muted-foreground">
            Set the result for each game to mark it as completed.
          </p>
        </div>

        {scheduledGames.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No upcoming scheduled games.
          </Card>
        ) : filteredGames.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No games match the selected filters.
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredGames.map((game) => (
              <Card key={game.id} className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">
                        {game.team1.teamName} vs {game.team2.teamName}
                      </p>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {DIVISION_LABELS[game.division] ??
                          game.division.replace(/_/g, " ")}
                      </Badge>
                      {game.gameType === "PLAYOFF" && (
                        <Badge variant="outline" className="text-xs">
                          Playoff
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {GAME_DATE_FMT.format(new Date(game.date))}
                      {game.venue ? ` · ${game.venue}` : ""}
                    </p>
                  </div>
                  <SetResultButton
                    gameId={game.id}
                    team1Code={game.team1Code}
                    team2Code={game.team2Code}
                    team1Name={game.team1.teamShortCode ?? game.team1.teamName}
                    team2Name={game.team2.teamShortCode ?? game.team2.teamName}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="border-t" />

      {/* ── Section 2: Calculate Points ── */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Calculate Points</h2>
          <p className="text-sm text-muted-foreground">
            Once games are completed, calculate fantasy points for each game
            week.
          </p>
        </div>

        {unscoredWeeks.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No pending game weeks — all predictions are scored.
          </Card>
        ) : filteredWeeks.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No pending weeks for the selected weekend.
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredWeeks.map((week) => (
              <Card key={week.weekKey} className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">
                        {formatWeekLabel(week.weekKey)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {week.weekKey}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {week.gameCount} completed game
                      {week.gameCount !== 1 ? "s" : ""} · {week.predictionCount}{" "}
                      unscored prediction
                      {week.predictionCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ScoreWeekButton
                    weekKey={week.weekKey}
                    weekLabel={formatWeekLabel(week.weekKey)}
                    gameCount={week.gameCount}
                    predictionCount={week.predictionCount}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
