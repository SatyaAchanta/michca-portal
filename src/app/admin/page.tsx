import Link from "next/link";
import { Download } from "lucide-react";

import { getAdminRegistrations } from "@/app/admin/actions";
import { ClubInfoFilters } from "@/components/admin/club-info-filters";
import { AdminSectionSelect } from "@/components/admin/admin-section-select";
import { DeleteClubInfoButton } from "@/components/admin/delete-club-info-button";
import { DeleteWaiverButton } from "@/components/admin/delete-waiver-button";
import { WaiverFilters } from "@/components/admin/waiver-filters";
import { AdminFilters } from "@/components/umpiring-training/admin-filters";
import {
  formatName,
  formatResultLabel,
  formatSubmittedDate,
  resultBadgeClass,
} from "@/components/umpiring-training/admin-formatters";
import { ResultCell } from "@/components/umpiring-training/result-cell";
import { PageContainer } from "@/components/page-container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getTeamDivisionLabel, TEAM_FORMAT_LABELS } from "@/lib/team-data";
import { getTeamAdminOptions } from "@/lib/team-queries";
import { canAccessAdminSection } from "@/lib/roles";
import { getCurrentWaiverYear } from "@/lib/waiver-constants";

type AdminPageProps = {
  searchParams?: Promise<{
    dates?: string;
    locations?: string;
    section?: string;
    division?: string;
    team?: string;
    player?: string;
    club?: string;
    clubDivision?: string;
  }>;
};

type AdminSection = "youth15" | "umpiring" | "waiver" | "clubInfo" | "teams";

