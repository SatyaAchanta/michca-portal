-- CreateEnum
CREATE TYPE "CertificationWindowStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "CertificationAttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'TIME_EXPIRED');

-- CreateEnum
CREATE TYPE "CertificationAttemptResult" AS ENUM ('PASS', 'FAIL');

-- CreateTable
CREATE TABLE "CertificationQuestion" (
  "id" TEXT NOT NULL,
  "prompt" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdByUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CertificationQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificationQuestionOption" (
  "id" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "isCorrect" BOOLEAN NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CertificationQuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificationTestWindow" (
  "id" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "testDateLocal" DATE NOT NULL,
  "status" "CertificationWindowStatus" NOT NULL DEFAULT 'DRAFT',
  "durationMinutes" INTEGER NOT NULL DEFAULT 30,
  "questionCount" INTEGER NOT NULL DEFAULT 20,
  "startedByUserId" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CertificationTestWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificationAttempt" (
  "id" TEXT NOT NULL,
  "windowId" TEXT NOT NULL,
  "userProfileId" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "submittedAt" TIMESTAMP(3),
  "status" "CertificationAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
  "scorePercent" INTEGER,
  "correctCount" INTEGER,
  "totalQuestions" INTEGER NOT NULL,
  "result" "CertificationAttemptResult",
  "snapshotVersion" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CertificationAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificationAttemptQuestion" (
  "id" TEXT NOT NULL,
  "attemptId" TEXT NOT NULL,
  "displayOrder" INTEGER NOT NULL,
  "questionIdOriginal" TEXT NOT NULL,
  "promptSnapshot" TEXT NOT NULL,
  "optionsSnapshotJson" JSONB NOT NULL,
  "selectedOptionIdOriginal" TEXT,
  "isFlagged" BOOLEAN NOT NULL DEFAULT false,
  "answeredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CertificationAttemptQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CertificationQuestion_isActive_idx" ON "CertificationQuestion"("isActive");

-- CreateIndex
CREATE INDEX "CertificationQuestion_createdByUserId_idx" ON "CertificationQuestion"("createdByUserId");

-- CreateIndex
CREATE INDEX "CertificationQuestionOption_questionId_idx" ON "CertificationQuestionOption"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationQuestionOption_questionId_sortOrder_key" ON "CertificationQuestionOption"("questionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationTestWindow_location_testDateLocal_key" ON "CertificationTestWindow"("location", "testDateLocal");

-- CreateIndex
CREATE INDEX "CertificationTestWindow_status_idx" ON "CertificationTestWindow"("status");

-- CreateIndex
CREATE INDEX "CertificationTestWindow_testDateLocal_idx" ON "CertificationTestWindow"("testDateLocal");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationAttempt_windowId_userProfileId_key" ON "CertificationAttempt"("windowId", "userProfileId");

-- CreateIndex
CREATE INDEX "CertificationAttempt_userProfileId_idx" ON "CertificationAttempt"("userProfileId");

-- CreateIndex
CREATE INDEX "CertificationAttempt_status_idx" ON "CertificationAttempt"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationAttemptQuestion_attemptId_displayOrder_key" ON "CertificationAttemptQuestion"("attemptId", "displayOrder");

-- CreateIndex
CREATE INDEX "CertificationAttemptQuestion_attemptId_idx" ON "CertificationAttemptQuestion"("attemptId");

-- AddForeignKey
ALTER TABLE "CertificationQuestion" ADD CONSTRAINT "CertificationQuestion_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationQuestionOption" ADD CONSTRAINT "CertificationQuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CertificationQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationTestWindow" ADD CONSTRAINT "CertificationTestWindow_startedByUserId_fkey" FOREIGN KEY ("startedByUserId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationAttempt" ADD CONSTRAINT "CertificationAttempt_windowId_fkey" FOREIGN KEY ("windowId") REFERENCES "CertificationTestWindow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationAttempt" ADD CONSTRAINT "CertificationAttempt_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificationAttemptQuestion" ADD CONSTRAINT "CertificationAttemptQuestion_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "CertificationAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
