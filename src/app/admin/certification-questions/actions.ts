"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { AuthenticationRequiredError, InsufficientRoleError, requireRole } from "@/lib/user-profile";
import { validateQuestionPayload } from "@/lib/certification";

type QuestionActionResult = {
  status: "success" | "error";
  message: string;
};

type QuestionPayload = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

async function requireAdminProfile() {
  try {
    return await requireRole(UserRole.ADMIN);
  } catch (error) {
    if (error instanceof AuthenticationRequiredError || error instanceof InsufficientRoleError) {
      return null;
    }
    throw error;
  }
}

async function assertNoActiveWindows() {
  const activeCount = await prisma.certificationTestWindow.count({
    where: { status: "ACTIVE" },
  });
  if (activeCount > 0) {
    throw new Error("Question bank is locked while any test window is active.");
  }
}

function revalidateCertificationPages() {
  revalidatePath("/admin/certification-questions");
  revalidatePath("/umpiring-certification");
}

export async function createCertificationQuestion(payload: QuestionPayload): Promise<QuestionActionResult> {
  const admin = await requireAdminProfile();
  if (!admin) {
    return { status: "error", message: "Only admins can manage questions." };
  }

  const validation = validateQuestionPayload(payload.prompt, payload.options, payload.correctIndex);
  if (!validation.ok) {
    return { status: "error", message: validation.message };
  }

  try {
    await assertNoActiveWindows();
  } catch (error) {
    return { status: "error", message: (error as Error).message };
  }

  await prisma.certificationQuestion.create({
    data: {
      prompt: validation.prompt,
      createdByUserId: admin.id,
      isActive: true,
      options: {
        create: validation.options.map((label, index) => ({
          label,
          sortOrder: index + 1,
          isCorrect: index === validation.correctIndex,
        })),
      },
    },
  });

  revalidateCertificationPages();
  return { status: "success", message: "Question created." };
}

export async function updateCertificationQuestion(
  questionId: string,
  payload: QuestionPayload
): Promise<QuestionActionResult> {
  const admin = await requireAdminProfile();
  if (!admin) {
    return { status: "error", message: "Only admins can manage questions." };
  }

  const validation = validateQuestionPayload(payload.prompt, payload.options, payload.correctIndex);
  if (!validation.ok) {
    return { status: "error", message: validation.message };
  }

  try {
    await assertNoActiveWindows();
  } catch (error) {
    return { status: "error", message: (error as Error).message };
  }

  await prisma.$transaction(async (tx) => {
    await tx.certificationQuestion.update({
      where: { id: questionId },
      data: { prompt: validation.prompt },
    });

    await tx.certificationQuestionOption.deleteMany({
      where: { questionId },
    });

    await tx.certificationQuestionOption.createMany({
      data: validation.options.map((label, index) => ({
        questionId,
        label,
        sortOrder: index + 1,
        isCorrect: index === validation.correctIndex,
      })),
    });
  });

  revalidateCertificationPages();
  return { status: "success", message: "Question updated." };
}

export async function deleteCertificationQuestion(questionId: string): Promise<QuestionActionResult> {
  const admin = await requireAdminProfile();
  if (!admin) {
    return { status: "error", message: "Only admins can manage questions." };
  }

  try {
    await assertNoActiveWindows();
  } catch (error) {
    return { status: "error", message: (error as Error).message };
  }

  await prisma.certificationQuestion.delete({
    where: { id: questionId },
  });

  revalidateCertificationPages();
  return { status: "success", message: "Question deleted." };
}

export async function setCertificationQuestionActive(
  questionId: string,
  isActive: boolean
): Promise<QuestionActionResult> {
  const admin = await requireAdminProfile();
  if (!admin) {
    return { status: "error", message: "Only admins can manage questions." };
  }

  try {
    await assertNoActiveWindows();
  } catch (error) {
    return { status: "error", message: (error as Error).message };
  }

  await prisma.certificationQuestion.update({
    where: { id: questionId },
    data: { isActive },
  });

  revalidateCertificationPages();
  return { status: "success", message: isActive ? "Question activated." : "Question deactivated." };
}
