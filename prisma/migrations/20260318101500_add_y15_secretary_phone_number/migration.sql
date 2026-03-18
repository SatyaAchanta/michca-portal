-- AlterTable
ALTER TABLE "Youth15Registration"
ADD COLUMN "secretaryPhoneNumber" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Youth15Registration"
ALTER COLUMN "secretaryPhoneNumber" DROP DEFAULT;
