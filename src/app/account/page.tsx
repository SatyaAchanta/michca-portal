import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AccountForm } from "@/components/account/account-form";
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
        t20TeamCode: true,
        secondaryTeamCode: true,
        playingRole: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (profile) {
      const [registration, waiver, teamOptions] = await Promise.all([
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
            secondaryTeamCode: true,
            role: true,
          },
        }),
        getWaiverTeamOptions(),
      ]);

      umpiringResult = registration?.result ?? null;
      waiverSubmission = waiver;
      teams = teamOptions;
    }
  } catch (error) {
    console.log("Error fetching user profile:", error);
    redirect("/sign-in");
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="text-3xl font-bold mb-8">Account</h1>
      <AccountForm
        profile={profile ?? null}
        umpiringResult={umpiringResult}
        teams={teams}
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