function normalizeSection(input?: string): AdminSection {
  if (
    input === "umpiring" ||
    input === "teams" ||
    input === "waiver" ||
    input === "clubInfo"
  ) {
    return input;
  }

  return "youth15";
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const section = normalizeSection(resolvedParams?.section);
  const [
    {
      registrations,
      youth15Registrations,
      waiverData,
      clubInfoData,
      selectedDates,
      selectedLocations,
      selectedWaiverDivision,
      selectedWaiverTeamCode,
      selectedWaiverPlayerName,
      selectedClubInfoTeamName,
      selectedClubInfoDivision,
      userRole,
    },
    { teams },
  ] = await Promise.all([
    getAdminRegistrations({
      datesParam: resolvedParams?.dates,
      locationsParam: resolvedParams?.locations,
      waiverDivisionParam: resolvedParams?.division,
      waiverTeamParam: resolvedParams?.team,
      waiverPlayerParam: resolvedParams?.player,
      clubInfoTeamParam: resolvedParams?.club,
      clubInfoDivisionParam: resolvedParams?.clubDivision,
    }),
    getTeamAdminOptions(),
  ]);

  const waiverYear = getCurrentWaiverYear();
  const waiverDivisions = Array.from(
    new Set(
      teams
        .filter((team) =>
          [
            "Premier",
            "Division-1",
            "Division-2",
            "Division-3",
            "F40",
            "T30",
          ].includes(team.division),
        )
        .map((team) => team.division),
    ),
  );
  const waiverTeams = teams
    .filter((team) => ["T20", "F40", "T30"].includes(team.format))
    .map((team) => ({
      teamCode: team.teamCode,
      teamName: team.teamName,
      division: team.division,
    }));
  const waiverExportParams = new URLSearchParams({ section: "waiver" });
  if (selectedWaiverDivision) {
    waiverExportParams.set("division", selectedWaiverDivision);
  }
  if (selectedWaiverTeamCode) {
    waiverExportParams.set("team", selectedWaiverTeamCode);
  }
  if (selectedWaiverPlayerName) {
    waiverExportParams.set("player", selectedWaiverPlayerName);
  }
  const clubInfoExportParams = new URLSearchParams({ section: "clubInfo" });
  if (selectedClubInfoTeamName) {
    clubInfoExportParams.set("club", selectedClubInfoTeamName);
  }
  if (selectedClubInfoDivision) {
    clubInfoExportParams.set("clubDivision", selectedClubInfoDivision);
  }
  const clubInfoDivisions = Array.from(
    new Set(
      teams
        .filter((team) => ["T20", "F40", "T30"].includes(team.format))
        .map((team) => team.division),
    ),
  );
  const clubInfoTeams = teams
    .filter((team) => ["T20", "F40", "T30"].includes(team.format))
    .map((team) => ({
      teamCode: team.teamCode,
      teamName: team.teamName,
      division: team.division,
    }));

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Admin
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Review registration activity and manage teams across the portal.
          </p>
        </div>

        <Card className="p-4">
          <AdminSectionSelect value={section} />
        </Card>

        {section === "youth15" ? (
          !canAccessAdminSection(userRole, "youth15") ? (
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">
                You do not have enough permissions to see this page
              </p>
            </Card>
          ) : (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Youth 15 registrations
                </h2>
                <p className="text-sm text-muted-foreground">
                  Club-level registrations submitted through the Youth 15 form.
                </p>
              </div>

              {youth15Registrations.length === 0 ? (
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
                          <th className="px-4 py-3 font-medium">
                            President Email
                          </th>
                          <th className="px-4 py-3 font-medium">
                            President Phone
                          </th>
                          <th className="px-4 py-3 font-medium">Secretary</th>
                          <th className="px-4 py-3 font-medium">
                            Secretary Phone
                          </th>
                          <th className="px-4 py-3 font-medium">
                            Secretary Email
                          </th>
                          <th className="px-4 py-3 font-medium">
                            Account Email
                          </th>
                          <th className="px-4 py-3 font-medium">Submitted</th>
                          <th className="px-4 py-3 font-medium">Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {youth15Registrations.map((registration) => (
                          <tr
                            key={registration.id}
                            className="border-t border-border align-top odd:bg-background even:bg-muted/20"
                          >
                            <td className="px-4 py-3 font-medium">
                              {registration.clubName}
                            </td>
                            <td className="px-4 py-3">
                              {registration.presidentName}
                            </td>
                            <td className="px-4 py-3">
                              {registration.presidentEmail}
                            </td>
                            <td className="px-4 py-3">
                              {registration.presidentPhoneNumber}
                            </td>
                            <td className="px-4 py-3">
                              {registration.secretaryName ?? "-"}
                            </td>
                            <td className="px-4 py-3">
                              {registration.secretaryPhoneNumber}
                            </td>
                            <td className="px-4 py-3">
                              {registration.secretaryEmail}
                            </td>
                            <td className="px-4 py-3">
                              {registration.userProfile.email}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {formatSubmittedDate(registration.createdAt)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {formatSubmittedDate(registration.updatedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>

                  <div className="md:hidden">
                    <Card className="p-0">
                      <Accordion type="single" collapsible className="w-full">
                        {youth15Registrations.map((registration) => (
                          <AccordionItem
                            key={registration.id}
                            value={`y15-${registration.id}`}
                            className="px-4"
                          >
                            <AccordionTrigger className="text-left">
                              <div>
                                <p className="text-sm font-medium">
                                  {registration.clubName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {registration.presidentName}
                                </p>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 pb-2 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">
                                    President email
                                  </span>
                                  <span>{registration.presidentEmail}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">
                                    President phone
                                  </span>
                                  <span>
                                    {registration.presidentPhoneNumber}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">
                                    Secretary
                                  </span>
                                  <span>
                                    {registration.secretaryName ?? "-"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">
                                    Secretary phone
                                  </span>
                                  <span>
                                    {registration.secretaryPhoneNumber}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">
                                    Secretary email
                                  </span>
                                  <span>{registration.secretaryEmail}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">
                                    Account email
                                  </span>
                                  <span>{registration.userProfile.email}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">
                                    Submitted
                                  </span>
                                  <span>
                                    {formatSubmittedDate(
                                      registration.createdAt,
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">
                                    Updated
                                  </span>
                                  <span>
                                    {formatSubmittedDate(
                                      registration.updatedAt,
                                    )}
                                  </span>
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
            </section>
          )
        ) : null}

        {section === "umpiring" ? (
          !canAccessAdminSection(userRole, "umpiring") ? (
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">
                You do not have enough permissions to see this page
              </p>
            </Card>
          ) : (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Umpiring training registrations
                </h2>
                <p className="text-sm text-muted-foreground">
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
                          <th className="px-4 py-3 font-medium">
                            Current Result
                          </th>
                          <th className="px-4 py-3 font-medium">
                            Update Result
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map((registration) => (
                          <tr
                            key={registration.id}
                            className="border-t border-border align-top odd:bg-background even:bg-muted/20"
                          >
                            <td className="px-4 py-3 font-medium">
                              {formatName(
                                registration.firstName,
                                registration.lastName,
                              )}
                            </td>
                            <td className="px-4 py-3">{registration.email}</td>
                            <td className="px-4 py-3">
                              {registration.preferredLocation}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant="outline"
                                className={resultBadgeClass(
                                  registration.result,
                                )}
                              >
                                {formatResultLabel(registration.result)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <ResultCell
                                id={registration.id}
                                initialResult={registration.result}
                              />
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
                          <AccordionItem
                            key={registration.id}
                            value={registration.id}
                            className="px-4"
                          >
                            <AccordionTrigger className="text-left">
                              <div>
                                <p className="text-sm font-medium">
                                  {formatName(
                                    registration.firstName,
                                    registration.lastName,
                                  )}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {registration.email}
                                </p>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 pb-2 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">
                                    Location
                                  </span>
                                  <span>{registration.preferredLocation}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">
                                    Current Result
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={resultBadgeClass(
                                      registration.result,
                                    )}
                                  >
                                    {formatResultLabel(registration.result)}
                                  </Badge>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-muted-foreground">
                                    Update Result
                                  </p>
                                  <ResultCell
                                    id={registration.id}
                                    initialResult={registration.result}
                                  />
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
            </section>
          )
        ) : null}

        {section === "waiver" ? (
          !canAccessAdminSection(userRole, "waiver") ? (
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">
                You do not have enough permissions to see this page
              </p>
            </Card>
          ) : (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Waiver status
                </h2>
                <p className="text-sm text-muted-foreground">
                  Waiver submissions for the {waiverYear} season.
                </p>
              </div>

              <WaiverFilters
                initialDivision={selectedWaiverDivision}
                initialTeamCode={selectedWaiverTeamCode}
                initialPlayerName={selectedWaiverPlayerName}
                divisions={waiverDivisions}
                teams={waiverTeams}
              />

              <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
                <p className="text-sm text-muted-foreground">
                  Total waivers submitted:{" "}
                  <span className="font-semibold text-foreground">
                    {waiverData.count}
                  </span>
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link
                    href={`/admin/waivers/export?${waiverExportParams.toString()}`}
                  >
                    <Download className="h-4 w-4" />
                    Export Excel
                  </Link>
                </Button>
              </Card>

              {waiverData.rows.length === 0 ? (
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground">
                    No waiver submissions found.
                  </p>
                </Card>
              ) : (
                <>
                  <Card className="hidden overflow-x-auto p-0 md:block">
                    <table className="w-full min-w-[1280px] text-sm">
                      <thead className="bg-muted/60 text-left">
                        <tr>
                          <th className="px-4 py-3 font-medium">Player Name</th>
                          <th className="px-4 py-3 font-medium">
                            Account Email
                          </th>
                          <th className="px-4 py-3 font-medium">
                            CricClubs ID
                          </th>
                          <th className="px-4 py-3 font-medium">State</th>
                          <th className="px-4 py-3 font-medium">City</th>
                          <th className="px-4 py-3 font-medium">Address</th>
                          <th className="px-4 py-3 font-medium">
                            T20 Division
                          </th>
                          <th className="px-4 py-3 font-medium">T20 Team</th>
                          <th className="px-4 py-3 font-medium">F40/T30</th>
                          <th className="px-4 py-3 font-medium">
                            F40/T30 Team
                          </th>
                          <th className="px-4 py-3 font-medium">Year</th>
                          <th className="px-4 py-3 font-medium">Submitted</th>
                          <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {waiverData.rows.map((waiver) => (
                          <tr
                            key={waiver.id}
                            className="border-t border-border align-top odd:bg-background even:bg-muted/20"
                          >
                            <td className="px-4 py-3 font-medium">
                              {waiver.playerName}
                            </td>
                            <td className="px-4 py-3">
                              {waiver.userProfile.email}
                            </td>
                            <td className="px-4 py-3">{waiver.cricclubsId}</td>
                            <td className="px-4 py-3">{waiver.state ?? "N/A"}</td>
                            <td className="px-4 py-3">{waiver.city}</td>
                            <td className="px-4 py-3">{waiver.address}</td>
                            <td className="px-4 py-3">
                              {waiver.t20Division ?? "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              {waiver.t20Team?.teamName ??
                                waiver.t20TeamCode ??
                                "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              {waiver.secondaryDivision ?? "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              {waiver.secondaryTeam?.teamName ??
                                waiver.secondaryTeamCode ??
                                "N/A"}
                            </td>
                            <td className="px-4 py-3">{waiver.year}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {formatSubmittedDate(waiver.submittedAt)}
                            </td>
                            <td className="px-4 py-3">
                              <DeleteWaiverButton waiverId={waiver.id} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>

                  <div className="md:hidden">
                    <Card className="p-0">
                      <Accordion type="single" collapsible className="w-full">
                        {waiverData.rows.map((waiver) => (
                          <AccordionItem
                            key={waiver.id}
                            value={`waiver-${waiver.id}`}
                            className="px-4"
                          >
                            <AccordionTrigger className="text-left">
                              <div>
                                <p className="text-sm font-medium">
                                  {waiver.playerName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {waiver.t20Division ?? "N/A"} /{" "}
                                  {waiver.secondaryDivision ?? "N/A"}
                                </p>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 pb-2 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">
                                    Email
                                  </span>
                                  <span>{waiver.userProfile.email}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">
                                    CricClubs ID
                                  </span>
                                  <span>{waiver.cricclubsId}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">
                                    State
                                  </span>
                                  <span>{waiver.state ?? "N/A"}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">
                                    City
                                  </span>
                                  <span>{waiver.city}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">
                                    Address
                                  </span>
                                  <span>{waiver.address}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">
                                    T20 team
                                  </span>
                                  <span>
                                    {waiver.t20Team?.teamName ??
                                      waiver.t20TeamCode ??
                                      "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">
                                    F40/T30 team
                                  </span>
                                  <span>
                                    {waiver.secondaryTeam?.teamName ??
                                      waiver.secondaryTeamCode ??
                                      "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">
                                    Submitted
                                  </span>
                                  <span>
                                    {formatSubmittedDate(waiver.submittedAt)}
                                  </span>
                                </div>
                                <div className="pt-2">
                                  <DeleteWaiverButton waiverId={waiver.id} />
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
            </section>
          )
        ) : null}

        {section === "clubInfo" ? (
          !canAccessAdminSection(userRole, "clubInfo") ? (
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">
                You do not have enough permissions to see this page
              </p>
            </Card>
          ) : (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">Club Info</h2>
                <p className="text-sm text-muted-foreground">
                  Captain declarations submitted through the Club Info form.
                </p>
              </div>

              <ClubInfoFilters
                initialDivision={selectedClubInfoDivision}
                initialTeamName={selectedClubInfoTeamName}
                divisions={clubInfoDivisions}
                teams={clubInfoTeams}
              />

              <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {clubInfoData.count} club info submission
                  {clubInfoData.count === 1 ? "" : "s"}
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/club-info/export?${clubInfoExportParams.toString()}`}>
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
                        {clubInfoData.rows.map((submission) => (
                          <tr
                            key={submission.id}
                            className="border-t border-border align-top odd:bg-background even:bg-muted/20"
                          >
                            <td className="px-4 py-3 font-medium">{submission.captainName}</td>
                            <td className="px-4 py-3">{submission.accountEmail}</td>
                            <td className="px-4 py-3">{submission.userProfile.email}</td>
                            <td className="px-4 py-3">{submission.contactNumber}</td>
                            <td className="px-4 py-3">{submission.cricclubsId}</td>
                            <td className="px-4 py-3">
                              {submission.t20Team?.teamName ?? submission.t20TeamCode ?? "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              {submission.secondaryTeam?.teamName ??
                                submission.secondaryTeamCode ??
                                "N/A"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {formatSubmittedDate(submission.createdAt)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {formatSubmittedDate(submission.updatedAt)}
                            </td>
                            <td className="px-4 py-3">
                              <DeleteClubInfoButton submissionId={submission.id} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>

                  <div className="md:hidden">
                    <Card className="p-0">
                      <Accordion type="single" collapsible className="w-full">
                        {clubInfoData.rows.map((submission) => (
                          <AccordionItem
                            key={submission.id}
                            value={`club-${submission.id}`}
                            className="px-4"
                          >
                            <AccordionTrigger className="text-left">
                              <div>
                                <p className="text-sm font-medium">{submission.captainName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {submission.t20Team?.teamName ??
                                    submission.secondaryTeam?.teamName ??
                                    "No team"}
                                </p>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 pb-2 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">Account email</span>
                                  <span>{submission.accountEmail}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">Profile email</span>
                                  <span>{submission.userProfile.email}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">Contact</span>
                                  <span>{submission.contactNumber}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">CricClubs ID</span>
                                  <span>{submission.cricclubsId}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">T20 Team</span>
                                  <span>
                                    {submission.t20Team?.teamName ??
                                      submission.t20TeamCode ??
                                      "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">F40/T30 Team</span>
                                  <span>
                                    {submission.secondaryTeam?.teamName ??
                                      submission.secondaryTeamCode ??
                                      "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-muted-foreground">Submitted</span>
                                  <span>{formatSubmittedDate(submission.createdAt)}</span>
                                </div>
                                <div className="pt-2">
                                  <DeleteClubInfoButton submissionId={submission.id} />
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
            </section>
          )
        ) : null}

        {section === "teams" ? (
          !canAccessAdminSection(userRole, "teams") ? (
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">
                You do not have enough permissions to see this page
              </p>
            </Card>
          ) : (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">Teams</h2>
                <p className="text-sm text-muted-foreground">
                  Review imported teams and open any club profile for editing.
                </p>
              </div>

              {teams.length === 0 ? (
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground">
                    No teams found.
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {teams.map((team) => (
                    <Card key={team.teamCode} className="p-5">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              {TEAM_FORMAT_LABELS[team.format]}
                            </p>
                            <h3 className="mt-1 text-lg font-semibold">
                              {team.teamName}
                            </h3>
                          </div>
                          <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
                            {team.teamShortCode}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getTeamDivisionLabel(team.division)}
                        </p>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-muted-foreground">
                            {team.teamCode}
                          </span>
                          <Link
                            href={`/admin/teams/${team.teamCode}`}
                            className="font-medium underline underline-offset-4"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )
        ) : null}
      </PageContainer>
    </div>
  );
}
