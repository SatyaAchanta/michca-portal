"use server";

import { revalidatePath } from "next/cache";

import { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/user-profile";

export type UpdateTeamProfileState = {
  status: "idle" | "success" | "error";
  message?: string;
};

function normalizeOptionalString(value: FormDataEntryValue | null) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized.length > 0 ? normalized : null;
}

export async function updateTeamProfile(
  _prevState: UpdateTeamProfileState,
  formData: FormData
): Promise<UpdateTeamProfileState> {
  await requireRole(UserRole.ADMIN);

  const teamCode = normalizeOptionalString(formData.get("teamCode"));
  if (!teamCode) {
    return { status: "error", message: "Team code is required." };
  }

  const existingTeam = await prisma.team.findUnique({
    where: { teamCode },
    select: { teamCode: true },
  });

  if (!existingTeam) {
    return { status: "error", message: "Team not found." };
  }

  const teamName = normalizeOptionalString(formData.get("teamName"));
  if (!teamName) {
    return { status: "error", message: "Team name is required." };
  }

  await prisma.team.update({
    where: { teamCode },
    data: {
      teamName,
      description: normalizeOptionalString(formData.get("description")),
      captainId: normalizeOptionalString(formData.get("captainId")),
      viceCaptainId: normalizeOptionalString(formData.get("viceCaptainId")),
      facebookPage: normalizeOptionalString(formData.get("facebookPage")),
      instagramPage: normalizeOptionalString(formData.get("instagramPage")),
      logo: normalizeOptionalString(formData.get("logo")),
    },
  });

  revalidatePath("/teams");
  revalidatePath(`/teams/${teamCode}`);
  revalidatePath("/admin");
  revalidatePath(`/admin/teams/${teamCode}`);

  return { status: "success", message: "Team profile updated successfully." };
}
