-- CreateEnum
CREATE TYPE "MichcaMadnessConfigStatus" AS ENUM ('COMING_SOON', 'READY', 'LOCKED');

-- CreateEnum
CREATE TYPE "MichcaMadnessEntryStatus" AS ENUM ('ALIVE', 'ELIMINATED');

-- CreateTable
CREATE TABLE "MichcaMadnessBracketConfig" (
    "id" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "division" "Division" NOT NULL,
    "templateKey" TEXT NOT NULL,
    "status" "MichcaMadnessConfigStatus" NOT NULL DEFAULT 'COMING_SOON',
    "lockAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MichcaMadnessBracketConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MichcaMadnessSeed" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "seedKey" TEXT NOT NULL,
    "pool" TEXT,
    "seed" INTEGER NOT NULL,
    "teamCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MichcaMadnessSeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MichcaMadnessGameSlot" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "slotKey" TEXT NOT NULL,
    "round" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "team1Source" TEXT NOT NULL,
    "team2Source" TEXT NOT NULL,
    "team1Code" TEXT,
    "team2Code" TEXT,
    "winnerCode" TEXT,
    "gameId" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "venue" TEXT,
    "needsAttention" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MichcaMadnessGameSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MichcaMadnessEntry" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "status" "MichcaMadnessEntryStatus" NOT NULL DEFAULT 'ALIVE',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MichcaMadnessEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MichcaMadnessPick" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "slotKey" TEXT NOT NULL,
    "predictedWinnerCode" TEXT NOT NULL,
    "isCorrect" BOOLEAN,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MichcaMadnessPick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MichcaMadnessBracketConfig_season_division_key" ON "MichcaMadnessBracketConfig"("season", "division");

-- CreateIndex
CREATE INDEX "MichcaMadnessBracketConfig_status_idx" ON "MichcaMadnessBracketConfig"("status");

-- CreateIndex
CREATE INDEX "MichcaMadnessBracketConfig_season_idx" ON "MichcaMadnessBracketConfig"("season");

-- CreateIndex
CREATE UNIQUE INDEX "MichcaMadnessSeed_configId_seedKey_key" ON "MichcaMadnessSeed"("configId", "seedKey");

-- CreateIndex
CREATE UNIQUE INDEX "MichcaMadnessSeed_configId_teamCode_key" ON "MichcaMadnessSeed"("configId", "teamCode");

-- CreateIndex
CREATE INDEX "MichcaMadnessSeed_teamCode_idx" ON "MichcaMadnessSeed"("teamCode");

-- CreateIndex
CREATE UNIQUE INDEX "MichcaMadnessGameSlot_configId_slotKey_key" ON "MichcaMadnessGameSlot"("configId", "slotKey");

-- CreateIndex
CREATE INDEX "MichcaMadnessGameSlot_gameId_idx" ON "MichcaMadnessGameSlot"("gameId");

-- CreateIndex
CREATE INDEX "MichcaMadnessGameSlot_winnerCode_idx" ON "MichcaMadnessGameSlot"("winnerCode");

-- CreateIndex
CREATE INDEX "MichcaMadnessGameSlot_scheduledAt_idx" ON "MichcaMadnessGameSlot"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "MichcaMadnessEntry_configId_userProfileId_key" ON "MichcaMadnessEntry"("configId", "userProfileId");

-- CreateIndex
CREATE INDEX "MichcaMadnessEntry_userProfileId_idx" ON "MichcaMadnessEntry"("userProfileId");

-- CreateIndex
CREATE INDEX "MichcaMadnessEntry_status_idx" ON "MichcaMadnessEntry"("status");

-- CreateIndex
CREATE INDEX "MichcaMadnessEntry_submittedAt_idx" ON "MichcaMadnessEntry"("submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MichcaMadnessPick_entryId_slotKey_key" ON "MichcaMadnessPick"("entryId", "slotKey");

-- CreateIndex
CREATE INDEX "MichcaMadnessPick_predictedWinnerCode_idx" ON "MichcaMadnessPick"("predictedWinnerCode");

-- CreateIndex
CREATE INDEX "MichcaMadnessPick_isCorrect_idx" ON "MichcaMadnessPick"("isCorrect");

-- AddForeignKey
ALTER TABLE "MichcaMadnessSeed" ADD CONSTRAINT "MichcaMadnessSeed_configId_fkey" FOREIGN KEY ("configId") REFERENCES "MichcaMadnessBracketConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MichcaMadnessGameSlot" ADD CONSTRAINT "MichcaMadnessGameSlot_configId_fkey" FOREIGN KEY ("configId") REFERENCES "MichcaMadnessBracketConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MichcaMadnessEntry" ADD CONSTRAINT "MichcaMadnessEntry_configId_fkey" FOREIGN KEY ("configId") REFERENCES "MichcaMadnessBracketConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MichcaMadnessEntry" ADD CONSTRAINT "MichcaMadnessEntry_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MichcaMadnessPick" ADD CONSTRAINT "MichcaMadnessPick_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "MichcaMadnessEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
