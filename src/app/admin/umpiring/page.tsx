import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AdminFilters } from "@/components/umpiring-training/admin-filters";
import {
  formatName,
  formatResultLabel,
  formatSubmittedDate,
  parseDateFilterParam,
  parseLocationFilterParam,
  resultBadgeClass,
} from "@/components/umpiring-training/admin-formatters";
import { ResultCell } from "@/components/umpiring-training/result-cell";
import { prisma } from "@/lib/prisma";
import { canAccessAdminSection } from "@/lib/roles";
import {
  AuthenticationRequiredError,
  InsufficientRoleError,
  requireAnyAdminRole,
} from "@/lib/user-profile";
import { Prisma } from "@/generated/prisma/client";

type PageProps = {
  searchParams?: Promise<{ dates?: string; locations?: string }>;
};

export default async function AdminUmpiringPage({ searchParams }: PageProps) {
  let userProfile;
  try {
    userProfile = await requireAnyAdminRole();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) redirect("/sign-in");
    if (error instanceof InsufficientRoleError) redirect("/");
    throw error;
  }

  if (!canAccessAdminSection(userProfile.role, "umpiring")) {
    redirect("/admin");
  }

  const resolved = searchParams ? await searchParams : undefined;
  const selectedDates = parseDateFilterParam(resolved?.dates);
  const selectedLocations = parseLocationFilterParam(resolved?.locations);

  const where: Prisma.UmpiringTrainingWhereInput = {};
  if (selectedDates.length > 0) {
    where.preferredDates = { hasSome: selectedDates };
  }
  if (selectedLocations.length > 0) {
    where.preferredLocation = { in: selectedLocations };
  }

  const registrations = await prisma.umpiringTraining.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      preferredLocation: true,
      result: true,
    },
  });

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-1">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Admin
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Umpiring
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Individual umpiring training signups and result management.
          </p>
        </div>

        <AdminFilters
          initialDates={selectedDates}
          initialLocations={selectedLocations}
        />

        {registrations.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              No registrations found.
            </p>
          </Card>
        ) : (
          <>
            <Card className="hidden overflow-x-auto p-0 md:block">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-muted/60 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Current Result</th>
                    <th className="px-4 py-3 font-medium">Update Result</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-border align-top odd:bg-background even:bg-muted/20"
                    >
                      <td className="px-4 py-3 font-medium">
                        {formatName(r.firstName, r.lastName)}
                      </td>
                      <td className="px-4 py-3">{r.email}</td>
                      <td className="px-4 py-3">{r.preferredLocation}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={resultBadgeClass(r.result)}
                        >
                          {formatResultLabel(r.result)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <ResultCell id={r.id} initialResult={r.result} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <div className="md:hidden">
              <Card className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {registrations.map((r) => (
                    <AccordionItem key={r.id} value={r.id} className="px-4">
                      <AccordionTrigger className="text-left">
                        <div>
                          <p className="text-sm font-medium">
                            {formatName(r.firstName, r.lastName)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {r.email}
                          </p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pb-2 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              Location
                            </span>
                            <span>{r.preferredLocation}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              Current Result
                            </span>
                            <Badge
                              variant="outline"
                              className={resultBadgeClass(r.result)}
                            >
                              {formatResultLabel(r.result)}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="text-muted-foreground">
                              Update Result
                            </p>
                            <ResultCell id={r.id} initialResult={r.result} />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            </div>
          </>
        )}
      </PageContainer>
    </div>
  );
}
