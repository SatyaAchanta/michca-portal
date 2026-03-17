-- CreateTable
CREATE TABLE "Youth15Registration" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "clubName" TEXT NOT NULL,
    "presidentName" TEXT NOT NULL,
    "presidentEmail" TEXT NOT NULL,
    "presidentPhoneNumber" TEXT NOT NULL,
    "secretaryName" TEXT,
    "secretaryEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Youth15Registration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Youth15Registration_userProfileId_key" ON "Youth15Registration"("userProfileId");

-- CreateIndex
CREATE INDEX "Youth15Registration_createdAt_idx" ON "Youth15Registration"("createdAt");

-- CreateIndex
CREATE INDEX "Youth15Registration_clubName_idx" ON "Youth15Registration"("clubName");

-- AddForeignKey
ALTER TABLE "Youth15Registration" ADD CONSTRAINT "Youth15Registration_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
