import { PageContainer } from "@/components/page-container";
import { ScheduleClient } from "@/app/schedule/schedule-client";
import { getScheduleGames, getScheduleSeasons } from "@/app/schedule/actions";
import { PAGE_SIZE } from "@/app/schedule/types";

export default async function SchedulePage() {
  const populatedSeasons = await getScheduleSeasons();
  const currentYear = new Date().getUTCFullYear();
  const defaultSeason = populatedSeasons[0] ?? currentYear;
  const seasonOptions = Array.from(new Set([currentYear, ...populatedSeasons])).sort(
    (a, b) => b - a
  );

  const initialResult = await getScheduleGames({
    season: defaultSeason,
    status: "SCHEDULED",
    page: 1,
    pageSize: PAGE_SIZE,
  });

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Season Schedule
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Browse games by date range, division, team name, and status.
          </p>
        </div>

        <ScheduleClient initialResult={initialResult} initialSeasons={seasonOptions} />
      </PageContainer>
    </div>
  );
}
