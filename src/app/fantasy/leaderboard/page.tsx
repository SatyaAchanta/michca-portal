import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { PublicLeaderboardClient } from "@/components/fantasy/public-leaderboard-client";
import { PageContainer } from "@/components/page-container";
import { getLeaderboard, getWeeklyLeaderboards } from "@/lib/actions/fantasy";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Fantasy Leaderboard",
  description: "See the top MichCA Fantasy predictors for the 2026 season.",
};

export default async function LeaderboardPage() {
  const { userId } = await auth();

  const [entries, weeklyLeaderboards, currentProfile] = await Promise.all([
    getLeaderboard(),
    getWeeklyLeaderboards(),
    userId
      ? prisma.userProfile.findUnique({
          where: { clerkUserId: userId },
          select: { id: true },
        })
      : null,
  ]);

  const currentUserId = currentProfile?.id ?? null;

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Link
            href="/fantasy"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Predictions
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Follow the season race or switch to weekly standings for each fully
            scored fantasy weekend.
          </p>
          <div className="inline-flex items-start gap-2 text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-xs sm:text-sm">
              Note: If a weekly ranking ends in a tie, the winner will be
              decided using a lottery method.
            </p>
          </div>
        </div>

        <PublicLeaderboardClient
          seasonEntries={entries}
          weeklyLeaderboards={weeklyLeaderboards}
          currentUserId={currentUserId}
          canViewPredictions={Boolean(userId)}
        />
      </PageContainer>
    </div>
  );
}
