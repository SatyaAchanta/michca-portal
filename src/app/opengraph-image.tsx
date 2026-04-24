import {
  createSocialPreviewImage,
  socialImageAlt,
  socialImageContentType,
  socialImageSize,
} from "@/app/social-preview";

export const alt = socialImageAlt;
export const size = socialImageSize;
export const contentType = socialImageContentType;

export default async function OpenGraphImage() {
  return createSocialPreviewImage();
}
