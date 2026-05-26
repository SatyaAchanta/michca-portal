CREATE TYPE "GameResult" AS ENUM ('PENDING', 'WIN', 'DRAW', 'ABANDONED', 'CANCELLED');

ALTER TABLE "Game"
ADD COLUMN "resultType" "GameResult" NOT NULL DEFAULT 'PENDING';

UPDATE "Game"
SET "resultType" = CASE
  WHEN "isCancelled" = true THEN 'CANCELLED'::"GameResult"
  WHEN "isDraw" = true THEN 'ABANDONED'::"GameResult"
  WHEN "winnerCode" IS NOT NULL THEN 'WIN'::"GameResult"
  ELSE 'PENDING'::"GameResult"
END;

CREATE INDEX "Game_resultType_idx" ON "Game"("resultType");
