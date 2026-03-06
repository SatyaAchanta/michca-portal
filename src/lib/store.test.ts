import { StoreListingStatus, UserRole } from "@/generated/prisma/client";
import {
  canCreateStoreListing,
  getPublicStoreWhereClause,
  getStoreStatusLabel,
  isStoreListingOwner,
} from "@/lib/store";

describe("store helpers", () => {
  it("enforces active-only public where clause", () => {
    expect(getPublicStoreWhereClause()).toEqual({ status: StoreListingStatus.ACTIVE });
  });

  it("adds case-insensitive title filter when query is provided", () => {
    expect(getPublicStoreWhereClause("bat")).toEqual({
      status: StoreListingStatus.ACTIVE,
      title: {
        contains: "bat",
        mode: "insensitive",
      },
    });
  });

  it("ignores empty search query", () => {
    expect(getPublicStoreWhereClause("   ")).toEqual({ status: StoreListingStatus.ACTIVE });
  });

  it("checks listing ownership", () => {
    expect(isStoreListingOwner("owner-1", "owner-1")).toBe(true);
    expect(isStoreListingOwner("owner-1", "owner-2")).toBe(false);
    expect(isStoreListingOwner("owner-1", null)).toBe(false);
  });

  it("maps status labels", () => {
    expect(getStoreStatusLabel(StoreListingStatus.ACTIVE)).toBe("Active");
    expect(getStoreStatusLabel(StoreListingStatus.SOLD)).toBe("Sold");
  });

  it("allows player/admin to create listings", () => {
    expect(canCreateStoreListing(UserRole.PLAYER)).toBe(true);
    expect(canCreateStoreListing(UserRole.ADMIN)).toBe(true);
    expect(canCreateStoreListing(UserRole.UMPIRE)).toBe(false);
  });
});
