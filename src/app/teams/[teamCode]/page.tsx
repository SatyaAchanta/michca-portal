/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTeamByCode } from "@/lib/team-queries";
import { getTeamDivisionLabel, TEAM_FORMAT_LABELS } from "@/lib/team-data";

type TeamDetailPageProps = {
  params: Promise<{
    teamCode: string;
  }>;
};

function getPersonName(
  person: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null,
) {
  if (!person) {
    return "Unassigned";
  }

  const fullName = [person.firstName, person.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName.length > 0 ? fullName : person.email;
}

function getPlayingRoleLabel(playingRole: string | null) {
  return playingRole?.trim().length ? playingRole : "Not specified";
}

function getTeamGameSummary(
  game: NonNullable<Awaited<ReturnType<typeof getTeamByCode>>>["upcomingGames"][number],
  teamCode: string
) {
  const opponent = game.team1.teamCode === teamCode ? game.team2 : game.team1;

  return {
    id: game.id,
    date: game.date,
    venue: game.venue,
    opponentName: opponent.teamName,
    opponentCode: opponent.teamCode,
  };
}

export async function generateMetadata({
  params,
}: TeamDetailPageProps): Promise<Metadata> {
  const { teamCode } = await params;
  const team = await getTeamByCode(teamCode);

  if (!team) {
    return {
      title: "Team Not Found",
    };
  }

  return {
    title: team.teamName,
    description: `View the ${team.teamName} profile on MichCA.`,
  };
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { teamCode } = await params;
  const team = await getTeamByCode(teamCode);

  if (!team) {
    notFound();
  }

  const upcomingGames = team.upcomingGames.map((game) =>
    getTeamGameSummary(game, team.teamCode)
  );
  const recentGames = team.recentGames.map((game) =>
    getTeamGameSummary(game, team.teamCode)
  );
  const gameSectionTitle = upcomingGames.length > 0 ? "Upcoming Games" : "Recent Games";
  const displayedGames = upcomingGames.length > 0 ? upcomingGames : recentGames;

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-2">
          <Link
            href="/teams"
            className="mb-3 inline-flex text-sm text-muted-foreground underline underline-offset-4"
          >
            Back to Teams
          </Link>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="rounded-full border px-3 py-1">
                  {TEAM_FORMAT_LABELS[team.format]}
                </span>
                <span className="rounded-full border px-3 py-1">
                  {getTeamDivisionLabel(team.division)}
                </span>
                <span className="rounded-full border px-3 py-1">
                  {team.teamShortCode}
                </span>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {team.teamName}
              </h1>
              <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
                {team.description ??
                  "This team profile is live. Additional club details, social links, and branding will appear here as they are provided."}
              </p>
            </div>

            {team.logo ? (
              <div className="relative h-28 w-28 overflow-hidden rounded-2xl border bg-card">
                <img
                  src={team.logo}
                  alt={`${team.teamName} logo`}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Team Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Captain</p>
                  <p className="font-medium text-foreground">
                    {getPersonName(team.captain)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Vice Captain</p>
                  <p className="font-medium text-foreground">
                    {getPersonName(team.viceCaptain)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Team Code</p>
                  <p className="font-medium text-foreground">{team.teamCode}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Format</p>
                  <p className="font-medium text-foreground">
                    {TEAM_FORMAT_LABELS[team.format]}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {team.facebookPage ? (
                  <a
                    href={team.facebookPage}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full border px-4 py-2 text-sm font-medium"
                  >
                    Facebook
                  </a>
                ) : null}
                {team.instagramPage ? (
                  <a
                    href={team.instagramPage}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full border px-4 py-2 text-sm font-medium"
                  >
                    Instagram
                  </a>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{gameSectionTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {displayedGames.length > 0 ? (
                displayedGames.map((game) => (
                  <div
                    key={game.id}
                    className="space-y-3 rounded-xl border border-border/70 p-4"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        vs {game.opponentName}
                      </p>
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
                        <span>
                          {game.date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="hidden sm:inline" aria-hidden="true">
                          •
                        </span>
                        <span>{game.venue ?? "Venue TBD"}</span>
                      </div>
                    </div>
                    <Link
                      href={`/teams/${game.opponentCode}`}
                      className="inline-flex text-sm text-foreground underline underline-offset-4"
                    >
                      View opponent
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No games are available for this team yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Players</CardTitle>
          </CardHeader>
          <CardContent>
            {team.players.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {team.players.map((player) => (
                  <div
                    key={player.id}
                    className="rounded-xl border border-border/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-foreground">
                        {getPersonName(player)}
                      </p>
                      {team.captain?.id === player.id ? (
                        <Badge variant="outline">Captain</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Playing role: {getPlayingRoleLabel(player.playingRole)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No current players have selected this team yet.
              </p>
            )}
          </CardContent>
        </Card>
      </PageContainer>
    </div>
  );
}
