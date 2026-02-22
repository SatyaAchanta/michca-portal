import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { UserRole } from "@/generated/prisma/client";

import { PageContainer } from "@/components/page-container";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ResultCell } from "@/components/umpiring-training/result-cell";
import {
  AuthenticationRequiredError,
  InsufficientRoleError,
  requireRole,
} from "@/lib/user-profile";
import { prisma } from "@/lib/prisma";
import {
  formatName,
  formatPreferredDate,
  formatSubmittedDate,
  resultBadgeClass,
} from "@/components/umpiring-training/admin-formatters";

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  try {
    await requireRole(UserRole.ADMIN);
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      redirect("/sign-in");
    }
    if (error instanceof InsufficientRoleError) {
      redirect("/");
    }
    throw error;
  }

  const registrations = await prisma.umpiringTraining.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      contactNumber: true,
      dietaryPreference: true,
      previouslyCertified: true,
      affiliation: true,
      preferredDate: true,
      preferredLocation: true,
      questions: true,
      result: true,
      createdAt: true,
    },
  });

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Admin</h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Umpiring training registrations.
          </p>
        </div>

        {registrations.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">No registrations found.</p>
          </Card>
        ) : null}

        {registrations.length > 0 ? (
          <>
            <Card className="hidden overflow-x-auto p-0 md:block">
              <table className="w-full min-w-[1160px] text-sm">
                <thead className="bg-muted/60 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Dietary</th>
                    <th className="px-4 py-3 font-medium">Certified</th>
                    <th className="px-4 py-3 font-medium">Affiliation</th>
                    <th className="px-4 py-3 font-medium">Preferred Date</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Questions</th>
                    <th className="px-4 py-3 font-medium">Current Result</th>
                    <th className="px-4 py-3 font-medium">Update Result</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((registration) => (
                    <tr
                      key={registration.id}
                      className="border-t border-border align-top odd:bg-background even:bg-muted/20"
                    >
                      <td className="px-4 py-3 font-medium">
                        {formatName(registration.firstName, registration.lastName)}
                      </td>
                      <td className="px-4 py-3">{registration.email}</td>
                      <td className="px-4 py-3">{registration.contactNumber}</td>
                      <td className="px-4 py-3">
                        {registration.dietaryPreference === "VEGETARIAN"
                          ? "Vegetarian"
                          : "Non-Vegetarian"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {registration.previouslyCertified ? "Yes" : "No"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{registration.affiliation ?? "-"}</td>
                      <td className="px-4 py-3">{formatPreferredDate(registration.preferredDate)}</td>
                      <td className="px-4 py-3">{registration.preferredLocation}</td>
                      <td className="max-w-[260px] px-4 py-3 whitespace-pre-wrap break-words">
                        {registration.questions ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={resultBadgeClass(registration.result)}>
                          {registration.result}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <ResultCell id={registration.id} initialResult={registration.result} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatSubmittedDate(registration.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <div className="md:hidden">
              <Card className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {registrations.map((registration) => (
                    <AccordionItem key={registration.id} value={registration.id} className="px-4">
                      <AccordionTrigger className="text-left">
                        <div>
                          <p className="text-sm font-medium">
                            {formatName(registration.firstName, registration.lastName)}
                          </p>
                          <p className="text-xs text-muted-foreground">{registration.email}</p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pb-2 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Contact</span>
                            <span>{registration.contactNumber}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Certified</span>
                            <Badge variant="outline">
                              {registration.previouslyCertified ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Dietary</span>
                            <span>
                              {registration.dietaryPreference === "VEGETARIAN"
                                ? "Vegetarian"
                                : "Non-Vegetarian"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Affiliation</span>
                            <span>{registration.affiliation ?? "-"}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Preferred Date</span>
                            <span>{formatPreferredDate(registration.preferredDate)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Location</span>
                            <span>{registration.preferredLocation}</span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-muted-foreground">Questions</p>
                            <p className="whitespace-pre-wrap break-words">
                              {registration.questions ?? "-"}
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Current Result</span>
                            <Badge
                              variant="outline"
                              className={resultBadgeClass(registration.result)}
                            >
                              {registration.result}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="text-muted-foreground">Update Result</p>
                            <ResultCell id={registration.id} initialResult={registration.result} />
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Submitted</span>
                            <span>{formatSubmittedDate(registration.createdAt)}</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            </div>
          </>
        ) : null}
      </PageContainer>
    </div>
  );
}
