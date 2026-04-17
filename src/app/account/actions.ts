"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@clerk/nextjs/server";

import { getWaiverTeamOptions } from "@/lib/team-queries";
import { prisma } from "@/lib/prisma";
import { WAIVER_ROLE_OPTIONS, type WaiverRoleValue } from "@/lib/waiver-constants";

export type UpdateProfileState = {
  status: "idle" | "success" | "error";
  message?: string;
};

function normalizeOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed !== "NONE" ? trimmed : null;
}

export type DeleteAccountState = {
  status: "error";
  message: string;
};

export async function updateProfile(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const { userId } = await auth();
  if (!userId) {
    return { status: "error", message: "You must be signed in to update your profile." };
  }

  const profile = await prisma.userProfile.findUnique({ where: { clerkUserId: userId } });
  if (!profile) {
    return { status: "error", message: "Profile not found." };
  }

  const firstName = (formData.get("firstName") as string | null)?.trim() || null;
  const lastName = (formData.get("lastName") as string | null)?.trim() || null;
  const t20TeamCode = normalizeOptionalString(formData.get("t20TeamCode"));
  const secondaryTeamCode = normalizeOptionalString(formData.get("secondaryTeamCode"));
  const playingRole = normalizeOptionalString(formData.get("playingRole"));

  if (playingRole && !WAIVER_ROLE_OPTIONS.includes(playingRole as WaiverRoleValue)) {
    return { status: "error", message: "Select a valid playing role." };
  }

  const teams = await getWaiverTeamOptions();
  if (t20TeamCode) {
    const t20Team = teams.find((team) => team.teamCode === t20TeamCode);
    if (!t20Team || t20Team.format !== "T20") {
      return { status: "error", message: "Select a valid current T20 team." };
    }
  }

  if (secondaryTeamCode) {
    const secondaryTeam = teams.find((team) => team.teamCode === secondaryTeamCode);
    if (
      !secondaryTeam ||
      (secondaryTeam.format !== "F40" && secondaryTeam.format !== "T30")
    ) {
      return { status: "error", message: "Select a valid current F40/T30 team." };
    }
  }

  await prisma.userProfile.update({
    where: { id: profile.id },
    data: {
      firstName,
      lastName,
      t20TeamCode,
      secondaryTeamCode,
      playingRole,
    },
  });

  revalidatePath("/account");
  revalidatePath("/teams");

  return { status: "success", message: "Profile updated successfully." };
}

export async function deleteAccount(): Promise<DeleteAccountState | never> {
  const { userId } = await auth();

  if (!userId) {
    return { status: "error", message: "You must be signed in to delete your account." };
  }

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
  });

  if (!profile) {
    redirect("/");
  }

  // Pre-check Restrict constraints before attempting delete
  const [certQuestionCount, certWindowCount] = await Promise.all([
    prisma.certificationQuestion.count({ where: { createdByUserId: profile.id } }),
    prisma.certificationTestWindow.count({ where: { startedByUserId: profile.id } }),
  ]);

  if (certQuestionCount > 0 || certWindowCount > 0) {
    return {
      status: "error",
      message:
        "Your account has certification content (questions or test windows) that must be reassigned or removed by another admin before your account can be deleted.",
    };
  }

  await prisma.userProfile.delete({ where: { id: profile.id } });

  redirect("/");
}
