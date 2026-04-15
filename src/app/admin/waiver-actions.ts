"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  AuthenticationRequiredError,
  InsufficientRoleError,
  requireAnyAdminRole,
} from "@/lib/user-profile";

type DeleteWaiverState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function deleteWaiverSubmission(
  _prevState: DeleteWaiverState,
  formData: FormData
): Promise<DeleteWaiverState> {
  try {
    await requireAnyAdminRole();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError || error instanceof InsufficientRoleError) {
      return {
        status: "error",
        message: "Only admins can delete waiver submissions.",
      };
    }

    return {
      status: "error",
      message: "Unable to validate admin permissions.",
    };
  }

  const idValue = formData.get("id");
  if (typeof idValue !== "string" || idValue.trim().length === 0) {
    return {
      status: "error",
      message: "Waiver ID is missing.",
    };
  }

  await prisma.waiverSubmission.delete({
    where: { id: idValue },
  });

  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath("/admin");
  revalidatePath("/waiver");

  return {
    status: "success",
    message: "Waiver deleted.",
  };
}
