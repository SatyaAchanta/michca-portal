import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { GamesManager } from "@/components/admin/games-manager";
import { PageContainer } from "@/components/page-container";
import { grounds } from "@/lib/data";
import { canAccessAdminSection } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import {
  AuthenticationRequiredError,
  InsufficientRoleError,
  requireAdminAllowlistedProfile,
} from "@/lib/user-profile";

export default async function AdminGamesPage() {
  let userProfile;
  try {
    userProfile = await requireAdminAllowlistedProfile();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) redirect("/sign-in");
    if (error instanceof InsufficientRoleError) redirect("/");
    throw error;
  }

  if (!canAccessAdminSection(userProfile.role, "games")) {
    redirect("/admin");
  }

  const [teams, scheduledGames] = await Promise.all([
    prisma.team.findMany({
      orderBy: [{ format: "asc" }, { division: "asc" }, { teamName: "asc" }],
      select: {
        teamCode: true,
        teamName: true,
        teamShortCode: true,
        division: true,
        format: true,
      },
    }),
    prisma.game.findMany({
      where: { status: "SCHEDULED" },
      orderBy: { date: "asc" },
      select: {
        id: true,
        date: true,
        division: true,
        gameType: true,
        league: true,
        venue: true,
        team1Code: true,
        team2Code: true,
        team1: { select: { teamName: true, teamShortCode: true } },
        team2: { select: { teamName: true, teamShortCode: true } },
      },
    }),
  ]);

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-1">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Admin
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Games
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Create scheduled games and cancel fixtures when the real-world schedule changes.
          </p>
        </div>

        <GamesManager teams={teams} grounds={grounds} scheduledGames={scheduledGames} />
      </PageContainer>
    </div>
  );
}
