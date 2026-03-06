import Image from "next/image";

import { Card } from "@/components/ui/card";

type ListingGalleryProps = {
  title: string;
  images: { id: string; blobUrl: string }[];
};

export function ListingGallery({ title, images }: ListingGalleryProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {images.map((image) => (
        <Card key={image.id} className="relative aspect-[4/3] overflow-hidden border-border/70">
          <Image src={image.blobUrl} alt={title} fill className="object-cover" />
        </Card>
      ))}
    </div>
  );
}
