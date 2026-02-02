import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
           Michigan Cricket Association
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
            A non-profit organization established in 2001, nurturing competitive cricket across Michigan
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

        <Card className="border border-primary/25 bg-gradient-to-br from-blue-50/70 via-white to-red-50/70 p-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Season Hub
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">
                A single place to keep clubs, players, and officials aligned.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                From Pre-Season registrations to Finals day, MichCA's online portal centralizes all league activities.
              </p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-primary/25 bg-gradient-to-br from-blue-100/60 via-white to-red-100/60 p-4">
                <p className="text-sm font-semibold text-foreground">Quick Links</p>
                <div className="mt-3 grid gap-2 text-sm">
                  <Link href="/schedule" className="group inline-flex items-center text-foreground transition-all duration-200 hover:translate-x-1 hover:text-primary">
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span> Season Schedule
                  </Link>
                  <Link href="/grounds" className="group inline-flex items-center text-foreground transition-all duration-200 hover:translate-x-1 hover:text-primary">
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span> Grounds & Venues
                  </Link>
                  <Link href="/forms" className="group inline-flex items-center text-foreground transition-all duration-200 hover:translate-x-1 hover:text-primary">
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span> Registration & Forms
                  </Link>
                </div>
              </div>
              
              <div className="rounded-lg border border-primary/25 bg-gradient-to-br from-blue-100/60 via-white to-red-100/60 p-4">
                <p className="text-sm font-semibold text-foreground">Connect With Us</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    href="https://www.facebook.com/MichiganCricketAssociationUSA/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-200 hover:scale-110 hover:bg-primary hover:text-primary-foreground"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </Link>
                  <Link
                    href="https://www.instagram.com/michca2001/?hl=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-200 hover:scale-110 hover:bg-primary hover:text-primary-foreground"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </Link>
                  <Link
                    href="https://www.youtube.com/channel/UCsFOLC2_wHIVfSAkTqZrwQA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-200 hover:scale-110 hover:bg-primary hover:text-primary-foreground"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-5 w-5" />
                  </Link>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Follow us for updates, highlights, and community events
                </p>
              </div>
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
              To control and improve the quality and standards of cricket in Michigan, recognizing that players and cricket fans are our primary stakeholders. We are committed to accountability, transparency, and integrity as our core values, while promoting and developing the game through tournaments, coaching schemes, and cricket academies.
            </p>
          </Card>
          <Card className="space-y-3 p-6">
            <h2 className="text-lg font-semibold">What We Do</h2>
            <p className="text-sm text-muted-foreground">
              Organize and conduct tournaments including Test Matches, ODIs, and T20 formats. We encourage formation of cricket clubs and teams, arrange matches across the USA, and foster sportsmanship among school, college, and university students.
            </p>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="space-y-3 p-6">
            <h2 className="text-lg font-semibold">Programs</h2>
            <p className="text-sm text-muted-foreground">
              Youth cricket coaching camps, facilitating young cricketers to play in national and international tournaments, and seeding the game at school and community levels to provide opportunities for youth to learn, play, and master cricket.
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
              Sportsmanship, professionalism, transparency, and ethical standards in all aspects of cricket. We ban all forms of inequity and discrimination, promoting elimination of unethical and unfair practices in the game.
            </p>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-3 p-6">
            <h2 className="text-lg font-semibold">Leadership</h2>
            <p className="text-sm text-muted-foreground">
              Mich-CA is governed by charter members who constitute committees to oversee various functions. We appoint representatives to the USA National Cricket Governing Body approved by ICC, ensuring proper governance and administration of cricket in Michigan.
            </p>
          </Card>
          <Card className="space-y-3 p-6">
            <h2 className="text-lg font-semibold">Contact</h2>
            <p className="text-sm text-muted-foreground">
              Detroit, Michigan 48310
              <br />
              Registered non-profit organization
              <br />
              Email: info@michca.org
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
