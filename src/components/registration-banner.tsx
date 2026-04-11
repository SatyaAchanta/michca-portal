import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export async function RegistrationBanner() {
  const totalRegistrations = await prisma.umpiringTraining.count();

  return (
    <Card className="relative overflow-hidden border border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.14),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(250,250,250,0.92))] shadow-sm dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.12),transparent_26%),linear-gradient(135deg,rgba(10,14,18,0.98),rgba(16,18,24,0.96))]">
      <div className="absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-transparent via-emerald-300/40 to-transparent lg:block" />
      <div className="relative grid gap-5 p-4 sm:p-5 lg:grid-cols-[200px_minmax(0,1fr)_auto] lg:items-center lg:gap-8 lg:p-7">
        <div className="w-full rounded-2xl border border-emerald-200/70 bg-background/85 p-4 text-left shadow-sm backdrop-blur dark:border-emerald-900/60 dark:bg-background/70">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Umpiring Registrations
          </p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {totalRegistrations}
          </p>
          <p className="mt-2 text-sm leading-5 text-muted-foreground">
            participants supported through training and certification
          </p>
        </div>

        <div className="space-y-3 text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/70 bg-emerald-100/80 px-3 py-1 text-xs font-medium text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-100">
            <BadgeCheck className="h-3.5 w-3.5" />
            Mich-CA Umpiring Appreciation
          </div>
          <h2 className="max-w-3xl text-xl font-semibold tracking-tight text-foreground sm:text-2xl lg:text-[2rem] lg:leading-[1.15]">
            Thank you for strengthening the quality of cricket in Mich-CA.
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-[15px] lg:text-base">
            Mich-CA thanks every participant who registered and took part in
            umpiring training and certification, and extends special
            appreciation to the Umpiring Committee for managing the training,
            logistics, and standards that support the game across Michigan.
          </p>
        </div>

        <div className="flex items-start lg:justify-end">
          <Button asChild size="sm" className="w-full sm:w-auto lg:h-11 lg:px-5">
            <Link href="/account">
              View My Result
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
