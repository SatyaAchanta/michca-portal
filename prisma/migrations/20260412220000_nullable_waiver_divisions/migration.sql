-- AlterTable
ALTER TABLE "WaiverSubmission" ALTER COLUMN "t20Division" DROP NOT NULL;
ALTER TABLE "WaiverSubmission" ALTER COLUMN "t20TeamCode" DROP NOT NULL;
ALTER TABLE "WaiverSubmission" ALTER COLUMN "secondaryDivision" DROP NOT NULL;
ALTER TABLE "WaiverSubmission" ALTER COLUMN "secondaryTeamCode" DROP NOT NULL;
