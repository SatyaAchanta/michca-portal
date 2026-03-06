"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import {
  AuthenticationRequiredError,
  InsufficientRoleError,
  requireRole,
} from "@/lib/user-profile";
import {
  INITIAL_STORE_LISTING_FORM_STATE,
  type StoreListingFormState,
  parseStoreListingForm,
} from "@/components/store/validation";
import { deleteStoreImageBlobs, uploadStoreImagesAsWebp } from "@/lib/store-images";
import { validateUploadedImages } from "@/lib/store-image-validation";

function authErrorState() {
  return {
    status: "error" as const,
    fieldErrors: { form: "You must be signed in to manage store listings." },
  };
}

function ownershipErrorState() {
  return {
    status: "error" as const,
    fieldErrors: { form: "You can only edit your own listings." },
  };
}

export async function createStoreListing(
  _prevState: StoreListingFormState,
  formData: FormData
): Promise<StoreListingFormState> {
  let profile;
  try {
    profile = await requireRole(UserRole.PLAYER);
  } catch (error) {
    if (error instanceof AuthenticationRequiredError || error instanceof InsufficientRoleError) {
      return authErrorState();
    }
    return { status: "error", fieldErrors: { form: "Unable to validate user profile." } };
  }

  const { data, fieldErrors } = parseStoreListingForm(formData, { requireImages: true });
  if (!data) {
    return {
      status: "error",
      fieldErrors,
      message: "Please correct the highlighted fields.",
    };
  }

  const listingId = crypto.randomUUID();

  let uploadedImages;
  try {
    uploadedImages = await uploadStoreImagesAsWebp({
      files: data.imageFiles,
      userProfileId: profile.id,
      listingId,
    });
  } catch (error) {
    return {
      status: "error",
      fieldErrors: {
        ...fieldErrors,
        images: error instanceof Error ? error.message : "Unable to process images.",
      },
    };
  }

  await prisma.storeListing.create({
    data: {
      id: listingId,
      userProfileId: profile.id,
      sellerName: data.sellerName,
      sellerPhone: data.sellerPhone,
      title: data.title,
      description: data.description,
      condition: data.condition,
      priceUsdCents: data.priceUsdCents,
      isNegotiable: data.isNegotiable,
      images: {
        createMany: {
          data: uploadedImages,
        },
      },
    },
  });

  revalidatePath("/store");
  revalidatePath("/store/my-listings");

  return {
    ...INITIAL_STORE_LISTING_FORM_STATE,
    status: "success",
    message: "Listing posted successfully.",
  };
}

