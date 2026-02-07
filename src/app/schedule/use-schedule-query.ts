"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { getScheduleGames } from "@/app/schedule/actions";
import {
  PAGE_SIZE,
  type DivisionCode,
  type ScheduleFilters,
  type ScheduleQueryResult,
  type ScheduleStatusFilter,
} from "@/app/schedule/types";

type QueryState = {
  season: number;
  status: ScheduleStatusFilter;
  division: DivisionCode | "all";
  teamQuery: string;
  startDate?: string;
  endDate?: string;
  page: number;
};

type UseScheduleQueryArgs = {
  initialResult: ScheduleQueryResult;
};

export function useScheduleQuery({ initialResult }: UseScheduleQueryArgs) {
  const [result, setResult] = useState(initialResult);
  const [query, setQuery] = useState<QueryState>({
    season: initialResult.season,
    status: "SCHEDULED",
    division: "all",
    teamQuery: "",
    page: 1,
  });
  const [teamInput, setTeamInput] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isFirstQuery = useRef(true);

  const requestFilters: ScheduleFilters = useMemo(
    () => ({
      season: query.season,
      status: query.status,
      division: query.division === "all" ? undefined : query.division,
      teamQuery: query.teamQuery || undefined,
      startDate: query.startDate,
      endDate: query.endDate,
      page: query.page,
      pageSize: PAGE_SIZE,
    }),
    [query]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmed = teamInput.trim();
      setQuery((previous) =>
        previous.teamQuery === trimmed
          ? previous
          : { ...previous, teamQuery: trimmed, page: 1 }
      );
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [teamInput]);

  useEffect(() => {
    if (isFirstQuery.current) {
      isFirstQuery.current = false;
      return;
    }

    startTransition(async () => {
      try {
        const next = await getScheduleGames(requestFilters);
        setResult(next);
        setError(null);
      } catch {
        setError("Unable to load schedule right now. Please try again.");
      }
    });
  }, [requestFilters]);

  const setSeason = (season: number) => {
    setDateRange(undefined);
    setQuery((previous) => ({
      ...previous,
      season,
      startDate: undefined,
      endDate: undefined,
      page: 1,
    }));
  };

  const setStatus = (status: ScheduleStatusFilter) => {
    setQuery((previous) => ({ ...previous, status, page: 1 }));
  };

  const setDivision = (division: DivisionCode | "all") => {
    setQuery((previous) => ({ ...previous, division, page: 1 }));
  };

  const setDateRangeValue = (nextRange: DateRange | undefined) => {
    setDateRange(nextRange);
    setQuery((previous) => ({
      ...previous,
      startDate: nextRange?.from ? format(nextRange.from, "yyyy-MM-dd") : undefined,
      endDate: nextRange?.to ? format(nextRange.to, "yyyy-MM-dd") : undefined,
      page: 1,
    }));
  };

  const goToPreviousPage = () => {
    setQuery((previous) => ({ ...previous, page: previous.page - 1 }));
  };

  const goToNextPage = () => {
    setQuery((previous) => ({ ...previous, page: previous.page + 1 }));
  };

  return {
    result,
    query,
    teamInput,
    dateRange,
    error,
    isPending,
    hasPreviousPage: result.page > 1,
    hasNextPage: result.page < result.totalPages,
    setSeason,
    setStatus,
    setDivision,
    setTeamInput,
    setDateRangeValue,
    goToPreviousPage,
    goToNextPage,
  };
}
