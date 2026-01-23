import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function FantasyBanner() {
  const fantasyUrl = process.env.NEXT_PUBLIC_FANTASY_URL ?? "";

  return (
    <Card className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-primary">Fantasy League</p>
        <h3 className="mt-2 text-xl font-semibold text-foreground font-display">
          Draft your squad and compete with MichCA fans this season.
        </h3>
      </div>
      <div className="flex flex-wrap gap-3">
        {fantasyUrl ? (
          <Button asChild variant="destructive">
            <Link href={fantasyUrl} target="_blank" rel="noreferrer">
              Play Now
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button variant="destructive" disabled>
            Play Now
          </Button>
        )}
        {fantasyUrl ? (
          <Button asChild variant="outline">
            <Link href={fantasyUrl} target="_blank" rel="noreferrer">
              View Leaderboard
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
