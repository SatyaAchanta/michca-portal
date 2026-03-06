import { MAX_STORE_IMAGE_BYTES, MAX_STORE_IMAGES, MIN_STORE_IMAGES } from "@/components/store/validation";

const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export function validateUploadedImages(files: File[], options: { requireImages: boolean }) {
  if (options.requireImages && files.length < MIN_STORE_IMAGES) {
    throw new Error(`Upload at least ${MIN_STORE_IMAGES} images.`);
  }

  if (files.length > MAX_STORE_IMAGES) {
    throw new Error(`You can upload up to ${MAX_STORE_IMAGES} images.`);
  }

  files.forEach((file) => {
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      throw new Error(`Unsupported file type for ${file.name}.`);
    }

    if (file.size > MAX_STORE_IMAGE_BYTES) {
      throw new Error(`${file.name} exceeds the 10MB limit.`);
    }
  });
}
