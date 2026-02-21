import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import { RegistrationForm } from "@/components/umpiring-training/registration-form";
import { prisma } from "@/lib/prisma";
import { AuthenticationRequiredError, getOrCreateCurrentUserProfile } from "@/lib/user-profile";

export default async function UmpiringTrainingPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  let profile;
  try {
    profile = await getOrCreateCurrentUserProfile();
  } catch (error) {
    console.log("Error fetching user profile:", error);
    if (error instanceof AuthenticationRequiredError) {
      redirect("/sign-in");
    }
    throw error;
  }

  const registration = await prisma.umpiringTraining.findUnique({
    where: { userProfileId: profile.id },
    select: {
      contactNumber: true,
      previouslyCertified: true,
      affiliation: true,
      preferredDate: true,
      preferredLocation: true,
      questions: true,
    },
  });

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Umpiring Training Registration
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Register for umpiring training and exam. You can update your submission any time.
          </p>
        </div>

        <Card className="p-6">
          <RegistrationForm
            profile={{
              firstName: profile.firstName,
              lastName: profile.lastName,
              email: profile.email,
            }}
            registration={registration}
          />
        </Card>
      </PageContainer>
    </div>
  );
}

