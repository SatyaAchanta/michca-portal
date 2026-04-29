import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { ClubInfoForm } from "@/components/club-info/club-info-form";
import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import { getWaiverTeamOptions } from "@/lib/team-queries";
import { prisma } from "@/lib/prisma";
import {
  AuthenticationRequiredError,
  getOrCreateCurrentUserProfile,
} from "@/lib/user-profile";

export default async function ClubInfoPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  let profile;
  try {
    profile = await getOrCreateCurrentUserProfile();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      redirect("/sign-in");
    }
    throw error;
  }

  const [submission, teams] = await Promise.all([
    prisma.clubInfoSubmission.findUnique({
      where: { userProfileId: profile.id },
      select: {
        accountEmail: true,
        captainName: true,
        cricclubsId: true,
        contactNumber: true,
        t20Division: true,
        t20TeamCode: true,
        secondaryDivision: true,
        secondaryTeamCode: true,
        createdAt: true,
      },
    }),
    getWaiverTeamOptions(),
  ]);

  const t20Divisions = Array.from(
    new Set(
      teams
        .filter((team) => team.format === "T20")
        .map((team) => team.division),
    ),
  );
  const initialCaptainName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Club Info
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Submit captain details for your team assignments. This form is
            private and can be submitted only once.
          </p>
        </div>

        <Card className="border-primary/35 bg-primary/10 p-5 shadow-sm">
          <p className="text-sm text-muted-foreground sm:text-base">
            Use this form only if you are the current captain. If you need to
            change a submission later, Contact Stats Committee.
          </p>
        </Card>

        <ClubInfoForm
          accountEmail={profile.email}
          initialCaptainName={initialCaptainName}
          initialContactNumber={profile.contactNumber ?? ""}
          submission={
            submission
              ? {
                  ...submission,
                  createdAt: submission.createdAt.toISOString(),
                }
              : null
          }
          t20Divisions={t20Divisions}
          teams={teams}
        />
      </PageContainer>
    </div>
  );
}
