import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AdminMichcaMadnessClient } from "@/components/michca-madness/admin-michca-madness-client";
import { PageContainer } from "@/components/page-container";
import { grounds } from "@/lib/data";
import { getAdminMichcaMadnessData } from "@/lib/actions/michca-madness";
import { canAccessAdminSection } from "@/lib/roles";
import {
  AuthenticationRequiredError,
  InsufficientRoleError,
  requireAnyAdminRole,
} from "@/lib/user-profile";

export const metadata: Metadata = {
  title: "Admin · MichCA-Madness",
  description: "Set playoff teams, schedules, and bracket updates.",
};

export default async function AdminMichcaMadnessPage() {
  let userProfile;
  try {
    userProfile = await requireAnyAdminRole();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) redirect("/sign-in");
    if (error instanceof InsufficientRoleError) redirect("/");
    throw error;
  }

  if (!canAccessAdminSection(userProfile.role, "michcaMadness")) {
    redirect("/admin");
  }

  const data = await getAdminMichcaMadnessData();

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
          <p className="text-sm font-semibold text-primary">Admin</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            MichCA-Madness
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Configure playoff teams, schedule bracket games, link completed
            playoff results, and keep user brackets updated.
          </p>
        </div>

        <AdminMichcaMadnessClient
          season={data.season}
          grounds={grounds}
          teams={data.teams}
          configs={data.configs.map((config) => ({
            id: config.id,
            division: config.division,
            status: config.status,
            lockAt: config.lockAt?.toISOString() ?? null,
            entryCount: config._count.entries,
            seeds: config.seeds.map((seed) => ({
              seedKey: seed.seedKey,
              teamCode: seed.teamCode,
            })),
            slots: config.slots.map((slot) => ({
              slotKey: slot.slotKey,
              gameId: slot.gameId,
              scheduledAt: slot.scheduledAt?.toISOString() ?? null,
              venue: slot.venue,
              winnerCode: slot.winnerCode,
              needsAttention: slot.needsAttention,
            })),
          }))}
          playoffGames={data.playoffGames.map((game) => ({
            id: game.id,
            date: game.date.toISOString(),
            division: game.division,
            status: game.status,
            resultType: game.resultType,
            winnerCode: game.winnerCode,
            venue: game.venue,
            team1Code: game.team1Code,
            team2Code: game.team2Code,
            team1: game.team1,
            team2: game.team2,
          }))}
        />
      </PageContainer>
    </div>
  );
}

