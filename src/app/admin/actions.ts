import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@/generated/prisma/client";

import {
  AuthenticationRequiredError,
  InsufficientRoleError,
  requireAnyAdminRole,
} from "@/lib/user-profile";
import { prisma } from "@/lib/prisma";
import {
  parseDateFilterParam,
  parseLocationFilterParam,
} from "@/components/umpiring-training/admin-formatters";
import { getClubInfoAdminData, parseClubInfoAdminSearch } from "@/lib/club-info";
import { getWaiverAdminData, parseWaiverAdminSearch } from "@/lib/waiver";

type GetAdminRegistrationsArgs = {
  datesParam?: string;
  locationsParam?: string;
  waiverDivisionParam?: string;
  waiverTeamParam?: string;
  waiverPlayerParam?: string;
  clubInfoTeamParam?: string;
  clubInfoDivisionParam?: string;
};

export async function getAdminRegistrations({
  datesParam,
  locationsParam,
  waiverDivisionParam,
  waiverTeamParam,
  waiverPlayerParam,
  clubInfoTeamParam,
  clubInfoDivisionParam,
}: GetAdminRegistrationsArgs) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  let userProfile;
  try {
    userProfile = await requireAnyAdminRole();
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
  const selectedWaiverDivision = waiverDivisionParam?.trim() ?? "";
  const selectedWaiverTeamCode = waiverTeamParam?.trim() ?? "";
  const selectedWaiverPlayerName = parseWaiverAdminSearch(waiverPlayerParam);
  const selectedClubInfoTeamName = parseClubInfoAdminSearch(clubInfoTeamParam);
  const selectedClubInfoDivision = clubInfoDivisionParam?.trim() ?? "";

  const where: Prisma.UmpiringTrainingWhereInput = {};
  if (selectedDates.length > 0) {
    where.preferredDates = { hasSome: selectedDates };
  }
  if (selectedLocations.length > 0) {
    where.preferredLocation = { in: selectedLocations };
  }

  const [registrations, youth15Registrations, waiverData, clubInfoData] = await Promise.all([
    prisma.umpiringTraining.findMany({
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
    }),
    prisma.youth15Registration.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        clubName: true,
        presidentName: true,
        presidentEmail: true,
        presidentPhoneNumber: true,
        secretaryName: true,
        secretaryEmail: true,
        secretaryPhoneNumber: true,
        createdAt: true,
        updatedAt: true,
        userProfile: {
          select: {
            email: true,
          },
        },
      },
    }),
    getWaiverAdminData({
      division: selectedWaiverDivision || undefined,
      teamCode: selectedWaiverTeamCode || undefined,
      playerName: selectedWaiverPlayerName || undefined,
    }),
    getClubInfoAdminData({
      teamName: selectedClubInfoTeamName || undefined,
      division: selectedClubInfoDivision || undefined,
    }),
  ]);

  return {
    registrations,
    youth15Registrations,
    waiverData,
    clubInfoData,
    selectedDates,
    selectedLocations,
    selectedWaiverDivision,
    selectedWaiverTeamCode,
    selectedWaiverPlayerName,
    selectedClubInfoTeamName,
    selectedClubInfoDivision,
    userRole: userProfile.role,
  };
}
