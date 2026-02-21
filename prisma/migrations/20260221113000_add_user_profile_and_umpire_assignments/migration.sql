-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('PLAYER', 'UMPIRE', 'ADMIN');

-- CreateTable
CREATE TABLE "public"."UserProfile" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "newsletterSubscribed" BOOLEAN NOT NULL DEFAULT false,
    "role" "public"."UserRole" NOT NULL DEFAULT 'PLAYER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UmpireAssignment" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "umpireId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UmpireAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_clerkUserId_key" ON "public"."UserProfile"("clerkUserId");

-- CreateIndex
CREATE INDEX "UserProfile_email_idx" ON "public"."UserProfile"("email");

-- CreateIndex
CREATE INDEX "UserProfile_role_idx" ON "public"."UserProfile"("role");

-- CreateIndex
CREATE UNIQUE INDEX "UmpireAssignment_gameId_umpireId_key" ON "public"."UmpireAssignment"("gameId", "umpireId");

-- CreateIndex
CREATE INDEX "UmpireAssignment_umpireId_idx" ON "public"."UmpireAssignment"("umpireId");

-- CreateIndex
CREATE INDEX "UmpireAssignment_gameId_idx" ON "public"."UmpireAssignment"("gameId");

-- AddForeignKey
ALTER TABLE "public"."UmpireAssignment" ADD CONSTRAINT "UmpireAssignment_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UmpireAssignment" ADD CONSTRAINT "UmpireAssignment_umpireId_fkey" FOREIGN KEY ("umpireId") REFERENCES "public"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
