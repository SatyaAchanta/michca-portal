import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/page-container";
import { CertificationClient } from "@/components/umpiring-certification/certification-client";
import { StartTestButton } from "@/components/umpiring-certification/start-test-button";
import { prisma } from "@/lib/prisma";
import { AuthenticationRequiredError, getOrCreateCurrentUserProfile } from "@/lib/user-profile";
import { getDetroitDateString, toDateOnlyValue } from "@/lib/certification";

export default async function UmpiringCertificationPage() {
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

  const registration = await prisma.umpiringTraining.findUnique({
    where: { userProfileId: profile.id },
    select: {
      preferredLocation: true,
    },
  });

  const today = toDateOnlyValue(getDetroitDateString());
  const activeWindow = registration
    ? await prisma.certificationTestWindow.findUnique({
        where: {
          location_testDateLocal: {
            location: registration.preferredLocation,
            testDateLocal: today,
          },
        },
      })
    : null;

  const currentAttempt = activeWindow
    ? await prisma.certificationAttempt.findUnique({
        where: {
          windowId_userProfileId: {
            windowId: activeWindow.id,
            userProfileId: profile.id,
          },
        },
        include: {
          questions: {
            orderBy: { displayOrder: "asc" },
          },
        },
      })
    : null;

  return (
    <div className="bg-background py-8 sm:py-12">
      <PageContainer className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Umpiring Certification Test</h1>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
            Complete your online certification exam. You get one attempt per active test window.
          </p>
        </div>

        {!registration ? (
          <Card className="space-y-3 p-5">
            <p className="font-medium">You are not eligible yet.</p>
            <p className="text-sm text-muted-foreground">
              Complete your umpiring training registration first. Then return when your location window is active.
            </p>
          </Card>
        ) : null}

        {registration && !activeWindow ? (
          <Card className="space-y-3 p-5">
            <p className="font-medium">No active test window</p>
            <p className="text-sm text-muted-foreground">
              There is no active certification window for {registration.preferredLocation} today.
            </p>
          </Card>
        ) : null}

        {registration && activeWindow && !currentAttempt ? (
          <Card className="space-y-4 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Location: {activeWindow.location}</Badge>
              <Badge variant="outline">Duration: {activeWindow.durationMinutes} min</Badge>
              <Badge variant="outline">Questions: {activeWindow.questionCount}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Once started, your timer begins immediately and you cannot start again after submission.
            </p>
            <StartTestButton />
          </Card>
        ) : null}

        {currentAttempt && currentAttempt.status === "IN_PROGRESS" ? (
          <CertificationClient
            expiresAtIso={currentAttempt.expiresAt.toISOString()}
            questions={currentAttempt.questions.map((question) => ({
              id: question.id,
              displayOrder: question.displayOrder,
              promptSnapshot: question.promptSnapshot,
              selectedOptionIdOriginal: question.selectedOptionIdOriginal,
              isFlagged: question.isFlagged,
              options: (question.optionsSnapshotJson as Array<{ id: string; label: string }>).map(
                (option) => ({ id: option.id, label: option.label })
              ),
            }))}
          />
        ) : null}

        {currentAttempt && currentAttempt.status !== "IN_PROGRESS" ? (
          <Card className="space-y-3 p-5">
            <p className="text-xl font-semibold">Test Completed</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Status: {currentAttempt.status}</Badge>
              <Badge variant="outline">Score: {currentAttempt.scorePercent ?? 0}%</Badge>
              <Badge
                variant="outline"
                className={
                  currentAttempt.result === "PASS"
                    ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300"
                    : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
                }
              >
                Result: {currentAttempt.result}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              You cannot restart this test window.
            </p>
          </Card>
        ) : null}
      </PageContainer>
    </div>
  );
}
