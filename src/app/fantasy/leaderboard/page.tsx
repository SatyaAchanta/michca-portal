import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, Medal } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import { LevelBadge } from "@/components/fantasy/level-badge";
import { getLeaderboard } from "@/lib/actions/fantasy";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Fantasy Leaderboard",
  description: "See the top MichCA Fantasy predictors for the 2026 season.",
};

function getRankStyle(rank: number) {
  if (rank === 1) return "text-amber-500";
  if (rank === 2) return "text-slate-400";
  if (rank === 3) return "text-amber-700";
  return "text-muted-foreground";
}

function getMedalIcon(rank: number) {
  if (rank <= 3) return <Medal className={cn("h-4 w-4", getRankStyle(rank))} />;
  return null;
}

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
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium w-12">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Player</th>
                    <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">
                      Level
                    </th>
                    <th className="px-4 py-3 text-left font-medium hidden md:table-cell">
                      Full Weeks
                    </th>
                    <th className="px-4 py-3 text-right font-medium">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {entries.map((entry) => {
                    const rank =
                      entries.filter(
                        (other) => other.fantasyPoints > entry.fantasyPoints,
                      ).length + 1;
                    const isCurrentUser = entry.id === currentUserId;
                    const displayName =
                      entry.firstName && entry.lastName
                        ? `${entry.firstName} ${entry.lastName}`
                        : (entry.firstName ?? entry.email.split("@")[0]);

                    return (
                      <tr
                        key={entry.id}
                        className={cn(
                          "transition-colors",
                          isCurrentUser
                            ? "bg-primary/5 font-medium"
                            : "hover:bg-muted/50",
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {getMedalIcon(rank)}
                            <span
                              className={cn(
                                "font-semibold",
                                getRankStyle(rank),
                              )}
                            >
                              {rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-foreground">
                              {displayName}
                            </span>
                            {isCurrentUser && (
                              <span className="text-xs text-primary font-medium">
                                (you)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <LevelBadge level={entry.fantasyLevel} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {entry.fullParticipationWeeks}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-foreground">
                          {entry.fantasyPoints}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </PageContainer>
    </div>
  );
}
