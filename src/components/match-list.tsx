import type { Match } from "@/lib/data";
import { formatMatchDate } from "@/lib/formatters";
import { MatchCard } from "@/components/match-card";
import type { ScheduleSortOrder } from "@/app/schedule/types";

function groupMatches(matches: Match[]) {
  return matches.reduce<Record<string, Match[]>>((acc, match) => {
    const key = match.date.split("T")[0];
    acc[key] = acc[key] ? [...acc[key], match] : [match];
    return acc;
  }, {});
}

export function MatchList({
  matches,
  sortOrder = "asc",
}: {
  matches: Match[];
  sortOrder?: ScheduleSortOrder;
}) {
  const grouped = groupMatches(matches);
  const dates = Object.keys(grouped).sort((a, b) =>
    sortOrder === "asc" ? a.localeCompare(b) : b.localeCompare(a)
  );

  return (
    <div className="space-y-6">
      {dates.map((date) => (
        <div key={date} className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            {formatMatchDate(date)}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {grouped[date].map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
