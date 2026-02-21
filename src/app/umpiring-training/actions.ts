"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { AuthenticationRequiredError, InsufficientRoleError, requireRole } from "@/lib/user-profile";
import {
  INITIAL_REGISTRATION_FORM_STATE,
  type RegistrationFormState,
  parseRegistrationForm,
  parseResultValue,
} from "@/components/umpiring-training/validation";

function toPreferredDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export async function upsertMyUmpiringTrainingRegistration(
  _prevState: RegistrationFormState,
  formData: FormData
): Promise<RegistrationFormState> {
  let profile;
  try {
    profile = await requireRole(UserRole.PLAYER);
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return {
        status: "error",
        fieldErrors: { form: "You must be signed in to register." },
      };
    }
    return {
      status: "error",
      fieldErrors: { form: "Unable to validate user profile." },
    };
  }

  const { data, fieldErrors } = parseRegistrationForm(formData);
  if (!data) {
    return {
      status: "error",
      fieldErrors,
      message: "Please correct the highlighted fields.",
    };
  }

  await prisma.umpiringTraining.upsert({
    where: { userProfileId: profile.id },
    create: {
      userProfileId: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      contactNumber: data.contactNumber,
      previouslyCertified: data.previouslyCertified,
      affiliation: data.affiliation,
      preferredDate: toPreferredDate(data.preferredDate),
      preferredLocation: data.preferredLocation,
      questions: data.questions,
    },
    update: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      contactNumber: data.contactNumber,
      previouslyCertified: data.previouslyCertified,
      affiliation: data.affiliation,
      preferredDate: toPreferredDate(data.preferredDate),
      preferredLocation: data.preferredLocation,
      questions: data.questions,
    },
  });

  revalidatePath("/umpiring-training");
  revalidatePath("/admin");

  return {
    ...INITIAL_REGISTRATION_FORM_STATE,
    status: "success",
    message: "Registration saved successfully.",
  };
}

type ResultUpdateState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function updateUmpiringTrainingResult(
  _prevState: ResultUpdateState,
  formData: FormData
): Promise<ResultUpdateState> {
  try {
    await requireRole(UserRole.ADMIN);
  } catch (error) {
    if (error instanceof AuthenticationRequiredError || error instanceof InsufficientRoleError) {
      return {
        status: "error",
        message: "Only admins can update result.",
      };
    }
    return {
      status: "error",
      message: "Unable to validate admin permissions.",
    };
  }

  const idValue = formData.get("id");
  const resultValue = formData.get("result");

  if (typeof idValue !== "string" || idValue.trim().length === 0) {
    return {
      status: "error",
      message: "Registration ID is missing.",
    };
  }

  if (typeof resultValue !== "string") {
    return {
      status: "error",
      message: "Result is required.",
    };
  }

  const parsedResult = parseResultValue(resultValue);
  if (!parsedResult) {
    return {
      status: "error",
      message: "Invalid result value.",
    };
  }

  await prisma.umpiringTraining.update({
    where: { id: idValue },
    data: { result: parsedResult },
  });

  revalidatePath("/admin");
  revalidatePath("/umpiring-training");

  return {
    status: "success",
    message: "Result updated.",
  };
}
