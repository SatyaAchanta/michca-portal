"use client";

import { useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Crown,
  Loader2,
  Lock,
  Shield,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";

import { saveMichcaMadnessPick } from "@/lib/actions/michca-madness";
import {
  DIVISION_LABELS,
  MICHCA_MADNESS_DIVISIONS,
  getDownstreamSlotKeys,
  getRemainingPickCount,
  getSourceLabel,
  validatePartialBracketPicks,
  type BracketTemplate,
  type MichcaMadnessDivision,
} from "@/lib/michca-madness";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const DETROIT_TIMEZONE = "America/Detroit";
const BRACKET_CARD_WIDTH = 288;
const BRACKET_CARD_HEIGHT = 236;
const BRACKET_COLUMN_GAP = 112;
const BRACKET_ROW_GAP = 36;

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

type MadnessView = "brackets" | "leaderboards";

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
    <Card
      className={cn(
        "h-full w-full border-border/70 bg-card p-4 shadow-sm transition-shadow",
        winnerCode && "shadow-md",
        slot.round === "Finals" &&
          "border-amber-500/40 bg-amber-50/60 dark:bg-amber-950/20",
      )}
    >
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

function getSourceSlotKey(source: string) {
  if (source.startsWith("WIN:")) return source.slice(4);
  if (source.startsWith("LOSS:")) return source.slice(5);
  return null;
}

function getSlotSourceKeys(slot: { team1Source: string; team2Source: string }) {
  return [slot.team1Source, slot.team2Source].flatMap((source) => {
    const slotKey = getSourceSlotKey(source);
    return slotKey ? [slotKey] : [];
  });
}

function BracketBoard({
  data,
  validation,
  picks,
  disabled,
  teamsByCode,
  onPick,
}: {
  data: DivisionData;
  validation: ReturnType<typeof validatePartialBracketPicks>;
  picks: Map<string, string>;
  disabled: boolean;
  teamsByCode: Map<string, Team>;
  onPick: (slotKey: string, code: string) => void;
}) {
  const groupedSlots = data.template.slots.reduce(
    (groups, slot) => {
      const existing = groups.get(slot.round) ?? [];
      existing.push(slot);
      groups.set(slot.round, existing);
      return groups;
    },
    new Map<string, typeof data.template.slots>(),
  );
  const rounds = Array.from(groupedSlots.entries());
  const roundIndexBySlot = new Map<string, number>();
  rounds.forEach(([, slots], roundIndex) => {
    slots.forEach((slot) => roundIndexBySlot.set(slot.key, roundIndex));
  });

  const positions = new Map<string, { x: number; y: number }>();
  rounds.forEach(([, slots], roundIndex) => {
    slots.forEach((slot, slotIndex) => {
      const x = roundIndex * (BRACKET_CARD_WIDTH + BRACKET_COLUMN_GAP);
      const sourceCenters = getSlotSourceKeys(slot)
        .map((sourceKey) => positions.get(sourceKey))
        .filter((position): position is { x: number; y: number } => Boolean(position))
        .map((position) => position.y + BRACKET_CARD_HEIGHT / 2);
      const fallbackY = slotIndex * (BRACKET_CARD_HEIGHT + BRACKET_ROW_GAP);
      const y =
        sourceCenters.length > 0
          ? sourceCenters.reduce((sum, center) => sum + center, 0) /
              sourceCenters.length -
            BRACKET_CARD_HEIGHT / 2
          : fallbackY;

      positions.set(slot.key, { x, y: Math.max(0, y) });
    });
  });

  const boardWidth =
    rounds.length * BRACKET_CARD_WIDTH +
    Math.max(rounds.length - 1, 0) * BRACKET_COLUMN_GAP;
  const boardHeight =
    Math.max(
      ...Array.from(positions.values()).map(
        (position) => position.y + BRACKET_CARD_HEIGHT,
      ),
      BRACKET_CARD_HEIGHT,
    ) + 24;
  const connectors = data.template.slots.flatMap((slot) => {
    const target = positions.get(slot.key);
    const targetRound = roundIndexBySlot.get(slot.key) ?? 0;
    if (!target || targetRound === 0) return [];

    return getSlotSourceKeys(slot).flatMap((sourceKey) => {
      const source = positions.get(sourceKey);
      if (!source) return [];
      const startX = source.x + BRACKET_CARD_WIDTH;
      const startY = source.y + BRACKET_CARD_HEIGHT / 2;
      const endX = target.x;
      const endY = target.y + BRACKET_CARD_HEIGHT / 2;
      const midX = startX + (endX - startX) / 2;

      return [
        {
          key: `${sourceKey}-${slot.key}`,
          d: `M ${startX} ${startY} H ${midX} V ${endY} H ${endX - 10}`,
        },
      ];
    });
  });

  return (
    <div className="overflow-x-auto rounded-xl border bg-muted/20 p-3 sm:p-4">
      <div
        className="relative min-w-max"
        style={{ width: boardWidth, height: boardHeight + 56 }}
      >
        <svg
          className="pointer-events-none absolute left-0 top-14 z-0 overflow-visible"
          width={boardWidth}
          height={boardHeight}
          viewBox={`0 0 ${boardWidth} ${boardHeight}`}
          aria-hidden="true"
        >
          <defs>
            <marker
              id={`bracket-arrow-${data.division}`}
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M 0 0 L 10 5 L 0 10 z"
                className="fill-primary/65"
              />
            </marker>
          </defs>
          {connectors.map((connector) => (
            <path
              key={connector.key}
              d={connector.d}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              markerEnd={`url(#bracket-arrow-${data.division})`}
              className="text-primary/55"
            />
          ))}
        </svg>

        {rounds.map(([round], roundIndex) => (
          <div
            key={round}
            className="absolute top-0 z-20 flex h-11 items-center justify-between gap-3 rounded-lg border bg-background/95 px-3 shadow-sm backdrop-blur"
            style={{
              left: roundIndex * (BRACKET_CARD_WIDTH + BRACKET_COLUMN_GAP),
              width: BRACKET_CARD_WIDTH,
            }}
          >
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Stage {roundIndex + 1}
              </p>
              <h3 className="truncate text-sm font-semibold">{round}</h3>
            </div>
            {roundIndex === rounds.length - 1 ? (
              <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
            ) : (
              <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
            )}
          </div>
        ))}

        <div className="absolute left-0 top-14 z-10">
          {data.template.slots.map((slot) => {
            const position = positions.get(slot.key);
            if (!position) return null;
            const dbSlot = data.slots.find((item) => item.key === slot.key);
            const resolved = validation.resolvedSlots.get(slot.key);
            const selectedCode = picks.get(slot.key) ?? null;
            return (
              <div
                key={slot.key}
                className="absolute"
                style={{
                  left: position.x,
                  top: position.y,
                  width: BRACKET_CARD_WIDTH,
                  height: BRACKET_CARD_HEIGHT,
                }}
              >
                <BracketSlotCard
                  slot={
                    dbSlot ?? {
                      ...slot,
                      team1Code: null,
                      team2Code: null,
                      winnerCode: null,
                      scheduledAt: null,
                      venue: null,
                      needsAttention: false,
                    }
                  }
                  template={data.template}
                  team1Code={resolved?.team1Code ?? dbSlot?.team1Code ?? null}
                  team2Code={resolved?.team2Code ?? dbSlot?.team2Code ?? null}
                  selectedCode={selectedCode}
                  winnerCode={dbSlot?.winnerCode ?? null}
                  disabled={disabled}
                  teamsByCode={teamsByCode}
                  onPick={(code) => onPick(slot.key, code)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getGroupedRounds(template: BracketTemplate) {
  const groupedSlots = template.slots.reduce(
    (groups, slot) => {
      const existing = groups.get(slot.round) ?? [];
      existing.push(slot);
      groups.set(slot.round, existing);
      return groups;
    },
    new Map<string, typeof template.slots>(),
  );

  return Array.from(groupedSlots.entries());
}

function getAdvanceLabels(template: BracketTemplate, slotKey: string) {
  return template.slots.flatMap((slot) => {
    const labels: string[] = [];
    if (slot.team1Source === `WIN:${slotKey}` || slot.team2Source === `WIN:${slotKey}`) {
      labels.push(`Winner goes to ${slot.displayName}`);
    }
    if (slot.team1Source === `LOSS:${slotKey}` || slot.team2Source === `LOSS:${slotKey}`) {
      labels.push(`Loser goes to ${slot.displayName}`);
    }
    return labels;
  });
}

function MobileBracketRounds({
  data,
  validation,
  picks,
  disabled,
  teamsByCode,
  onPick,
}: {
  data: DivisionData;
  validation: ReturnType<typeof validatePartialBracketPicks>;
  picks: Map<string, string>;
  disabled: boolean;
  teamsByCode: Map<string, Team>;
  onPick: (slotKey: string, code: string) => void;
}) {
  const rounds = getGroupedRounds(data.template);
  const [selectedRoundIndex, setSelectedRoundIndex] = useState(0);
  const selectedRound = rounds[selectedRoundIndex] ?? rounds[0];
  const roundCount = rounds.length;

  if (!selectedRound) return null;

  return (
    <div className="space-y-4 md:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {rounds.map(([round, slots], index) => {
          const pickedInRound = slots.filter((slot) => picks.has(slot.key)).length;
          return (
            <button
              key={round}
              type="button"
              onClick={() => setSelectedRoundIndex(index)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium",
                selectedRoundIndex === index
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground",
              )}
            >
              {round}
              <span className="ml-2 text-xs opacity-80">
                {pickedInRound}/{slots.length}
              </span>
            </button>
          );
        })}
      </div>

      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Stage {selectedRoundIndex + 1} of {roundCount}
            </p>
            <h3 className="text-xl font-semibold">{selectedRound[0]}</h3>
          </div>
          {selectedRoundIndex === roundCount - 1 ? (
            <Trophy className="h-5 w-5 text-amber-500" />
          ) : (
            <ArrowRight className="h-5 w-5 text-primary" />
          )}
        </div>

        <div className="space-y-4">
          {selectedRound[1].map((slot) => {
            const dbSlot = data.slots.find((item) => item.key === slot.key);
            const resolved = validation.resolvedSlots.get(slot.key);
            const selectedCode = picks.get(slot.key) ?? null;
            const advanceLabels = getAdvanceLabels(data.template, slot.key);

            return (
              <div key={slot.key} className="space-y-2">
                <BracketSlotCard
                  slot={
                    dbSlot ?? {
                      ...slot,
                      team1Code: null,
                      team2Code: null,
                      winnerCode: null,
                      scheduledAt: null,
                      venue: null,
                      needsAttention: false,
                    }
                  }
                  template={data.template}
                  team1Code={resolved?.team1Code ?? dbSlot?.team1Code ?? null}
                  team2Code={resolved?.team2Code ?? dbSlot?.team2Code ?? null}
                  selectedCode={selectedCode}
                  winnerCode={dbSlot?.winnerCode ?? null}
                  disabled={disabled}
                  teamsByCode={teamsByCode}
                  onPick={(code) => onPick(slot.key, code)}
                />
                {advanceLabels.length > 0 ? (
                  <div className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
                    {advanceLabels.join(" · ")}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={selectedRoundIndex === 0}
            onClick={() => setSelectedRoundIndex((index) => Math.max(index - 1, 0))}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={selectedRoundIndex === roundCount - 1}
            onClick={() =>
              setSelectedRoundIndex((index) =>
                Math.min(index + 1, roundCount - 1),
              )
            }
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
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
          F40 and T30 brackets open during the week of August 3. Build your
          playoff bracket, back your champions, and stay perfect as the
          postseason unfolds.
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
          <h3 className="font-semibold">Leaderboard</h3>
          <p className="text-sm text-muted-foreground">
            Still-alive perfect brackets for this division.
          </p>
        </div>
        <Shield className="h-5 w-5 text-primary" />
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No perfect brackets are on the board yet.
        </p>
      ) : (
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1 sm:max-h-80 xl:max-h-[420px]">
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
      {entries.length > 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Showing up to 100 still-alive brackets.
        </p>
      ) : null}
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

function LeaderboardLockedState({ data }: { data: DivisionData }) {
  const title = `${DIVISION_LABELS[data.division]} Leaderboard`;
  const isConfigured = Boolean(data.config?.isReady);

  return (
    <Card className="border-dashed p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Lock className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {isConfigured ? "Locked Until Brackets Close" : "Coming Soon"}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            {isConfigured
              ? "Leaderboard unlocks after this division's bracket closes. Until then, other users' bracket standings stay hidden."
              : "This division's bracket is not open yet. Leaderboard standings will appear after the bracket is configured and later locked."}
          </p>
          {data.config?.lockAt ? (
            <Badge variant="outline">Closes {formatDateTime(data.config.lockAt)}</Badge>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function DivisionLeaderboard({ data }: { data: DivisionData }) {
  if (!data.config?.isReady || !data.config.isLocked) {
    return <LeaderboardLockedState data={data} />;
  }

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Leaderboard
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              {DIVISION_LABELS[data.division]} still-alive brackets
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              These are complete brackets that are still perfect after resolved
              results for this division.
            </p>
          </div>
          <Badge variant="outline">
            Locked {formatDateTime(data.config.lockAt)}
          </Badge>
        </div>
      </Card>
      <Leaderboard entries={data.leaderboard} />
    </div>
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
  const [saveMessage, setSaveMessage] = useState<string | null>(() =>
    data.entry
      ? `Saved · ${data.entry.picks.length} of ${data.template.slots.length} picks complete.`
      : null,
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savingSlotKey, setSavingSlotKey] = useState<string | null>(null);
  const seedsByKey = useMemo(
    () =>
      new Map(
        data.seeds
          .filter((seed) => seed.teamCode)
          .map((seed) => [seed.key, seed.teamCode as string]),
      ),
    [data.seeds],
  );
  const validation = validatePartialBracketPicks(data.template, seedsByKey, picks);
  const remainingCount = getRemainingPickCount(data.template, picks);
  const completedCount = data.template.slots.length - remainingCount;
  const firstMissingSlot = data.template.slots.find((slot) => !picks.get(slot.key));
  const disabled = data.config?.isLocked || data.entry?.status === "ELIMINATED";

  async function handlePick(slotKey: string, code: string) {
    if (disabled || savingSlotKey) return;

    setSaveError(null);
    setSaveMessage("Saving pick...");
    setSavingSlotKey(slotKey);

    const downstreamSlotKeys = getDownstreamSlotKeys(data.template, slotKey);
    setPicks((current) => {
      const next = new Map(current);
      next.set(slotKey, code);
      for (const key of downstreamSlotKeys) {
        next.delete(key);
      }
      return next;
    });

    const result = await saveMichcaMadnessPick({
      season,
      division: data.division,
      slotKey,
      predictedWinnerCode: code,
    });

    if (result.success) {
      if (result.savedPicks) {
        setPicks(
          new Map(
            result.savedPicks.map((pick) => [
              pick.slotKey,
              pick.predictedWinnerCode,
            ]),
          ),
        );
      }
      setSaveMessage(result.message ?? "Pick saved.");
      setSaveError(null);
    } else {
      setSaveError(result.message ?? "Unable to save pick.");
      setSaveMessage(null);
    }

    setSavingSlotKey(null);
  }

  if (!data.config?.isReady) {
    return <ComingSoonState />;
  }

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]">
      <div className="min-w-0 space-y-5">
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

        <div className="space-y-5">
          <Card
            className={cn(
              "p-4",
              remainingCount === 0
                ? "border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/20"
                : "border-amber-500/40 bg-amber-50/60 dark:bg-amber-950/20",
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    remainingCount === 0
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-500 text-white",
                  )}
                >
                  {savingSlotKey ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : remainingCount === 0 ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">
                    {remainingCount === 0 ? "Bracket complete" : "Incomplete bracket"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {remainingCount === 0
                      ? "All picks are saved. You can still change them before lock."
                      : `${remainingCount} ${
                          remainingCount === 1 ? "pick is" : "picks are"
                        } still missing${
                          firstMissingSlot
                            ? `, starting with ${firstMissingSlot.displayName}`
                            : ""
                        }.`}
                  </p>
                  {saveError ? (
                    <p className="mt-1 text-sm text-destructive">{saveError}</p>
                  ) : saveMessage ? (
                    <p className="mt-1 text-sm text-muted-foreground">{saveMessage}</p>
                  ) : null}
                </div>
              </div>
              <Badge variant="outline">
                {completedCount}/{data.template.slots.length} saved
              </Badge>
            </div>
          </Card>

          <div className="hidden md:block">
            <p className="mb-2 text-xs text-muted-foreground">
              Scroll sideways to view the full connected bracket.
            </p>
            <BracketBoard
              data={data}
              validation={validation}
              picks={picks}
              disabled={Boolean(disabled) || Boolean(savingSlotKey)}
              teamsByCode={teamsByCode}
              onPick={handlePick}
            />
          </div>

          <MobileBracketRounds
            data={data}
            validation={validation}
            picks={picks}
            disabled={Boolean(disabled) || Boolean(savingSlotKey)}
            teamsByCode={teamsByCode}
            onPick={handlePick}
          />
        </div>
      </div>

      <aside className="min-w-0 space-y-5 xl:sticky xl:top-20 xl:self-start">
        <RulesCard />
      </aside>
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
  const [activeView, setActiveView] = useState<MadnessView>("brackets");
  const teamsByCode = useMemo(
    () => new Map(teams.map((team) => [team.teamCode, team])),
    [teams],
  );
  const selectedData =
    divisions.find((division) => division.division === selectedDivision) ??
    divisions[0];

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-lg border bg-muted/30 p-1">
        {[
          { key: "brackets" as const, label: "Brackets" },
          { key: "leaderboards" as const, label: "Leaderboards" },
        ].map((view) => (
          <button
            key={view.key}
            type="button"
            onClick={() => setActiveView(view.key)}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeView === view.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {view.label}
          </button>
        ))}
      </div>

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
        activeView === "brackets" ? (
          <DivisionBracket
            key={selectedData.division}
            data={selectedData}
            season={season}
            teamsByCode={teamsByCode}
          />
        ) : (
          <DivisionLeaderboard data={selectedData} />
        )
      ) : (
        <ComingSoonState />
      )}
    </div>
  );
}
