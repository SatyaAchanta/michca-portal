"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { getWaiverTeamOptions } from "@/lib/team-queries";
import {
  AuthenticationRequiredError,
  requireRole,
} from "@/lib/user-profile";
import {
  getCurrentWaiverYear,
  WAIVER_RULEBOOK_ACKNOWLEDGEMENT_TEXT,
  WAIVER_PRIMARY_DIVISIONS,
  WAIVER_SUBMIT_TEXT,
} from "@/lib/waiver-constants";
import {
  INITIAL_WAIVER_FORM_STATE,
  parseWaiverForm,
  type WaiverFormState,
} from "@/components/waiver/validation";

export async function submitMyWaiver(
  _prevState: WaiverFormState,
  formData: FormData
): Promise<WaiverFormState> {
  let profile;
  try {
    profile = await requireRole(UserRole.PLAYER);
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return {
        status: "error",
        fieldErrors: { form: "You must be signed in to submit the waiver." },
      };
    }

    return {
      status: "error",
      fieldErrors: { form: "Unable to validate user profile." },
    };
  }

  const { data, fieldErrors } = parseWaiverForm(formData);
  if (!data) {
    return {
      status: "error",
      fieldErrors,
      message: "Please correct the highlighted fields.",
    };
  }

  const teams = await getWaiverTeamOptions();
  const t20Team = data.t20TeamCode
    ? teams.find((team) => team.teamCode === data.t20TeamCode)
    : null;
  const secondaryTeam = data.secondaryTeamCode
    ? teams.find((team) => team.teamCode === data.secondaryTeamCode)
    : null;

  const nextErrors = { ...fieldErrors };
  if (data.t20Division !== null) {
    if (!WAIVER_PRIMARY_DIVISIONS.includes(data.t20Division as (typeof WAIVER_PRIMARY_DIVISIONS)[number])) {
      nextErrors.t20Division = "T20 division must be Premier, Division-1, Division-2, or Division-3.";
    } else if (!t20Team || t20Team.format !== "T20" || t20Team.division !== data.t20Division) {
      nextErrors.t20TeamCode = "Select a valid T20 team for the chosen division.";
    }
  }
  if (data.secondaryDivision !== null) {
    if (
      !secondaryTeam ||
      secondaryTeam.division !== data.secondaryDivision ||
      secondaryTeam.format !== data.secondaryDivision
    ) {
      nextErrors.secondaryTeamCode = "Select a valid F40 or T30 team for the chosen division.";
    }
  }
  if (Object.keys(nextErrors).length > 0) {
    return {
      status: "error",
      fieldErrors: nextErrors,
      message: "Please correct the highlighted fields.",
    };
  }

  const year = getCurrentWaiverYear();
  const existingWaiver = await prisma.waiverSubmission.findUnique({
    where: {
      userProfileId_year: {
        userProfileId: profile.id,
        year,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingWaiver) {
    return {
      status: "error",
      fieldErrors: {
        form: "You have already submitted waiver, to reset contact Stats Committee.",
      },
    };
  }

  const submittedAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.waiverSubmission.create({
      data: {
        userProfileId: profile.id,
        playerName: data.playerName,
        cricclubsId: data.cricclubsId,
        state: data.state,
        city: data.city,
        address: data.address,
        t20Division: data.t20Division,
        t20TeamCode: data.t20TeamCode,
        secondaryDivision: data.secondaryDivision,
        secondaryTeamCode: data.secondaryTeamCode,
        signatureName: data.signatureName,
        acknowledgedSubmitText: WAIVER_SUBMIT_TEXT,
        acknowledgedRulebookText: WAIVER_RULEBOOK_ACKNOWLEDGEMENT_TEXT,
        year,
        submittedAt,
      },
    });

    await tx.userProfile.update({
      where: { id: profile.id },
      data: {
        t20TeamCode: data.t20TeamCode,
        secondaryTeamCode: data.secondaryTeamCode,
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/forms");
  revalidatePath("/account");
  revalidatePath("/admin");
  revalidatePath("/waiver");

  return {
    ...INITIAL_WAIVER_FORM_STATE,
    status: "success",
    message: "Waiver submitted successfully.",
  };
}
