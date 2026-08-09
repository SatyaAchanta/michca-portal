"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Clock,
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

  const filteredGames = playoffGames.filter((game) => {
    if (divisionFilter === "ALL") return true;
    return game.division === divisionFilter;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 1. PLAYOFF ANNOUNCEMENT HERO BANNER (HARMONIOUS LIGHT & DARK THEMES) */}
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
              <span>PLAYOFFS ARE LIVE · F40 & T30 KNOCKOUTS STARTED</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground dark:text-white sm:text-6xl lg:text-7xl font-display">
              F40 & T30 Playoffs <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-red-600 via-amber-600 to-amber-700 dark:from-red-400 dark:via-amber-300 dark:to-amber-500 bg-clip-text text-transparent">
                Have Officially Begun
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto max-w-3xl text-base text-muted-foreground dark:text-slate-300 sm:text-xl leading-relaxed">
              The fight for the championship cup is underway! Predict knockout winners across all F40 and T30 playoff matches to earn <strong className="text-red-700 dark:text-amber-400 font-bold">3X FANTASY POINTS</strong> per game — or unleash a massive <strong className="text-amber-700 dark:text-amber-300 font-black">9X MULTIPLIER</strong> with your booster!
            </p>

            {/* Hero CTA buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button asChild size="lg" className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white border-0 shadow-md text-base px-8 h-12 font-bold">
                <Link href="/fantasy">
                  <Zap className="mr-2 h-5 w-5 fill-amber-300 text-amber-300" />
                  Make 3X / 9X Fantasy Picks
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

      {/* 2. PLAYOFF SCHEDULE SECTION (FLOWS SEAMLESSLY FROM HERO TO FOOTER) */}
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
                  Playoff Match Schedule
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Upcoming F40 (Forty-Over) and T30 (Thirty-Over) knockout games. Predict winners for 3x / 9x points.
                </p>
              </div>

              {/* Division Filter Buttons */}
              <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-xl border border-border/60">
                <button
                  type="button"
                  onClick={() => setDivisionFilter("ALL")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    divisionFilter === "ALL"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All Fixtures
                </button>
                <button
                  type="button"
                  onClick={() => setDivisionFilter("F40")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    divisionFilter === "F40"
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  F40 Division
                </button>
                <button
                  type="button"
                  onClick={() => setDivisionFilter("T30")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    divisionFilter === "T30"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  T30 Division
                </button>
              </div>
            </div>

            {/* Playoff Match Schedule Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {filteredGames.map((game) => {
                const gameDate = new Date(game.date);
                const formattedDate = gameDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });
                const formattedTime = gameDate.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                });

                const isF40 = game.division === "F40";

                return (
                  <Card
                    key={game.id}
                    className="relative overflow-hidden border border-border/80 bg-card p-6 hover:border-red-500/50 hover:shadow-xl transition-all space-y-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                            isF40
                              ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {game.division} Playoff
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                          <Zap className="h-3 w-3 fill-current" /> 3X / 9X PTS
                        </span>
                      </div>

                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formattedDate} · {formattedTime}
                      </span>
                    </div>

                    {/* Matchup Team Showcase */}
                    <div className="grid grid-cols-11 items-center bg-muted/30 p-4 rounded-xl border border-border/60 text-center">
                      <div className="col-span-5 space-y-1 text-left sm:text-center">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider">
                          {game.team1Code}
                        </p>
                        <p className="text-base font-extrabold text-foreground truncate">
                          {game.team1Name}
                        </p>
                      </div>

                      <div className="col-span-1 flex items-center justify-center">
                        <span className="text-xs font-black text-muted-foreground bg-muted h-7 w-7 rounded-full flex items-center justify-center border border-border/60">
                          VS
                        </span>
                      </div>

                      <div className="col-span-5 space-y-1 text-right sm:text-center">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider">
                          {game.team2Code}
                        </p>
                        <p className="text-base font-extrabold text-foreground truncate">
                          {game.team2Name}
                        </p>
                      </div>
                    </div>

                    {/* Venue & Action Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{game.venue}</span>
                      </div>

                      <Button asChild size="sm" className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold shrink-0 border-0">
                        <Link href="/fantasy">
                          Predict Winner (3X / 9X)
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
