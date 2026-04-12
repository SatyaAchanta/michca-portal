import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { PageContainer } from "@/components/page-container";
import { TeamsFilters } from "@/components/teams/teams-filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTeams } from "@/lib/team-queries";
import {
  getTeamDivisionLabel,
  TEAM_FORMAT_LABELS,
  type TeamDivision,
} from "@/lib/team-data";
import type { TeamFormat } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Teams",
  description: "Browse MichCA teams across T20, F40, T30, and youth competitions.",
};

type TeamsPageProps = {
  searchParams?: Promise<{
    format?: string;
    division?: string;
    search?: string;
  }>;
};

export default async function TeamsPage({ searchParams }: TeamsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const format = (params?.format as TeamFormat | "all" | undefined) ?? "all";
  const division =
    format === "T20"
      ? ((params?.division as TeamDivision | "all" | undefined) ?? "all")
      : "all";
  const search = params?.search?.trim() ?? "";

  const teams = await getTeams({
    format,
    division,
    search,
  });

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Teams</h1>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
            Explore club profiles across the MichCA competitions.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <TeamsFilters
              initialFormat={format}
              initialDivision={division}
              initialSearch={search}
            />
          </CardContent>
        </Card>

        {teams.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => (
              <Card key={team.teamCode} className="h-full">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {TEAM_FORMAT_LABELS[team.format]}
                      </p>
                      <CardTitle className="mt-1 text-xl">{team.teamName}</CardTitle>
                    </div>
                    <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
                      {team.teamShortCode}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      {getTeamDivisionLabel(team.division)}
                    </span>
                    <Link
                      href={`/teams/${team.teamCode}`}
                      className="inline-flex font-medium text-foreground underline underline-offset-4"
                    >
                      View Team
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No teams match the current filters"
            description="Try a different format, division, or search term."
          />
        )}
      </PageContainer>
    </div>
  );
}
