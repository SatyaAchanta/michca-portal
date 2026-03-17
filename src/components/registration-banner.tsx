import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function RegistrationBanner() {
  return (
    <Card className="border border-border/60 bg-background/90 p-4 shadow-none">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            Youth 15 registration is open. Initial deposit due March 31, 2026.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Full fee due April 12, 2026.
          </p>
        </div>
        <Button asChild size="sm" className="shrink-0">
          <Link href="/y15-registration">
            Register
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
