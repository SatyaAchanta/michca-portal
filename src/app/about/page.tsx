import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            About Michigan Cricket Association
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Michigan Cricket Association nurtures competitive cricket across the state.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link href="/schedule">View Schedule</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/forms">Forms & Documents</Link>
            </Button>
          </div>
        </div>

        <Card className="grid gap-4 border border-primary/25 bg-gradient-to-br from-blue-50/70 via-white to-red-50/70 p-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Season Hub
            </p>
            <h2 className="text-2xl font-semibold text-foreground">
              A single place to keep clubs, players, and officials aligned.
            </h2>
            <p className="text-sm text-muted-foreground">
              From weekly fixtures to day-of match details, MichCA keeps everything
              organized so teams can focus on the game.
            </p>
          </div>
          <div className="rounded-lg border border-primary/25 bg-gradient-to-br from-blue-100/60 via-white to-red-100/60 p-4">
            <p className="text-sm font-semibold text-foreground">Quick links</p>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <Link href="/schedule" className="text-foreground hover:text-primary">
                Season schedule
              </Link>
              <Link href="/forms" className="text-foreground hover:text-primary">
                Registration & policies
              </Link>
              <Link href="/about" className="text-foreground hover:text-primary">
                League overview
              </Link>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Teams", value: "42+" },
            { label: "Divisions", value: "5" },
            { label: "Matches", value: "220+" },
            { label: "Volunteers", value: "60+" },
          ].map((stat) => (
            <Card
              key={stat.label}
              className="border border-primary/15 bg-gradient-to-br from-blue-50/50 via-white to-red-50/50 p-6"
            >
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-3 text-2xl font-semibold text-foreground">{stat.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="space-y-3 p-6">
            <h2 className="text-lg font-semibold">Our Mission</h2>
            <p className="text-sm text-muted-foreground">
              Provide structured leagues, develop talent pipelines, and foster inclusive
              cricket communities across Michigan. We focus on competitive integrity,
              player development, and a welcoming match-day experience.
            </p>
          </Card>
          <Card className="space-y-3 p-6">
            <h2 className="text-lg font-semibold">What We Do</h2>
            <p className="text-sm text-muted-foreground">
              Manage seasonal fixtures, train officials, support clubs, and coordinate
              venues across metro and regional hubs.
            </p>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="space-y-3 p-6">
            <h2 className="text-lg font-semibold">Programs</h2>
            <p className="text-sm text-muted-foreground">
              League play, youth development, umpire certification, and community outreach
              clinics run throughout the year.
            </p>
          </Card>
          <Card className="space-y-3 p-6">
            <h2 className="text-lg font-semibold">Season Format</h2>
            <p className="text-sm text-muted-foreground">
              Regular-season fixtures lead into playoffs and finals across multiple
              divisions to keep competition balanced.
            </p>
          </Card>
          <Card className="space-y-3 p-6">
            <h2 className="text-lg font-semibold">Values</h2>
            <p className="text-sm text-muted-foreground">
              Fair play, respect, inclusion, and community partnership guide every match
              day.
            </p>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-3 p-6">
            <h2 className="text-lg font-semibold">Leadership</h2>
            <p className="text-sm text-muted-foreground">
              A volunteer committee oversees scheduling, umpiring, operations, and
              community outreach for the league. Captains represent each division.
            </p>
          </Card>
          <Card className="space-y-3 p-6">
            <h2 className="text-lg font-semibold">Contact</h2>
            <p className="text-sm text-muted-foreground">
              Email: info@michca.org
              <br />
              Phone: (555) 012-1987
            </p>
          </Card>
        </div>

        <Card className="space-y-3 p-6">
          <h2 className="text-lg font-semibold">Sponsors & Partners</h2>
          <p className="text-sm text-muted-foreground">
            Local partners help us deliver facilities, training, and community events
            throughout the season. We welcome new sponsorships each year to grow the game.
          </p>
        </Card>
      </PageContainer>
    </div>
  );
}
