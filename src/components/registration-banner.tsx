import Link from "next/link";
import { ArrowRight, FileSignature } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export async function RegistrationBanner() {
  return (
    <Card className="overflow-hidden border border-border/70 bg-[linear-gradient(135deg,rgba(255,250,240,0.96),rgba(244,247,241,0.94))] p-5 shadow-sm dark:bg-[linear-gradient(135deg,rgba(24,18,12,0.96),rgba(14,18,16,0.94))] sm:p-6 lg:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3 text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/70 bg-emerald-100/80 px-3 py-1 text-xs font-medium text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-100">
            <FileSignature className="h-3.5 w-3.5" />
            Mich-CA Player Waiver
          </div>
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Complete the required player waiver for the 2026 season.
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
            Review the waiver and submit it once from your account before match play.
          </p>
        </div>

        <div className="flex items-start">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/waiver">
              Open Waiver Form
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
