import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { UserRole } from "@/generated/prisma/client";

import { TeamProfileForm } from "@/components/admin/team-profile-form";
import { PageContainer } from "@/components/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AuthenticationRequiredError,
  InsufficientRoleError,
  requireRole,
} from "@/lib/user-profile";
import { getTeamAdminOptions, getTeamByCode } from "@/lib/team-queries";

type AdminTeamDetailPageProps = {
  params: Promise<{
    teamCode: string;
  }>;
};

export default async function AdminTeamDetailPage({ params }: AdminTeamDetailPageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  try {
    await requireRole(UserRole.ADMIN);
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      redirect("/sign-in");
    }
    if (error instanceof InsufficientRoleError) {
      redirect("/");
    }
    throw error;
  }

  const { teamCode } = await params;
  const [team, { profiles }] = await Promise.all([
    getTeamByCode(teamCode),
    getTeamAdminOptions(),
  ]);

  if (!team) {
    notFound();
  }

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-2">
          <Link href="/admin?section=teams" className="text-sm text-muted-foreground underline underline-offset-4">
            Back to Teams
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Edit {team.teamName}
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
            Manage the public team profile shown in the directory.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamProfileForm
              team={{
                teamCode: team.teamCode,
                format: team.format,
                division: team.division,
                teamShortCode: team.teamShortCode,
                teamName: team.teamName,
                description: team.description,
                captainId: team.captainId,
                viceCaptainId: team.viceCaptainId,
                facebookPage: team.facebookPage,
                instagramPage: team.instagramPage,
                logo: team.logo,
              }}
              profiles={profiles}
            />
          </CardContent>
        </Card>
      </PageContainer>
    </div>
  );
}
