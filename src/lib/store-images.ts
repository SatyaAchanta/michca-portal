import "server-only";

import { del, put } from "@vercel/blob";
import sharp from "sharp";

import { validateUploadedImages } from "@/lib/store-image-validation";

export type UploadedStoreImage = {
  blobUrl: string;
  blobPathname: string;
  width: number;
  height: number;
  sizeBytes: number;
  sortOrder: number;
};

export async function uploadStoreImagesAsWebp(args: {
  files: File[];
  userProfileId: string;
  listingId: string;
}): Promise<UploadedStoreImage[]> {
  validateUploadedImages(args.files, { requireImages: true });

  return Promise.all(
    args.files.map(async (file, index) => {
      const inputBuffer = Buffer.from(await file.arrayBuffer());
      const transformed = sharp(inputBuffer).rotate().webp({ quality: 78 });
      const metadata = await transformed.metadata();
      const buffer = await transformed.toBuffer();
      const pathname = `store/${args.userProfileId}/${args.listingId}/${crypto.randomUUID()}.webp`;

      const uploaded = await put(pathname, buffer, {
        access: "public",
        contentType: "image/webp",
      });

      return {
        blobUrl: uploaded.url,
        blobPathname: uploaded.pathname,
        width: metadata.width ?? 0,
        height: metadata.height ?? 0,
        sizeBytes: buffer.length,
        sortOrder: index,
      };
    })
  );
}

export async function deleteStoreImageBlobs(blobUrls: string[]) {
  if (blobUrls.length === 0) {
    return;
  }

  await del(blobUrls);
}
