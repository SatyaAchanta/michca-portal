import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BookOpen, Trophy, Zap } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FantasyClient } from "@/components/fantasy/fantasy-client";
import {
  getUserFantasyData,
  getFantasyGames,
  getGamePredictionCounts,
} from "@/lib/actions/fantasy";
import { FULL_WEEKS_FOR_BOOSTERS, canUseBoosters } from "@/lib/fantasy";

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
    getFantasyGames(),
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
  const scoredPredictions = userData.predictions.filter((p) => p.isScored);
  const correctPredictions = scoredPredictions.filter((p) => p.isCorrect);
  const accuracy =
    scoredPredictions.length > 0
      ? Math.round((correctPredictions.length / scoredPredictions.length) * 100)
      : null;

  const canBoost = canUseBoosters(userData.fullParticipationWeeks);
  const fullWeeksToBoosters = Math.max(
    FULL_WEEKS_FOR_BOOSTERS - userData.fullParticipationWeeks,
    0,
  );

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
              Pick the winner of each game before lock, track past results, unlock
              boosters through full-week participation, and compete on the
              leaderboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/fantasy/rules">
                <BookOpen className="h-4 w-4" />
                Rules
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/fantasy/leaderboard">
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Link>
            </Button>
          </div>
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
              Rank
            </p>
            <p className="text-2xl font-bold text-foreground">
              {userData.fantasyRank ? `#${userData.fantasyRank}` : "—"}
            </p>
          </Card>
          <Card className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Accuracy
            </p>
            <p className="text-2xl font-bold text-foreground">
              {accuracy !== null ? `${accuracy}%` : "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {scoredPredictions.length > 0
                ? `${correctPredictions.length}/${scoredPredictions.length} correct`
                : "No scored picks yet"}
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
            <p className="text-xs text-muted-foreground">
              10 boosters for the whole season
            </p>
          </Card>
        </div>

        {!canBoost && (
          <Card className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Booster progress
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Predict all league games in{" "}
                  {fullWeeksToBoosters === 1
                    ? "1 more week"
                    : `${fullWeeksToBoosters} more weeks`}{" "}
                  to unlock boosters.
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                {userData.fullParticipationWeeks} / {FULL_WEEKS_FOR_BOOSTERS} weeks
              </div>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${Math.min(
                    (userData.fullParticipationWeeks / FULL_WEEKS_FOR_BOOSTERS) * 100,
                    100,
                  )}%`,
                }}
              />
            </div>
          </Card>
        )}

        {/* Games */}
        {games.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            No fantasy games available right now.
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
