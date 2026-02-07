-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Division" AS ENUM ('F40', 'PREMIER_T20', 'DIV1_T20', 'DIV2_T20', 'DIV3_T20', 'T30', 'U15', 'GLT');

-- CreateEnum
CREATE TYPE "public"."GameType" AS ENUM ('LEAGUE', 'PLAYOFF');

-- CreateEnum
CREATE TYPE "public"."GameStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."Team" (
    "shortCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("shortCode")
);

-- CreateTable
CREATE TABLE "public"."Game" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "division" "public"."Division" NOT NULL,
    "status" "public"."GameStatus" NOT NULL DEFAULT 'SCHEDULED',
    "venue" TEXT,
    "team1ShortCode" TEXT NOT NULL,
    "team2ShortCode" TEXT NOT NULL,
    "gameType" "public"."GameType" NOT NULL DEFAULT 'LEAGUE',
    "winnerShortCode" TEXT,
    "isDraw" BOOLEAN NOT NULL DEFAULT false,
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "team1Score" INTEGER,
    "team2Score" INTEGER,
    "resultNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Game_date_idx" ON "public"."Game"("date");

-- CreateIndex
CREATE INDEX "Game_status_idx" ON "public"."Game"("status");

-- AddForeignKey
ALTER TABLE "public"."Game" ADD CONSTRAINT "Game_team1ShortCode_fkey" FOREIGN KEY ("team1ShortCode") REFERENCES "public"."Team"("shortCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Game" ADD CONSTRAINT "Game_team2ShortCode_fkey" FOREIGN KEY ("team2ShortCode") REFERENCES "public"."Team"("shortCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Game" ADD CONSTRAINT "Game_winnerShortCode_fkey" FOREIGN KEY ("winnerShortCode") REFERENCES "public"."Team"("shortCode") ON DELETE SET NULL ON UPDATE CASCADE;

