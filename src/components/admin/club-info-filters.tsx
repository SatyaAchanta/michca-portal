"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ClubInfoFiltersProps = {
  initialDivision: string;
  initialTeamName: string;
  divisions: string[];
  teams: Array<{
    teamCode: string;
    teamName: string;
    division: string;
  }>;
};

export function ClubInfoFilters({
  initialDivision,
  initialTeamName,
  divisions,
  teams,
}: ClubInfoFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [division, setDivision] = useState(initialDivision || "all");
  const [teamName, setTeamName] = useState(initialTeamName);
  const visibleTeams = useMemo(() => {
    if (division === "all") {
      return teams;
    }

    return teams.filter((team) => team.division === division);
  }, [division, teams]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", "clubInfo");
    if (division !== "all") {
      params.set("clubDivision", division);
    } else {
      params.delete("clubDivision");
    }
    if (teamName.trim()) {
      params.set("club", teamName.trim());
    } else {
      params.delete("club");
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const clearFilters = () => {
    setDivision("all");
    setTeamName("");
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", "clubInfo");
    params.delete("clubDivision");
    params.delete("club");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <Card className="space-y-4 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-medium">Division</p>
          <Select value={division} onValueChange={setDivision}>
            <SelectTrigger>
              <SelectValue placeholder="All divisions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All divisions</SelectItem>
              {divisions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="club-name-filter" className="text-sm font-medium">
            Filter by Team Name
          </label>
          <Input
            id="club-name-filter"
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
            placeholder={
              visibleTeams.length > 0
                ? `Search ${visibleTeams.length} visible team${visibleTeams.length === 1 ? "" : "s"}`
                : "Search by team name"
            }
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={applyFilters}>
          Apply
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={clearFilters}>
          Clear Filter
        </Button>
      </div>
    </Card>
  );
}
