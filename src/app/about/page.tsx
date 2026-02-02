import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";

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

        <Card className="border border-primary/25 bg-gradient-to-br from-blue-50/70 via-white to-blue-50/70 p-6">
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
                    Season Schedule
                  </Link>
                  <Link href="/grounds" className="group inline-flex items-center text-foreground transition-all duration-200 hover:translate-x-1 hover:text-primary">
                    Grounds & Venues
                  </Link>
                  <Link href="/forms" className="group inline-flex items-center text-foreground transition-all duration-200 hover:translate-x-1 hover:text-primary">
                    Registration & Forms
                  </Link>
                </div>
              </div>
              
              <div className="rounded-lg border border-primary/25 bg-gradient-to-br from-blue-100/60 via-white to-blue-100/60 p-4">
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

        <Card className="space-y-4 p-6 border-primary/30 bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-md">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Our Mission</h2>
            <p className="mt-2 text-sm font-medium text-muted-foreground">Non-profit organization registered with the state of Michigan since 2001</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-primary">Quality & Standards</h3>
              <p className="text-sm text-muted-foreground">
                Control and improve the quality of cricket in Michigan, establishing policies and regulations while maintaining accountability, transparency, and integrity as core values.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-primary">Promotion & Development</h3>
              <p className="text-sm text-muted-foreground">
                Organize ODIs, T20s, and tournaments. Establish coaching academies and schemes to promote cricket welfare and eliminate unethical practices.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-primary">Sportsmanship & Ethics</h3>
              <p className="text-sm text-muted-foreground">
                Foster professionalism and ethical standards in players, officials, and administrators. Ban all forms of inequity and discrimination.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-primary">Community Building</h3>
              <p className="text-sm text-muted-foreground">
                Encourage formation of cricket clubs and teams across Michigan. Arrange matches and tournaments throughout the USA with ICC-approved organizations.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-primary">Youth Development</h3>
              <p className="text-sm text-muted-foreground">
                Organize youth coaching camps, facilitate participation in national and international tournaments, and seed cricket at school and community levels.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-primary">Governance</h3>
              <p className="text-sm text-muted-foreground">
                Appoint representatives to USA National Cricket Governing Body approved by ICC. Constitute committees to oversee various functions and development.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Teams", value: "101" },
            { label: "Divisions", value: "6" },
            { label: "Matches", value: "500+" },
            { label: "Grounds", value: "14" },
          ].map((stat) => (
            <Card
              key={stat.label}
              className="border border-primary/15 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50 p-6"
            >
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-3 text-2xl font-semibold text-foreground">{stat.value}</p>
            </Card>
          ))}
        </div>

        <Card className="space-y-6 p-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Leadership</h2>
            <p className="text-sm text-muted-foreground">
              Mich-CA is governed by charter members who constitute committees to oversee various functions. We appoint representatives to the USA National Cricket Governing Body approved by ICC, ensuring proper governance and administration of cricket in Michigan.
            </p>
          </div>
          
          <div>
            <h3 className="mb-6 text-sm font-semibold text-foreground">General Body Members</h3>
            <div className="space-y-8">
              {/* Row 1: President and Vice President */}
              <div className="flex justify-center gap-12">
                {[
                  { name: "Tayefur Rahman", role: "President", initials: "TR" },
                  { name: "Hardeep Singh", role: "Vice President", initials: "HS" },
                ].map((member, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-semibold text-white shadow-lg">
                      {member.initials}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Row 2: Secretary, Treasurer, and Committee Member */}
              <div className="flex justify-center gap-8">
                {[
                  { name: "Praveen Choudhury", role: "Secretary", initials: "PC" },
                  { name: "Ravi Chalanti", role: "Treasurer", initials: "RC" },
                  { name: "Iftekar Ahmad", role: "Public Relations", initials: "IA" }
                ].map((member, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-semibold text-white shadow-lg">
                      {member.initials}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-3 p-6">
          <h2 className="text-lg font-semibold">Sponsors & Partners</h2>
          <p className="text-sm text-muted-foreground">
            Local partners help us deliver facilities, training, and community events
            throughout the season. We welcome new sponsorships each year to grow the game.
          </p>
        </Card>
      </PageContainer>
      </div>
      <SiteFooter />
    </>
  );
}
