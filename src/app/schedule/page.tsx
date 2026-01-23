"use client";

import { useMemo, useState } from "react";

import { PageContainer } from "@/components/page-container";
import { MatchList } from "@/components/match-list";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { matches } from "@/lib/mock-data";

export default function SchedulePage() {
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("all");
  const [venue, setVenue] = useState("all");

  const divisions = useMemo(
    () => ["all", ...Array.from(new Set(matches.map((match) => match.division)))],
    []
  );
  const venues = useMemo(
    () => ["all", ...Array.from(new Set(matches.map((match) => match.venue)))],
    []
  );

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const query = search.trim().toLowerCase();
      const searchMatch = query
        ? [match.homeTeam, match.awayTeam, match.venue, match.date]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true;
      const divisionMatch = division === "all" || match.division === division;
      const venueMatch = venue === "all" || match.venue === venue;

      return searchMatch && divisionMatch && venueMatch;
    });
  }, [division, venue, search]);

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Season Schedule
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Find upcoming fixtures fast. Filter by division or venue.
          </p>
        </div>

        <div className="grid gap-3 rounded-xl border border-border/70 bg-card p-4 md:grid-cols-[1.2fr_0.9fr_0.9fr]">
          <Input
            placeholder="Search team, venue, or date"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select value={division} onValueChange={setDivision}>
            <SelectTrigger>
              <SelectValue placeholder="Division" />
            </SelectTrigger>
            <SelectContent>
              {divisions.map((divisionOption) => (
                <SelectItem key={divisionOption} value={divisionOption}>
                  {divisionOption === "all" ? "All divisions" : divisionOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={venue} onValueChange={setVenue}>
            <SelectTrigger>
              <SelectValue placeholder="Venue" />
            </SelectTrigger>
            <SelectContent>
              {venues.map((venueOption) => (
                <SelectItem key={venueOption} value={venueOption}>
                  {venueOption === "all" ? "All venues" : venueOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredMatches.length ? (
          <MatchList matches={filteredMatches} />
        ) : (
          <EmptyState
            title="No matches found"
            description="Try adjusting the filters or search terms."
          />
        )}
      </PageContainer>
    </div>
  );
}
