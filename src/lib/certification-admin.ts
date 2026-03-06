import "server-only";

import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export const CERTIFICATION_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const CERTIFICATION_IMAGE_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export async function assertNoActiveCertificationWindows() {
  const activeCount = await prisma.certificationTestWindow.count({
    where: { status: "ACTIVE" },
  });

  if (activeCount > 0) {
    throw new Error("Question bank is locked while any test window is active.");
  }
}

export function isAllowedCertificationImageType(type: string) {
  return CERTIFICATION_IMAGE_ACCEPTED_TYPES.includes(
    type as (typeof CERTIFICATION_IMAGE_ACCEPTED_TYPES)[number]
  );
}

export function buildCertificationImagePath(fileName: string) {
  const extension = fileName.includes(".") ? fileName.split(".").pop()?.toLowerCase() : "";
  const safeExtension = extension && extension.length <= 10 ? extension : "bin";
  const randomSuffix = crypto.randomUUID();
  return `certification-questions/${Date.now()}-${randomSuffix}.${safeExtension}`;
}

export async function deleteBlobIfPresent(url: string | null | undefined) {
  if (!url) {
    return;
  }

  try {
    await del(url);
  } catch (error) {
    console.error("Failed to delete certification question blob:", error);
  }
}
