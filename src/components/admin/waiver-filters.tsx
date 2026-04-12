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

type TeamOption = {
  teamCode: string;
  teamName: string;
  division: string;
};

type WaiverFiltersProps = {
  initialDivision: string;
  initialTeamCode: string;
  initialPlayerName: string;
  divisions: string[];
  teams: TeamOption[];
};

export function WaiverFilters({
  initialDivision,
  initialTeamCode,
  initialPlayerName,
  divisions,
  teams,
}: WaiverFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [division, setDivision] = useState(initialDivision || "all");
  const [teamCode, setTeamCode] = useState(initialTeamCode || "all");
  const [playerName, setPlayerName] = useState(initialPlayerName);
  const visibleTeams = useMemo(() => {
    if (division === "all") {
      return teams;
    }

    return teams.filter((team) => team.division === division);
  }, [division, teams]);
  const selectedTeamVisible =
    teamCode === "all" || visibleTeams.some((team) => team.teamCode === teamCode);
  const displayedTeamCode = selectedTeamVisible ? teamCode : "all";

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", "waiver");

    if (division !== "all") {
      params.set("division", division);
    } else {
      params.delete("division");
    }

    if (teamCode !== "all") {
      params.set("team", teamCode);
    } else {
      params.delete("team");
    }

    if (playerName.trim()) {
      params.set("player", playerName.trim());
    } else {
      params.delete("player");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", "waiver");
    params.delete("division");
    params.delete("team");
    params.delete("player");
    setDivision("all");
    setTeamCode("all");
    setPlayerName("");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Card className="space-y-4 p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-sm font-medium">Division</p>
          <Select
            value={division}
            onValueChange={(value) => {
              if (teamCode !== "all") {
                const nextTeams =
                  value === "all" ? teams : teams.filter((team) => team.division === value);
                const teamStillVisible = nextTeams.some((team) => team.teamCode === teamCode);
                if (!teamStillVisible) {
                  setTeamCode("all");
                }
              }
              setDivision(value);
            }}
          >
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
          <p className="text-sm font-medium">Team</p>
          <Select value={displayedTeamCode} onValueChange={setTeamCode}>
            <SelectTrigger>
              <SelectValue placeholder="All teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All teams</SelectItem>
              {visibleTeams.map((team) => (
                <SelectItem key={team.teamCode} value={team.teamCode}>
                  {team.teamName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Player Name</p>
          <Input value={playerName} onChange={(event) => setPlayerName(event.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={applyFilters}>
          Apply
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>
    </Card>
  );
}
