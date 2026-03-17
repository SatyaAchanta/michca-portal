"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { AuthenticationRequiredError, requireRole } from "@/lib/user-profile";
import {
  INITIAL_YOUTH15_REGISTRATION_FORM_STATE,
  parseYouth15RegistrationForm,
  type Youth15RegistrationFormState,
} from "@/components/y15-registration/validation";

export async function upsertMyYouth15Registration(
  _prevState: Youth15RegistrationFormState,
  formData: FormData
): Promise<Youth15RegistrationFormState> {
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

  const { data, fieldErrors } = parseYouth15RegistrationForm(formData);
  if (!data) {
    return {
      status: "error",
      fieldErrors,
      message: "Please correct the highlighted fields.",
    };
  }

  await prisma.youth15Registration.upsert({
    where: { userProfileId: profile.id },
    create: {
      userProfile: {
        connect: { id: profile.id },
      },
      clubName: data.clubName,
      presidentName: data.presidentName,
      presidentEmail: data.presidentEmail,
      presidentPhoneNumber: data.presidentPhoneNumber,
      secretaryName: data.secretaryName,
      secretaryEmail: data.secretaryEmail,
    },
    update: {
      clubName: data.clubName,
      presidentName: data.presidentName,
      presidentEmail: data.presidentEmail,
      presidentPhoneNumber: data.presidentPhoneNumber,
      secretaryName: data.secretaryName,
      secretaryEmail: data.secretaryEmail,
    },
  });

  revalidatePath("/");
  revalidatePath("/forms");
  revalidatePath("/admin");
  revalidatePath("/y15-registration");

  return {
    ...INITIAL_YOUTH15_REGISTRATION_FORM_STATE,
    status: "success",
    message: "Youth 15 registration saved successfully.",
  };
}
