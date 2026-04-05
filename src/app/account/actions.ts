"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export type UpdateProfileState = {
  status: "idle" | "success" | "error";
  message?: string;
};

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

  await prisma.userProfile.update({
    where: { id: profile.id },
    data: { firstName, lastName },
  });

  revalidatePath("/account");

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
