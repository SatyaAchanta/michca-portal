import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { getMyStoreListings } from "@/app/store/data";
import { EmptyState } from "@/components/empty-state";
import { MyListingCard } from "@/components/store/my-listing-card";
import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";

export default async function MyStoreListingsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const result = await getMyStoreListings();
  if (!result) {
    redirect("/sign-in");
  }

  const { listings } = result;

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">My Listings</h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Manage your store posts and mark items as sold.
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/store/new">Post New Listing</Link>
          </Button>
        </div>

        {listings.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <MyListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No listings yet"
            description="Create your first listing and it will appear here."
          />
        )}
      </PageContainer>
    </div>
  );
}
