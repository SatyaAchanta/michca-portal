-- CreateEnum
CREATE TYPE "GearCondition" AS ENUM ('NEW', 'USED');

-- CreateEnum
CREATE TYPE "StoreListingStatus" AS ENUM ('ACTIVE', 'SOLD');

-- CreateTable
CREATE TABLE "StoreListing" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "sellerName" TEXT NOT NULL,
    "sellerPhone" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "condition" "GearCondition" NOT NULL,
    "priceUsdCents" INTEGER NOT NULL,
    "isNegotiable" BOOLEAN NOT NULL DEFAULT false,
    "status" "StoreListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreListingImage" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "blobUrl" TEXT NOT NULL,
    "blobPathname" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreListingImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoreListing_status_createdAt_idx" ON "StoreListing"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "StoreListing_userProfileId_updatedAt_idx" ON "StoreListing"("userProfileId", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "StoreListingImage_listingId_idx" ON "StoreListingImage"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreListingImage_listingId_sortOrder_key" ON "StoreListingImage"("listingId", "sortOrder");

-- AddForeignKey
ALTER TABLE "StoreListing" ADD CONSTRAINT "StoreListing_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreListingImage" ADD CONSTRAINT "StoreListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "StoreListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
