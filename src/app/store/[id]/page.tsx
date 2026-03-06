import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { getStoreListingForDetail } from "@/app/store/data";
import { PageContainer } from "@/components/page-container";
import { ListingGallery } from "@/components/store/listing-gallery";
import { formatPriceUsd } from "@/components/store/validation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { isStoreListingOwner } from "@/lib/store";

export default async function StoreListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getStoreListingForDetail(id);

  if (!listing) {
    notFound();
  }

  if (listing.status === "SOLD") {
    const { userId } = await auth();
    let canViewSold = false;

    if (userId) {
      const profile = await prisma.userProfile.findUnique({
        where: { clerkUserId: userId },
        select: { id: true },
      });
      canViewSold = isStoreListingOwner(listing.userProfileId, profile?.id ?? null);
    }

    if (!canViewSold) {
      notFound();
    }
  }

  const { userId } = await auth();
  let isOwner = false;
  if (userId) {
    const profile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });
    isOwner = isStoreListingOwner(listing.userProfileId, profile?.id ?? null);
  }

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{listing.title}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{listing.condition === "NEW" ? "New" : "Used"}</Badge>
              <Badge variant={listing.status === "SOLD" ? "secondary" : "outline"}>{listing.status}</Badge>
            </div>
          </div>

          {isOwner ? (
            <Button asChild variant="outline">
              <Link href={`/store/${listing.id}/edit`}>Edit Listing</Link>
            </Button>
          ) : null}
        </div>

        <ListingGallery title={listing.title} images={listing.images} />

        <Card className="space-y-4 p-5">
          <p className="text-lg font-semibold text-primary">
            {formatPriceUsd(listing.priceUsdCents, listing.isNegotiable)}
          </p>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{listing.description}</p>

          <div className="grid gap-2 rounded-lg border border-border/70 bg-muted/20 p-4 text-sm sm:grid-cols-2">
            <p>
              <span className="font-medium">Seller:</span> {listing.sellerName}
            </p>
            <p>
              <span className="font-medium">Phone:</span> {listing.sellerPhone}
            </p>
          </div>
        </Card>
      </PageContainer>
    </div>
  );
}
