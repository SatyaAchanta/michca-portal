-- AlterTable
ALTER TABLE "CertificationQuestion"
ADD COLUMN "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "CertificationAttemptQuestion"
ADD COLUMN "imageUrlSnapshot" TEXT;
