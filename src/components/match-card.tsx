import { MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Match } from "@/lib/data";
import { formatMatchDateTime } from "@/lib/formatters";

export function MatchCard({ match }: { match: Match }) {
  return (
    <Card className="p-6 transition-colors hover:border-primary/40">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">
            {formatMatchDateTime(match.date)}
          </p>
          <Badge variant="outline">{match.division}</Badge>
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">
            {match.homeTeam}
            <span className="mx-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              vs
            </span>
            {match.awayTeam}
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            {match.venue}
          </p>
        </div>
      </div>
    </Card>
  );
}
