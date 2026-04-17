ALTER TABLE "UserProfile"
ADD COLUMN "t20TeamCode" TEXT,
ADD COLUMN "secondaryTeamCode" TEXT,
ADD COLUMN "playingRole" TEXT;

CREATE INDEX "UserProfile_t20TeamCode_idx" ON "UserProfile"("t20TeamCode");
CREATE INDEX "UserProfile_secondaryTeamCode_idx" ON "UserProfile"("secondaryTeamCode");
CREATE INDEX "UserProfile_playingRole_idx" ON "UserProfile"("playingRole");
