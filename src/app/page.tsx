import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Gamepad2, Sparkles, Trophy } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
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
  { label: "Schedule", href: "/schedule" },
  { label: "Fantasy", href: "/fantasy" },
  { label: "Madness", href: "/michca-madness" },
];

function PostseasonAnnouncement() {
  return (
    <Card className="border-red-500/20 bg-gradient-to-br from-red-50 via-background to-amber-50 p-5 shadow-sm dark:from-red-950/20 dark:via-background dark:to-amber-950/20 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
            <Trophy className="h-6 w-6" />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-red-700 dark:text-red-300">
              Playoff Push
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Playoffs, fantasy stakes, and MichCA-Madness are heating up
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              F40 and T30 are almost at playoff time. Follow the schedule, make
              your fantasy picks for 3x playoff points, and get ready for
              MichCA-Madness brackets opening during the week of August 3.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="destructive" className="shrink-0">
            <Link href="/michca-madness">
              Madness
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/fantasy">Fantasy</Link>
          </Button>
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/schedule">Schedule</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function PlayoffSpotlight() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="border border-border/70 bg-card p-6 shadow-md">
        <div className="space-y-5">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
              Playoff Schedule
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Track the road to the finals
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              F40 and T30 are moving toward their biggest games. Keep an eye on
              dates, venues, and matchups as playoff fixtures are confirmed.
            </p>
          </div>
          <Button asChild>
            <Link href="/schedule">
              View Schedule
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Card>

      <Card className="border-amber-500/25 bg-gradient-to-br from-amber-50 via-background to-card p-6 shadow-md dark:from-amber-950/20 dark:via-background dark:to-card">
        <div className="space-y-5">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-white">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700 dark:text-amber-300">
              Fantasy Playoffs
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Playoff games count 3x
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Regular fantasy picks matter even more in the postseason. Each
              playoff game is worth 3x points, so one correct call can move the
              leaderboard.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/fantasy">
              Make Fantasy Picks
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Card>

      <Card className="border-red-500/20 bg-gradient-to-br from-red-50 via-background to-amber-50 p-6 shadow-md dark:from-red-950/20 dark:via-background dark:to-amber-950/20">
        <div className="space-y-5">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-red-700 dark:text-red-300">
              MichCA-Madness
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Build the perfect bracket
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              F40 and T30 brackets open during the week of August 3. Once they
              open, pick each division from the first playoff game through the
              final and stay perfect as the postseason moves forward.
            </p>
          </div>
          <Button asChild variant="destructive">
            <Link href="/michca-madness">
              Open Madness
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

function getCurrentYear() {
  return Number.parseInt(
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      timeZone: DETROIT_TIMEZONE,
    }).format(new Date()),
    10,
  );
}

export default function HomePage() {
  const season = getCurrentYear();

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
            {/* <RegistrationBanner /> */}
            <div className="mt-4">
              <PostseasonAnnouncement />
            </div>
          </div>
        </PageContainer>

        <div className="py-16 sm:py-20">
          <PageContainer>
            <div className="mx-auto max-w-6xl space-y-10">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div className="space-y-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                    {season} Playoffs
                  </p>
                  <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    F40 and T30 playoffs are right around the corner
                  </h1>
                  <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                    The regular-season push is giving way to knockout pressure.
                    Follow the playoff race, watch the bracket take shape, and
                    get ready for F40 and T30 MichCA-Madness brackets to open
                    during the week of August 3.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild size="lg">
                      <Link href="/schedule">
                        View Schedule
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                      <Link href="/fantasy">Fantasy 3x Picks</Link>
                    </Button>
                  </div>
                </div>

                <Card className="relative overflow-hidden border border-border/70 bg-card p-6 shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-amber-500/10 pointer-events-none" />
                  <div className="relative space-y-5">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                        Season Hub
                      </p>
                      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                        Three ways to follow the race
                      </h2>
                      <p className="text-sm leading-7 text-muted-foreground">
                        Check the playoff schedule, make fantasy picks for 3x
                        points, and get ready for F40 and T30 brackets opening
                        during the week of August 3.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button asChild size="sm">
                        <Link href="/schedule">
                          Schedule
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href="/fantasy">Fantasy</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href="/michca-madness">Madness</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              <PlayoffSpotlight />

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
