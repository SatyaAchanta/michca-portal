"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Loader2, Medal, Zap } from "lucide-react";

import {
  getLeaderboardParticipantPredictions,
  type LeaderboardParticipantPredictionResponse,
  type SeasonLeaderboardEntry,
  type WeeklyLeaderboardEntry,
} from "@/lib/actions/fantasy";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type LeaderboardEntry = SeasonLeaderboardEntry | WeeklyLeaderboardEntry;

type LeaderboardTableProps = {
  entries: LeaderboardEntry[];
  currentUserId: string | null;
  canViewPredictions: boolean;
  mode?: "season" | "weekly";
};

const DETROIT_TZ = "America/Detroit";
const PAGE_SIZE = 10;

function getRankStyle(rank: number) {
  if (rank === 1) return "text-amber-500";
  if (rank === 2) return "text-slate-400";
  if (rank === 3) return "text-amber-700";
  return "text-muted-foreground";
}

function getMedalIcon(rank: number) {
  if (rank <= 3) return <Medal className={cn("h-4 w-4", getRankStyle(rank))} />;
  return null;
}

function formatGameDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: DETROIT_TZ,
  }).format(new Date(date));
}

function getDisplayName(entry: LeaderboardEntry) {
  return entry.firstName && entry.lastName
    ? `${entry.firstName} ${entry.lastName}`
    : (entry.firstName ?? entry.email.split("@")[0]);
}

function isSeasonEntry(entry: LeaderboardEntry): entry is SeasonLeaderboardEntry {
  return "fantasyPoints" in entry;
}

function isWeeklyEntry(entry: LeaderboardEntry): entry is WeeklyLeaderboardEntry {
  return "weeklyPoints" in entry;
}

function getDisplayedRank(
  entries: LeaderboardEntry[],
  index: number,
  mode: "season" | "weekly",
): string {
  if (index === 0) return "1";

  const current = entries[index];
  const previous = entries[index - 1];

  if (mode === "season") {
    const sameScore =
      isSeasonEntry(current) &&
      isSeasonEntry(previous) &&
      current.fantasyPoints === previous.fantasyPoints;
    return sameScore ? getDisplayedRank(entries, index - 1, mode) : String(index + 1);
  }

  const sameScore =
    isWeeklyEntry(current) &&
    isWeeklyEntry(previous) &&
    current.weeklyPoints === previous.weeklyPoints;
  const sameCorrect =
    isWeeklyEntry(current) &&
    isWeeklyEntry(previous) &&
    current.correctPredictions === previous.correctPredictions;
  const sameTotal =
    isWeeklyEntry(current) &&
    isWeeklyEntry(previous) &&
    current.totalPredictions === previous.totalPredictions;

  return sameScore && sameCorrect && sameTotal
    ? getDisplayedRank(entries, index - 1, mode)
    : String(index + 1);
}

