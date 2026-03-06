import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { ListingCard } from "@/components/store/listing-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { getActiveStoreListings } from "@/app/store/data";

type StorePageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export default async function StorePage({ searchParams }: StorePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query = resolvedSearchParams?.q?.trim() ?? "";
  const listings = await getActiveStoreListings({ query });

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Mich-CA Store</h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Buy and sell cricket gear from the Mich-CA community.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/store/new">Post Gear</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/store/my-listings">My Listings</Link>
            </Button>
          </div>
        </div>

        <Card className="border-primary/40 bg-primary/5 p-4 text-sm text-muted-foreground">
          Include at least 2 photos for every listing. Seller name and phone are shown publicly.
        </Card>

        <form action="/store" method="get" className="grid gap-3 rounded-xl border border-border/70 bg-card p-4 sm:grid-cols-[1fr_auto_auto]">
          <Input
            name="q"
            placeholder="Search by title (e.g. bat, gloves, spikes)"
            defaultValue={query}
          />
          <Button type="submit">Search</Button>
          <Button asChild type="button" variant="outline">
            <Link href="/store">Clear</Link>
          </Button>
        </form>

        {listings.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={query ? "No matching listings" : "No active listings"}
            description={
              query
                ? `No active listings found for "${query}". Try a different keyword.`
                : "Be the first to post cricket gear in the Mich-CA Store."
            }
          />
        )}
      </PageContainer>
    </div>
  );
}
