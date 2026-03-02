import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { UserRole } from "@/generated/prisma/client";
import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import { AdminQuestionManager } from "@/components/umpiring-certification/admin-question-manager";
import { AuthenticationRequiredError, InsufficientRoleError, requireRole } from "@/lib/user-profile";
import { prisma } from "@/lib/prisma";

export default async function CertificationQuestionsPage() {
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

  const [questions, activeWindowCount] = await Promise.all([
    prisma.certificationQuestion.findMany({
      include: {
        options: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.certificationTestWindow.count({
      where: { status: "ACTIVE" },
    }),
  ]);

  return (
    <div className="bg-background py-8 sm:py-12">
      <PageContainer className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Certification Question Bank</h1>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
            Create and manage multiple-choice questions used by umpiring certification tests.
          </p>
        </div>

        {activeWindowCount > 0 ? (
          <Card className="border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Question bank edits are locked while a certification test window is active.
            </p>
          </Card>
        ) : null}

        <AdminQuestionManager
          questions={questions.map((question) => ({
            id: question.id,
            prompt: question.prompt,
            isActive: question.isActive,
            options: question.options,
            createdAtIso: question.createdAt.toISOString(),
          }))}
        />
      </PageContainer>
    </div>
  );
}
