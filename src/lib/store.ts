import { type Prisma, StoreListingStatus, UserRole, type StoreListingStatus as StoreListingStatusType } from "@/generated/prisma/client";

export function isStoreListingOwner(listingOwnerId: string, currentUserProfileId: string | null) {
  return Boolean(currentUserProfileId && listingOwnerId === currentUserProfileId);
}

export function getPublicStoreWhereClause(query?: string): Prisma.StoreListingWhereInput {
  const trimmedQuery = query?.trim();

  return {
    status: StoreListingStatus.ACTIVE,
    ...(trimmedQuery
      ? {
          title: {
            contains: trimmedQuery,
            mode: "insensitive",
          },
        }
      : {}),
  };
}

export function getStoreStatusLabel(status: StoreListingStatusType) {
  if (status === StoreListingStatus.SOLD) {
    return "Sold";
  }
  return "Active";
}

export function canCreateStoreListing(role: UserRole) {
  return role === UserRole.PLAYER || role === UserRole.ADMIN;
}
