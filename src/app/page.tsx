import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Trophy, Calendar, Users, DollarSign, ArrowRight } from "lucide-react";

import { PageContainer } from "@/components/page-container";

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
  },
};
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { RegistrationBanner } from "@/components/registration-banner";
import { sponsors } from "@/lib/sponsors";

const quickLinks = [
  { label: "Account", href: "/account" },
  { label: "Grounds", href: "/grounds" },
  { label: "Leadership", href: "/committees" },
  { label: "About Mich-CA", href: "/about" },
  { label: "Umpiring", href: "/umpiring-training" },
];

export default function HomePage() {
  const [authentikkaSponsor, lincodeSponsor, djSponsor] = sponsors;
  const featuredSponsors = [authentikkaSponsor, lincodeSponsor];
  const featuredSponsorSummaries: Record<string, string> = {
    [authentikkaSponsor.name]:
      "Food, hospitality, and community energy supporting Mich-CA throughout the 2026 season.",
    [lincodeSponsor.name]:
      "AI and computer vision expertise helping strengthen league operations and the wider cricket community.",
  };

  return (
    <>
      <div className="bg-background">
        {/* Homepage Banner */}
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

        {/* Sponsor Section */}
        <div className="relative bg-gradient-to-b from-background via-primary/5 to-primary/10 py-20">
          <PageContainer>
            <div className="mx-auto max-w-6xl space-y-8">
              <div className="max-w-3xl space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                  2026 Sponsors & Partners
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  Mich-CA partnerships powering the{" "}
                  <span className="whitespace-nowrap">2026 season</span>
                </h1>
                <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                  Our sponsor lineup for the 2026 campaign is led by two Gold
                  Sponsors and backed by an event partner helping shape the
                  atmosphere around the season.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {featuredSponsors.map((sponsor) => (
                  <Card
                    key={sponsor.name}
                    className="overflow-hidden border border-amber-500/30 bg-gradient-to-br from-amber-50 via-card to-orange-100 p-8 shadow-lg dark:from-amber-500/10 dark:via-card dark:to-orange-500/10"
                  >
                    <div className="flex h-full flex-col gap-5">
                      <div className="space-y-3">
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700 dark:text-amber-400">
                          {sponsor.tierLabel}
                        </p>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                          {sponsor.name}
                        </h2>
                        <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                          {featuredSponsorSummaries[sponsor.name] ??
                            sponsor.homeDescription}
                        </p>
                      </div>
                      {sponsor.offers?.length ? (
                        <div className="rounded-2xl border border-amber-500/20 bg-background/70 p-4">
                          <p className="text-sm font-medium text-foreground">
                            Exclusive Mich-CA offers
                          </p>
                          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            {sponsor.offers.map((offer) => (
                              <li key={offer}>{offer}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-amber-500/20 bg-background/70 p-4">
                          <p className="text-sm font-medium text-foreground">
                            Partnership focus
                          </p>
                          <p className="mt-3 text-sm text-muted-foreground">
                            Supporting Mich-CA through technology, operations,
                            and long-term league growth.
                          </p>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-3">
                        <Button asChild size="lg">
                          <Link
                            href={sponsor.href ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {sponsor.name === "Lincode"
                              ? "Visit Lincode"
                              : "Visit Authentikka Wixom"}
                          </Link>
                        </Button>
                        <p className="text-sm font-medium text-foreground">
                          {sponsor.highlight}
                        </p>
                      </div>
                      <div className="mt-auto rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm">
                        <Image
                          src={sponsor.logoSrc}
                          alt={sponsor.logoAlt}
                          width={560}
                          height={260}
                          className="h-auto w-full object-contain"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-1">
                {[djSponsor].map((sponsor) => (
                  <Card
                    key={sponsor.name}
                    className="border border-border/70 bg-card/90 p-6 shadow-md"
                  >
                    <div className="flex h-full flex-col gap-5">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                          {sponsor.tierLabel}
                        </p>
                        <h3 className="text-2xl font-semibold text-foreground">
                          {sponsor.name}
                        </h3>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-background p-4">
                        <Image
                          src={sponsor.logoSrc}
                          alt={sponsor.logoAlt}
                          width={320}
                          height={140}
                          className="h-20 w-full object-contain"
                        />
                      </div>
                      <p className="text-sm leading-7 text-muted-foreground">
                        {sponsor.homeDescription}
                      </p>
                      <div className="mt-auto flex items-center justify-between gap-4">
                        <p className="text-sm font-medium text-foreground">
                          {sponsor.highlight ?? "Season partner"}
                        </p>
                        {sponsor.href ? (
                          <Link
                            href={sponsor.href}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                          >
                            Learn more
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </Card>
                ))}
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
                      The 2025 photo gallery now lives on a dedicated history
                      page so the homepage can stay focused on this
                      season&apos;s sponsors and league updates.
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

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-secondary/40 via-background to-secondary/30 py-16">
          <PageContainer>
            <div className="text-center space-y-2 mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                2025 Season Stats
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Teams", value: "101", icon: Users },
                { label: "Divisions", value: "7", icon: Trophy },
                { label: "Matches", value: "500+", icon: Calendar },
                { label: "Prize Money", value: "$10k+", icon: DollarSign },
              ].map((stat) => (
                <Card
                  key={stat.label}
                  className="text-center p-6 border border-border/70 bg-card shadow-md"
                >
                  <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </Card>
              ))}
            </div>
          </PageContainer>
        </div>

        {/* Call to Action */}
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
