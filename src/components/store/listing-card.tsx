import Link from "next/link";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatPriceUsd } from "@/components/store/validation";

type ListingCardProps = {
  listing: {
    id: string;
    title: string;
    condition: "NEW" | "USED";
    priceUsdCents: number;
    isNegotiable: boolean;
    createdAt: Date;
    images: { blobUrl: string }[];
  };
};

export function ListingCard({ listing }: ListingCardProps) {
  const image = listing.images[0]?.blobUrl;

  return (
    <Card className="overflow-hidden border-border/70">
      <Link href={`/store/${listing.id}`} className="block">
        <div className="relative aspect-[4/3] w-full bg-muted/30">
          {image ? (
            <Image src={image} alt={listing.title} fill className="object-cover" />
          ) : null}
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="line-clamp-1 text-base font-semibold">{listing.title}</h3>
            <Badge variant="outline">{listing.condition === "NEW" ? "New" : "Used"}</Badge>
          </div>
          <p className="text-sm font-medium text-primary">
            {formatPriceUsd(listing.priceUsdCents, listing.isNegotiable)}
          </p>
          <p className="text-xs text-muted-foreground">
            Posted {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(listing.createdAt)}
          </p>
        </div>
      </Link>
    </Card>
  );
}
