"use client";

import { useActionState, useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import {
  CheckCircle2,
  CircleDot,
  Crown,
  Lock,
  Shield,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";

import {
  submitMichcaMadnessBracket,
  type MichcaMadnessActionState,
} from "@/lib/actions/michca-madness";
import {
  DIVISION_LABELS,
  MICHCA_MADNESS_DIVISIONS,
  getSourceLabel,
  validateBracketPicks,
  type BracketTemplate,
  type MichcaMadnessDivision,
} from "@/lib/michca-madness";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const INITIAL_STATE: MichcaMadnessActionState = { status: "idle" };
const DETROIT_TIMEZONE = "America/Detroit";

type Team = {
  teamCode: string;
  teamName: string;
  teamShortCode: string;
  logo: string | null;
};

type DivisionData = {
  division: MichcaMadnessDivision;
  template: BracketTemplate;
  config: {
    id: string;
    status: string;
    lockAt: string | null;
    isLocked: boolean;
    isReady: boolean;
  } | null;
  seeds: Array<{
    key: string;
    label: string;
    pool: string | null;
    seed: number;
    teamCode: string | null;
  }>;
  slots: Array<{
    key: string;
    round: string;
    displayName: string;
    team1Source: string;
    team2Source: string;
    sortOrder: number;
    team1Code: string | null;
    team2Code: string | null;
    winnerCode: string | null;
    scheduledAt: string | null;
    venue: string | null;
    needsAttention: boolean;
  }>;
  entry: {
    id: string;
    status: string;
    submittedAt: string;
    picks: Array<{
      slotKey: string;
      predictedWinnerCode: string;
      isCorrect: boolean | null;
    }>;
  } | null;
  leaderboard: Array<{
    id: string;
    rank: number;
    displayName: string;
    teamCode: string | null;
    submittedAt: string;
  }>;
};

type MichcaMadnessClientProps = {
  season: number;
  teams: Team[];
  divisions: DivisionData[];
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

function formatDateTime(iso: string | null) {
  if (!iso) return "TBD";
  return formatInTimeZone(new Date(iso), DETROIT_TIMEZONE, "EEE, MMM d, h:mm a");
}

function TeamName({
  code,
  teamsByCode,
  fallback,
}: {
  code: string | null;
  teamsByCode: Map<string, Team>;
  fallback: string;
}) {
  if (!code) return <span className="text-muted-foreground">{fallback}</span>;
  const team = teamsByCode.get(code);
  return (
    <span className="min-w-0">
      <span className="block truncate font-medium">
        {team?.teamShortCode || code}
      </span>
      <span className="block truncate text-xs text-muted-foreground">
        {team?.teamName ?? code}
      </span>
    </span>
  );
}

function ResultBadge({
  pickedCode,
  winnerCode,
}: {
  pickedCode: string | null;
  winnerCode: string | null;
}) {
  if (!pickedCode || !winnerCode) return null;
  if (pickedCode === winnerCode) {
    return (
      <Badge className="gap-1 border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        <CheckCircle2 className="h-3 w-3" />
        Correct
      </Badge>
    );
  }
  return (
    <Badge className="gap-1 border-red-500/40 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
      <XCircle className="h-3 w-3" />
      Wrong
    </Badge>
  );
}

function PickButton({
  code,
  fallback,
  teamsByCode,
  selected,
  disabled,
  winnerCode,
  onPick,
}: {
  code: string | null;
  fallback: string;
  teamsByCode: Map<string, Team>;
  selected: boolean;
  disabled: boolean;
  winnerCode: string | null;
  onPick: (code: string) => void;
}) {
  const isResolvedWinner = Boolean(code && winnerCode === code);
  const isResolvedWrong = Boolean(selected && winnerCode && winnerCode !== code);

  return (
    <button
      type="button"
      disabled={!code || disabled}
      onClick={() => code && onPick(code)}
      className={cn(
        "flex h-16 min-w-0 items-center justify-between gap-3 rounded-lg border px-3 text-left transition-colors",
        selected
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-background hover:border-primary/40",
        isResolvedWinner &&
          "border-emerald-500/60 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100",
        isResolvedWrong &&
          "border-red-500/60 bg-red-50 text-red-900 dark:bg-red-950/30 dark:text-red-100",
        (!code || disabled) && "cursor-default hover:border-border",
      )}
    >
      <TeamName code={code} teamsByCode={teamsByCode} fallback={fallback} />
      {selected ? <CircleDot className="h-4 w-4 shrink-0 text-primary" /> : null}
    </button>
  );
}

function BracketSlotCard({
  slot,
  template,
  team1Code,
  team2Code,
  selectedCode,
  winnerCode,
  disabled,
  teamsByCode,
  onPick,
}: {
  slot: DivisionData["slots"][number];
  template: BracketTemplate;
  team1Code: string | null;
  team2Code: string | null;
  selectedCode: string | null;
  winnerCode: string | null;
  disabled: boolean;
  teamsByCode: Map<string, Team>;
  onPick: (code: string) => void;
}) {
  return (
    <Card className="h-full p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{slot.displayName}</p>
          <p className="text-xs text-muted-foreground">{slot.round}</p>
        </div>
        <ResultBadge pickedCode={selectedCode} winnerCode={winnerCode} />
      </div>

      <div className="space-y-2">
        <PickButton
          code={team1Code}
          fallback={getSourceLabel(slot.team1Source, template)}
          teamsByCode={teamsByCode}
          selected={selectedCode === team1Code}
          disabled={disabled}
          winnerCode={winnerCode}
          onPick={onPick}
        />
        <PickButton
          code={team2Code}
          fallback={getSourceLabel(slot.team2Source, template)}
          teamsByCode={teamsByCode}
          selected={selectedCode === team2Code}
          disabled={disabled}
          winnerCode={winnerCode}
          onPick={onPick}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{formatDateTime(slot.scheduledAt)}</span>
        <span>{slot.venue ?? "Venue TBD"}</span>
      </div>
    </Card>
  );
}

function ComingSoonState() {
  return (
    <Card className="overflow-hidden border-red-500/20 bg-gradient-to-br from-red-50 via-background to-amber-50 p-6 shadow-sm dark:from-red-950/20 dark:via-background dark:to-amber-950/20 sm:p-8">
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-background/80 px-3 py-1 text-sm font-semibold text-red-700 dark:text-red-300">
          <Sparkles className="h-4 w-4" />
          Coming Soon
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
          MichCA-Madness is almost here.
        </h2>
        <p className="text-base leading-8 text-muted-foreground sm:text-lg">
          Build your playoff bracket, back your champions, and stay perfect as
          the postseason unfolds. Updates will be posted here when brackets open.
        </p>
      </div>
    </Card>
  );
}

function Leaderboard({
  entries,
}: {
  entries: DivisionData["leaderboard"];
}) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Still Alive</h3>
          <p className="text-sm text-muted-foreground">
            Perfect brackets for this division.
          </p>
        </div>
        <Shield className="h-5 w-5 text-primary" />
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No perfect brackets are on the board yet.
        </p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  #{entry.rank} {entry.displayName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Submitted {formatDateTime(entry.submittedAt)}
                </p>
              </div>
              {entry.rank === 1 ? (
                <Crown className="h-4 w-4 shrink-0 text-amber-500" />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function RulesCard() {
  return (
    <Card className="p-5">
      <h3 className="mb-3 font-semibold">Rules</h3>
      <div className="space-y-3 text-sm leading-6 text-muted-foreground">
        <p>Each account can submit one bracket for each division.</p>
        <p>Brackets can be changed until that division&apos;s first playoff game starts.</p>
        <p>After games are completed, correct picks stay alive and wrong picks are marked out.</p>
        <p>The leaderboard only shows users who have every resolved pick correct so far.</p>
      </div>
    </Card>
  );
}

function DivisionBracket({
  data,
  season,
  teamsByCode,
}: {
  data: DivisionData;
  season: number;
  teamsByCode: Map<string, Team>;
}) {
  const [state, formAction, isPending] = useActionState(
    submitMichcaMadnessBracket,
    INITIAL_STATE,
  );
  const initialPicks = useMemo(
    () =>
      new Map(
        data.entry?.picks.map((pick) => [
          pick.slotKey,
          pick.predictedWinnerCode,
        ]) ?? [],
      ),
    [data.entry],
  );
  const [picks, setPicks] = useState(() => initialPicks);
  const seedsByKey = useMemo(
    () =>
      new Map(
        data.seeds
          .filter((seed) => seed.teamCode)
          .map((seed) => [seed.key, seed.teamCode as string]),
      ),
    [data.seeds],
  );
  const validation = validateBracketPicks(data.template, seedsByKey, picks);
  const groupedSlots = data.template.slots.reduce(
    (groups, slot) => {
      const existing = groups.get(slot.round) ?? [];
      existing.push(slot);
      groups.set(slot.round, existing);
      return groups;
    },
    new Map<string, typeof data.template.slots>(),
  );
  const disabled = data.config?.isLocked || data.entry?.status === "ELIMINATED";

  if (!data.config?.isReady) {
    return <ComingSoonState />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <Card className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                {DIVISION_LABELS[data.division]} Bracket
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {data.template.formatSummary}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.config.isLocked ? (
                <Badge variant="outline" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Locked
                </Badge>
              ) : (
                <Badge className="bg-emerald-600 text-white">
                  Open until {formatDateTime(data.config.lockAt)}
                </Badge>
              )}
              {data.entry?.status === "ELIMINATED" ? (
                <Badge className="bg-red-600 text-white">Out of race</Badge>
              ) : data.entry ? (
                <Badge className="bg-emerald-600 text-white">Still alive</Badge>
              ) : null}
            </div>
          </div>
        </Card>

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="season" value={season} />
          <input type="hidden" name="division" value={data.division} />
          {data.template.slots.map((slot) => (
            <input
              key={slot.key}
              type="hidden"
              name={`pick:${slot.key}`}
              value={picks.get(slot.key) ?? ""}
            />
          ))}

          {Array.from(groupedSlots.entries()).map(([round, slots]) => (
            <section key={round} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {round}
              </h3>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {slots.map((slot) => {
                  const dbSlot = data.slots.find((item) => item.key === slot.key);
                  const resolved = validation.resolvedSlots.get(slot.key);
                  const selectedCode = picks.get(slot.key) ?? null;
                  return (
                    <BracketSlotCard
                      key={slot.key}
                      slot={dbSlot ?? { ...slot, team1Code: null, team2Code: null, winnerCode: null, scheduledAt: null, venue: null, needsAttention: false }}
                      template={data.template}
                      team1Code={resolved?.team1Code ?? dbSlot?.team1Code ?? null}
                      team2Code={resolved?.team2Code ?? dbSlot?.team2Code ?? null}
                      selectedCode={selectedCode}
                      winnerCode={dbSlot?.winnerCode ?? null}
                      disabled={Boolean(disabled)}
                      teamsByCode={teamsByCode}
                      onPick={(code) =>
                        setPicks((current) => {
                          const next = new Map(current);
                          next.set(slot.key, code);
                          const slotIndex = data.template.slots.findIndex(
                            (item) => item.key === slot.key,
                          );
                          for (const laterSlot of data.template.slots.slice(slotIndex + 1)) {
                            next.delete(laterSlot.key);
                          }
                          return next;
                        })
                      }
                    />
                  );
                })}
              </div>
            </section>
          ))}

          <ActionMessage state={state} />
          <Button
            type="submit"
            disabled={Boolean(disabled) || isPending || !validation.isValid}
          >
            <Trophy className="h-4 w-4" />
            {isPending ? "Saving..." : data.entry ? "Update Bracket" : "Submit Bracket"}
          </Button>
        </form>
      </div>

      <div className="space-y-5">
        <Leaderboard entries={data.leaderboard} />
        <RulesCard />
      </div>
    </div>
  );
}

export function MichcaMadnessClient({
  season,
  teams,
  divisions,
}: MichcaMadnessClientProps) {
  const firstReady = divisions.find((division) => division.config?.isReady);
  const [selectedDivision, setSelectedDivision] = useState<MichcaMadnessDivision>(
    firstReady?.division ?? "PREMIER_T20",
  );
  const teamsByCode = useMemo(
    () => new Map(teams.map((team) => [team.teamCode, team])),
    [teams],
  );
  const selectedData =
    divisions.find((division) => division.division === selectedDivision) ??
    divisions[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {MICHCA_MADNESS_DIVISIONS.map((division) => {
          const divisionData = divisions.find((item) => item.division === division);
          return (
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
              {divisionData?.config?.isReady ? (
                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
              ) : null}
            </button>
          );
        })}
      </div>

      {selectedData ? (
        <DivisionBracket
          data={selectedData}
          season={season}
          teamsByCode={teamsByCode}
        />
      ) : (
        <ComingSoonState />
      )}
    </div>
  );
}

