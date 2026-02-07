"use client";

import { ScheduleCardList } from "@/components/schedule-card-list";
import { ScheduleFiltersBar } from "@/components/schedule-filters-bar";
import { SchedulePagination } from "@/components/schedule-pagination";
import { EmptyState } from "@/components/empty-state";
import type { DivisionCode, ScheduleQueryResult, ScheduleStatusFilter } from "@/app/schedule/types";
import { useScheduleQuery } from "@/app/schedule/use-schedule-query";

type ScheduleClientProps = {
  initialResult: ScheduleQueryResult;
  initialSeasons: number[];
};

export function ScheduleClient({ initialResult, initialSeasons }: ScheduleClientProps) {
  const {
    result,
    query,
    teamInput,
    dateRange,
    error,
    isPending,
    hasPreviousPage,
    hasNextPage,
    setSeason,
    setStatus,
    setDivision,
    setTeamInput,
    setDateRangeValue,
    goToPreviousPage,
    goToNextPage,
  } = useScheduleQuery({ initialResult });

  const seasonValues =
    initialSeasons.length > 0
      ? initialSeasons
      : [result.season].filter((value, index, self) => self.indexOf(value) === index);
  const seasonStartDate = new Date(Date.UTC(query.season, 0, 1, 12, 0, 0));
  const seasonEndDate = new Date(Date.UTC(query.season, 11, 31, 12, 0, 0));

  return (
    <div className="space-y-6">
      <ScheduleFiltersBar
        seasonValues={seasonValues}
        season={query.season}
        isPastSeason={result.isPastSeason}
        status={query.status}
        division={query.division}
        teamInput={teamInput}
        dateRange={dateRange}
        seasonStartDate={seasonStartDate}
        seasonEndDate={seasonEndDate}
        onSeasonChange={(value) => {
          const season = Number.parseInt(value, 10);
          if (Number.isFinite(season)) {
            setSeason(season);
          }
        }}
        onStatusChange={(value) => setStatus(value as ScheduleStatusFilter)}
        onDivisionChange={(value) => setDivision(value as DivisionCode | "all")}
        onTeamInputChange={setTeamInput}
        onDateRangeChange={setDateRangeValue}
      />

      {isPending ? <p className="text-sm text-muted-foreground">Loading games...</p> : null}

      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      {result.items.length ? (
        <>
          <ScheduleCardList games={result.items} />
          <SchedulePagination
            page={result.page}
            totalPages={result.totalPages}
            totalCount={result.totalCount}
            isPending={isPending}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            onPrevious={goToPreviousPage}
            onNext={goToNextPage}
          />
        </>
      ) : (
        <EmptyState
          title={`No games found for ${query.season}`}
          description="Try changing filters to find games in the selected season."
        />
      )}
    </div>
  );
}
