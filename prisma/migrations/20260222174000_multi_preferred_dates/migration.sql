-- CreateEnum
CREATE TYPE "UmpiringTrainingDateOption" AS ENUM ('MARCH_28_2026', 'MARCH_29_2026');

-- AlterTable
ALTER TABLE "UmpiringTraining"
ADD COLUMN "preferredDates" "UmpiringTrainingDateOption"[] NOT NULL DEFAULT ARRAY[]::"UmpiringTrainingDateOption"[];

-- Backfill from legacy single preferredDate column
UPDATE "UmpiringTraining"
SET "preferredDates" = CASE
  WHEN "preferredDate"::date = DATE '2026-03-28' THEN ARRAY['MARCH_28_2026']::"UmpiringTrainingDateOption"[]
  WHEN "preferredDate"::date = DATE '2026-03-29' THEN ARRAY['MARCH_29_2026']::"UmpiringTrainingDateOption"[]
  ELSE ARRAY[]::"UmpiringTrainingDateOption"[]
END;

-- Remove default after backfill
ALTER TABLE "UmpiringTraining" ALTER COLUMN "preferredDates" DROP DEFAULT;

-- Drop legacy column
ALTER TABLE "UmpiringTraining" DROP COLUMN "preferredDate";

-- CreateIndex
CREATE INDEX "UmpiringTraining_preferredDates_idx" ON "UmpiringTraining"("preferredDates");
