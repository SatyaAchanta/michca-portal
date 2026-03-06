import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { updateStoreListing } from "@/app/store/actions";
import { getStoreListingForDetail } from "@/app/store/data";
import { PageContainer } from "@/components/page-container";
import { ListingForm } from "@/components/store/listing-form";
import { prisma } from "@/lib/prisma";
import { isStoreListingOwner } from "@/lib/store";

export default async function EditStoreListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const listing = await getStoreListingForDetail(id);
  if (!listing) {
    notFound();
  }

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!isStoreListingOwner(listing.userProfileId, profile?.id ?? null)) {
    redirect("/store/my-listings");
  }

  const updateAction = updateStoreListing.bind(null, id);

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Edit Listing</h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Update your listing details. Upload new photos only if you want to replace the current set.
          </p>
        </div>

        <ListingForm
          action={updateAction}
          submitLabel="Save Changes"
          currentImageCount={listing.images.length}
          defaults={{
            title: listing.title,
            description: listing.description,
            condition: listing.condition,
            price: (listing.priceUsdCents / 100).toString(),
            isNegotiable: listing.isNegotiable,
            sellerName: listing.sellerName,
            sellerPhone: listing.sellerPhone,
          }}
        />
      </PageContainer>
    </div>
  );
}
