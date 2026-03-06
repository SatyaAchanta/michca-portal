"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { AuthenticationRequiredError, InsufficientRoleError, requireRole } from "@/lib/user-profile";
import {
  CERTIFICATION_DURATION_MINUTES,
  CERTIFICATION_QUESTION_COUNT,
  getDetroitDateString,
  toDateOnlyValue,
} from "@/lib/certification";

type WindowActionResult = {
  status: "success" | "error";
  message: string;
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

function revalidateCertificationPages() {
  revalidatePath("/admin/certification-windows");
  revalidatePath("/umpiring-certification");
}

export async function startCertificationWindow(
  location: string,
  dateLocal?: string
): Promise<WindowActionResult> {
  const admin = await requireAdminProfile();
  if (!admin) {
    return { status: "error", message: "Only admins can manage windows." };
  }

  const normalizedLocation = location.trim();
  if (!normalizedLocation) {
    return { status: "error", message: "Location is required." };
  }

  const localDate = (dateLocal ?? getDetroitDateString()).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
    return { status: "error", message: "Date must be in YYYY-MM-DD format." };
  }
  const dateValue = toDateOnlyValue(localDate);

  const activeQuestionCount = await prisma.certificationQuestion.count({
    where: { isActive: true },
  });
  if (activeQuestionCount < CERTIFICATION_QUESTION_COUNT) {
    return {
      status: "error",
      message: `At least ${CERTIFICATION_QUESTION_COUNT} active questions are required to start a window.`,
    };
  }

  const existing = await prisma.certificationTestWindow.findUnique({
    where: {
      location_testDateLocal: {
        location: normalizedLocation,
        testDateLocal: dateValue,
      },
    },
  });

  if (existing) {
    return {
      status: "error",
      message:
        existing.status === "ACTIVE"
          ? "A window is already active for this location and date."
          : "A window already exists for this location and date.",
    };
  }

  await prisma.certificationTestWindow.create({
    data: {
      location: normalizedLocation,
      testDateLocal: dateValue,
      status: "ACTIVE",
      durationMinutes: CERTIFICATION_DURATION_MINUTES,
      questionCount: CERTIFICATION_QUESTION_COUNT,
      startedByUserId: admin.id,
    },
  });

  revalidateCertificationPages();
  return { status: "success", message: "Certification window started." };
}

export async function closeCertificationWindow(windowId: string): Promise<WindowActionResult> {
  const admin = await requireAdminProfile();
  if (!admin) {
    return { status: "error", message: "Only admins can manage windows." };
  }

  await prisma.certificationTestWindow.update({
    where: { id: windowId },
    data: {
      status: "CLOSED",
      closedAt: new Date(),
    },
  });

  revalidateCertificationPages();
  return { status: "success", message: "Certification window closed." };
}
