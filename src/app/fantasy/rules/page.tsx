import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CircleDollarSign,
  Clock3,
  ListChecks,
  Medal,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FULL_WEEKS_FOR_BOOSTERS, SEASON_BOOSTER_COUNT } from "@/lib/fantasy";

export const metadata: Metadata = {
  title: "Fantasy Rules",
  description:
    "Learn how MichCA Fantasy predictions, points, boosters, and full-week participation work.",
};

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
                unlock boosters through full-week participation, and climb the
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
                <Clock3 className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Deadline</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Predictions lock 1 hour before each game&apos;s scheduled
                  start time. Saturday games lock 1 hour before their Saturday
                  kickoff, and Sunday games lock 1 hour before their Sunday
                  kickoff.
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
                  Boosters unlock after {FULL_WEEKS_FOR_BOOSTERS} full league
                  prediction weeks.{" "}
                  <strong className="text-red-300 dark:text-red-300">
                    Each player receives {SEASON_BOOSTER_COUNT} boosters for
                    the season.
                  </strong>{" "}
                  A boosted correct prediction earns 3x points; a boosted
                  incorrect prediction still earns 0.
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
                <h2 className="text-lg font-semibold">Full Weeks</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  A full week means predicting every league game in that game
                  week. Full weeks unlock boosters, but there are no fantasy
                  levels or level bonus points.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden border-amber-200 bg-gradient-to-br from-amber-50 via-background to-emerald-50 shadow-sm dark:border-amber-900/60 dark:from-amber-950/30 dark:via-background dark:to-emerald-950/20">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-md bg-amber-100 p-2 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800">
                <CircleDollarSign className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-semibold">Prize Money</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Weekly winners earn cash, and the season leaderboard pays out
                  through the top 10 finishers.
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-amber-200 bg-white/75 px-4 py-3 text-right shadow-sm dark:border-amber-900/70 dark:bg-background/70">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Prize Pool
              </p>
              <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                Up to $1,500
              </p>
            </div>
          </div>

          <div className="grid gap-3 border-t border-amber-200/80 bg-white/60 p-5 dark:border-amber-900/60 dark:bg-background/50 sm:grid-cols-2 lg:grid-cols-6">
            <div className="rounded-lg border border-emerald-200 bg-background p-4 shadow-sm dark:border-emerald-900/70">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Weekly Winner
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                $25
              </p>
              <p className="text-xs text-muted-foreground">each week</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-background p-4 shadow-sm dark:border-amber-900/70">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Season Winner
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">$200</p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Runner-up
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">$150</p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Third Place
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">$100</p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                4th &amp; 5th
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">$75</p>
              <p className="text-xs text-muted-foreground">each</p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                6th-10th
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">$50</p>
              <p className="text-xs text-muted-foreground">each</p>
            </div>
          </div>

          <div className="border-t border-amber-200/80 px-5 py-3 text-xs leading-5 text-muted-foreground dark:border-amber-900/60">
            Season leaderboard prizes total $850. Weekly $25 prizes bring the
            full fantasy prize pool to roughly $1,450-$1,475, rounded up and
            promoted as up to $1,500.
          </div>
        </Card>
      </PageContainer>
    </div>
  );
}