export function LeaderboardTable({
  entries,
  currentUserId,
  canViewPredictions,
  mode = "season",
}: LeaderboardTableProps) {
  const [openUserId, setOpenUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [detailsByUser, setDetailsByUser] = useState<
    Record<string, LeaderboardParticipantPredictionResponse>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showPicks = mode === "weekly";

  const openEntry = useMemo(
    () => entries.find((entry) => entry.id === openUserId) ?? null,
    [entries, openUserId],
  );
  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paginatedEntries = entries.slice(pageStart, pageStart + PAGE_SIZE);
  const currentUserIndex = currentUserId
    ? entries.findIndex((entry) => entry.id === currentUserId)
    : -1;
  const currentUserRank =
    currentUserIndex >= 0
      ? getDisplayedRank(entries, currentUserIndex, mode)
      : null;

  useEffect(() => {
    if (!openUserId || detailsByUser[openUserId]) return;

    const userId = openUserId;
    let isCancelled = false;

    async function loadPredictions() {
      setIsLoading(true);
      setError(null);

      const result = await getLeaderboardParticipantPredictions(userId);
      if (isCancelled) return;

      if (result.success) {
        setDetailsByUser((current) => ({ ...current, [userId]: result }));
      } else {
        setError(result.error ?? "Failed to load picks");
      }

      setIsLoading(false);
    }

    void loadPredictions();

    return () => {
      isCancelled = true;
    };
  }, [detailsByUser, openUserId]);

  const openDetails = openUserId ? detailsByUser[openUserId] : undefined;
  const dialogTitle =
    openDetails?.participant?.displayName ??
    (openEntry ? getDisplayName(openEntry) : "Participant");
  const weeks = openDetails?.weeks ?? [];

  function renderPagination(compact = false) {
    if (totalPages <= 1) return null;

    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 px-4 py-3",
          compact ? "border-b sm:hidden" : "border-t hidden sm:flex",
        )}
      >
        <p className="text-xs text-muted-foreground sm:text-sm">
          Showing {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, entries.length)} of{" "}
          {entries.length}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="sm:hidden"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="hidden sm:inline-flex"
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground sm:text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            className="sm:hidden"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            className="hidden sm:inline-flex"
          >
            Next
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        {currentUserRank ? (
          <div className="border-b px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Your current position:{" "}
              <span className="font-semibold text-foreground">#{currentUserRank}</span>
            </p>
          </div>
        ) : null}
        {renderPagination(true)}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground">
                <th className="w-14 px-4 py-3 text-left font-medium">Rank</th>
                <th className="px-4 py-3 text-left font-medium">Player</th>
                <th className="px-4 py-3 text-center font-medium">
                  {mode === "weekly" ? "Weekly Pts" : "Points"}
                </th>
                {mode === "weekly" ? (
                  <th className="hidden px-4 py-3 text-center font-medium sm:table-cell">
                    Correct Picks
                  </th>
                ) : null}
                {showPicks ? (
                  <th className="px-4 py-3 text-center font-medium">Picks</th>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedEntries.map((entry, index) => {
                const entryIndex = pageStart + index;
                const rank = entryIndex + 1;
                const displayedRank = getDisplayedRank(entries, entryIndex, mode);
                const isCurrentUser = entry.id === currentUserId;
                const points =
                  mode === "weekly" && isWeeklyEntry(entry)
                    ? entry.weeklyPoints
                    : isSeasonEntry(entry)
                      ? entry.fantasyPoints
                      : 0;

                return (
                  <tr
                    key={entry.id}
                    className={cn(
                      "transition-colors",
                      isCurrentUser
                        ? "bg-primary/5 font-medium"
                        : "hover:bg-muted/50",
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {getMedalIcon(rank)}
                        <span className={cn("font-semibold", getRankStyle(rank))}>
                          {displayedRank}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground">{getDisplayName(entry)}</span>
                          {isCurrentUser ? (
                            <span className="text-xs font-medium text-primary">
                              (you)
                            </span>
                          ) : null}
                        </div>
                        {mode === "weekly" && isWeeklyEntry(entry) ? (
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {entry.correctPredictions}/{entry.totalPredictions} correct
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-foreground">
                      {points}
                    </td>
                    {mode === "weekly" && isWeeklyEntry(entry) ? (
                      <td className="hidden px-4 py-3 text-center text-muted-foreground sm:table-cell">
                        {entry.correctPredictions}/{entry.totalPredictions}
                      </td>
                    ) : null}
                    {showPicks ? (
                      <td className="px-4 py-3 text-center">
                        {canViewPredictions ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => {
                              setOpenUserId(entry.id);
                              setError(null);
                            }}
                            aria-label={`View picks for ${getDisplayName(entry)}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            asChild
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                          >
                            <Link href="/sign-in" aria-label="Sign in to view picks">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {renderPagination(false)}
      </Card>

      <Dialog
        open={openUserId !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setOpenUserId(null);
            setError(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader className="border-b border-border/70 px-6 py-5">
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              Revealed fantasy picks grouped by completed weekend.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading picks...
              </div>
            ) : error ? (
              <Card className="p-6 text-center text-sm text-destructive">
                {error}
              </Card>
            ) : weeks.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                No revealed picks yet.
              </Card>
            ) : (
              weeks.map((week) => (
                <section key={week.weekKey} className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      {week.label}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {week.predictions.length} game
                      {week.predictions.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {week.predictions.map((prediction) => (
                      <Card key={prediction.id} className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-foreground">
                                {prediction.matchupLabel}
                              </p>
                              <Badge variant="outline" className="text-[11px]">
                                {prediction.division.replace(/_/g, " ")}
                              </Badge>
                              {prediction.gameType === "PLAYOFF" ? (
                                <Badge className="text-[11px]">Playoff</Badge>
                              ) : null}
                              {prediction.isBoosted ? (
                                <Badge
                                  variant="outline"
                                  className="gap-1 border-amber-500/40 bg-amber-50 text-amber-800"
                                >
                                  <Zap className="h-3 w-3" />
                                  Boosted
                                </Badge>
                              ) : null}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatGameDateTime(prediction.date)}
                            </p>
                            <div className="grid gap-1 text-sm sm:grid-cols-2">
                              <p>
                                <span className="text-muted-foreground">Pick:</span>{" "}
                                <span className="font-medium text-foreground">
                                  {prediction.pickLabel}
                                </span>
                              </p>
                              <p>
                                <span className="text-muted-foreground">Result:</span>{" "}
                                <span className="font-medium text-foreground">
                                  {prediction.resultLabel}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                            <Badge
                              variant="outline"
                              className={cn(
                                prediction.isCorrect
                                  ? "border-emerald-500/40 bg-emerald-50 text-emerald-800"
                                  : "border-destructive/30 bg-destructive/5 text-destructive",
                              )}
                            >
                              {prediction.isCorrect ? "Correct" : "Missed"}
                            </Badge>
                            <p className="text-sm font-semibold text-foreground">
                              {prediction.pointsEarned > 0
                                ? `+${prediction.pointsEarned} pts`
                                : "0 pts"}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
