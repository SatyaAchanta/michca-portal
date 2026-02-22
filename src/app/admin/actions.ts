import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Prisma, UserRole } from "@/generated/prisma/client";

import {
  AuthenticationRequiredError,
  InsufficientRoleError,
  requireRole,
} from "@/lib/user-profile";
import { prisma } from "@/lib/prisma";
import {
  parseDateFilterParam,
  parseLocationFilterParam,
} from "@/components/umpiring-training/admin-formatters";

type GetAdminRegistrationsArgs = {
  datesParam?: string;
  locationsParam?: string;
};

export async function getAdminRegistrations({
  datesParam,
  locationsParam,
}: GetAdminRegistrationsArgs) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  try {
    await requireRole(UserRole.ADMIN);
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      redirect("/sign-in");
    }
    if (error instanceof InsufficientRoleError) {
      redirect("/");
    }
    throw error;
  }

  const selectedDates = parseDateFilterParam(datesParam);
  const selectedLocations = parseLocationFilterParam(locationsParam);

  const where: Prisma.UmpiringTrainingWhereInput = {};
  if (selectedDates.length > 0) {
    where.preferredDates = { hasSome: selectedDates };
  }
  if (selectedLocations.length > 0) {
    where.preferredLocation = { in: selectedLocations };
  }

  const registrations = await prisma.umpiringTraining.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      contactNumber: true,
      dietaryPreference: true,
      previouslyCertified: true,
      affiliation: true,
      preferredDates: true,
      preferredLocation: true,
      questions: true,
      result: true,
      createdAt: true,
    },
  });

  return {
    registrations,
    selectedDates,
    selectedLocations,
  };
}

