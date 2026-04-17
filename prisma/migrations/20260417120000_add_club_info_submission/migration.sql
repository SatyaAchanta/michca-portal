-- AlterEnum
ALTER TYPE "public"."UserRole" ADD VALUE IF NOT EXISTS 'STATS_COMMITTEE';

-- AlterTable
ALTER TABLE "public"."UserProfile"
ADD COLUMN "contactNumber" TEXT;

-- CreateTable
CREATE TABLE "public"."ClubInfoSubmission" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "accountEmail" TEXT NOT NULL,
    "captainName" TEXT NOT NULL,
    "cricclubsId" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "t20Division" TEXT,
    "t20TeamCode" TEXT,
    "secondaryDivision" TEXT,
    "secondaryTeamCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubInfoSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClubInfoSubmission_userProfileId_key" ON "public"."ClubInfoSubmission"("userProfileId");

-- CreateIndex
CREATE INDEX "ClubInfoSubmission_createdAt_idx" ON "public"."ClubInfoSubmission"("createdAt");

-- CreateIndex
CREATE INDEX "ClubInfoSubmission_t20Division_idx" ON "public"."ClubInfoSubmission"("t20Division");

-- CreateIndex
CREATE INDEX "ClubInfoSubmission_t20TeamCode_idx" ON "public"."ClubInfoSubmission"("t20TeamCode");

-- CreateIndex
CREATE INDEX "ClubInfoSubmission_secondaryDivision_idx" ON "public"."ClubInfoSubmission"("secondaryDivision");

-- CreateIndex
CREATE INDEX "ClubInfoSubmission_secondaryTeamCode_idx" ON "public"."ClubInfoSubmission"("secondaryTeamCode");

-- CreateIndex
CREATE INDEX "ClubInfoSubmission_captainName_idx" ON "public"."ClubInfoSubmission"("captainName");

-- AddForeignKey
ALTER TABLE "public"."ClubInfoSubmission"
ADD CONSTRAINT "ClubInfoSubmission_userProfileId_fkey"
FOREIGN KEY ("userProfileId") REFERENCES "public"."UserProfile"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
