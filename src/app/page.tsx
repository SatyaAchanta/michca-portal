import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Gamepad2,
  MapPin,
  Trophy,
  Users,
} from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { RegistrationBanner } from "@/components/registration-banner";
import { FantasyBanner } from "@/components/fantasy-banner";
import { prisma } from "@/lib/prisma";
import { DETROIT_TIMEZONE } from "@/app/schedule/types";

export const metadata: Metadata = {
  title: "MichCA - Michigan Cricket Association | Official Website",
  description:
    "Official website of MichCA (Michigan Cricket Association). League schedules, teams, umpires, grounds, and cricket news across Michigan.",
  keywords: [
    "MichCA",
    "Michigan Cricket Association",
    "MichCA cricket",
    "Michigan cricket league",
  ],
  alternates: {
    canonical: "https://www.michcausa.org",
  },
  openGraph: {
    title: "MichCA - Michigan Cricket Association",
    description: "Official website of MichCA — Michigan Cricket Association.",
    url: "https://www.michcausa.org",
    siteName: "MichCA",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MichCA - Michigan Cricket Association",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MichCA - Michigan Cricket Association | Official Website",
    description:
      "Official website of MichCA (Michigan Cricket Association). League schedules, teams, umpires, grounds, and cricket news across Michigan.",
    images: ["/twitter-image"],
  },
};

const quickLinks = [
  { label: "Account", href: "/account" },
  { label: "Grounds", href: "/grounds" },
  { label: "Leadership", href: "/committees" },
  { label: "About Mich-CA", href: "/about" },
  { label: "Umpiring", href: "/umpiring-training" },
];

function getCurrentYear() {
  return Number.parseInt(
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      timeZone: DETROIT_TIMEZONE,
    }).format(new Date()),
    10,
  );
}

function getSeasonDateBounds(season: number) {
  return {
    start: new Date(Date.UTC(season, 0, 1)),
    end: new Date(Date.UTC(season + 1, 0, 1)),
  };
}

async function getHomeSeasonStats() {
  const season = getCurrentYear();
  const { start, end } = getSeasonDateBounds(season);
  const games = await prisma.game.findMany({
    where: {
      date: {
        gte: start,
        lt: end,
      },
    },
    select: {
      date: true,
      division: true,
      venue: true,
      team1Code: true,
      team2Code: true,
    },
  });

  const teamCodes = new Set<string>();
  const venues = new Set<string>();

  for (const game of games) {
    teamCodes.add(game.team1Code);
    teamCodes.add(game.team2Code);

    if (game.venue && game.venue !== "N/A") {
      venues.add(game.venue);
    }
  }

  return {
    season,
    teamCount: teamCodes.size,
    venueCount: venues.size,
  };
}

export default async function HomePage() {
  const stats = await getHomeSeasonStats();

  return (
    <>
      <div className="bg-background">
        <PageContainer className="pt-6">
          <div className="mx-auto max-w-5xl">
            <Card className="mb-4 border border-border/70 bg-card/80 p-4 shadow-sm md:hidden">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  Quick Links
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickLinks.map((link) => (
                    <Button key={link.href} asChild variant="outline" size="sm">
                      <Link href={link.href}>{link.label}</Link>
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
            <RegistrationBanner />
          </div>
        </PageContainer>

        <div className="py-16 sm:py-20">
          <PageContainer>
            <div className="mx-auto max-w-6xl space-y-10">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div className="space-y-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                    {stats.season} Season
                  </p>
                  <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    Mich-CA wishes every team a great season
                  </h1>
                  <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                    Play hard, play fair, and carry the spirit of cricket into
                    every match. Respect the game, the umpires, your opponents,
                    and your teammates as clubs across Michigan begin a full
                    season of league play and playoff cricket.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild size="lg">
                      <Link href="/schedule">
                        View Schedule
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                      <Link href="/teams">Browse Teams</Link>
                    </Button>
                  </div>
                </div>

                <Card className="relative overflow-hidden border border-border/70 bg-card p-6 shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
                  <div className="relative space-y-5">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Gamepad2 className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                        Fantasy League · 2026
                      </p>
                      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                        Think you know cricket? Prove it.
                      </h2>
                      <p className="text-sm leading-7 text-muted-foreground">
                        Pick winners every weekend, rack up points, and battle
                        for the top of the leaderboard. The 2026 season is live
                        — don&apos;t miss a matchday.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button asChild size="sm">
                        <Link href="/fantasy">
                          Make Predictions
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href="/fantasy/leaderboard">
                          <Trophy className="h-3.5 w-3.5" />
                          Leaderboard
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href="/fantasy/rules">
                          <BookOpen className="h-3.5 w-3.5" />
                          Rules
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  {
                    label: "Teams",
                    value: String(stats.teamCount),
                    icon: Users,
                  },
                  { label: "Divisions", value: "6", icon: Trophy },
                  {
                    label: "Venues",
                    value: String(stats.venueCount),
                    icon: MapPin,
                  },
                  { label: "Matches", value: "500+", icon: Calendar },
                  {
                    label: "Season + Playoffs",
                    value: "May - Oct",
                    icon: Calendar,
                  },
                ].map((stat) => (
                  <Card
                    key={stat.label}
                    className="border border-border/70 bg-card p-5 shadow-sm"
                  >
                    <stat.icon className="mb-4 h-6 w-6 text-primary" />
                    <p className="break-words text-2xl font-semibold tracking-tight text-foreground">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </Card>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
                <Card className="border border-border/70 bg-card p-6 shadow-md">
                  <div className="space-y-4">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Gamepad2 className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
                        Fantasy League
                      </p>
                      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                        Build your fantasy squad for the season
                      </h2>
                      <p className="text-sm leading-7 text-muted-foreground">
                        Follow your favorite players, compare performances, and
                        compete with the Mich-CA community throughout the
                        schedule.
                      </p>
                    </div>
                  </div>
                </Card>
                <FantasyBanner />
              </div>

              <Card className="border border-border/70 bg-gradient-to-r from-card via-background to-secondary/30 p-6 shadow-md">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
                      2025 Season History
                    </p>
                    <h2 className="text-2xl font-semibold text-foreground">
                      Explore last season&apos;s champions and runners-up
                      archive
                    </h2>
                    <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                      The 2025 photo gallery remains available while the 2026
                      season gets underway.
                    </p>
                  </div>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/history">
                      View 2025 History
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </PageContainer>
        </div>

        <PageContainer className="py-16">
          <Card className="p-8 md:p-12 text-center border border-border/70 bg-gradient-to-br from-card via-background to-secondary/50 shadow-md">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Join the Michigan Cricket Community
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Whether you&apos;re a player, volunteer, or cricket enthusiast,
              there&apos;s a place for you in MichCA. Explore our programs,
              committees, and upcoming events.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/about">Learn About Us</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/committees">Our Leadership</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/grounds">Find Grounds</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/history">Season History</Link>
              </Button>
            </div>
          </Card>
        </PageContainer>
      </div>
      <SiteFooter />
    </>
  );
}
