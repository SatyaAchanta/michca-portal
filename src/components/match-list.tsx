import type { Match } from "@/lib/data";
import { formatMatchDate } from "@/lib/formatters";
import { MatchCard } from "@/components/match-card";

function groupMatches(matches: Match[]) {
  return matches.reduce<Record<string, Match[]>>((acc, match) => {
    const key = match.date.split("T")[0];
    acc[key] = acc[key] ? [...acc[key], match] : [match];
    return acc;
  }, {});
}

export function MatchList({ matches }: { matches: Match[] }) {
  const grouped = groupMatches(matches);
  const dates = Object.keys(grouped).sort();

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
