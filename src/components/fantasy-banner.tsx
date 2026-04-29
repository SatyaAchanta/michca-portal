import Link from "next/link";
import { Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function FantasyBanner() {
  return (
    <Card className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-primary">Fantasy League</p>
        <h3 className="mt-2 text-xl font-semibold text-foreground font-display">
          Predict game winners, earn points, and climb the leaderboard.
        </h3>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="destructive">
          <Link href="/fantasy">Make Predictions</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/fantasy/leaderboard">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Link>
        </Button>
      </div>
    </Card>
  );
}
