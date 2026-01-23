"use client";

import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { DocCard } from "@/components/doc-card";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { assignments, documents } from "@/lib/mock-data";
import { formatMatchDateTime } from "@/lib/formatters";

export default function UmpiringPage() {
  const now = new Date();
  const upcomingAssignments = assignments.filter(
    (assignment) => new Date(assignment.date) >= now
  );
  const pastAssignments = assignments.filter(
    (assignment) => new Date(assignment.date) < now
  );
  const guidelineDocs = documents.filter((doc) => doc.category === "Umpiring");

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Umpiring
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Assignment details, match-day expectations, and support contacts.
          </p>
        </div>

        <Card className="grid gap-6 p-6 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-lg font-semibold">Public guidance</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Umpires keep MichCA matches consistent and fair. Review assignment details,
              confirm availability, and keep the guidelines handy on match day.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="mailto:umpires@michca.org">Contact Umpire Coordinator</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/forms">Open Umpiring Documents</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-lg border border-border/70 bg-card p-4">
            <p className="text-sm font-semibold text-foreground">Need a reminder?</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Keep your availability updated before weekly scheduling closes.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/forms">Update availability form</Link>
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">My Upcoming Assignments</h2>
          {upcomingAssignments.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingAssignments.map((assignment) => (
                <Card key={assignment.id} className="space-y-2 p-6">
                  <p className="text-sm font-semibold text-muted-foreground">
                    {formatMatchDateTime(assignment.date)}
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {assignment.matchLabel}
                  </p>
                  <p className="text-sm text-muted-foreground">{assignment.venue}</p>
                  <p className="text-sm text-muted-foreground">Role: {assignment.role}</p>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No upcoming assignments"
              description="Assignments will appear here once scheduled."
            />
          )}
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="past">
            <AccordionTrigger>Past Assignments</AccordionTrigger>
            <AccordionContent>
              {pastAssignments.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {pastAssignments.map((assignment) => (
                    <Card key={assignment.id} className="space-y-2 p-6">
                      <p className="text-sm font-semibold text-muted-foreground">
                        {formatMatchDateTime(assignment.date)}
                      </p>
                      <p className="text-base font-semibold text-foreground">
                        {assignment.matchLabel}
                      </p>
                      <p className="text-sm text-muted-foreground">{assignment.venue}</p>
                      <p className="text-sm text-muted-foreground">
                        Role: {assignment.role}
                      </p>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No past assignments"
                  description="Your completed matches will show up here."
                />
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Guidelines & Resources</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guidelineDocs.map((doc) => (
              <DocCard key={doc.id} doc={doc} />
            ))}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
