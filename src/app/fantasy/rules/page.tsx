import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeHelp,
  CircleDollarSign,
  ListChecks,
  Medal,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MAX_FANTASY_LEVEL,
  WEEKS_PER_FANTASY_LEVEL,
  getLevelBonusPoints,
} from "@/lib/fantasy";

export const metadata: Metadata = {
  title: "Fantasy Rules",
  description:
    "Learn how MichCA Fantasy predictions, points, boosters, and levels work.",
};

const levelRows = Array.from({ length: MAX_FANTASY_LEVEL }, (_, index) => {
  const level = index + 1;
  return {
    level,
    weeks: level * WEEKS_PER_FANTASY_LEVEL,
    bonus: getLevelBonusPoints(level),
  };
});

export default function FantasyRulesPage() {
  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-4">
          <Link
            href="/fantasy"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Predictions
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Fantasy Rules
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Make picks before games lock, earn points for correct results,
                unlock boosters through league-week participation, and climb the
                leaderboard.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/fantasy/leaderboard">
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
                <ListChecks className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">How to Play</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Pick Team 1, Draw, or Team 2 for each scheduled game before
                  predictions lock. Predictions can be changed while the game is
                  still open.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
                <Medal className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Points</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  A correct league-game prediction earns 1 point. A correct
                  playoff-game prediction earns 3 points. Incorrect predictions
                  earn 0 points.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
                <Zap className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Boosters</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Boosters unlock at Level 1.{" "}
                  <strong className="inline-flex rounded-md bg-red-50 px-1.5 py-0.5 font-semibold text-red-700 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-800">
                    Each player receives 10 boosters
                  </strong>{" "}
                  for the season. A boosted correct prediction earns 3x points;
                  a boosted incorrect prediction still earns 0.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Levels</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Every 2 full league game weeks gives 1 level, up to Level 8.
                  Playoff predictions still score points, but playoff games do
                  not count toward level progress.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="border-b bg-muted/50 p-5">
            <div className="flex items-center gap-2">
              <BadgeHelp className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Level Bonuses</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Bonus points are awarded once when a level is reached.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="px-5 py-3 text-left font-medium">Level</th>
                  <th className="px-5 py-3 text-left font-medium">
                    Full League Weeks
                  </th>
                  <th className="px-5 py-3 text-right font-medium">
                    Bonus Points
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {levelRows.map((row) => (
                  <tr key={row.level}>
                    <td className="px-5 py-3 font-semibold">
                      Level {row.level}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {row.weeks}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold">
                      +{row.bonus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Prize Money</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Prize details will be announced later.
              </p>
            </div>
          </div>
        </Card>
      </PageContainer>
    </div>
  );
}
