ALTER TABLE "WaiverSubmission"
ADD COLUMN "additionalT20Division" TEXT,
ADD COLUMN "additionalT20TeamCode" TEXT;

CREATE INDEX "WaiverSubmission_additionalT20Division_idx"
ON "WaiverSubmission"("additionalT20Division");

CREATE INDEX "WaiverSubmission_additionalT20TeamCode_idx"
ON "WaiverSubmission"("additionalT20TeamCode");
