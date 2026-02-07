"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type DateRangePickerProps = {
  value: DateRange | undefined;
  onChange: (value: DateRange | undefined) => void;
  className?: string;
  fromDate?: Date;
  toDate?: Date;
};

export function DateRangePicker({
  value,
  onChange,
  className,
  fromDate,
  toDate,
}: DateRangePickerProps) {
  const label = React.useMemo(() => {
    if (!value?.from) {
      return "Pick a date range";
    }

    if (!value.to) {
      return format(value.from, "LLL dd, y");
    }

    return `${format(value.from, "LLL dd, y")} - ${format(value.to, "LLL dd, y")}`;
  }, [value]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="schedule-date-range"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            fromDate={fromDate}
            toDate={toDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
