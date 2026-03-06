import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function RegistrationBanner() {
  return (
    <Card className="border border-border/60 bg-background/90 px-4 py-3 shadow-none">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">
          Umpiring training registration is open for March 28-29, 2026.
        </p>
        <Button asChild size="sm" className="shrink-0">
          <Link href="/umpiring-training">
            Register
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
