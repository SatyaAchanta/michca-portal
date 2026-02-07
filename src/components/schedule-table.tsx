import { Check } from "lucide-react";

import { formatMatchDateTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { ScheduleGameListItem } from "@/app/schedule/types";

type ScheduleTableProps = {
  games: ScheduleGameListItem[];
};

export function ScheduleTable({ games }: ScheduleTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-background">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-muted/35 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Division</th>
              <th className="px-4 py-3 font-medium">Team 1</th>
              <th className="px-4 py-3 font-medium">Team 2</th>
              <th className="px-4 py-3 font-medium">Venue</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game, index) => {
              const hasWinner = Boolean(game.winnerTeamName) && !game.isCancelled && !game.isDraw;
              const isHomeWinner = game.winnerTeamName === game.homeTeam;
              const isAwayWinner = game.winnerTeamName === game.awayTeam;

              return (
                <tr
                  key={game.id}
                  className={cn(
                    "border-t border-border/60",
                    index % 2 === 0 ? "bg-background" : "bg-muted/20",
                    hasWinner && "bg-primary/10"
                  )}
                >
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatMatchDateTime(game.date)}
                  </td>
                  <td className="px-4 py-3">{game.division}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-semibold",
                          isHomeWinner
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border/70 text-muted-foreground"
                        )}
                      >
                        {isHomeWinner ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                      </span>
                      <span className={cn("text-foreground", isHomeWinner && "font-semibold")}>
                        {game.homeTeam}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-semibold",
                          isAwayWinner
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border/70 text-muted-foreground"
                        )}
                      >
                        {isAwayWinner ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                      </span>
                      <span className={cn("text-foreground", isAwayWinner && "font-semibold")}>
                        {game.awayTeam}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{game.venue}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
