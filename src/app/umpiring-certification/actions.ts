"use server";

import { revalidatePath } from "next/cache";
import { Prisma, UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { AuthenticationRequiredError, InsufficientRoleError, requireRole } from "@/lib/user-profile";
import {
  buildAttemptSnapshots,
  CERTIFICATION_QUESTION_COUNT,
  getDetroitDateString,
  gradeAttempt,
  shuffleArray,
  toDateOnlyValue,
} from "@/lib/certification";

type CertificationActionResult = {
  status: "success" | "error";
  message: string;
};

function isRoleError(error: unknown) {
  return error instanceof AuthenticationRequiredError || error instanceof InsufficientRoleError;
}

async function resolvePlayerProfile() {
  try {
    return await requireRole(UserRole.PLAYER);
  } catch (error) {
    if (isRoleError(error)) {
      return null;
    }
    throw error;
  }
}

async function getEligibilityAndWindow(userProfileId: string, preferredLocation: string) {
  const dateString = getDetroitDateString();
  const today = toDateOnlyValue(dateString);
  const activeWindow = await prisma.certificationTestWindow.findUnique({
    where: {
      location_testDateLocal: {
        location: preferredLocation,
        testDateLocal: today,
      },
    },
  });

  if (!activeWindow || activeWindow.status !== "ACTIVE") {
    return null;
  }

  return activeWindow;
}

export async function startMyCertificationAttempt(): Promise<CertificationActionResult> {
  const profile = await resolvePlayerProfile();
  if (!profile) {
    return { status: "error", message: "You must be signed in as a player." };
  }

  const registration = await prisma.umpiringTraining.findUnique({
    where: { userProfileId: profile.id },
    select: { preferredLocation: true },
  });

  if (!registration) {
    return {
      status: "error",
      message: "You must complete umpiring training registration before starting the test.",
    };
  }

  const activeWindow = await getEligibilityAndWindow(profile.id, registration.preferredLocation);
  if (!activeWindow) {
    return {
      status: "error",
      message: "No active certification test window is available for your location today.",
    };
  }

  const existingAttempt = await prisma.certificationAttempt.findUnique({
    where: {
      windowId_userProfileId: {
        windowId: activeWindow.id,
        userProfileId: profile.id,
      },
    },
    select: { id: true },
  });
  if (existingAttempt) {
    return { status: "error", message: "You already started this test window." };
  }

  const activeQuestions = await prisma.certificationQuestion.findMany({
    where: { isActive: true },
    include: {
      options: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (activeQuestions.length < activeWindow.questionCount || activeQuestions.length < CERTIFICATION_QUESTION_COUNT) {
    return {
      status: "error",
      message: "Certification test cannot start because the active question pool is below 20.",
    };
  }

  const selectedQuestions = shuffleArray(activeQuestions).slice(0, activeWindow.questionCount);
  const expiresAt = new Date(Date.now() + activeWindow.durationMinutes * 60 * 1000);
  const snapshots = buildAttemptSnapshots(selectedQuestions);

  try {
    await prisma.$transaction(async (tx) => {
      const attempt = await tx.certificationAttempt.create({
        data: {
          windowId: activeWindow.id,
          userProfileId: profile.id,
          expiresAt,
          totalQuestions: activeWindow.questionCount,
        },
      });

      await tx.certificationAttemptQuestion.createMany({
        data: snapshots.map((snapshot) => ({
          attemptId: attempt.id,
          displayOrder: snapshot.displayOrder,
          questionIdOriginal: snapshot.questionIdOriginal,
          promptSnapshot: snapshot.promptSnapshot,
          imageUrlSnapshot: snapshot.imageUrlSnapshot,
          optionsSnapshotJson: snapshot.optionsSnapshotJson as Prisma.InputJsonValue,
        })),
      });
    });
  } catch {
    return {
      status: "error",
      message: "Unable to start test. If you already started, refresh and continue.",
    };
  }

  revalidatePath("/umpiring-certification");
  return { status: "success", message: "Your certification test has started." };
}

async function resolveInProgressAttempt(userProfileId: string) {
  return prisma.certificationAttempt.findFirst({
    where: {
      userProfileId,
      status: "IN_PROGRESS",
    },
    include: {
      questions: {
        orderBy: { displayOrder: "asc" },
      },
      window: true,
    },
    orderBy: { startedAt: "desc" },
  });
}

export async function saveAttemptAnswer(
  attemptQuestionId: string,
  optionId: string | null
): Promise<CertificationActionResult> {
  const profile = await resolvePlayerProfile();
  if (!profile) {
    return { status: "error", message: "Authentication required." };
  }

  const attempt = await resolveInProgressAttempt(profile.id);
  if (!attempt) {
    return { status: "error", message: "No active test attempt found." };
  }

  const question = attempt.questions.find((item) => item.id === attemptQuestionId);
  if (!question) {
    return { status: "error", message: "Question not found." };
  }

  if (new Date() > attempt.expiresAt) {
    return submitMyCertificationAttempt(true);
  }

  await prisma.certificationAttemptQuestion.update({
    where: { id: attemptQuestionId },
    data: {
      selectedOptionIdOriginal: optionId,
      answeredAt: optionId ? new Date() : null,
    },
  });

  revalidatePath("/umpiring-certification");
  return { status: "success", message: "Answer saved." };
}

export async function toggleAttemptFlag(
  attemptQuestionId: string,
  isFlagged: boolean
): Promise<CertificationActionResult> {
  const profile = await resolvePlayerProfile();
  if (!profile) {
    return { status: "error", message: "Authentication required." };
  }

  const attempt = await resolveInProgressAttempt(profile.id);
  if (!attempt) {
    return { status: "error", message: "No active test attempt found." };
  }

  await prisma.certificationAttemptQuestion.update({
    where: { id: attemptQuestionId },
    data: { isFlagged },
  });

  revalidatePath("/umpiring-certification");
  return { status: "success", message: isFlagged ? "Question flagged." : "Flag removed." };
}

export async function submitMyCertificationAttempt(autoExpired = false): Promise<CertificationActionResult> {
  const profile = await resolvePlayerProfile();
  if (!profile) {
    return { status: "error", message: "Authentication required." };
  }

  const attempt = await resolveInProgressAttempt(profile.id);
  if (!attempt) {
    return { status: "error", message: "No active test attempt found." };
  }

  if (attempt.status !== "IN_PROGRESS") {
    return { status: "error", message: "This test attempt is already submitted." };
  }

  const grading = gradeAttempt(attempt.questions);
  const trainingResult = grading.result === "PASS" ? "PASS" : "FAIL";
  const now = new Date();
  const finalStatus = autoExpired || now > attempt.expiresAt ? "TIME_EXPIRED" : "SUBMITTED";

  await prisma.$transaction(async (tx) => {
    await tx.certificationAttempt.update({
      where: { id: attempt.id },
      data: {
        submittedAt: now,
        status: finalStatus,
        correctCount: grading.correctCount,
        totalQuestions: grading.totalQuestions,
        scorePercent: grading.scorePercent,
        result: grading.result,
      },
    });

    await tx.umpiringTraining.updateMany({
      where: { userProfileId: profile.id },
      data: { result: trainingResult },
    });
  });

  revalidatePath("/umpiring-certification");
  revalidatePath("/admin");
  return {
    status: "success",
    message: finalStatus === "TIME_EXPIRED" ? "Time expired. Test submitted." : "Test submitted.",
  };
}

export async function autoSubmitIfExpired(): Promise<CertificationActionResult> {
  return submitMyCertificationAttempt(true);
}
