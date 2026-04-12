CREATE TABLE "WaiverSubmission" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "cricclubsId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "socialMediaHandle" TEXT NOT NULL,
    "t20Division" TEXT NOT NULL,
    "t20TeamCode" TEXT NOT NULL,
    "secondaryDivision" TEXT NOT NULL,
    "secondaryTeamCode" TEXT NOT NULL,
    "signatureName" TEXT NOT NULL,
    "acknowledgedSubmitText" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaiverSubmission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WaiverSubmission_userProfileId_year_key" ON "WaiverSubmission"("userProfileId", "year");
CREATE INDEX "WaiverSubmission_year_idx" ON "WaiverSubmission"("year");
CREATE INDEX "WaiverSubmission_submittedAt_idx" ON "WaiverSubmission"("submittedAt");
CREATE INDEX "WaiverSubmission_t20Division_idx" ON "WaiverSubmission"("t20Division");
CREATE INDEX "WaiverSubmission_secondaryDivision_idx" ON "WaiverSubmission"("secondaryDivision");
CREATE INDEX "WaiverSubmission_t20TeamCode_idx" ON "WaiverSubmission"("t20TeamCode");
CREATE INDEX "WaiverSubmission_secondaryTeamCode_idx" ON "WaiverSubmission"("secondaryTeamCode");
CREATE INDEX "WaiverSubmission_playerName_idx" ON "WaiverSubmission"("playerName");

ALTER TABLE "WaiverSubmission"
ADD CONSTRAINT "WaiverSubmission_userProfileId_fkey"
FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
