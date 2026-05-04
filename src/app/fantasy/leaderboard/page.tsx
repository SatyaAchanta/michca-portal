import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";

import { LeaderboardTable } from "@/components/fantasy/leaderboard-table";
import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import { getLeaderboard } from "@/lib/actions/fantasy";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Fantasy Leaderboard",
  description: "See the top MichCA Fantasy predictors for the 2026 season.",
};

export default async function LeaderboardPage() {
  const { userId } = await auth();

  const [entries, currentProfile] = await Promise.all([
    getLeaderboard(),
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
            Top predictors for the 2026 season, ranked by total fantasy points.
          </p>
        </div>

        {/* Table */}
        {entries.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            No scores yet — be the first to make a prediction!
          </Card>
        ) : (
          <LeaderboardTable
            entries={entries}
            currentUserId={currentUserId}
            canViewPredictions={Boolean(userId)}
          />
        )}
      </PageContainer>
    </div>
  );
}
