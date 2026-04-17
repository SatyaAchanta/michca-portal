import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { UserRole } from "@/generated/prisma/client";
import * as XLSX from "xlsx";

import {
  AuthenticationRequiredError,
  InsufficientRoleError,
  requireRole,
} from "@/lib/user-profile";
import { formatSubmittedDate } from "@/components/umpiring-training/admin-formatters";
import { getClubInfoAdminData } from "@/lib/club-info";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  try {
    await requireRole(UserRole.STATS_COMMITTEE);
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    if (error instanceof InsufficientRoleError) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    throw error;
  }

  const { searchParams } = new URL(request.url);
  const data = await getClubInfoAdminData({
    teamName: searchParams.get("club") || undefined,
    division: searchParams.get("clubDivision") || undefined,
  });

  const rows = data.rows.map((submission) => ({
    "Captain Name": submission.captainName,
    "Account Email": submission.accountEmail,
    "Profile Email": submission.userProfile.email,
    "Contact Number": submission.contactNumber,
    "CricClubs ID": submission.cricclubsId,
    "T20 Division": submission.t20Division,
    "T20 Team": submission.t20Team?.teamName ?? submission.t20TeamCode,
    "F40/T30 Division": submission.secondaryDivision,
    "F40/T30 Team": submission.secondaryTeam?.teamName ?? submission.secondaryTeamCode,
    Submitted: formatSubmittedDate(submission.createdAt),
    Updated: formatSubmittedDate(submission.updatedAt),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Club Info");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="club-info.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
