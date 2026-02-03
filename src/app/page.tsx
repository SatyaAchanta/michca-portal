import Link from "next/link";
import Image from "next/image";
import { Trophy, Calendar, Users, ArrowRight, DollarSign } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { RegistrationBanner } from "@/components/registration-banner";

const champions = [
  { division: "Premier Division", image: "/docs/premier-champions.jpg", year: "2025", teamName: "Greater Detroit CC Panthers" },
  { division: "Division I", image: "/docs/division-1-champions.jpg", year: "2025", teamName: "Killers CC" },
  { division: "Division II", image: "/docs/div-II-champions.jpg", year: "2025", teamName: "Michigan International CA Thunderbirds" },
  { division: "Division III", image: "/docs/div-III-champions.jpg", year: "2025", teamName: "Big League Arena CC Knights" },
  { division: "F40", image: "/docs/f40-champions.jpg", year: "2025", teamName: "Nirvana CC" },
  { division: "T30", image: "/docs/t30-champions.jpg", year: "2025", teamName: "Michigan Rangers CC" },
];

export default function HomePage() {
  return (
    <>
      <div className="bg-background">
        {/* Registration Deadline Banner */}
        <PageContainer className="pt-6">
          <div className="mx-auto max-w-xl">
            <RegistrationBanner />
          </div>
        </PageContainer>

        {/* Hero Section */}
        <div className="relative border-primary/30 bg-gradient-to-br from-white via-blue-50 to-blue-100 shadow-md py-20">
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
                2025 Season Champions - Showcasing the best of competitive cricket in Michigan
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

        {/* Champions Showcase */}
        <PageContainer className="py-16 space-y-12">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <Trophy className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              2025 Season Champions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Congratulations to all our division winners for their outstanding performance this season
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {champions.map((champion) => (
              <Card 
                key={champion.division}
                className="overflow-hidden border border-primary/25 bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50">
                  <Image
                    src={champion.image}
                    alt={`${champion.division} Champions ${champion.year}`}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base text-foreground">
                      {champion.division}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {champion.teamName}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </PageContainer>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-16">
          <PageContainer>
            <div className="text-center space-y-2 mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                2025 Season Stats
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Teams", value: "101", icon: Users },
                { label: "Divisions", value: "6", icon: Trophy },
                { label: "Matches", value: "500+", icon: Calendar },
                { label: "Prize Money", value: "$10k+", icon: DollarSign },
              ].map((stat) => (
                <Card
                  key={stat.label}
                  className="text-center p-6 border border-primary/25 bg-white shadow-md"
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
          <Card className="p-8 md:p-12 text-center border border-primary/25 bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-md">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Join the Michigan Cricket Community
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Whether you're a player, volunteer, or cricket enthusiast, there's a place for you in MichCA. 
              Explore our programs, committees, and upcoming events.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/about">Learn About Us</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/committees">View Committees</Link>
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

