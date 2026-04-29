import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Trophy, Zap } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LevelBadge } from "@/components/fantasy/level-badge";
import { FantasyClient } from "@/components/fantasy/fantasy-client";
import {
  getUserFantasyData,
  getUpcomingGamesForPrediction,
  getGamePredictionCounts,
} from "@/lib/actions/fantasy";
import { getLevelFromWeeks } from "@/lib/fantasy";

export const metadata: Metadata = {
  title: "Fantasy Predictions",
  description:
    "Predict game winners, earn points, and climb the MichCA Fantasy leaderboard.",
};

export default async function FantasyPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [userData, games] = await Promise.all([
    getUserFantasyData(),
    getUpcomingGamesForPrediction(),
  ]);

  if (!userData) redirect("/sign-in");

  const rawCounts = await getGamePredictionCounts(games.map((g) => g.id));

  // Build a countMap: gameId → { team1Count, drawCount, team2Count, total }
  const countMap = new Map(
    games.map((g) => {
      const forGame = rawCounts.filter((r) => r.gameId === g.id);
      const team1Count =
        forGame.find((r) => r.predictedWinnerCode === g.team1Code)?.count ?? 0;
      const team2Count =
        forGame.find((r) => r.predictedWinnerCode === g.team2Code)?.count ?? 0;
      const drawCount =
        forGame.find((r) => r.predictedWinnerCode === null)?.count ?? 0;
      return [
        g.id,
        {
          team1Count,
          drawCount,
          team2Count,
          total: team1Count + drawCount + team2Count,
        },
      ] as const;
    }),
  );

  const predictionMap = new Map(userData.predictions.map((p) => [p.gameId, p]));

  const canBoost = userData.fantasyLevel >= 1;
  const weeksToNextLevel =
    userData.fantasyLevel < 5
      ? (userData.fantasyLevel + 1) * 3 - userData.fullParticipationWeeks
      : 0;

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-10">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Fantasy Predictions
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Pick the winner of each upcoming game. Earn points, level up, and
              compete on the leaderboard.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/fantasy/leaderboard">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </Link>
          </Button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Total Points
            </p>
            <p className="text-2xl font-bold text-foreground">
              {userData.fantasyPoints}
            </p>
          </Card>
          <Card className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Level
            </p>
            <div className="pt-0.5">
              <LevelBadge level={userData.fantasyLevel} />
            </div>
          </Card>
          <Card className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Full Weeks
            </p>
            <p className="text-2xl font-bold text-foreground">
              {userData.fullParticipationWeeks}
            </p>
          </Card>
          <Card className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Boosters Left
            </p>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" />
              <p className="text-2xl font-bold text-foreground">
                {canBoost ? userData.boostersRemaining : "—"}
              </p>
            </div>
          </Card>
        </div>

        {/* Progress to next level */}
        {userData.fantasyLevel < 5 && (
          <Card className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Progress to{" "}
                  <LevelBadge
                    level={userData.fantasyLevel + 1}
                    size="sm"
                    className="ml-1"
                  />
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Predict all games in{" "}
                  {weeksToNextLevel === 1
                    ? "1 more week"
                    : `${weeksToNextLevel} more weeks`}{" "}
                  to level up
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                {userData.fullParticipationWeeks} /{" "}
                {(userData.fantasyLevel + 1) * 3} weeks
              </div>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${Math.min(
                    (userData.fullParticipationWeeks /
                      ((userData.fantasyLevel + 1) * 3)) *
                      100,
                    100,
                  )}%`,
                }}
              />
            </div>
          </Card>
        )}

        {/* Upcoming games */}
        {games.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            No upcoming games available for prediction right now. Check back
            soon!
          </Card>
        ) : (
          <FantasyClient
            games={games.map((g) => ({
              ...g,
              date: new Date(g.date),
              gameType: g.gameType as "LEAGUE" | "PLAYOFF",
              division: g.division as string,
            }))}
            predictionMap={predictionMap}
            countMap={countMap}
            canBoost={canBoost}
            boostersRemaining={userData.boostersRemaining}
          />
        )}
      </PageContainer>
    </div>
  );
}
