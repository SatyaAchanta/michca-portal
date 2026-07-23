import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { MichcaMadnessClient } from "@/components/michca-madness/michca-madness-client";
import { PageContainer } from "@/components/page-container";
import { getMichcaMadnessPageData } from "@/lib/actions/michca-madness";

export const metadata: Metadata = {
  title: "MichCA-Madness",
  description:
    "Submit playoff brackets, stay perfect, and follow the MichCA-Madness leaderboard.",
};

export default async function MichcaMadnessPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const data = await getMichcaMadnessPageData();

  return (
    <div className="bg-background py-8 sm:py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            Playoff Bracket · {data.season}
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            MichCA-Madness
          </h1>
          <p className="max-w-2xl text-base leading-8 text-muted-foreground">
            Pick every playoff winner before brackets lock, then stay perfect
            as each division moves toward championship weekend.
          </p>
          <p className="max-w-2xl text-sm font-medium text-primary">
            F40 and T30 brackets open during the week of August 3.
          </p>
        </div>

        <MichcaMadnessClient
          season={data.season}
          teams={data.teams}
          divisions={data.divisions}
        />
      </PageContainer>
    </div>
  );
}
