import Link from "next/link";
import { Flame, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/page-container";
import { SiteFooter } from "@/components/site-footer";

export function PlayoffHomePage() {
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

      <SiteFooter />
    </div>
  );
}
