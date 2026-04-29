import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClubInfoFilters } from "@/components/admin/club-info-filters";
import { DeleteClubInfoButton } from "@/components/admin/delete-club-info-button";
import { formatSubmittedDate } from "@/components/umpiring-training/admin-formatters";
import { canAccessAdminSection } from "@/lib/roles";
import {
  getClubInfoAdminData,
  parseClubInfoAdminSearch,
} from "@/lib/club-info";
import { getTeamAdminOptions } from "@/lib/team-queries";
import {
  AuthenticationRequiredError,
  InsufficientRoleError,
  requireAnyAdminRole,
} from "@/lib/user-profile";

type PageProps = {
  searchParams?: Promise<{ club?: string; clubDivision?: string }>;
};

export default async function AdminClubInfoPage({ searchParams }: PageProps) {
  let userProfile;
  try {
    userProfile = await requireAnyAdminRole();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) redirect("/sign-in");
    if (error instanceof InsufficientRoleError) redirect("/");
    throw error;
  }

  if (!canAccessAdminSection(userProfile.role, "clubInfo")) {
    redirect("/admin");
  }

  const resolved = searchParams ? await searchParams : undefined;
  const selectedTeamName = parseClubInfoAdminSearch(resolved?.club);
  const selectedDivision = resolved?.clubDivision?.trim() ?? "";

  const [clubInfoData, { teams }] = await Promise.all([
    getClubInfoAdminData({
      teamName: selectedTeamName || undefined,
      division: selectedDivision || undefined,
    }),
    getTeamAdminOptions(),
  ]);

  const clubInfoDivisions = Array.from(
    new Set(
      teams
        .filter((t) => ["T20", "F40", "T30"].includes(t.format))
        .map((t) => t.division),
    ),
  );
  const clubInfoTeams = teams
    .filter((t) => ["T20", "F40", "T30"].includes(t.format))
    .map((t) => ({
      teamCode: t.teamCode,
      teamName: t.teamName,
      division: t.division,
    }));

  const exportParams = new URLSearchParams();
  if (selectedTeamName) exportParams.set("club", selectedTeamName);
  if (selectedDivision) exportParams.set("clubDivision", selectedDivision);

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
            Club Info
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Captain declarations submitted through the Club Info form.
          </p>
        </div>

        <ClubInfoFilters
          initialDivision={selectedDivision}
          initialTeamName={selectedTeamName}
          divisions={clubInfoDivisions}
          teams={clubInfoTeams}
        />

        <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {clubInfoData.count} club info submission
            {clubInfoData.count === 1 ? "" : "s"}
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/club-info/export?${exportParams.toString()}`}>
              <Download className="h-4 w-4" />
              Export Excel
            </Link>
          </Button>
        </Card>

        {clubInfoData.rows.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              No club info submissions found.
            </p>
          </Card>
        ) : (
          <>
            <Card className="hidden overflow-x-auto p-0 md:block">
              <table className="w-full min-w-[1200px] text-sm">
                <thead className="bg-muted/60 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Captain</th>
                    <th className="px-4 py-3 font-medium">Account Email</th>
                    <th className="px-4 py-3 font-medium">Profile Email</th>
                    <th className="px-4 py-3 font-medium">Contact Number</th>
                    <th className="px-4 py-3 font-medium">CricClubs ID</th>
                    <th className="px-4 py-3 font-medium">T20 Team</th>
                    <th className="px-4 py-3 font-medium">F40/T30 Team</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                    <th className="px-4 py-3 font-medium">Updated</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clubInfoData.rows.map((s) => (
                    <tr
                      key={s.id}
                      className="border-t border-border align-top odd:bg-background even:bg-muted/20"
                    >
                      <td className="px-4 py-3 font-medium">{s.captainName}</td>
                      <td className="px-4 py-3">{s.accountEmail}</td>
                      <td className="px-4 py-3">{s.userProfile.email}</td>
                      <td className="px-4 py-3">{s.contactNumber}</td>
                      <td className="px-4 py-3">{s.cricclubsId}</td>
                      <td className="px-4 py-3">
                        {s.t20Team?.teamName ?? s.t20TeamCode ?? "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        {s.secondaryTeam?.teamName ??
                          s.secondaryTeamCode ??
                          "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatSubmittedDate(s.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatSubmittedDate(s.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <DeleteClubInfoButton submissionId={s.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <div className="md:hidden">
              <Card className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {clubInfoData.rows.map((s) => (
                    <AccordionItem
                      key={s.id}
                      value={`club-${s.id}`}
                      className="px-4"
                    >
                      <AccordionTrigger className="text-left">
                        <div>
                          <p className="text-sm font-medium">{s.captainName}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.t20Team?.teamName ??
                              s.secondaryTeam?.teamName ??
                              "No team"}
                          </p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pb-2 text-sm">
                          {[
                            ["Account email", s.accountEmail],
                            ["Profile email", s.userProfile.email],
                            ["Contact", s.contactNumber],
                            ["CricClubs ID", s.cricclubsId],
                            [
                              "T20 Team",
                              s.t20Team?.teamName ?? s.t20TeamCode ?? "N/A",
                            ],
                            [
                              "F40/T30 Team",
                              s.secondaryTeam?.teamName ??
                                s.secondaryTeamCode ??
                                "N/A",
                            ],
                            ["Submitted", formatSubmittedDate(s.createdAt)],
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
                          <div className="pt-2">
                            <DeleteClubInfoButton submissionId={s.id} />
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
