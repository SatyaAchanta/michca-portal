-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "boostersRemaining" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fantasyLevel" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fantasyPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fullParticipationWeeks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "levelBonusesAwarded" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "predictedWinnerCode" TEXT,
    "isBoosted" BOOLEAN NOT NULL DEFAULT false,
    "isScored" BOOLEAN NOT NULL DEFAULT false,
    "isCorrect" BOOLEAN,
    "pointsEarned" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Prediction_gameId_idx" ON "Prediction"("gameId");

-- CreateIndex
CREATE INDEX "Prediction_userProfileId_idx" ON "Prediction"("userProfileId");

-- CreateIndex
CREATE INDEX "Prediction_isScored_idx" ON "Prediction"("isScored");

-- CreateIndex
CREATE UNIQUE INDEX "Prediction_userProfileId_gameId_key" ON "Prediction"("userProfileId", "gameId");

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
