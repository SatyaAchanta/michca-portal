import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { UserRole } from "@/generated/prisma/client";
import * as XLSX from "xlsx";

import {
  AuthenticationRequiredError,
  InsufficientRoleError,
  requireRole,
} from "@/lib/user-profile";
import { getWaiverAdminData } from "@/lib/waiver";
import { formatSubmittedDate } from "@/components/umpiring-training/admin-formatters";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  try {
    await requireRole(UserRole.ADMIN);
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
  const data = await getWaiverAdminData({
    division: searchParams.get("division") || undefined,
    teamCode: searchParams.get("team") || undefined,
    playerName: searchParams.get("player") || undefined,
  });

  const rows = data.rows.map((waiver) => ({
    "Player Name": waiver.playerName,
    "Account Email": waiver.userProfile.email,
    "CricClubs ID": waiver.cricclubsId,
    State: waiver.state,
    City: waiver.city,
    Address: waiver.address,
    "T20 Division": waiver.t20Division,
    "T20 Team": waiver.t20Team?.teamName ?? waiver.t20TeamCode,
    "F40/T30 Division": waiver.secondaryDivision,
    "F40/T30 Team": waiver.secondaryTeam?.teamName ?? waiver.secondaryTeamCode,
    Year: waiver.year,
    Submitted: formatSubmittedDate(waiver.submittedAt),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Waivers");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="waiver-status-${data.year}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
