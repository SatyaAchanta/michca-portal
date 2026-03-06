import { revalidatePath } from "next/cache";

import { deleteStoreListing } from "@/app/store/actions";
import { prisma } from "@/lib/prisma";
import { deleteStoreImageBlobs } from "@/lib/store-images";
import { requireRole } from "@/lib/user-profile";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    storeListing: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/store-images", () => ({
  deleteStoreImageBlobs: vi.fn(),
  uploadStoreImagesAsWebp: vi.fn(),
}));

vi.mock("@/lib/store-image-validation", () => ({
  validateUploadedImages: vi.fn(),
}));

vi.mock("@/lib/user-profile", () => ({
  AuthenticationRequiredError: class AuthenticationRequiredError extends Error {},
  InsufficientRoleError: class InsufficientRoleError extends Error {},
  requireRole: vi.fn(),
}));

describe("deleteStoreListing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes listing and related blob images for owner", async () => {
    vi.mocked(requireRole).mockResolvedValue({ id: "profile-1" } as never);
    vi.mocked(prisma.storeListing.findUnique).mockResolvedValue({
      id: "listing-1",
      userProfileId: "profile-1",
      images: [{ blobUrl: "https://blob/a.webp" }, { blobUrl: "https://blob/b.webp" }],
    } as never);
    vi.mocked(prisma.storeListing.delete).mockResolvedValue({} as never);
    vi.mocked(deleteStoreImageBlobs).mockResolvedValue();

    const result = await deleteStoreListing("listing-1");

    expect(result).toEqual({ success: true, message: "Listing permanently deleted." });
    expect(prisma.storeListing.delete).toHaveBeenCalledWith({ where: { id: "listing-1" } });
    expect(deleteStoreImageBlobs).toHaveBeenCalledWith([
      "https://blob/a.webp",
      "https://blob/b.webp",
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/store");
    expect(revalidatePath).toHaveBeenCalledWith("/store/listing-1");
    expect(revalidatePath).toHaveBeenCalledWith("/store/my-listings");
  });

  it("returns safe error when listing is missing", async () => {
    vi.mocked(requireRole).mockResolvedValue({ id: "profile-1" } as never);
    vi.mocked(prisma.storeListing.findUnique).mockResolvedValue(null);

    const result = await deleteStoreListing("missing");

    expect(result).toEqual({ success: false, message: "Listing not found." });
    expect(prisma.storeListing.delete).not.toHaveBeenCalled();
  });

  it("rejects non-owner deletion", async () => {
    vi.mocked(requireRole).mockResolvedValue({ id: "profile-1" } as never);
    vi.mocked(prisma.storeListing.findUnique).mockResolvedValue({
      id: "listing-1",
      userProfileId: "profile-2",
      images: [{ blobUrl: "https://blob/a.webp" }],
    } as never);

    const result = await deleteStoreListing("listing-1");

    expect(result).toEqual({ success: false, message: "You can only delete your own listing." });
    expect(prisma.storeListing.delete).not.toHaveBeenCalled();
  });

  it("keeps deletion successful if blob cleanup fails", async () => {
    vi.mocked(requireRole).mockResolvedValue({ id: "profile-1" } as never);
    vi.mocked(prisma.storeListing.findUnique).mockResolvedValue({
      id: "listing-1",
      userProfileId: "profile-1",
      images: [{ blobUrl: "https://blob/a.webp" }],
    } as never);
    vi.mocked(prisma.storeListing.delete).mockResolvedValue({} as never);
    vi.mocked(deleteStoreImageBlobs).mockRejectedValue(new Error("blob error"));

    const result = await deleteStoreListing("listing-1");

    expect(result).toEqual({ success: true, message: "Listing permanently deleted." });
    expect(prisma.storeListing.delete).toHaveBeenCalled();
  });
});
