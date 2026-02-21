import Link from "next/link";
import Image from "next/image";
import { Trophy, Calendar, Users, DollarSign, Handshake } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteFooter } from "@/components/site-footer";
import { RegistrationBanner } from "@/components/registration-banner";
import { SeasonResultsShowcase } from "@/components/season-results-showcase";

export default function HomePage() {
  const collaborationMessage = (
    <div className="mx-auto max-w-4xl space-y-4 text-left text-sm leading-7 text-muted-foreground sm:text-base">
      <p>
        The Michigan Cricket Association (Mich-CA) is proud to announce that{" "}
        <Link
          href="https://www.lincode.ai"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Lincode
        </Link>{" "}
        has renewed its sponsorship for another year to support the successful conduct of our
        cricket league.
      </p>
      <p>
        <Link
          href="https://www.lincode.ai"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Lincode
        </Link>{" "}
        is an artificial intelligence and computer vision organization dedicated to
        transforming manufacturing quality inspection. Their flagship product, LIVIS (Lincode
        Intelligent Visual Inspection System), enables real-time quality inspections of components,
        assemblies, and packaging using advanced AI technology. With a powerful no-code platform,
        LIVIS empowers engineers, machine operators, and quality managers to train and deploy AI
        models efficiently across production lines, making visual inspection faster, more accurate,
        and highly scalable.
      </p>
      <p>
        We are deeply grateful for{" "}
        <Link
          href="https://www.lincode.ai"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Lincode
        </Link>
        &apos;s continued partnership and commitment to supporting community-driven initiatives like
        Mich-CA. Their investment strengthens our ability to organize competitive, well-structured,
        and inclusive cricket leagues that bring together players, families, and supporters across
        Michigan.
      </p>
      <p>
        On behalf of the entire Mich-CA leadership, players, volunteers, and supporters, we extend
        our sincere appreciation to{" "}
        <Link
          href="https://www.lincode.ai"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Lincode
        </Link>{" "}
        for believing in our mission and helping us grow the sport of cricket in Michigan.
      </p>
      <p>We look forward to another exciting and successful season together.</p>
      <p className="pt-2 text-foreground">
        With appreciation,
        <br />
        <span className="font-medium">Tayefur Rahman</span>
        <br />
        Chairman, Mich-CA
      </p>
    </div>
  );

  return (
    <>
      <div className="bg-background">
        {/* Registration Deadline Banner */}
        <PageContainer className="pt-6">
          <div className="mx-auto max-w-xl">
            <RegistrationBanner />
          </div>
        </PageContainer>

        {/* Sponsor Thank You Section */}
        <div className="relative bg-gradient-to-b from-background via-primary/5 to-primary/10 py-20">
          <PageContainer>
            <div className="mx-auto max-w-5xl space-y-8">
              <div className="flex flex-col items-center justify-center gap-5 text-center sm:flex-row sm:gap-8">
                <div className="rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm">
                  <Image
                    src="/michca.png"
                    alt="Michigan Cricket Association"
                    width={110}
                    height={110}
                    className="h-[88px] w-auto sm:h-[96px]"
                  />
                </div>
                <Handshake className="h-10 w-10 text-primary sm:h-12 sm:w-12" aria-label="partnership" />
                <div className="rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm">
                  <Image
                    src="/docs/lincode-logo.webp"
                    alt="Lincode"
                    width={220}
                    height={110}
                    className="h-[88px] w-auto sm:h-[96px] dark:rounded-md dark:bg-white dark:p-1.5"
                  />
                </div>
              </div>
              <div className="space-y-5 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  Thank You to{" "}
                  <Link
                    href="https://www.lincode.ai"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Lincode
                  </Link>{" "}
                  for Renewing Their Support for Mich-CA
                </h1>
                <div className="hidden md:block">{collaborationMessage}</div>
                <div className="mx-auto w-full max-w-4xl md:hidden">
                  <Accordion type="single" collapsible className="rounded-lg border border-border/70 bg-card/60 px-4">
                    <AccordionItem value="collaboration-message" className="border-b-0">
                      <AccordionTrigger className="text-left text-sm text-foreground hover:no-underline">
                        Read about about our collaboration
                      </AccordionTrigger>
                      <AccordionContent>{collaborationMessage}</AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
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
