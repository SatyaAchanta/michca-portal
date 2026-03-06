/*
  Warnings:

  - You are about to drop the `CertificationAttempt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CertificationAttemptQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CertificationQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CertificationQuestionOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CertificationTestWindow` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CertificationAttempt" DROP CONSTRAINT "CertificationAttempt_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "CertificationAttempt" DROP CONSTRAINT "CertificationAttempt_windowId_fkey";

-- DropForeignKey
ALTER TABLE "CertificationAttemptQuestion" DROP CONSTRAINT "CertificationAttemptQuestion_attemptId_fkey";

-- DropForeignKey
ALTER TABLE "CertificationQuestion" DROP CONSTRAINT "CertificationQuestion_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "CertificationQuestionOption" DROP CONSTRAINT "CertificationQuestionOption_questionId_fkey";

-- DropForeignKey
ALTER TABLE "CertificationTestWindow" DROP CONSTRAINT "CertificationTestWindow_startedByUserId_fkey";

-- DropTable
DROP TABLE "CertificationAttempt";

-- DropTable
DROP TABLE "CertificationAttemptQuestion";

-- DropTable
DROP TABLE "CertificationQuestion";

-- DropTable
DROP TABLE "CertificationQuestionOption";

-- DropTable
DROP TABLE "CertificationTestWindow";

-- DropEnum
DROP TYPE "CertificationAttemptResult";

-- DropEnum
DROP TYPE "CertificationAttemptStatus";

-- DropEnum
DROP TYPE "CertificationWindowStatus";
