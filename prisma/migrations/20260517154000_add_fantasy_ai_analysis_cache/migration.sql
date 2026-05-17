-- CreateTable
CREATE TABLE "FantasyAnalysisReport" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "analyticsFingerprint" TEXT NOT NULL,
    "reportPayload" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FantasyAnalysisReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FantasyAnalysisReport_userProfileId_key" ON "FantasyAnalysisReport"("userProfileId");

-- CreateIndex
CREATE INDEX "FantasyAnalysisReport_expiresAt_idx" ON "FantasyAnalysisReport"("expiresAt");

-- CreateIndex
CREATE INDEX "FantasyAnalysisReport_analyticsFingerprint_idx" ON "FantasyAnalysisReport"("analyticsFingerprint");

-- AddForeignKey
ALTER TABLE "FantasyAnalysisReport" ADD CONSTRAINT "FantasyAnalysisReport_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
