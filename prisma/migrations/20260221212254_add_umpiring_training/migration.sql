-- CreateEnum
CREATE TYPE "UmpiringTrainingResult" AS ENUM ('PENDING', 'PASS', 'FAIL');

-- CreateTable
CREATE TABLE "UmpiringTraining" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "previouslyCertified" BOOLEAN NOT NULL,
    "affiliation" TEXT,
    "preferredDate" TIMESTAMP(3) NOT NULL,
    "preferredLocation" TEXT NOT NULL,
    "questions" TEXT,
    "result" "UmpiringTrainingResult" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UmpiringTraining_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UmpiringTraining_userProfileId_key" ON "UmpiringTraining"("userProfileId");

-- CreateIndex
CREATE INDEX "UmpiringTraining_result_idx" ON "UmpiringTraining"("result");

-- CreateIndex
CREATE INDEX "UmpiringTraining_createdAt_idx" ON "UmpiringTraining"("createdAt");

-- CreateIndex
CREATE INDEX "UmpiringTraining_preferredDate_idx" ON "UmpiringTraining"("preferredDate");

-- AddForeignKey
ALTER TABLE "UmpiringTraining" ADD CONSTRAINT "UmpiringTraining_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
