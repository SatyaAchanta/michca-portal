"use client";

import { useActionState, useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { CalendarClock, RefreshCw, Save, Trophy } from "lucide-react";

import {
  saveMichcaMadnessDivisionSetup,
  updateMichcaMadnessBracket,
  type MichcaMadnessActionState,
} from "@/lib/actions/michca-madness";
import {
  DIVISION_LABELS,
  MICHCA_MADNESS_DIVISIONS,
  getSourceLabel,
  requireMichcaMadnessTemplate,
  type MichcaMadnessDivision,
} from "@/lib/michca-madness";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const INITIAL_STATE: MichcaMadnessActionState = { status: "idle" };
const DETROIT_TIMEZONE = "America/Detroit";

type TeamOption = {
  teamCode: string;
  teamName: string;
  teamShortCode: string;
  division: string;
  format: string;
};

type GroundOption = {
  id: string;
  name: string;
  shortName: string;
};

type ConfigRow = {
  id: string;
  division: string;
  status: string;
  lockAt: string | null;
  seeds: Array<{
    seedKey: string;
    teamCode: string;
  }>;
  slots: Array<{
    slotKey: string;
    gameId: string | null;
    scheduledAt: string | null;
    venue: string | null;
    winnerCode: string | null;
    needsAttention: boolean;
  }>;
  entryCount: number;
};

type PlayoffGame = {
  id: string;
  date: string;
  division: string;
  status: string;
  resultType: string;
  winnerCode: string | null;
  venue: string | null;
  team1Code: string;
  team2Code: string;
  team1: { teamName: string; teamShortCode: string | null };
  team2: { teamName: string; teamShortCode: string | null };
};

type AdminMichcaMadnessClientProps = {
  season: number;
  configs: ConfigRow[];
  teams: TeamOption[];
  grounds: GroundOption[];
  playoffGames: PlayoffGame[];
};

function ActionMessage({ state }: { state: MichcaMadnessActionState }) {
  if (state.status === "success" && state.message) {
    return <p className="text-sm text-green-600 dark:text-green-400">{state.message}</p>;
  }
  if (state.status === "error" && state.message) {
    return <p className="text-sm text-destructive">{state.message}</p>;
  }
  return null;
}

function formatDateInput(iso: string | null) {
  if (!iso) return "";
  return formatInTimeZone(new Date(iso), DETROIT_TIMEZONE, "yyyy-MM-dd");
}

function formatTimeInput(iso: string | null) {
  if (!iso) return "";
  return formatInTimeZone(new Date(iso), DETROIT_TIMEZONE, "HH:mm");
}

function formatGameLabel(game: PlayoffGame) {
  const date = formatInTimeZone(new Date(game.date), DETROIT_TIMEZONE, "MMM d, h:mm a");
  return `${date} · ${game.team1.teamShortCode ?? game.team1Code} vs ${
    game.team2.teamShortCode ?? game.team2Code
  }`;
}

function getExpectedTeamDivision(division: MichcaMadnessDivision) {
  switch (division) {
    case "PREMIER_T20":
      return "Premier";
    case "DIV1_T20":
      return "Division-1";
    case "DIV2_T20":
      return "Division-2";
    case "DIV3_T20":
      return "Division-3";
    case "F40":
      return "F40";
    case "T30":
      return "T30";
  }
}

function getTeamLabel(team: TeamOption) {
  return `${team.teamName} (${team.teamShortCode})`;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "READY") {
    return (
      <Badge className="border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        Open
      </Badge>
    );
  }
  if (status === "LOCKED") {
    return <Badge variant="outline">Locked</Badge>;
  }
  return <Badge variant="outline">Coming Soon</Badge>;
}

