"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Flame,
  MapPin,
  Users,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/page-container";
import { SiteFooter } from "@/components/site-footer";

export type HomeSeasonStats = {
  season: number;
  teamCount: number;
  venueCount: number;
};

export type PlayoffScheduleGame = {
  id: string;
  date: string;
  division: string;
  venue: string;
  team1Code: string;
  team1Name: string;
  team2Code: string;
  team2Name: string;
  status: string;
};

interface PlayoffHomePageProps {
  stats: HomeSeasonStats;
  playoffGames: PlayoffScheduleGame[];
}

export function PlayoffHomePage({ stats, playoffGames }: PlayoffHomePageProps) {
  const [divisionFilter, setDivisionFilter] = useState<string>("ALL");
  const divisions = Array.from(
    new Set(playoffGames.map((game) => game.division)),
  );

  const filteredGames = playoffGames.filter((game) => {
    if (divisionFilter === "ALL") return true;
    return game.division === divisionFilter;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 1. PLAYOFF ANNOUNCEMENT HERO BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-50/80 via-amber-50/30 to-background dark:from-slate-950 dark:via-slate-900 dark:to-background py-16 lg:py-24 border-b border-border/60 text-foreground dark:text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,38,38,0.25),rgba(255,255,255,0))]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/30 dark:via-red-500/50 to-transparent" />

        <PageContainer className="relative">
          <div className="mx-auto max-w-5xl text-center space-y-6">
            {/* Live Playoff Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400 backdrop-blur-md animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <Flame className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
              <span>
                PLAYOFFS ARE LIVE · THE ROAD TO THE CHAMPIONSHIP STARTS NOW
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground dark:text-white sm:text-6xl lg:text-7xl font-display">
              MichCA Playoffs <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-red-600 via-amber-600 to-amber-700 dark:from-red-400 dark:via-amber-300 dark:to-amber-500 bg-clip-text text-transparent">
                Have Officially Begun
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto max-w-3xl text-base text-muted-foreground dark:text-slate-300 sm:text-xl leading-relaxed">
              The fight for the championship cup is underway! Predict winners
              across every playoff matchup to earn{" "}
              <strong className="text-red-700 dark:text-amber-400 font-bold">
                3X FANTASY POINTS
              </strong>{" "}
              per game — or unleash a massive{" "}
              <strong className="text-amber-700 dark:text-amber-300 font-black">
                9X MULTIPLIER
              </strong>{" "}
              with your booster!
            </p>

            {/* Hero CTA buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button asChild size="lg" className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white border-0 shadow-md text-base px-8 h-12 font-bold">
                <Link href="/fantasy">
                  <Zap className="mr-2 h-5 w-5 fill-amber-300 text-amber-300" />
                  Make Fantasy Picks
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="border-border bg-card/80 text-foreground hover:bg-muted dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800 text-base px-8 h-12">
                <Link href="#playoff-schedule">
                  <Calendar className="mr-2 h-5 w-5 text-red-600 dark:text-red-400" />
                  Playoff Schedule
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="border-border bg-card/80 text-foreground hover:bg-muted dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800 text-base px-6 h-12">
                <Link href="/teams">
                  <Users className="mr-2 h-5 w-5 text-amber-600 dark:text-amber-400" />
                  Browse Teams
                </Link>
              </Button>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 2. UPCOMING PLAYOFF GAMES SCHEDULE SECTION */}
      <section id="playoff-schedule" className="py-14 bg-background">
        <PageContainer>
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border/60 pb-5">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>PLAYOFF FIXTURES</span>
                </div>
                <h2 className="text-3xl font-bold font-display text-foreground">
                  Upcoming Playoff Games
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Follow the postseason matchups on the road to the
                  championship.
                </p>
              </div>

              {/* Division Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2 bg-muted/60 p-1 rounded-xl border border-border/60">
                <button
                  type="button"
                  onClick={() => setDivisionFilter("ALL")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    divisionFilter === "ALL"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All Divisions
                </button>
                {divisions.map((division) => (
                  <button
                    key={division}
                    type="button"
                    onClick={() => setDivisionFilter(division)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      divisionFilter === division
                        ? "bg-red-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {division.replaceAll("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Clean Playoff Match Schedule Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {filteredGames.map((game) => {
                return (
                  <Card
                    key={game.id}
                    className="relative overflow-hidden border border-border/80 bg-card p-6 hover:border-red-500/50 hover:shadow-xl transition-all flex flex-col justify-between space-y-5"
                  >
                    {/* Top Row: Division Badge */}
                    <div className="flex items-center justify-between">
                      <span
                        className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-extrabold uppercase text-red-600 dark:text-red-400"
                      >
                        {game.division} Playoff
                      </span>
                    </div>

                    {/* Team Names Stacked on Individual Lines */}
                    <div className="space-y-3 bg-muted/40 p-4 rounded-xl border border-border/60">
                      <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
                        <p className="text-base font-extrabold text-foreground leading-snug">
                          {game.team1Name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border/60 shrink-0">
                          VS
                        </span>
                        <div className="h-px flex-1 bg-border/60" />
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                        <p className="text-base font-extrabold text-foreground leading-snug">
                          {game.team2Name}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Venue & Action Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{game.venue}</span>
                      </div>

                      <Button asChild size="sm" className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold shrink-0 border-0">
                        <Link href="/fantasy">
                          Predict Winner
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Link to Full Schedule */}
            <div className="text-center pt-2">
              <Button asChild variant="outline" size="lg">
                <Link href="/schedule">
                  View Full League Schedule <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </PageContainer>
      </section>

      <SiteFooter />
    </div>
  );
}
