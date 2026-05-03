"use client";

import { useActionState, useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";

import type { AdminGameActionState } from "@/app/admin/games/actions";
import { cancelAdminGame, createAdminGame } from "@/app/admin/games/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const INITIAL_STATE: AdminGameActionState = { status: "idle" };
const DETROIT_TIMEZONE = "America/Detroit";

const DIVISION_OPTIONS = [
  { value: "PREMIER_T20", label: "Premier T20" },
  { value: "DIV1_T20", label: "Division 1" },
  { value: "DIV2_T20", label: "Division 2" },
  { value: "DIV3_T20", label: "Division 3" },
  { value: "F40", label: "F40" },
  { value: "T30", label: "T30" },
  { value: "U15", label: "U15" },
  { value: "GLT", label: "GLT" },
] as const;

const GAME_TYPE_OPTIONS = [
  { value: "LEAGUE", label: "League" },
  { value: "PLAYOFF", label: "Playoff" },
] as const;

type TeamOption = {
  teamCode: string;
  teamName: string;
  teamShortCode: string;
  division: string;
  format: string;
};

type GroundOption = {
  id: string;
  name: string;
  shortName: string;
};

type ScheduledGame = {
  id: string;
  date: Date;
  division: string;
  gameType: string;
  league: string;
  venue: string | null;
  team1Code: string;
  team2Code: string;
  team1: { teamName: string; teamShortCode: string | null };
  team2: { teamName: string; teamShortCode: string | null };
};

type GamesManagerProps = {
  teams: TeamOption[];
  grounds: GroundOption[];
  scheduledGames: ScheduledGame[];
};

function formatGameDate(date: Date) {
  return formatInTimeZone(date, DETROIT_TIMEZONE, "EEE, MMM d, HH:mm");
}

function getTeamLabel(team: TeamOption) {
  return `${team.teamName} (${team.teamShortCode})`;
}

function getLeagueForDivision(division: string) {
  switch (division) {
    case "PREMIER_T20":
    case "DIV1_T20":
    case "DIV2_T20":
    case "DIV3_T20":
      return "2026 T20";
    case "F40":
    case "T30":
      return "2026 F40 & T30";
    case "U15":
      return "2026 U15";
    case "GLT":
      return "2026 GLT";
    default:
      return "";
  }
}

function ActionMessage({ state }: { state: AdminGameActionState }) {
  if (state.status === "success" && state.message) {
    return <p className="text-sm text-green-600 dark:text-green-400">{state.message}</p>;
  }
  if (state.status === "error" && state.message) {
    return <p className="text-sm text-destructive">{state.message}</p>;
  }
  return null;
}

function CancelGameButton({ gameId }: { gameId: string }) {
  const [state, formAction, isPending] = useActionState(cancelAdminGame, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="gameId" value={gameId} />
      <Button type="submit" size="sm" variant="destructive" disabled={isPending}>
        {isPending ? "Canceling..." : "Cancel Game"}
      </Button>
      <ActionMessage state={state} />
    </form>
  );
}

export function GamesManager({ teams, grounds, scheduledGames }: GamesManagerProps) {
  const [createState, createAction, isCreatePending] = useActionState(
    createAdminGame,
    INITIAL_STATE,
  );
  const [selectedDivision, setSelectedDivision] = useState("PREMIER_T20");
  const derivedLeague = getLeagueForDivision(selectedDivision);
  const filteredTeams = useMemo(() => {
    const divisionMap: Record<string, { format: string; division: string }> = {
      PREMIER_T20: { format: "T20", division: "Premier" },
      DIV1_T20: { format: "T20", division: "Division-1" },
      DIV2_T20: { format: "T20", division: "Division-2" },
      DIV3_T20: { format: "T20", division: "Division-3" },
      F40: { format: "F40", division: "F40" },
      T30: { format: "T30", division: "T30" },
      U15: { format: "YOUTH", division: "YOUTH" },
      GLT: { format: "GLT", division: "GLT" },
    };
    const expected = divisionMap[selectedDivision];
    if (!expected) return teams;
    return teams.filter(
      (team) => team.format === expected.format && team.division === expected.division,
    );
  }, [selectedDivision, teams]);

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="space-y-5">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Create Game</h2>
            <p className="text-sm text-muted-foreground">
              Add a new scheduled fixture. Use this for rescheduled or newly confirmed games.
            </p>
          </div>

          <form action={createAction} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="date">
                  Date
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="time">
                  Time
                </label>
                <input
                  id="time"
                  name="time"
                  type="time"
                  required
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="division">
                  Division
                </label>
                <select
                  id="division"
                  name="division"
                  required
                  value={selectedDivision}
                  onChange={(event) => setSelectedDivision(event.target.value)}
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  {DIVISION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="league">
                  League
                </label>
                <input
                  id="league"
                  value={derivedLeague}
                  readOnly
                  disabled
                  className="flex h-11 w-full rounded-lg border border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="gameType">
                  Game Type
                </label>
                <select
                  id="gameType"
                  name="gameType"
                  required
                  defaultValue="LEAGUE"
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  {GAME_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="team1Code">
                  Team 1
                </label>
                <select
                  id="team1Code"
                  name="team1Code"
                  required
                  defaultValue=""
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="" disabled>
                    Select team
                  </option>
                  {filteredTeams.map((team) => (
                    <option key={team.teamCode} value={team.teamCode}>
                      {getTeamLabel(team)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="team2Code">
                  Team 2
                </label>
                <select
                  id="team2Code"
                  name="team2Code"
                  required
                  defaultValue=""
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="" disabled>
                    Select team
                  </option>
                  {filteredTeams.map((team) => (
                    <option key={team.teamCode} value={team.teamCode}>
                      {getTeamLabel(team)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="venue">
                  Venue
                </label>
                <select
                  id="venue"
                  name="venue"
                  defaultValue=""
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Venue TBD</option>
                  {grounds.map((ground) => (
                    <option key={ground.id} value={ground.name}>
                      {ground.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <ActionMessage state={createState} />

            <Button type="submit" disabled={isCreatePending}>
              {isCreatePending ? "Creating..." : "Create Game"}
            </Button>
          </form>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-5">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Scheduled Games</h2>
            <p className="text-sm text-muted-foreground">
              Cancel games here when a fixture is called off. Completed games are intentionally excluded.
            </p>
          </div>

          {scheduledGames.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scheduled games found.</p>
          ) : (
            <div className="space-y-3">
              {scheduledGames.map((game) => (
                <div
                  key={game.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {(game.team1.teamShortCode ?? game.team1Code)} vs {(game.team2.teamShortCode ?? game.team2Code)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {game.team1.teamName} vs {game.team2.teamName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatGameDate(game.date)} · {game.division.replace(/_/g, " ")} · {game.gameType} ·{" "}
                      {game.venue ?? "Venue TBD"}
                    </p>
                    <p className="text-xs text-muted-foreground">{game.league}</p>
                  </div>
                  <CancelGameButton gameId={game.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
