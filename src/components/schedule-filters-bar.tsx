"use client";

import type { DateRange } from "react-day-picker";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DIVISION_LABELS,
  DIVISIONS,
  type DivisionCode,
  type ScheduleStatusFilter,
} from "@/app/schedule/types";

type ScheduleFiltersBarProps = {
  seasonValues: number[];
  season: number;
  isPastSeason: boolean;
  status: ScheduleStatusFilter;
  division: DivisionCode | "all";
  teamInput: string;
  dateRange: DateRange | undefined;
  seasonStartDate: Date;
  seasonEndDate: Date;
  onSeasonChange: (value: string) => void;
  onStatusChange: (value: ScheduleStatusFilter) => void;
  onDivisionChange: (value: DivisionCode | "all") => void;
  onTeamInputChange: (value: string) => void;
  onDateRangeChange: (value: DateRange | undefined) => void;
};

export function ScheduleFiltersBar({
  seasonValues,
  season,
  isPastSeason,
  status,
  division,
  teamInput,
  dateRange,
  seasonStartDate,
  seasonEndDate,
  onSeasonChange,
  onStatusChange,
  onDivisionChange,
  onTeamInputChange,
  onDateRangeChange,
}: ScheduleFiltersBarProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-border/70 bg-card p-4 md:grid-cols-5">
      <Select value={String(season)} onValueChange={onSeasonChange}>
        <SelectTrigger>
          <SelectValue placeholder="Season" />
        </SelectTrigger>
        <SelectContent>
          {seasonValues.map((year) => (
            <SelectItem key={year} value={String(year)}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!isPastSeason ? (
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <div className="hidden md:block" />
      )}

      <Select value={division} onValueChange={onDivisionChange}>
        <SelectTrigger>
          <SelectValue placeholder="Division" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All divisions</SelectItem>
          {DIVISIONS.map((divisionOption) => (
            <SelectItem key={divisionOption} value={divisionOption}>
              {DIVISION_LABELS[divisionOption]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="Filter by team name"
        value={teamInput}
        onChange={(event) => onTeamInputChange(event.target.value)}
      />

      <DateRangePicker
        value={dateRange}
        onChange={onDateRangeChange}
        fromDate={seasonStartDate}
        toDate={seasonEndDate}
      />
    </div>
  );
}
