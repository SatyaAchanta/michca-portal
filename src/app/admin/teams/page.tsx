import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import { getTeamDivisionLabel, TEAM_FORMAT_LABELS } from "@/lib/team-data";
import { getTeamAdminOptions } from "@/lib/team-queries";
import { canAccessAdminSection } from "@/lib/roles";
import {
  AuthenticationRequiredError,
  InsufficientRoleError,
  requireAnyAdminRole,
} from "@/lib/user-profile";

export default async function AdminTeamsPage() {
  let userProfile;
  try {
    userProfile = await requireAnyAdminRole();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) redirect("/sign-in");
    if (error instanceof InsufficientRoleError) redirect("/");
    throw error;
  }

  if (!canAccessAdminSection(userProfile.role, "teams")) {
    redirect("/admin");
  }

  const { teams } = await getTeamAdminOptions();

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-1">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Admin
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Teams
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Review imported teams and open any club profile for editing.
          </p>
        </div>

        {teams.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">No teams found.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => (
              <Card key={team.teamCode} className="p-5">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {TEAM_FORMAT_LABELS[team.format]}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold">
                        {team.teamName}
                      </h3>
                    </div>
                    <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
                      {team.teamShortCode}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getTeamDivisionLabel(team.division)}
                  </p>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      {team.teamCode}
                    </span>
                    <Link
                      href={`/admin/teams/${team.teamCode}`}
                      className="font-medium underline underline-offset-4"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
