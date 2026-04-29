import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import { AdminFantasyClient } from "@/components/fantasy/admin-fantasy-client";
import { getUnscoredGameWeeks } from "@/lib/fantasy";
import { getScheduledGamesForAdmin } from "@/lib/actions/fantasy";
import { prisma } from "@/lib/prisma";
import { canAccessAdminSection } from "@/lib/roles";
import { UserRole } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Admin · Fantasy Scoring",
  description: "Set game results and calculate fantasy prediction points.",
};

export default async function AdminFantasyPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    select: { role: true },
  });

  if (!profile || !canAccessAdminSection(profile.role as UserRole, "fantasy")) {
    redirect("/");
  }

  const [scheduledGames, unscoredWeeks] = await Promise.all([
    getScheduledGamesForAdmin(),
    getUnscoredGameWeeks(),
  ]);

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-10">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-primary">Admin</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Fantasy Scoring
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Set game results to mark them as completed, then calculate points
            for each week.
          </p>
        </div>

        <AdminFantasyClient
          scheduledGames={scheduledGames}
          unscoredWeeks={unscoredWeeks}
        />
      </PageContainer>
    </div>
  );
}
