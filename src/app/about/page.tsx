import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import { SiteFooter } from "@/components/site-footer";
import { sponsors } from "@/lib/sponsors";

export const metadata: Metadata = {
  title: "About Michigan Cricket Association",
  description:
    "Learn about Mich-CA (Michigan Cricket Association), our mission, cricket development programs, governance, sponsors, and community impact across Michigan.",
};

export default function AboutPage() {
  return (
    <>
      <div className="bg-background py-12">
        <PageContainer className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Our Story
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
              A non-profit organization established in 2001, nurturing competitive cricket across Michigan.
            </p>
          </div>

          <Card className="space-y-5 rounded-xl border border-border/70 bg-gradient-to-br from-card via-background to-secondary/20 p-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Our Mission</h2>
              <p className="text-sm text-muted-foreground">
                Non-profit organization registered with the state of Michigan since 2001
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-primary">Quality & Standards</h3>
                <p className="text-sm text-muted-foreground">
                  Control and improve the quality of cricket in Michigan, establishing policies and regulations while maintaining accountability, transparency, and integrity as core values.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-primary">Promotion & Development</h3>
                <p className="text-sm text-muted-foreground">
                  Organize One-Dayer, T20s, leagues, and tournaments. Establish coaching academies and schemes to promote cricket welfare and eliminate unethical practices.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-primary">Sportsmanship & Ethics</h3>
                <p className="text-sm text-muted-foreground">
                  Foster professionalism and ethical standards in players, officials, and administrators. Ban all forms of inequity and discrimination.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-primary">Community Building</h3>
                <p className="text-sm text-muted-foreground">
                  Encourage formation of cricket clubs and teams across Michigan. Arrange matches and tournaments throughout the USA with ICC-approved organizations.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-primary">Youth Development</h3>
                <p className="text-sm text-muted-foreground">
                  Organize youth coaching camps, facilitate participation in national and international tournaments, and seed cricket at school and community levels.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-primary">Governance</h3>
                <p className="text-sm text-muted-foreground">
                  Appoint representatives to USA National Cricket Governing Body approved by ICC. Constitute committees to oversee various functions and development.
                </p>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Teams", value: "101" },
              { label: "Divisions", value: "7" },
              { label: "Matches", value: "500+" },
              { label: "Grounds", value: "14" },
            ].map((stat) => (
              <Card
                key={stat.label}
                className="rounded-xl border border-border/70 bg-gradient-to-br from-card via-background to-secondary/20 p-6 shadow-sm"
              >
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-foreground">{stat.value}</p>
              </Card>
            ))}
          </div>

          <Card className="space-y-3 rounded-xl border border-border/70 bg-gradient-to-br from-card via-background to-secondary/20 p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Sponsors & Partners</h2>
            <p className="text-sm text-muted-foreground">
              Local partners help us deliver facilities, training, and community events
              throughout the season. This year&apos;s lineup reflects Gold, Silver, and
              DJ support across the Mich-CA community.
            </p>
            <div className="mt-4 grid gap-4">
              {sponsors.map((sponsor) => (
                <div
                  key={sponsor.name}
                  className="rounded-xl border border-border/70 bg-card/70 p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="rounded-lg border border-border/70 bg-background p-3">
                      <Image
                        src={sponsor.logoSrc}
                        alt={sponsor.logoAlt}
                        width={180}
                        height={72}
                        className="h-[56px] w-auto object-contain dark:rounded-md dark:bg-white dark:p-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                        {sponsor.tierLabel}
                      </p>
                      <p className="text-sm text-foreground">
                        {sponsor.href ? (
                          <Link
                            href={sponsor.href}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-primary underline-offset-4 hover:underline"
                          >
                            {sponsor.name}
                          </Link>
                        ) : (
                          <span className="font-medium">{sponsor.name}</span>
                        )}{" "}
                        {sponsor.aboutDescription}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Looking back at last season? Visit our{" "}
              <Link
                href="/history"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                2025 history archive
              </Link>{" "}
              for champions and runners-up photos.
            </p>
          </Card>

          <Card className="rounded-xl border border-border/70 bg-gradient-to-br from-card via-background to-secondary/20 p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Community Archive</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We now keep season photo highlights on a dedicated archive page so current
              season updates can stay focused. Browse the 2025 champions and runners-up
              in our history section.
            </p>
            <div className="mt-4">
              <Link
                href="/history"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Open the 2025 history page
              </Link>
            </div>
          </Card>
        </PageContainer>
      </div>
      <SiteFooter />
    </>
  );
}
