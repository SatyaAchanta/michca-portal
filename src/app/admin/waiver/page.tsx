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
import { DeleteWaiverButton } from "@/components/admin/delete-waiver-button";
import { WaiverFilters } from "@/components/admin/waiver-filters";
import { formatSubmittedDate } from "@/components/umpiring-training/admin-formatters";
import { canAccessAdminSection } from "@/lib/roles";
import { getWaiverAdminData, parseWaiverAdminSearch } from "@/lib/waiver";
import { getCurrentWaiverYear } from "@/lib/waiver-constants";
import { getTeamAdminOptions } from "@/lib/team-queries";
import {
  AuthenticationRequiredError,
  InsufficientRoleError,
  requireAnyAdminRole,
} from "@/lib/user-profile";

type PageProps = {
  searchParams?: Promise<{
    division?: string;
    team?: string;
    player?: string;
  }>;
};

export default async function AdminWaiverPage({ searchParams }: PageProps) {
  let userProfile;
  try {
    userProfile = await requireAnyAdminRole();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) redirect("/sign-in");
    if (error instanceof InsufficientRoleError) redirect("/");
    throw error;
  }

  if (!canAccessAdminSection(userProfile.role, "waiver")) {
    redirect("/admin");
  }

  const resolved = searchParams ? await searchParams : undefined;
  const selectedDivision = resolved?.division?.trim() ?? "";
  const selectedTeamCode = resolved?.team?.trim() ?? "";
  const selectedPlayerName = parseWaiverAdminSearch(resolved?.player);

  const [waiverData, { teams }] = await Promise.all([
    getWaiverAdminData({
      division: selectedDivision || undefined,
      teamCode: selectedTeamCode || undefined,
      playerName: selectedPlayerName || undefined,
    }),
    getTeamAdminOptions(),
  ]);

  const waiverYear = getCurrentWaiverYear();

  const waiverDivisions = Array.from(
    new Set(
      teams
        .filter((t) =>
          [
            "Premier",
            "Division-1",
            "Division-2",
            "Division-3",
            "F40",
            "T30",
          ].includes(t.division),
        )
        .map((t) => t.division),
    ),
  );
  const waiverTeams = teams
    .filter((t) => ["T20", "F40", "T30"].includes(t.format))
    .map((t) => ({
      teamCode: t.teamCode,
      teamName: t.teamName,
      division: t.division,
    }));

  const exportParams = new URLSearchParams();
  if (selectedDivision) exportParams.set("division", selectedDivision);
  if (selectedTeamCode) exportParams.set("team", selectedTeamCode);
  if (selectedPlayerName) exportParams.set("player", selectedPlayerName);

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
            Waiver Status
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Waiver submissions for the {waiverYear} season.
          </p>
        </div>

        <WaiverFilters
          initialDivision={selectedDivision}
          initialTeamCode={selectedTeamCode}
          initialPlayerName={selectedPlayerName}
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
            <Link href={`/admin/waivers/export?${exportParams.toString()}`}>
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
                    <th className="px-4 py-3 font-medium">Account Email</th>
                    <th className="px-4 py-3 font-medium">CricClubs ID</th>
                    <th className="px-4 py-3 font-medium">State</th>
                    <th className="px-4 py-3 font-medium">City</th>
                    <th className="px-4 py-3 font-medium">Address</th>
                    <th className="px-4 py-3 font-medium">T20 Division</th>
                    <th className="px-4 py-3 font-medium">T20 Team</th>
                    <th className="px-4 py-3 font-medium">Additional T20</th>
                    <th className="px-4 py-3 font-medium">F40/T30</th>
                    <th className="px-4 py-3 font-medium">F40/T30 Team</th>
                    <th className="px-4 py-3 font-medium">Year</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {waiverData.rows.map((w) => (
                    <tr
                      key={w.id}
                      className="border-t border-border align-top odd:bg-background even:bg-muted/20"
                    >
                      <td className="px-4 py-3 font-medium">{w.playerName}</td>
                      <td className="px-4 py-3">{w.userProfile.email}</td>
                      <td className="px-4 py-3">{w.cricclubsId}</td>
                      <td className="px-4 py-3">{w.state ?? "N/A"}</td>
                      <td className="px-4 py-3">{w.city}</td>
                      <td className="px-4 py-3">{w.address}</td>
                      <td className="px-4 py-3">{w.t20Division ?? "N/A"}</td>
                      <td className="px-4 py-3">
                        {w.t20Team?.teamName ?? w.t20TeamCode ?? "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        {w.additionalT20Division &&
                        (w.additionalT20Team?.teamName ??
                          w.additionalT20TeamCode)
                          ? `${w.additionalT20Division} (${w.additionalT20Team?.teamName ?? w.additionalT20TeamCode})`
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        {w.secondaryDivision ?? "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        {w.secondaryTeam?.teamName ??
                          w.secondaryTeamCode ??
                          "N/A"}
                      </td>
                      <td className="px-4 py-3">{w.year}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatSubmittedDate(w.submittedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <DeleteWaiverButton waiverId={w.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <div className="md:hidden">
              <Card className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {waiverData.rows.map((w) => (
                    <AccordionItem
                      key={w.id}
                      value={`waiver-${w.id}`}
                      className="px-4"
                    >
                      <AccordionTrigger className="text-left">
                        <div>
                          <p className="text-sm font-medium">{w.playerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {w.t20Division ?? "N/A"} /{" "}
                            {w.secondaryDivision ?? "N/A"}
                          </p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pb-2 text-sm">
                          {[
                            ["Email", w.userProfile.email],
                            ["CricClubs ID", w.cricclubsId],
                            ["State", w.state ?? "N/A"],
                            ["City", w.city],
                            ["Address", w.address],
                            [
                              "T20 team",
                              w.t20Team?.teamName ?? w.t20TeamCode ?? "N/A",
                            ],
                            [
                              "Additional T20",
                              w.additionalT20Division &&
                              (w.additionalT20Team?.teamName ??
                                w.additionalT20TeamCode)
                                ? `${w.additionalT20Division} (${w.additionalT20Team?.teamName ?? w.additionalT20TeamCode})`
                                : "N/A",
                            ],
                            [
                              "F40/T30 team",
                              w.secondaryTeam?.teamName ??
                                w.secondaryTeamCode ??
                                "N/A",
                            ],
                            ["Under 18", w.isUnder18 ? "Yes" : "No"],
                            ...(w.isUnder18
                              ? [["Parent's name", w.parentName]]
                              : []),
                            ["Submitted", formatSubmittedDate(w.submittedAt)],
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
                            <DeleteWaiverButton waiverId={w.id} />
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
