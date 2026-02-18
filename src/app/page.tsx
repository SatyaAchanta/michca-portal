import Link from "next/link";
import Image from "next/image";
import { Trophy, Calendar, Users, ArrowRight, DollarSign } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { RegistrationBanner } from "@/components/registration-banner";
import { SeasonResultsShowcase } from "@/components/season-results-showcase";

export default function HomePage() {
  return (
    <>
      <div className="bg-background">
        {/* Registration Deadline Banner */}
        <PageContainer className="pt-6">
          <div className="mx-auto max-w-xl">
            <RegistrationBanner />
          </div>
          <div className="mx-auto mt-3 max-w-xl rounded-lg border border-primary/35 bg-primary/10 px-4 py-3 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Zelle Payment Info
            </p>
            <p className="mt-1 text-sm text-foreground">
              For MichCA payments, use the official Zelle email:
            </p>
            <p className="mt-1 break-all text-sm font-semibold text-foreground sm:text-base">
              micricketfinance@gmail.com
            </p>
          </div>
        </PageContainer>

        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-background via-primary/5 to-primary/10 py-20">
          <PageContainer>
            <div className="mx-auto max-w-4xl text-center space-y-6">
              <div className="flex justify-center mb-6">
                <Image 
                  src="/michca.png" 
                  alt="Michigan Cricket Association" 
                  width={120} 
                  height={120}
                  className="drop-shadow-md"
                />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Celebrating Excellence in Michigan Cricket
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl">
                Showcasing the best of competitive cricket in Michigan
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Button asChild size="lg">
                  <Link href="/schedule">
                    <Calendar className="h-5 w-5" />
                    View Schedule
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/forms">
                    Register Your Team
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </PageContainer>
        </div>

        <SeasonResultsShowcase />

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
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
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
              Whether you&apos;re a player, volunteer, or cricket enthusiast, there&apos;s a place for you in MichCA.
              Explore our programs, committees, and upcoming events.
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
            </div>
          </Card>
        </PageContainer>
      </div>
      <SiteFooter />
    </>
  );
}
