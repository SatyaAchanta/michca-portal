import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { UserRole } from "@/generated/prisma/client";
import { PageContainer } from "@/components/page-container";
import { AdminWindowManager } from "@/components/umpiring-certification/admin-window-manager";
import { AuthenticationRequiredError, InsufficientRoleError, requireRole } from "@/lib/user-profile";
import { prisma } from "@/lib/prisma";
import { getDetroitDateString } from "@/lib/certification";

export default async function CertificationWindowsPage() {
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

  const windows = await prisma.certificationTestWindow.findMany({
    include: {
      startedBy: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: [{ testDateLocal: "desc" }, { startedAt: "desc" }],
  });

  return (
    <div className="bg-background py-8 sm:py-12">
      <PageContainer className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Certification Test Windows</h1>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
            Start or close test windows by location and date.
          </p>
        </div>
        <AdminWindowManager
          defaultDate={getDetroitDateString()}
          windows={windows.map((window) => ({
            id: window.id,
            location: window.location,
            testDateLocal: window.testDateLocal.toISOString().slice(0, 10),
            status: window.status,
            questionCount: window.questionCount,
            durationMinutes: window.durationMinutes,
            startedAt: window.startedAt.toLocaleString("en-US", { timeZone: "America/Detroit" }),
            closedAt: window.closedAt?.toISOString() ?? null,
            startedByName:
              [window.startedBy.firstName, window.startedBy.lastName].filter(Boolean).join(" ").trim() ||
              window.startedBy.email,
          }))}
        />
      </PageContainer>
    </div>
  );
}
