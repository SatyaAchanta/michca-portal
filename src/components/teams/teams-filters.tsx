"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import {
  getTeamDivisionLabel,
  TEAM_FORMAT_LABELS,
  type TeamDivision,
} from "@/lib/team-data";
import type { TeamFormat } from "@/generated/prisma/client";

type TeamsFiltersProps = {
  initialFormat: TeamFormat | "all";
  initialDivision: TeamDivision | "all";
  initialSearch: string;
};

const FORMAT_OPTIONS: Array<TeamFormat | "all"> = ["all", "T20", "F40", "T30", "YOUTH", "GLT"];
const T20_DIVISION_OPTIONS: Array<TeamDivision | "all"> = [
  "all",
  "Premier",
  "Division-1",
  "Division-2",
  "Division-3",
];

export function TeamsFilters({
  initialFormat,
  initialDivision,
  initialSearch,
}: TeamsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(initialSearch);

  useEffect(() => {
    setSearchInput(initialSearch);
  }, [initialSearch]);

  const updateParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      updater(params);
      const query = params.toString();

      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmed = searchInput.trim();
      const normalizedSearch = trimmed.length >= 2 ? trimmed : "";
      const currentSearch = searchParams.get("search") ?? "";

      if (normalizedSearch === currentSearch) {
        return;
      }

      if (trimmed.length === 1 && currentSearch === "") {
        return;
      }

      updateParams((params) => {
        if (normalizedSearch) {
          params.set("search", normalizedSearch);
        } else {
          params.delete("search");
        }
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, searchParams, updateParams]);

  return (
    <div className="grid gap-3 md:grid-cols-[1.2fr_0.9fr_0.9fr]">
      <div className="space-y-1">
        <Input
          name="search"
          placeholder="Search by team name or code"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Search applies after at least 2 characters.
        </p>
      </div>

      <select
        name="format"
        value={initialFormat}
        disabled={isPending}
        onChange={(event) => {
          const nextFormat = event.target.value as TeamFormat | "all";
          updateParams((params) => {
            if (nextFormat === "all") {
              params.delete("format");
            } else {
              params.set("format", nextFormat);
            }

            if (nextFormat !== "T20") {
              params.delete("division");
            }
          });
        }}
        className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
      >
        {FORMAT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? "All formats" : TEAM_FORMAT_LABELS[option]}
          </option>
        ))}
      </select>

      <select
        name="division"
        value={initialFormat === "T20" ? initialDivision : "all"}
        disabled={initialFormat !== "T20" || isPending}
        onChange={(event) => {
          const nextDivision = event.target.value as TeamDivision | "all";
          updateParams((params) => {
            if (nextDivision === "all") {
              params.delete("division");
            } else {
              params.set("division", nextDivision);
            }
          });
        }}
        className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        {T20_DIVISION_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? "All T20 divisions" : getTeamDivisionLabel(option)}
          </option>
        ))}
      </select>
    </div>
  );
}
