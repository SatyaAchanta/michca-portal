"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@/generated/prisma/client";

import {
  findConflictingCaptainAssignments,
} from "@/lib/club-info";
import { splitCaptainName } from "@/lib/club-info-constants";
import { prisma } from "@/lib/prisma";
import { getWaiverTeamOptions } from "@/lib/team-queries";
import {
  AuthenticationRequiredError,
  requireRole,
} from "@/lib/user-profile";
import {
  INITIAL_CLUB_INFO_FORM_STATE,
  parseClubInfoForm,
  type ClubInfoFormState,
} from "@/components/club-info/validation";

export async function submitMyClubInfo(
  _prevState: ClubInfoFormState,
  formData: FormData,
): Promise<ClubInfoFormState> {
  let profile;
  try {
    profile = await requireRole(UserRole.PLAYER);
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return {
        status: "error",
        fieldErrors: { form: "You must be signed in to submit club info." },
      };
    }

    return {
      status: "error",
      fieldErrors: { form: "Unable to validate user profile." },
    };
  }

  const existingSubmission = await prisma.clubInfoSubmission.findUnique({
    where: { userProfileId: profile.id },
    select: { id: true },
  });
  if (existingSubmission) {
    return {
      status: "error",
      fieldErrors: {
        form: "Club info has already been submitted. For updates, contact the Stats Committee from the committees page.",
      },
    };
  }

  const { data, fieldErrors } = parseClubInfoForm(formData);
  if (!data) {
    return {
      status: "error",
      fieldErrors,
      message: "Please correct the highlighted fields.",
    };
  }

  const teams = await getWaiverTeamOptions();
  const t20Team = data.t20TeamCode ? teams.find((team) => team.teamCode === data.t20TeamCode) : null;
  const secondaryTeam = data.secondaryTeamCode
    ? teams.find((team) => team.teamCode === data.secondaryTeamCode)
    : null;

  const nextErrors = { ...fieldErrors };
  if (
    data.t20Division !== null &&
    (!t20Team || t20Team.format !== "T20" || t20Team.division !== data.t20Division)
  ) {
    nextErrors.t20TeamCode = "Select a valid T20 team for the chosen division.";
  }
  if (
    data.secondaryDivision !== null &&
    (!secondaryTeam ||
      secondaryTeam.format !== data.secondaryDivision ||
      secondaryTeam.division !== data.secondaryDivision)
  ) {
    nextErrors.secondaryTeamCode = "Select a valid F40 or T30 team for the chosen division.";
  }
  if (Object.keys(nextErrors).length > 0) {
    return {
      status: "error",
      fieldErrors: nextErrors,
      message: "Please correct the highlighted fields.",
    };
  }

  const selectedTeamCodes = [data.t20TeamCode, data.secondaryTeamCode].filter(
    (teamCode): teamCode is string => teamCode !== null,
  );
  const conflictingTeams = await findConflictingCaptainAssignments(profile.id, selectedTeamCodes);
  if (conflictingTeams.length > 0) {
    return {
      status: "error",
      fieldErrors: {
        form: `Captain is already assigned for ${conflictingTeams
          .map((team) => team.teamName)
          .join(", ")}. Contact the Stats Committee from the committees page.`,
      },
    };
  }

  const { firstName, lastName } = splitCaptainName(data.captainName);

  await prisma.$transaction(async (tx) => {
    await tx.clubInfoSubmission.create({
      data: {
        userProfileId: profile.id,
        accountEmail: profile.email,
        captainName: data.captainName,
        cricclubsId: data.cricclubsId,
        contactNumber: data.contactNumber,
        t20Division: data.t20Division,
        t20TeamCode: data.t20TeamCode,
        secondaryDivision: data.secondaryDivision,
        secondaryTeamCode: data.secondaryTeamCode,
      },
    });

    await tx.userProfile.update({
      where: { id: profile.id },
      data: {
        firstName,
        lastName,
        contactNumber: data.contactNumber,
      },
    });

    if (selectedTeamCodes.length > 0) {
      await tx.team.updateMany({
        where: { teamCode: { in: selectedTeamCodes } },
        data: { captainId: profile.id },
      });
    }
  });

  revalidatePath("/account");
  revalidatePath("/admin");
  revalidatePath("/club-info");
  revalidatePath("/teams");
  selectedTeamCodes.forEach((teamCode) => {
    revalidatePath(`/teams/${teamCode}`);
  });

  return {
    ...INITIAL_CLUB_INFO_FORM_STATE,
    status: "success",
    message: "Club info submitted successfully.",
  };
}
