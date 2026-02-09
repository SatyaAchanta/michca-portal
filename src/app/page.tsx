import Link from "next/link";
import Image from "next/image";
import { Trophy, Calendar, Users, ArrowRight, DollarSign } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { RegistrationBanner } from "@/components/registration-banner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const champions = [
  { division: "Premier Division - T20", image: "/docs/premier-champions.jpg", year: "2025", teamName: "Greater Detroit CC Panthers" },
  { division: "Division I - T20", image: "/docs/division-1-champions.jpg", year: "2025", teamName: "Killers CC" },
  { division: "Division II - T20", image: "/docs/div-II-champions.jpg", year: "2025", teamName: "Michigan International CA Thunderbirds" },
  { division: "Division III - T20", image: "/docs/div-III-champions.jpg", year: "2025", teamName: "Big League Arena CC Knights" },
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
              <Dialog key={champion.division}>
                <DialogTrigger asChild>
                  <Card
                    className="cursor-zoom-in overflow-hidden border border-border/70 bg-gradient-to-br from-card via-background to-secondary/50 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-secondary/70 to-background">
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
                        <h3 className="text-base font-semibold text-foreground">
                          {champion.division}
                        </h3>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {champion.teamName}
                      </p>
                    </div>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-black">
                    <Image
                      src={champion.image}
                      alt={`${champion.division} Champions ${champion.year}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <DialogHeader className="px-4 pb-4 pt-3 sm:px-6">
                    <DialogTitle>{champion.division}</DialogTitle>
                    <DialogDescription>
                      {champion.teamName} - {champion.year} Champions
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </PageContainer>

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
                { label: "Divisions", value: "6", icon: Trophy },
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
