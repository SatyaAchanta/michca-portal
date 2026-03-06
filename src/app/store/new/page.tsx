import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { createStoreListing } from "@/app/store/actions";
import { PageContainer } from "@/components/page-container";
import { ListingForm } from "@/components/store/listing-form";

export default async function NewStoreListingPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="bg-background py-12">
      <PageContainer className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Post Gear</h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Add your listing details and upload 2 to 6 photos.
          </p>
        </div>

        <ListingForm action={createStoreListing} submitLabel="Post Listing" />
      </PageContainer>
    </div>
  );
}
