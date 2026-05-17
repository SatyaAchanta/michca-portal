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
import { Card } from "@/components/ui/card";
import { formatSubmittedDate } from "@/components/umpiring-training/admin-formatters";
import { prisma } from "@/lib/prisma";
import { canAccessAdminSection } from "@/lib/roles";
import {
  AuthenticationRequiredError,
  InsufficientRoleError,
  requireAnyAdminRole,
} from "@/lib/user-profile";

export default async function AdminYouth15Page() {
  let userProfile;
  try {
    userProfile = await requireAnyAdminRole();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) redirect("/sign-in");
    if (error instanceof InsufficientRoleError) redirect("/");
    throw error;
  }

  if (!canAccessAdminSection(userProfile.role, "youth15")) {
    redirect("/admin");
  }

  const registrations = await prisma.youth15Registration.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      clubName: true,
      presidentName: true,
      presidentEmail: true,
      presidentPhoneNumber: true,
      secretaryName: true,
      secretaryEmail: true,
      secretaryPhoneNumber: true,
      createdAt: true,
      updatedAt: true,
      userProfile: { select: { email: true } },
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
            Youth 15
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Club-level registrations submitted through the Youth 15 form.
          </p>
        </div>

        {registrations.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              No Youth 15 registrations found.
            </p>
          </Card>
        ) : (
          <>
            <Card className="hidden overflow-x-auto p-0 md:block">
              <table className="w-full min-w-[1040px] text-sm">
                <thead className="bg-muted/60 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Club</th>
                    <th className="px-4 py-3 font-medium">President</th>
                    <th className="px-4 py-3 font-medium">President Email</th>
                    <th className="px-4 py-3 font-medium">President Phone</th>
                    <th className="px-4 py-3 font-medium">Secretary</th>
                    <th className="px-4 py-3 font-medium">Secretary Phone</th>
                    <th className="px-4 py-3 font-medium">Secretary Email</th>
                    <th className="px-4 py-3 font-medium">Account Email</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                    <th className="px-4 py-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-border align-top odd:bg-background even:bg-muted/20"
                    >
                      <td className="px-4 py-3 font-medium">{r.clubName}</td>
                      <td className="px-4 py-3">{r.presidentName}</td>
                      <td className="px-4 py-3">{r.presidentEmail}</td>
                      <td className="px-4 py-3">{r.presidentPhoneNumber}</td>
                      <td className="px-4 py-3">{r.secretaryName ?? "-"}</td>
                      <td className="px-4 py-3">{r.secretaryPhoneNumber}</td>
                      <td className="px-4 py-3">{r.secretaryEmail}</td>
                      <td className="px-4 py-3">{r.userProfile.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatSubmittedDate(r.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatSubmittedDate(r.updatedAt)}
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
                    <AccordionItem
                      key={r.id}
                      value={`y15-${r.id}`}
                      className="px-4"
                    >
                      <AccordionTrigger className="text-left">
                        <div>
                          <p className="text-sm font-medium">{r.clubName}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.presidentName}
                          </p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pb-2 text-sm">
                          {[
                            ["President email", r.presidentEmail],
                            ["President phone", r.presidentPhoneNumber],
                            ["Secretary", r.secretaryName ?? "-"],
                            ["Secretary phone", r.secretaryPhoneNumber],
                            ["Secretary email", r.secretaryEmail],
                            ["Account email", r.userProfile.email],
                            ["Submitted", formatSubmittedDate(r.createdAt)],
                            ["Updated", formatSubmittedDate(r.updatedAt)],
                          ].map(([label, value]) => (
                            <div
                              key={label}
                              className="flex items-center justify-between gap-3"
                            >
                              <span className="text-muted-foreground">
                                {label}
                              </span>
                              <span>{value}</span>
                            </div>
                          ))}
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
