"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Lock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { submitPrediction } from "@/lib/actions/fantasy";
import { cn } from "@/lib/utils";
import type { PredictionCount } from "@/components/fantasy/fantasy-client";

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
  team1Form?: ("W" | "L" | "D")[];
  team2Form?: ("W" | "L" | "D")[];
};

type ExistingPrediction = {
  gameId: string;
  predictedWinnerCode: string | null;
  isBoosted: boolean;
  isScored: boolean;
  isCorrect: boolean | null;
  pointsEarned: number | null;
};

type PredictionCardProps = {
  game: Game;
  existing?: ExistingPrediction;
  picks?: PredictionCount;
  canBoost: boolean;
  boostersRemaining: number;
};

const DETROIT_TZ = "America/Detroit";

function formatGameDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: DETROIT_TZ,
  }).format(date);
}

function FormChips({ form }: { form: ("W" | "L" | "D")[] }) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label="Recent form"
      data-testid="team-form"
    >
      {form.map((result, index) => {
        const isLatest = index === form.length - 1;
        const label =
          result === "W" ? "Win" : result === "L" ? "Loss" : "Draw";
        return (
          <span
            key={`${result}-${index}`}
            aria-label={label}
            data-latest={isLatest ? "true" : undefined}
            data-result={result}
            className={cn(
              "inline-flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-semibold leading-none",
              result === "W" &&
                "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
              result === "L" &&
                "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
              result === "D" &&
                "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
              isLatest && "ring-1 ring-current/35",
            )}
            title={label}
          >
            {result === "D" ? "-" : result}
          </span>
        );
      })}
    </div>
  );
}

function getFormSummary(form: ("W" | "L" | "D")[]) {
  return `Form: ${form.map((result) => (result === "D" ? "-" : result)).join(" ")}`;
}

function TeamForm({ form }: { form: ("W" | "L" | "D")[] }) {
  return (
    <div className="mt-1.5">
      <p className="sr-only">{getFormSummary(form)}</p>
      <FormChips form={form} />
    </div>
  );
}