export async function updateStoreListing(
  listingId: string,
  _prevState: StoreListingFormState,
  formData: FormData
): Promise<StoreListingFormState> {
  let profile;
  try {
    profile = await requireRole(UserRole.PLAYER);
  } catch (error) {
    if (error instanceof AuthenticationRequiredError || error instanceof InsufficientRoleError) {
      return authErrorState();
    }
    return { status: "error", fieldErrors: { form: "Unable to validate user profile." } };
  }

  const listing = await prisma.storeListing.findUnique({
    where: { id: listingId },
    include: { images: true },
  });

  if (!listing) {
    return {
      status: "error",
      fieldErrors: { form: "Listing not found." },
    };
  }

  if (listing.userProfileId !== profile.id) {
    return ownershipErrorState();
  }

  const { data, fieldErrors } = parseStoreListingForm(formData, { requireImages: false });
  if (!data) {
    return {
      status: "error",
      fieldErrors,
      message: "Please correct the highlighted fields.",
    };
  }

  const hasNewImages = data.imageFiles.length > 0;

  if (hasNewImages) {
    try {
      validateUploadedImages(data.imageFiles, { requireImages: true });
    } catch (error) {
      return {
        status: "error",
        fieldErrors: {
          ...fieldErrors,
          images: error instanceof Error ? error.message : "Unable to process images.",
        },
      };
    }
  }

  let uploadedImages: Awaited<ReturnType<typeof uploadStoreImagesAsWebp>> = [];
  if (hasNewImages) {
    try {
      uploadedImages = await uploadStoreImagesAsWebp({
        files: data.imageFiles,
        userProfileId: profile.id,
        listingId,
      });
    } catch (error) {
      return {
        status: "error",
        fieldErrors: {
          form: error instanceof Error ? error.message : "Unable to process images.",
        },
      };
    }
  }

  const previousBlobUrls = listing.images.map((image) => image.blobUrl);

  await prisma.$transaction(async (tx) => {
    await tx.storeListing.update({
      where: { id: listingId },
      data: {
        sellerName: data.sellerName,
        sellerPhone: data.sellerPhone,
        title: data.title,
        description: data.description,
        condition: data.condition,
        priceUsdCents: data.priceUsdCents,
        isNegotiable: data.isNegotiable,
      },
    });

    if (hasNewImages) {
      await tx.storeListingImage.deleteMany({ where: { listingId } });
      await tx.storeListingImage.createMany({ data: uploadedImages.map((image) => ({ ...image, listingId })) });
    }
  });

  if (hasNewImages) {
    await deleteStoreImageBlobs(previousBlobUrls).catch(() => {
      // Blob cleanup is best-effort so listing updates are not blocked.
    });
  }

  revalidatePath("/store");
  revalidatePath(`/store/${listingId}`);
  revalidatePath("/store/my-listings");

  return {
    ...INITIAL_STORE_LISTING_FORM_STATE,
    status: "success",
    message: "Listing updated.",
  };
}

export async function markStoreListingSold(listingId: string): Promise<{ success: boolean; message: string }> {
  let profile;
  try {
    profile = await requireRole(UserRole.PLAYER);
  } catch (error) {
    if (error instanceof AuthenticationRequiredError || error instanceof InsufficientRoleError) {
      return { success: false, message: "You must be signed in to manage listings." };
    }
    return { success: false, message: "Unable to validate user profile." };
  }

  const listing = await prisma.storeListing.findUnique({
    where: { id: listingId },
    select: { id: true, userProfileId: true },
  });

  if (!listing) {
    return { success: false, message: "Listing not found." };
  }

  if (listing.userProfileId !== profile.id) {
    return { success: false, message: "You can only mark your own listing as sold." };
  }

  await prisma.storeListing.update({
    where: { id: listingId },
    data: { status: "SOLD" },
  });

  revalidatePath("/store");
  revalidatePath(`/store/${listingId}`);
  revalidatePath("/store/my-listings");

  return { success: true, message: "Listing marked as sold." };
}

export async function deleteStoreListing(listingId: string): Promise<{ success: boolean; message: string }> {
  let profile;
  try {
    profile = await requireRole(UserRole.PLAYER);
  } catch (error) {
    if (error instanceof AuthenticationRequiredError || error instanceof InsufficientRoleError) {
      return { success: false, message: "You must be signed in to manage listings." };
    }
    return { success: false, message: "Unable to validate user profile." };
  }

  const listing = await prisma.storeListing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      userProfileId: true,
      images: {
        select: { blobUrl: true },
      },
    },
  });

  if (!listing) {
    return { success: false, message: "Listing not found." };
  }

  if (listing.userProfileId !== profile.id) {
    return { success: false, message: "You can only delete your own listing." };
  }

  const blobUrls = listing.images.map((image) => image.blobUrl);

  await prisma.storeListing.delete({
    where: { id: listingId },
  });

  await deleteStoreImageBlobs(blobUrls).catch(() => {
    // Blob cleanup is best-effort so listing deletion is not blocked.
  });

  revalidatePath("/store");
  revalidatePath(`/store/${listingId}`);
  revalidatePath("/store/my-listings");

  return { success: true, message: "Listing permanently deleted." };
}
