import { Check, Clock3, MapPin } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ScheduleGameListItem } from "@/app/schedule/types";

type ScheduleCardListProps = {
  games: ScheduleGameListItem[];
};

function getOutcomeBadge(game: ScheduleGameListItem) {
  if (game.isCancelled) {
    return <Badge variant="outline">Cancelled</Badge>;
  }
  if (game.isDraw) {
    return <Badge variant="outline">Draw</Badge>;
  }
  return null;
}

function getGameTypeLabel(gameType: ScheduleGameListItem["gameType"]) {
  return gameType === "PLAYOFF" ? "Playoff" : "League";
}

export function ScheduleCardList({ games }: ScheduleCardListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {games.map((game) => {
        const isHomeWinner = game.winnerTeamName === game.homeTeam;
        const isAwayWinner = game.winnerTeamName === game.awayTeam;
        const hasWinner = Boolean(game.winnerTeamName) && !game.isDraw && !game.isCancelled;

        return (
          <Card
            key={game.id}
            className={cn(
              "p-5 transition-colors",
              hasWinner && "bg-primary/5"
            )}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{game.division}</Badge>
                <Badge variant="outline">{getGameTypeLabel(game.gameType)}</Badge>
                {getOutcomeBadge(game)}
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Clock3 className="h-3 w-3" />
                  {game.displayDateTime}
                </Badge>
                <Badge variant="secondary" className="gap-1 text-xs">
                  <MapPin className="h-3 w-3" />
                  {game.venue}
                </Badge>
              </div>

              <div className="space-y-2 rounded-lg border border-border/60 bg-background/80 p-3">
                <p
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    isHomeWinner && "font-semibold text-primary"
                  )}
                >
                  {isHomeWinner ? <Check className="h-4 w-4" /> : <span className="h-4 w-4" />}
                  {game.homeTeam}
                </p>
                <p
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    isAwayWinner && "font-semibold text-primary"
                  )}
                >
                  {isAwayWinner ? <Check className="h-4 w-4" /> : <span className="h-4 w-4" />}
                  {game.awayTeam}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
