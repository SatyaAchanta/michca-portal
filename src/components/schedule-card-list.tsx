import { ArrowUpRight, Check, Clock3, MapPin, Swords } from "lucide-react";
import Link from "next/link";

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
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{game.division}</Badge>
                  <Badge variant="outline">{getGameTypeLabel(game.gameType)}</Badge>
                  {getOutcomeBadge(game)}
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Clock3 className="h-3 w-3" />
                    {game.displayDateTime}
                  </Badge>
                </div>
                <div className="flex min-h-5 items-start gap-1.5 text-xs font-medium text-muted-foreground">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{game.venue}</span>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-border/60 bg-background/80 p-3">
                <p
                  className={cn(
                    "flex items-center justify-center gap-2 text-center text-sm",
                    isHomeWinner && "font-semibold text-primary"
                  )}
                >
                  {isHomeWinner ? <Check className="h-4 w-4" /> : <span className="h-4 w-4" />}
                  <Link
                    href={`/teams/${game.homeTeamCode}`}
                    className="inline-flex items-center gap-1 text-primary underline underline-offset-4 md:text-foreground md:no-underline md:hover:underline"
                    aria-label={`View ${game.homeTeam} team page`}
                  >
                    <span>{game.homeTeam}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 md:hidden" />
                  </Link>
                </p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-px flex-1 bg-border/70" />
                  <Swords className="h-4 w-4" aria-hidden="true" />
                  <span className="h-px flex-1 bg-border/70" />
                </div>
                <p
                  className={cn(
                    "flex items-center justify-center gap-2 text-center text-sm",
                    isAwayWinner && "font-semibold text-primary"
                  )}
                >
                  {isAwayWinner ? <Check className="h-4 w-4" /> : <span className="h-4 w-4" />}
                  <Link
                    href={`/teams/${game.awayTeamCode}`}
                    className="inline-flex items-center gap-1 text-primary underline underline-offset-4 md:text-foreground md:no-underline md:hover:underline"
                    aria-label={`View ${game.awayTeam} team page`}
                  >
                    <span>{game.awayTeam}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 md:hidden" />
                  </Link>
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