function DivisionSetupCard({
  season,
  division,
  config,
  teams,
  grounds,
  playoffGames,
}: {
  season: number;
  division: MichcaMadnessDivision;
  config?: ConfigRow;
  teams: TeamOption[];
  grounds: GroundOption[];
  playoffGames: PlayoffGame[];
}) {
  const [saveState, saveAction, isSaving] = useActionState(
    saveMichcaMadnessDivisionSetup,
    INITIAL_STATE,
  );
  const [updateState, updateAction, isUpdating] = useActionState(
    updateMichcaMadnessBracket,
    INITIAL_STATE,
  );
  const template = requireMichcaMadnessTemplate(division);
  const seedMap = new Map(config?.seeds.map((seed) => [seed.seedKey, seed.teamCode]));
  const slotMap = new Map(config?.slots.map((slot) => [slot.slotKey, slot]));
  const teamOptions = teams.filter(
    (team) => team.division === getExpectedTeamDivision(division),
  );
  const gameOptions = playoffGames.filter((game) => game.division === division);
  const seedsComplete = template.seeds.every((seed) => seedMap.has(seed.key));
  const firstGameScheduled = config?.lockAt ?? null;

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              {DIVISION_LABELS[division]}
            </h2>
            <StatusBadge status={config?.status ?? "COMING_SOON"} />
          </div>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {template.formatSummary}
          </p>
        </div>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <Trophy className="mt-0.5 h-4 w-4" />
          {config?.entryCount ?? 0} submitted
        </div>
      </div>

      <form action={saveAction} className="space-y-6">
        <input type="hidden" name="season" value={season} />
        <input type="hidden" name="division" value={division} />

        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <div className="rounded-lg border p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">Playoff Teams</h3>
                <p className="text-sm text-muted-foreground">
                  Enter the teams that advanced and their bracket positions.
                </p>
              </div>
              <Badge variant={seedsComplete ? "secondary" : "outline"}>
                {seedsComplete ? "Seeds complete" : "Missing seeds"}
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {template.seeds.map((seed) => (
                <label key={seed.key} className="space-y-1.5">
                  <span className="text-sm font-medium">{seed.label}</span>
                  <select
                    name={`seed:${seed.key}`}
                    defaultValue={seedMap.get(seed.key) ?? ""}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select team</option>
                    {teamOptions.map((team) => (
                      <option key={team.teamCode} value={team.teamCode}>
                        {getTeamLabel(team)}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <label className="space-y-1.5">
              <span className="text-sm font-medium">Submission Status</span>
              <select
                name="status"
                defaultValue={config?.status ?? "COMING_SOON"}
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="COMING_SOON">Coming Soon</option>
                <option value="READY">Open Submissions</option>
                <option value="LOCKED">Locked</option>
              </select>
            </label>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Opening requires all seeds and at least one game time. Current lock:
              {" "}
              {firstGameScheduled
                ? formatInTimeZone(new Date(firstGameScheduled), DETROIT_TIMEZONE, "MMM d, h:mm a")
                : "not set"}
            </p>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">Bracket Games</h3>
              <p className="text-sm text-muted-foreground">
                Add schedule details and link playoff games once they exist.
              </p>
            </div>
            <CalendarClock className="h-5 w-5 text-primary" />
          </div>

          <div className="space-y-3">
            {template.slots.map((slot) => {
              const savedSlot = slotMap.get(slot.key);
              return (
                <div
                  key={slot.key}
                  className={cn(
                    "grid gap-3 rounded-lg border p-3 lg:grid-cols-[1.1fr_140px_120px_1fr_1fr]",
                    savedSlot?.needsAttention &&
                      "border-amber-500/50 bg-amber-50/60 dark:bg-amber-950/20",
                  )}
                >
                  <div className="min-w-0">
                    <p className="font-medium">{slot.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {getSourceLabel(slot.team1Source, template)} vs{" "}
                      {getSourceLabel(slot.team2Source, template)}
                    </p>
                    {savedSlot?.winnerCode ? (
                      <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                        Winner: {savedSlot.winnerCode}
                      </p>
                    ) : null}
                    {savedSlot?.needsAttention ? (
                      <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                        Result needs admin review.
                      </p>
                    ) : null}
                  </div>
                  <input
                    name={`slot:${slot.key}:date`}
                    type="date"
                    defaultValue={formatDateInput(savedSlot?.scheduledAt ?? null)}
                    className="flex h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    aria-label={`${slot.displayName} date`}
                  />
                  <input
                    name={`slot:${slot.key}:time`}
                    type="time"
                    defaultValue={formatTimeInput(savedSlot?.scheduledAt ?? null)}
                    className="flex h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    aria-label={`${slot.displayName} time`}
                  />
                  <select
                    name={`slot:${slot.key}:venue`}
                    defaultValue={savedSlot?.venue ?? ""}
                    className="flex h-11 min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    aria-label={`${slot.displayName} venue`}
                  >
                    <option value="">Venue TBD</option>
                    {grounds.map((ground) => (
                      <option key={ground.id} value={ground.name}>
                        {ground.name}
                      </option>
                    ))}
                  </select>
                  <select
                    name={`slot:${slot.key}:gameId`}
                    defaultValue={savedSlot?.gameId ?? ""}
                    className="flex h-11 min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    aria-label={`${slot.displayName} linked game`}
                  >
                    <option value="">No linked game</option>
                    {gameOptions.map((game) => (
                      <option key={game.id} value={game.id}>
                        {formatGameLabel(game)}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>

        <ActionMessage state={saveState} />
        <Button type="submit" disabled={isSaving}>
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Division Setup"}
        </Button>
      </form>

      <form action={updateAction} className="mt-4 space-y-2">
        <input type="hidden" name="season" value={season} />
        <input type="hidden" name="division" value={division} />
        <Button type="submit" variant="outline" disabled={isUpdating}>
          <RefreshCw className={cn("h-4 w-4", isUpdating && "animate-spin")} />
          {isUpdating ? "Updating..." : "Update Bracket"}
        </Button>
        <ActionMessage state={updateState} />
      </form>
    </Card>
  );
}

export function AdminMichcaMadnessClient({
  season,
  configs,
  teams,
  grounds,
  playoffGames,
}: AdminMichcaMadnessClientProps) {
  const [selectedDivision, setSelectedDivision] =
    useState<MichcaMadnessDivision>("PREMIER_T20");
  const configMap = useMemo(
    () => new Map(configs.map((config) => [config.division, config])),
    [configs],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {MICHCA_MADNESS_DIVISIONS.map((division) => (
          <button
            key={division}
            type="button"
            onClick={() => setSelectedDivision(division)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              selectedDivision === division
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            {DIVISION_LABELS[division]}
          </button>
        ))}
      </div>

      <DivisionSetupCard
        season={season}
        division={selectedDivision}
        config={configMap.get(selectedDivision)}
        teams={teams}
        grounds={grounds}
        playoffGames={playoffGames}
      />
    </div>
  );
}

