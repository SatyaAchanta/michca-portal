import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Trophy, Zap } from "lucide-react";

import { AccountForm } from "@/components/account/account-form";
import { Card } from "@/components/ui/card";
import { LevelBadge } from "@/components/fantasy/level-badge";
import { prisma } from "@/lib/prisma";
import { getWaiverTeamOptions } from "@/lib/team-queries";
import { getCurrentWaiverYear } from "@/lib/waiver-constants";

const Account = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  let profile;
  let umpiringResult = null;
  let waiverSubmission = null;
  let teams: Array<{
    teamCode: string;
    teamName: string;
    division: string;
    format: string;
  }> = [];
  let captainedTeams: Array<{
    teamCode: string;
    teamName: string;
    division: string;
    format: string;
  }> = [];

  try {
    profile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        clerkUserId: true,
        email: true,
        firstName: true,
        lastName: true,
        notificationsEnabled: true,
        newsletterSubscribed: true,
        role: true,
        contactNumber: true,
        t20TeamCode: true,
        secondaryTeamCode: true,
        playingRole: true,
        fantasyPoints: true,
        fantasyLevel: true,
        boostersRemaining: true,
        fullParticipationWeeks: true,
        levelBonusesAwarded: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (profile) {
      const [registration, waiver, teamOptions, teamsCaptained] =
        await Promise.all([
          prisma.umpiringTraining.findUnique({
            where: { userProfileId: profile.id },
            select: { result: true },
          }),
          prisma.waiverSubmission.findUnique({
            where: {
              userProfileId_year: {
                userProfileId: profile.id,
                year: getCurrentWaiverYear(),
              },
            },
            select: {
              submittedAt: true,
              state: true,
              address: true,
              city: true,
              t20Division: true,
              secondaryDivision: true,
              t20TeamCode: true,
              additionalT20Division: true,
              additionalT20TeamCode: true,
              secondaryTeamCode: true,
              isUnder18: true,
              parentName: true,
            },
          }),
          getWaiverTeamOptions(),
          prisma.team.findMany({
            where: { captainId: profile.id },
            orderBy: [
              { format: "asc" },
              { division: "asc" },
              { teamName: "asc" },
            ],
            select: {
              teamCode: true,
              teamName: true,
              division: true,
              format: true,
            },
          }),
        ]);

      umpiringResult = registration?.result ?? null;
      waiverSubmission = waiver;
      teams = teamOptions;
      captainedTeams = teamsCaptained;
    }
  } catch (error) {
    console.log("Error fetching user profile:", error);
    redirect("/sign-in");
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="text-3xl font-bold mb-8">Account</h1>

      {/* Fantasy stats */}
      {profile && (
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Fantasy</h2>
            <Link
              href="/fantasy/leaderboard"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Trophy className="h-3.5 w-3.5" />
              Leaderboard
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="p-4 space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Points
              </p>
              <p className="text-2xl font-bold text-foreground">
                {profile.fantasyPoints}
              </p>
            </Card>
            <Card className="p-4 space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Level
              </p>
              <div className="pt-0.5">
                <LevelBadge level={profile.fantasyLevel} />
              </div>
            </Card>
            <Card className="p-4 space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Full Weeks
              </p>
              <p className="text-2xl font-bold text-foreground">
                {profile.fullParticipationWeeks}
              </p>
            </Card>
            <Card className="p-4 space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Boosters
              </p>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                <p className="text-2xl font-bold text-foreground">
                  {profile.fantasyLevel >= 1 ? profile.boostersRemaining : "—"}
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      <AccountForm
        profile={profile ?? null}
        umpiringResult={umpiringResult}
        teams={teams}
        captainedTeams={captainedTeams}
        waiverSubmission={
          waiverSubmission
            ? {
                ...waiverSubmission,
                submittedAt: waiverSubmission.submittedAt.toISOString(),
              }
            : null
        }
      />
    </div>
  );
};

export default Account;
