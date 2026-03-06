import "server-only";

import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { getPublicStoreWhereClause } from "@/lib/store";
import { getOrCreateCurrentUserProfile } from "@/lib/user-profile";

export async function getActiveStoreListings(args?: { query?: string }) {
  return prisma.storeListing.findMany({
    where: getPublicStoreWhereClause(args?.query),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      condition: true,
      priceUsdCents: true,
      isNegotiable: true,
      createdAt: true,
      images: {
        orderBy: { sortOrder: "asc" },
        select: { blobUrl: true },
      },
    },
  });
}

export async function getStoreListingForDetail(id: string) {
  return prisma.storeListing.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      condition: true,
      priceUsdCents: true,
      isNegotiable: true,
      sellerName: true,
      sellerPhone: true,
      status: true,
      userProfileId: true,
      createdAt: true,
      images: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          blobUrl: true,
          sortOrder: true,
        },
      },
    },
  });
}

export async function getMyStoreListings() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const profile = await getOrCreateCurrentUserProfile();

  const listings = await prisma.storeListing.findMany({
    where: { userProfileId: profile.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      condition: true,
      priceUsdCents: true,
      isNegotiable: true,
      status: true,
      createdAt: true,
      images: {
        orderBy: { sortOrder: "asc" },
        select: { blobUrl: true },
      },
    },
  });

  return { listings, profileId: profile.id };
}
