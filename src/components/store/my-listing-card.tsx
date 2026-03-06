import Image from "next/image";
import Link from "next/link";

import { deleteStoreListing, markStoreListingSold } from "@/app/store/actions";
import { DeleteListingButton } from "@/components/store/delete-listing-button";
import { MarkSoldButton } from "@/components/store/mark-sold-button";
import { formatPriceUsd } from "@/components/store/validation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type MyListingCardProps = {
  listing: {
    id: string;
    title: string;
    condition: "NEW" | "USED";
    priceUsdCents: number;
    isNegotiable: boolean;
    status: "ACTIVE" | "SOLD";
    createdAt: Date;
    images: { blobUrl: string }[];
  };
};

export function MyListingCard({ listing }: MyListingCardProps) {
  const image = listing.images[0]?.blobUrl;

  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/70">
      <Link href={`/store/${listing.id}`} className="block">
        <div className="relative aspect-[4/3] w-full bg-muted/30">
          {image ? <Image src={image} alt={listing.title} fill className="object-cover" /> : null}
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-base font-semibold">{listing.title}</h3>
            <Badge variant="outline">{listing.condition === "NEW" ? "New" : "Used"}</Badge>
          </div>
          <p className="text-sm font-medium text-primary">
            {formatPriceUsd(listing.priceUsdCents, listing.isNegotiable)}
          </p>
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              Posted{" "}
              {new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }).format(listing.createdAt)}
            </span>
            <Badge variant={listing.status === "SOLD" ? "secondary" : "outline"}>{listing.status}</Badge>
          </div>
        </div>
      </Link>

      <div className="mt-auto space-y-3 border-t border-border/70 p-4">
        <div className="grid grid-cols-2 gap-2">
          <Button asChild size="sm" variant="outline" className="w-full">
            <Link href={`/store/${listing.id}`}>View</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="w-full">
            <Link href={`/store/${listing.id}/edit`}>Edit</Link>
          </Button>
        </div>
        {listing.status === "ACTIVE" ? (
          <MarkSoldButton listingId={listing.id} markSoldAction={markStoreListingSold} />
        ) : (
          <p className="text-sm text-muted-foreground">This listing is marked as sold.</p>
        )}
        <DeleteListingButton listingId={listing.id} deleteAction={deleteStoreListing} />
      </div>
    </Card>
  );
}