export function PredictionCard({
  game,
  existing,
  picks,
  canBoost,
  boostersRemaining,
}: PredictionCardProps) {
  const [selected, setSelected] = useState<string | null | undefined>(
    existing?.predictedWinnerCode !== undefined
      ? existing.predictedWinnerCode
      : undefined,
  );
  const [boosted, setBoosted] = useState(existing?.isBoosted ?? false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">(
    existing ? "saved" : "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentTime] = useState(() => Date.now());

  // Lock if already scored, game is not SCHEDULED, or within 1 hour of kickoff
  const kickoffLock = new Date(game.date).getTime() - 60 * 60 * 1000;
  const isLocked =
    existing?.isScored ||
    game.status === "COMPLETED" ||
    game.status === "CANCELLED" ||
    currentTime >= kickoffLock;

  function save(newSelected: string | null | undefined, newBoosted: boolean) {
    if (newSelected === undefined) return;
    startTransition(async () => {
      const result = await submitPrediction(game.id, newSelected, newBoosted);
      if (result.success) {
        setStatus("saved");
        setErrorMsg(null);
      } else {
        setStatus("error");
        setErrorMsg(result.error ?? "Failed to save");
      }
    });
  }

  function handleSelect(code: string | null) {
    if (isLocked) return;
    setSelected(code);
    setStatus("idle");
    save(code, boosted);
  }

  function handleBoostToggle() {
    if (isLocked || selected === undefined) return;
    const next = !boosted;
    setBoosted(next);
    save(selected, next);
  }

  const total = picks?.total ?? 0;

  function pct(count: number) {
    if (total === 0) return null;
    return Math.round((count / total) * 100);
  }

  const team1Pct = pct(picks?.team1Count ?? 0);
  const drawPct = pct(picks?.drawCount ?? 0);
  const team2Pct = pct(picks?.team2Count ?? 0);

  return (
    <Card
      className={cn(
        "max-w-full overflow-hidden p-3 sm:p-4 space-y-3",
        isLocked && "opacity-80",
      )}
    >
      {/* ── Header ── */}
      <div className="flex max-w-full flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 text-sm text-muted-foreground">
          {formatGameDateTime(game.date)}
        </p>
        <div className="flex max-w-full items-center justify-end gap-1.5 flex-wrap">
          {isLocked && (
            <Badge
              variant="outline"
              className="gap-1 border-amber-500/40 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-300"
            >
              <Lock className="h-3 w-3" />
              Game locked
            </Badge>
          )}
          {game.gameType === "PLAYOFF" && (
            <Badge className="bg-red-600 text-white text-xs">
              Playoff · 3pts
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {game.division.replace(/_/g, " ")}
          </Badge>
        </div>
      </div>

      {/* ── Team rows ── */}
      <div className="flex flex-col gap-2">
        {/* Team 1 */}
        <TeamRow
          code={game.team1Code}
          name={game.team1.teamName}
          shortCode={game.team1.teamShortCode}
          form={game.team1Form}
          pickPct={team1Pct}
          isSelected={selected === game.team1Code}
          isLocked={!!isLocked}
          isPending={isPending}
          color="primary"
          onClick={() => handleSelect(game.team1Code)}
        />

        {/* Tie */}
        <button
          type="button"
          disabled={!!isLocked || isPending}
          onClick={() => handleSelect(null)}
          className={cn(
            "flex max-w-full items-center justify-between rounded-xl border-2 px-3 py-2.5 sm:px-4 text-sm font-medium transition-all",
            selected === null
              ? "border-slate-400 bg-slate-100 text-slate-700 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-100"
              : "border-border text-muted-foreground hover:border-primary/30",
            (isLocked || isPending) && "cursor-default",
          )}
        >
          <div className="flex items-center gap-2">
            {selected === null && (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-600 dark:text-slate-300" />
            )}
            <span>Tie</span>
          </div>
          {drawPct !== null && (
            <span className="tabular-nums text-xs">{drawPct}%</span>
          )}
        </button>

        {/* Team 2 */}
        <TeamRow
          code={game.team2Code}
          name={game.team2.teamName}
          shortCode={game.team2.teamShortCode}
          form={game.team2Form}
          pickPct={team2Pct}
          isSelected={selected === game.team2Code}
          isLocked={!!isLocked}
          isPending={isPending}
          color="orange"
          onClick={() => handleSelect(game.team2Code)}
        />
      </div>

      {/* ── Pick distribution bar ── */}
      {total > 0 && (
        <div className="space-y-1">
          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
            {picks!.team1Count > 0 && (
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(picks!.team1Count / total) * 100}%` }}
              />
            )}
            {picks!.drawCount > 0 && (
              <div
                className="h-full bg-muted-foreground/30 transition-all"
                style={{ width: `${(picks!.drawCount / total) * 100}%` }}
              />
            )}
            {picks!.team2Count > 0 && (
              <div
                className="h-full bg-orange-400 transition-all"
                style={{ width: `${(picks!.team2Count / total) * 100}%` }}
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {total} {total === 1 ? "pick" : "picks"} so far
          </p>
        </div>
      )}

      {/* ── Scored result ── */}
      {isLocked && existing && (
        <div
          className={cn(
            "rounded-lg px-3 py-2 text-sm text-center font-medium",
            existing.isCorrect
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-muted text-muted-foreground",
          )}
        >
          {existing.isCorrect
            ? `Correct! +${existing.pointsEarned} pts${existing.isBoosted ? " (boosted)" : ""}`
            : "Incorrect — 0 pts"}
        </div>
      )}

      {isLocked && !existing?.isScored && (
        <div className="flex min-h-[28px] flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300">
            <Lock className="h-3 w-3" />
            Game locked
          </span>
          {!isPending && status === "error" && (
            <span className="text-xs text-destructive">{errorMsg}</span>
          )}
        </div>
      )}

      {/* ── Booster + status row ── */}
      {!isLocked && (
        <div className="flex min-h-[28px] flex-wrap items-center justify-between gap-2">
          {canBoost ? (
            <button
              type="button"
              disabled={
                selected === undefined ||
                isPending ||
                (!boosted && boostersRemaining <= 0)
              }
              onClick={handleBoostToggle}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                boosted
                  ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-600"
                  : "border-border text-muted-foreground hover:border-amber-400",
                (selected === undefined ||
                  isPending ||
                  (!boosted && boostersRemaining <= 0)) &&
                  "opacity-50 cursor-default",
              )}
            >
              <Zap className="h-3 w-3" />
              {boosted ? "Boosted (3×)" : `Boost (${boostersRemaining} left)`}
            </button>
          ) : (
            <span className="text-xs text-muted-foreground">
              2 full weeks predictions unlock boosters
            </span>
          )}

          <div className="flex max-w-full items-center gap-1.5 text-xs sm:whitespace-nowrap">
            {isPending && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
            {!isPending && status === "saved" && (
              <span className="flex items-center gap-1 text-muted-foreground">
                Saved
                <CheckCircle2 className="h-3 w-3" />
              </span>
            )}
            {!isPending && status === "error" && (
              <span className="break-words text-destructive">{errorMsg}</span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── TeamRow sub-component ─────────────────────────────────────────────────

type TeamRowProps = {
  code: string;
  name: string;
  shortCode: string;
  form?: ("W" | "L" | "D")[];
  pickPct: number | null;
  isSelected: boolean;
  isLocked: boolean;
  isPending: boolean;
  color: "primary" | "orange";
  onClick: () => void;
};

function TeamRow({
  name,
  shortCode,
  form,
  pickPct,
  isSelected,
  isLocked,
  isPending,
  color,
  onClick,
}: TeamRowProps) {
  const selectedStyles =
    color === "primary"
      ? "border-primary bg-primary text-primary-foreground shadow-sm"
      : "border-orange-500 bg-orange-500 text-white dark:border-orange-400 dark:bg-orange-500";

  return (
    <button
      type="button"
      disabled={isLocked || isPending}
      onClick={onClick}
      className={cn(
        "flex w-full max-w-full items-center justify-between rounded-xl border-2 px-3 py-3 sm:px-4 text-left transition-all",
        isSelected
          ? selectedStyles
          : "border-border text-foreground hover:border-primary/30",
        (isLocked || isPending) && "cursor-default",
      )}
    >
      {/* Left: check + name */}
      <div className="flex min-w-0 items-center gap-2.5">
        {isSelected ? (
          <CheckCircle2
            className={cn(
              "h-4 w-4 shrink-0",
              color === "primary" ? "text-primary-foreground" : "text-white",
            )}
          />
        ) : (
          <span className="h-4 w-4 shrink-0 rounded-full border-2 border-muted-foreground/30" />
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-snug">
            <span className="shrink-0">{shortCode}</span>
            <span className="ml-1.5 text-xs font-normal opacity-70">
              {name}
            </span>
          </p>
          {form && form.length > 0 && (
            <TeamForm form={form} />
          )}
        </div>
      </div>

      {/* Right: pick percentage */}
      {pickPct !== null && (
        <span className="ml-3 shrink-0 tabular-nums text-xs opacity-70">
          {pickPct}%
        </span>
      )}
    </button>
  );
}
