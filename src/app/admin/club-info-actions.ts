"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { canAccessAdminSection } from "@/lib/roles";
import {
  AuthenticationRequiredError,
  InsufficientRoleError,
  requireAnyAdminRole,
} from "@/lib/user-profile";

type DeleteClubInfoState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function deleteClubInfoSubmission(
  _prevState: DeleteClubInfoState,
  formData: FormData,
): Promise<DeleteClubInfoState> {
  let profile;
  try {
    profile = await requireAnyAdminRole();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError || error instanceof InsufficientRoleError) {
      return {
        status: "error",
        message: "Only authorized admins can delete club info submissions.",
      };
    }

    return {
      status: "error",
      message: "Unable to validate admin permissions.",
    };
  }

  if (!canAccessAdminSection(profile.role, "clubInfo")) {
    return {
      status: "error",
      message: "Only authorized admins can delete club info submissions.",
    };
  }

  const idValue = formData.get("id");
  if (typeof idValue !== "string" || idValue.trim().length === 0) {
    return {
      status: "error",
      message: "Club info submission ID is missing.",
    };
  }

  const submission = await prisma.clubInfoSubmission.findUnique({
    where: { id: idValue },
    select: {
      id: true,
      userProfileId: true,
      t20TeamCode: true,
      secondaryTeamCode: true,
    },
  });

  if (!submission) {
    return {
      status: "error",
      message: "Club info submission not found.",
    };
  }

  const teamCodes = [submission.t20TeamCode, submission.secondaryTeamCode].filter(
    (teamCode): teamCode is string => teamCode !== null,
  );

  await prisma.$transaction(async (tx) => {
    if (teamCodes.length > 0) {
      await tx.team.updateMany({
        where: {
          teamCode: { in: teamCodes },
          captainId: submission.userProfileId,
        },
        data: {
          captainId: null,
        },
      });
    }

    await tx.clubInfoSubmission.delete({
      where: { id: submission.id },
    });
  });

  revalidatePath("/account");
  revalidatePath("/admin");
  revalidatePath("/club-info");
  revalidatePath("/teams");
  teamCodes.forEach((teamCode) => {
    revalidatePath(`/teams/${teamCode}`);
  });

  return {
    status: "success",
    message: "Club info submission deleted.",
  };
}
