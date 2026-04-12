import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { SiteFooter } from "@/components/site-footer";
import { SeasonResultsShowcase } from "@/components/season-results-showcase";

export const metadata: Metadata = {
  title: "Mich-CA 2025 History",
  description:
    "Browse the Mich-CA 2025 season archive featuring champions and runners-up across divisions.",
};

export default function HistoryPage() {
  return (
    <>
      <div className="bg-background py-12">
        <PageContainer className="space-y-8">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Season Archive
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              2025 Mich-CA History
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              This archive preserves our 2025 season photo highlights, including
              champions and runners-up across the league. Current sponsor updates
              remain on the homepage, while season memories live here.
            </p>
            <p className="text-sm text-muted-foreground">
              Looking for current season partners? Visit the{" "}
              <Link
                href="/"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                homepage sponsor section
              </Link>
              .
            </p>
          </div>

          <SeasonResultsShowcase />
        </PageContainer>
      </div>
      <SiteFooter />
    </>
  );
}
