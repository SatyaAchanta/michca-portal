import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import { getFantasyAnalysisForUser } from "@/lib/fantasy-analysis";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { status: "error", message: "You must be signed in to view AI Analysis." },
      { status: 401 },
    );
  }

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json(
      { status: "error", message: "Profile not found." },
      { status: 404 },
    );
  }

  const result = await getFantasyAnalysisForUser(profile.id);
  const statusCode =
    result.status === "error"
      ? 500
      : 200;

  return NextResponse.json(result, { status: statusCode });
}
