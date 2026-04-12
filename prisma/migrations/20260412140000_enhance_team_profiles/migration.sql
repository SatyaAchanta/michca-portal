DO $$
BEGIN
    CREATE TYPE "public"."TeamFormat" AS ENUM ('T20', 'F40', 'T30', 'YOUTH', 'GLT');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "public"."Game" DROP CONSTRAINT IF EXISTS "Game_team1ShortCode_fkey";
ALTER TABLE "public"."Game" DROP CONSTRAINT IF EXISTS "Game_team2ShortCode_fkey";
ALTER TABLE "public"."Game" DROP CONSTRAINT IF EXISTS "Game_winnerShortCode_fkey";

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'Game' AND column_name = 'team1ShortCode'
    ) THEN
        ALTER TABLE "public"."Game" RENAME COLUMN "team1ShortCode" TO "team1Code";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'Game' AND column_name = 'team2ShortCode'
    ) THEN
        ALTER TABLE "public"."Game" RENAME COLUMN "team2ShortCode" TO "team2Code";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'Game' AND column_name = 'winnerShortCode'
    ) THEN
        ALTER TABLE "public"."Game" RENAME COLUMN "winnerShortCode" TO "winnerCode";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'Team'
    ) AND NOT EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'TeamLegacy'
    ) THEN
        ALTER TABLE "public"."Team" RENAME TO "TeamLegacy";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'TeamLegacy'
    ) AND EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Team_pkey' AND conrelid = 'public."TeamLegacy"'::regclass
    ) THEN
        ALTER TABLE "public"."TeamLegacy" RENAME CONSTRAINT "Team_pkey" TO "TeamLegacy_pkey";
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "public"."Team" (
    "teamCode" TEXT NOT NULL,
    "format" "public"."TeamFormat" NOT NULL,
    "division" "public"."Division" NOT NULL,
    "teamShortCode" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "description" TEXT,
    "captainId" TEXT,
    "viceCaptainId" TEXT,
    "facebookPage" TEXT,
    "instagramPage" TEXT,
    "logo" TEXT
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Team_pkey' AND conrelid = 'public."Team"'::regclass
    ) THEN
        ALTER TABLE "public"."Team" ADD CONSTRAINT "Team_pkey" PRIMARY KEY ("teamCode");
    END IF;
END $$;

INSERT INTO "public"."Team" ("teamCode", "format", "division", "teamShortCode", "teamName")
VALUES
    ('T20-DARI', 'T20', 'DIV1_T20', 'DARI', 'Dark Invaders CC DARI'),
    ('T20-DCCC', 'T20', 'DIV1_T20', 'DCCC', 'Detroit Challengers CC DCCC'),
    ('T20-DSKS', 'T20', 'DIV1_T20', 'DSKS', 'Detroit Super Kings CC Sharks DSKS'),
    ('T20-FCXI', 'T20', 'DIV1_T20', 'FCXI', 'Farmington CC Kings XI FCXI'),
    ('T20-GRSM', 'T20', 'DIV1_T20', 'GRSM', 'MIGR Single Malt GRSM'),
    ('T20-MIGR', 'T20', 'DIV1_T20', 'MIGR', 'MIGR Old Monks MIGR'),
    ('T20-HTCC', 'T20', 'DIV1_T20', 'HTCC', 'Hamtramck CC HTCC'),
    ('T20-KECC', 'T20', 'DIV1_T20', 'KECC', 'Karnataka Eagles CC KECC'),
    ('T20-MACO', 'T20', 'DIV1_T20', 'MACO', 'Macomb CC Olympians MACO'),
    ('T20-MBCC', 'T20', 'DIV1_T20', 'MBCC', 'Michigan Bengals CC MBCC'),
    ('T20-MDCC', 'T20', 'DIV1_T20', 'MDCC', 'Metro Detroit CC MDCC'),
    ('T20-MICA', 'T20', 'DIV1_T20', 'MICA', 'Michigan International CA Thunderbirds MICA'),
    ('T20-MMCH', 'T20', 'DIV1_T20', 'MMCH', 'Mid Michigan CC Heroes MMCH'),
    ('T20-MOCC', 'T20', 'DIV1_T20', 'MOCC', 'Motown CC MOCC'),
    ('T20-NLCC', 'T20', 'DIV1_T20', 'NLCC', 'Northville Cricket Club NLCC'),
    ('T20-ROCK', 'T20', 'DIV1_T20', 'ROCK', 'Rockstars ROCK'),
    ('T20-SCC', 'T20', 'DIV1_T20', 'SCC', 'Samrats Cricket Club SCC'),
    ('T20-SHCC', 'T20', 'DIV1_T20', 'SHCC', 'Smashers Cricket Club SHCC'),
    ('T20-SLCL', 'T20', 'DIV1_T20', 'SLCL', 'South Lyon Cricket Club Legends SLCL'),
    ('T20-SNCC', 'T20', 'DIV1_T20', 'SNCC', 'Sinha Cricket Club SNCC'),
    ('T20-UNCC', 'T20', 'DIV1_T20', 'UNCC', 'United CC UNCC'),
    ('T20-UTCC', 'T20', 'DIV1_T20', 'UTCC', 'University of Toledo Rockets UTCC'),
    ('T20-WFCC', 'T20', 'DIV1_T20', 'WFCC', 'Warren Flames Cricket Club WFCC'),
    ('T20-WMCC', 'T20', 'DIV1_T20', 'WMCC', 'West Michigan CC WMCC'),
    ('T20-ADCC', 'T20', 'DIV2_T20', 'ADCC', 'Aadukalam CC Cheavliers ADCC'),
    ('T20-BLAK', 'T20', 'DIV2_T20', 'BLAK', 'Big League Arena CCKnights BLAK'),
    ('T20-DDCC', 'T20', 'DIV2_T20', 'DDCC', 'Detroit Dynos CC DDCC'),
    ('T20-DEDR', 'T20', 'DIV2_T20', 'DEDR', 'Detroit Dragons DEDR'),
    ('T20-FBCC', 'T20', 'DIV2_T20', 'FBCC', 'Farmington Blazers CC FBCC'),
    ('T20-KLCA', 'T20', 'DIV2_T20', 'KLCA', 'Killers Acadamy CC KLCA'),
    ('T20-MBCW', 'T20', 'DIV2_T20', 'MBCW', 'Michigan Bengals CC Warriors MBCW'),
    ('T20-MCC', 'T20', 'DIV2_T20', 'MCC', 'Motor City Chargers Cricket Club MCC'),
    ('T20-MICH', 'T20', 'DIV2_T20', 'MICH', 'Michigan Challengers MICH'),
    ('T20-MIDS', 'T20', 'DIV2_T20', 'MIDS', 'Michigan Dreamers CC MIDS'),
    ('T20-MIRC', 'T20', 'DIV2_T20', 'MIRC', 'Michigan Rangers CC MIRC'),
    ('T20-MLCC', 'T20', 'DIV2_T20', 'MLCC', 'Majestic Lions CC MLCC'),
    ('T20-MVCC', 'T20', 'DIV2_T20', 'MVCC', 'Mavericks Cricket Club MVCC'),
    ('T20-OCCC', 'T20', 'DIV2_T20', 'OCCC', 'Oakland County CC OCCC'),
    ('T20-ODCL', 'T20', 'DIV2_T20', 'ODCL', 'Odia CA Lancers ODCL'),
    ('T20-RACC', 'T20', 'DIV2_T20', 'RACC', 'Royal Albatross CC RACC'),
    ('T20-RECC', 'T20', 'DIV2_T20', 'RECC', 'Rebels Cricket Club RECC'),
    ('T20-RIST', 'T20', 'DIV2_T20', 'RIST', 'Rising Stars CC RIST'),
    ('T20-RKTE', 'T20', 'DIV2_T20', 'RKTE', 'Royal Knights CC Terminators RKTE'),
    ('T20-SCRP', 'T20', 'DIV2_T20', 'SCRP', 'Scorpions Cricket Club SCRP'),
    ('T20-SIXC', 'T20', 'DIV2_T20', 'SIXC', 'Sixers Cricket Club SIXC'),
    ('T20-SLCA', 'T20', 'DIV2_T20', 'SLCA', 'South Lyon Cricket Club Avengers SLCA'),
    ('T20-TCAS', 'T20', 'DIV2_T20', 'TCAS', 'Troy CA Stars TCAS'),
    ('T20-TSXI', 'T20', 'DIV2_T20', 'TSXI', 'The Squad Cricket Club TSXI'),
    ('T20-ADCB', 'T20', 'DIV3_T20', 'ADCB', 'Aadukalam CC Chembians ADCB'),
    ('T20-CRWN', 'T20', 'DIV3_T20', 'CRWN', 'Crowned Strikers CRWN'),
    ('T20-DEEG', 'T20', 'DIV3_T20', 'DEEG', 'Detroit Eagles Cricket Club DEEG'),
    ('T20-DICE', 'T20', 'DIV3_T20', 'DICE', 'DETROIT ICE DICE'),
    ('T20-DTCC', 'T20', 'DIV3_T20', 'DTCC', 'Deccan Tigers Cricket Club DTCC'),
    ('T20-FAFL', 'T20', 'DIV3_T20', 'FAFL', 'Farmington CC Falcons FAFL'),
    ('T20-FSCC', 'T20', 'DIV3_T20', 'FSCC', 'Farmington Stars FSCC'),
    ('T20-MACH', 'T20', 'DIV3_T20', 'MACH', 'MACHI CC MACH'),
    ('T20-FCCB', 'T20', 'DIV3_T20', 'FCCB', 'Farmington Cricket Club Broncos FCCB'),
    ('T20-MELC', 'T20', 'DIV3_T20', 'MELC', 'Michigan Elite CC MELC'),
    ('T20-MICF', 'T20', 'DIV3_T20', 'MICF', 'Michigan International CA Firebirds MICF'),
    ('T20-MRSC', 'T20', 'DIV3_T20', 'MRSC', 'Michigan Rising Stars CC MRSC'),
    ('T20-MYCA', 'T20', 'DIV3_T20', 'MYCA', 'MYCA Elite MYCA'),
    ('T20-NLCR', 'T20', 'DIV3_T20', 'NLCR', 'Northville Cricket Club Risers NLCR'),
    ('T20-NVVK', 'T20', 'DIV3_T20', 'NVVK', 'Novi Vikings NVVK'),
    ('T20-ODCT', 'T20', 'DIV3_T20', 'ODCT', 'Odia CA Titans ODCT'),
    ('T20-PRSD', 'T20', 'DIV3_T20', 'PRSD', 'Prime Strikers PRSD'),
    ('T20-RRCC', 'T20', 'DIV3_T20', 'RRCC', 'Royal Risers Cricket Club RRCC'),
    ('T20-SHEP', 'T20', 'DIV3_T20', 'SHEP', 'Sylhet Express SHEP'),
    ('T20-SPCA', 'T20', 'DIV3_T20', 'SPCA', 'South Peninsula Cricket Association SPCA'),
    ('T20-SPCC', 'T20', 'DIV3_T20', 'SPCC', 'Sparks CC SPCC'),
    ('T20-BBNC', 'T20', 'PREMIER_T20', 'BBNC', 'Become Better Novi Cardinals BBNC'),
    ('T20-BSCC', 'T20', 'PREMIER_T20', 'BSCC', 'Brownstown Nirvana CC BSCC'),
    ('T20-CHWA', 'T20', 'PREMIER_T20', 'CHWA', 'Chargers Warriors Association CHWA'),
    ('T20-DRCC', 'T20', 'PREMIER_T20', 'DRCC', 'Detroit Royals CC DRCC'),
    ('T20-GPAN', 'T20', 'PREMIER_T20', 'GPAN', 'Greater Detroit CC Panthers GPAN'),
    ('T20-KLCC', 'T20', 'PREMIER_T20', 'KLCC', 'Killers CC KLCC'),
    ('T20-MACT', 'T20', 'PREMIER_T20', 'MACT', 'Macomb CC Titans MACT'),
    ('T20-MCUC', 'T20', 'PREMIER_T20', 'MCUC', 'Motor City United CC MCUC'),
    ('T20-MICT', 'T20', 'PREMIER_T20', 'MICT', 'Michigan Cheetahs MICT'),
    ('T20-MIWA', 'T20', 'PREMIER_T20', 'MIWA', 'Michigan Warriors MIWA'),
    ('T20-ODCC', 'T20', 'PREMIER_T20', 'ODCC', 'Odia CA Crusaders ODCC'),
    ('T20-PCC', 'T20', 'PREMIER_T20', 'PCC', 'Punjab Cricket Club PCC'),
    ('T20-SUSC', 'T20', 'PREMIER_T20', 'SUSC', 'Stellar United Sporting Club SUSC'),
    ('T20-TCSK', 'T20', 'PREMIER_T20', 'TCSK', 'Troy Cricket Super Kings TCSK'),
    ('F40-NCC', 'F40', 'F40', 'NCC', 'Nirvana Cricket Club'),
    ('F40-RKCC', 'F40', 'F40', 'RKCC', 'Royal Knight Cricket Club'),
    ('F40-MACC', 'F40', 'F40', 'MACC', 'Macomb Cricket Club'),
    ('F40-ODCC', 'F40', 'F40', 'ODCC', 'Odia Cricket Association Crusiders'),
    ('F40-SCC', 'F40', 'F40', 'SCC', 'Samrat Cricket Club'),
    ('F40-GPAN', 'F40', 'F40', 'GPAN', 'Greater Detroit CC Panthers'),
    ('T30-FCXI', 'T30', 'T30', 'FCXI', 'Farmington CC Kings XI'),
    ('T30-MIRC', 'T30', 'T30', 'MIRC', 'Michigan Rangers Cricket Club'),
    ('T30-MICF', 'T30', 'T30', 'MICF', 'Michigan International CA Falcons'),
    ('T30-DSKB', 'T30', 'T30', 'DSKB', 'Detroit Super Kings Bulls'),
    ('T30-SLCE', 'T30', 'T30', 'SLCE', 'South Lyon Cricket Club Eagles'),
    ('T30-MIWA', 'T30', 'T30', 'MIWA', 'Michigan Warriors'),
    ('T30-BLAB', 'T30', 'T30', 'BLAB', 'Big League Arena Cricket Club'),
    ('T30-MOCC', 'T30', 'T30', 'MOCC', 'Motown Cricket Club'),
    ('T30-SPCA', 'T30', 'T30', 'SPCA', 'South Peninsula Cricket Association'),
    ('T30-MICC', 'T30', 'T30', 'MICC', 'Michigan International CA Chargers'),
    ('T30-PRSD', 'T30', 'T30', 'PRSD', 'Prime Strikers'),
    ('T30-RBCC', 'T30', 'T30', 'RBCC', 'Royal Bengal Cricket Club'),
    ('T30-MLCC', 'T30', 'T30', 'MLCC', 'Majestic Lions Cricket Club'),
    ('T30-TSXI', 'T30', 'T30', 'TSXI', 'The Squad Cricket Club'),
    ('T30-MVCC', 'T30', 'T30', 'MVCC', 'Mavericks Cricket Club'),
    ('T30-DARI', 'T30', 'T30', 'DARI', 'Dark Invaders Cricket Club'),
    ('T30-UNCC', 'T30', 'T30', 'UNCC', 'United Cricket Club'),
    ('YOUTH-PCAS', 'YOUTH', 'U15', 'PCAS', 'Prime Cricket Academy Strikers'),
    ('YOUTH-PCAW', 'YOUTH', 'U15', 'PCAW', 'Prime Cricket Academy Warriors'),
    ('YOUTH-BBCA', 'YOUTH', 'U15', 'BBCA', 'Become Better Cricket Academy'),
    ('YOUTH-MMYC', 'YOUTH', 'U15', 'MMYC', 'Michigan Mustangs')
ON CONFLICT ("teamCode") DO NOTHING;

WITH "ReferencedTeams" AS (
    SELECT DISTINCT
        CASE
            WHEN POSITION('-' IN g."team1Code") > 0 THEN g."team1Code"
            WHEN g."division" IN ('DIV1_T20', 'DIV2_T20', 'DIV3_T20', 'PREMIER_T20') THEN 'T20-' || UPPER(g."team1Code")
            WHEN g."division" = 'F40' THEN 'F40-' || UPPER(g."team1Code")
            WHEN g."division" = 'T30' THEN 'T30-' || UPPER(g."team1Code")
            WHEN g."division" = 'U15' THEN 'YOUTH-' || UPPER(g."team1Code")
            ELSE 'GLT-' || UPPER(g."team1Code")
        END AS "teamCode",
        CASE
            WHEN g."division" IN ('DIV1_T20', 'DIV2_T20', 'DIV3_T20', 'PREMIER_T20') THEN 'T20'::"public"."TeamFormat"
            WHEN g."division" = 'F40' THEN 'F40'::"public"."TeamFormat"
            WHEN g."division" = 'T30' THEN 'T30'::"public"."TeamFormat"
            WHEN g."division" = 'U15' THEN 'YOUTH'::"public"."TeamFormat"
            ELSE 'GLT'::"public"."TeamFormat"
        END AS "format",
        g."division",
        UPPER(CASE WHEN POSITION('-' IN g."team1Code") > 0 THEN split_part(g."team1Code", '-', 2) ELSE g."team1Code" END) AS "teamShortCode",
        tl."name" AS "teamName"
    FROM "public"."Game" g
    INNER JOIN "public"."TeamLegacy" tl ON tl."shortCode" = CASE WHEN POSITION('-' IN g."team1Code") > 0 THEN split_part(g."team1Code", '-', 2) ELSE g."team1Code" END
    UNION
    SELECT DISTINCT
        CASE
            WHEN POSITION('-' IN g."team2Code") > 0 THEN g."team2Code"
            WHEN g."division" IN ('DIV1_T20', 'DIV2_T20', 'DIV3_T20', 'PREMIER_T20') THEN 'T20-' || UPPER(g."team2Code")
            WHEN g."division" = 'F40' THEN 'F40-' || UPPER(g."team2Code")
            WHEN g."division" = 'T30' THEN 'T30-' || UPPER(g."team2Code")
            WHEN g."division" = 'U15' THEN 'YOUTH-' || UPPER(g."team2Code")
            ELSE 'GLT-' || UPPER(g."team2Code")
        END,
        CASE
            WHEN g."division" IN ('DIV1_T20', 'DIV2_T20', 'DIV3_T20', 'PREMIER_T20') THEN 'T20'::"public"."TeamFormat"
            WHEN g."division" = 'F40' THEN 'F40'::"public"."TeamFormat"
            WHEN g."division" = 'T30' THEN 'T30'::"public"."TeamFormat"
            WHEN g."division" = 'U15' THEN 'YOUTH'::"public"."TeamFormat"
            ELSE 'GLT'::"public"."TeamFormat"
        END,
        g."division",
        UPPER(CASE WHEN POSITION('-' IN g."team2Code") > 0 THEN split_part(g."team2Code", '-', 2) ELSE g."team2Code" END),
        tl."name"
    FROM "public"."Game" g
    INNER JOIN "public"."TeamLegacy" tl ON tl."shortCode" = CASE WHEN POSITION('-' IN g."team2Code") > 0 THEN split_part(g."team2Code", '-', 2) ELSE g."team2Code" END
    UNION
    SELECT DISTINCT
        CASE
            WHEN POSITION('-' IN g."winnerCode") > 0 THEN g."winnerCode"
            WHEN g."division" IN ('DIV1_T20', 'DIV2_T20', 'DIV3_T20', 'PREMIER_T20') THEN 'T20-' || UPPER(g."winnerCode")
            WHEN g."division" = 'F40' THEN 'F40-' || UPPER(g."winnerCode")
            WHEN g."division" = 'T30' THEN 'T30-' || UPPER(g."winnerCode")
            WHEN g."division" = 'U15' THEN 'YOUTH-' || UPPER(g."winnerCode")
            ELSE 'GLT-' || UPPER(g."winnerCode")
        END,
        CASE
            WHEN g."division" IN ('DIV1_T20', 'DIV2_T20', 'DIV3_T20', 'PREMIER_T20') THEN 'T20'::"public"."TeamFormat"
            WHEN g."division" = 'F40' THEN 'F40'::"public"."TeamFormat"
            WHEN g."division" = 'T30' THEN 'T30'::"public"."TeamFormat"
            WHEN g."division" = 'U15' THEN 'YOUTH'::"public"."TeamFormat"
            ELSE 'GLT'::"public"."TeamFormat"
        END,
        g."division",
        UPPER(CASE WHEN POSITION('-' IN g."winnerCode") > 0 THEN split_part(g."winnerCode", '-', 2) ELSE g."winnerCode" END),
        tl."name"
    FROM "public"."Game" g
    INNER JOIN "public"."TeamLegacy" tl ON tl."shortCode" = CASE WHEN POSITION('-' IN g."winnerCode") > 0 THEN split_part(g."winnerCode", '-', 2) ELSE g."winnerCode" END
    WHERE g."winnerCode" IS NOT NULL
)
INSERT INTO "public"."Team" ("teamCode", "format", "division", "teamShortCode", "teamName")
SELECT rt."teamCode", rt."format", rt."division", rt."teamShortCode", rt."teamName"
FROM "ReferencedTeams" rt
ON CONFLICT ("teamCode") DO NOTHING;

INSERT INTO "public"."Team" ("teamCode", "format", "division", "teamShortCode", "teamName")
SELECT
    'GLT-' || UPPER(tl."shortCode"),
    'GLT'::"public"."TeamFormat",
    'GLT'::"public"."Division",
    UPPER(tl."shortCode"),
    tl."name"
FROM "public"."TeamLegacy" tl
WHERE NOT EXISTS (
    SELECT 1
    FROM "public"."Team" t
    WHERE t."teamCode" = 'GLT-' || UPPER(tl."shortCode")
)
ON CONFLICT ("teamCode") DO NOTHING;

UPDATE "public"."Game"
SET "team1Code" = CASE
    WHEN "division" IN ('DIV1_T20', 'DIV2_T20', 'DIV3_T20', 'PREMIER_T20') THEN 'T20-' || UPPER("team1Code")
    WHEN "division" = 'F40' THEN 'F40-' || UPPER("team1Code")
    WHEN "division" = 'T30' THEN 'T30-' || UPPER("team1Code")
    WHEN "division" = 'U15' THEN 'YOUTH-' || UPPER("team1Code")
    ELSE 'GLT-' || UPPER("team1Code")
END
WHERE POSITION('-' IN "team1Code") = 0;

UPDATE "public"."Game"
SET "team2Code" = CASE
    WHEN "division" IN ('DIV1_T20', 'DIV2_T20', 'DIV3_T20', 'PREMIER_T20') THEN 'T20-' || UPPER("team2Code")
    WHEN "division" = 'F40' THEN 'F40-' || UPPER("team2Code")
    WHEN "division" = 'T30' THEN 'T30-' || UPPER("team2Code")
    WHEN "division" = 'U15' THEN 'YOUTH-' || UPPER("team2Code")
    ELSE 'GLT-' || UPPER("team2Code")
END
WHERE POSITION('-' IN "team2Code") = 0;

UPDATE "public"."Game"
SET "winnerCode" = CASE
    WHEN "division" IN ('DIV1_T20', 'DIV2_T20', 'DIV3_T20', 'PREMIER_T20') THEN 'T20-' || UPPER("winnerCode")
    WHEN "division" = 'F40' THEN 'F40-' || UPPER("winnerCode")
    WHEN "division" = 'T30' THEN 'T30-' || UPPER("winnerCode")
    WHEN "division" = 'U15' THEN 'YOUTH-' || UPPER("winnerCode")
    ELSE 'GLT-' || UPPER("winnerCode")
END
WHERE "winnerCode" IS NOT NULL AND POSITION('-' IN "winnerCode") = 0;

DROP TABLE IF EXISTS "public"."TeamLegacy";

CREATE INDEX IF NOT EXISTS "Team_division_idx" ON "public"."Team"("division");
CREATE INDEX IF NOT EXISTS "Team_format_idx" ON "public"."Team"("format");
CREATE INDEX IF NOT EXISTS "Team_teamShortCode_idx" ON "public"."Team"("teamShortCode");
CREATE INDEX IF NOT EXISTS "Team_captainId_idx" ON "public"."Team"("captainId");
CREATE INDEX IF NOT EXISTS "Team_viceCaptainId_idx" ON "public"."Team"("viceCaptainId");
CREATE INDEX IF NOT EXISTS "Game_team1Code_idx" ON "public"."Game"("team1Code");
CREATE INDEX IF NOT EXISTS "Game_team2Code_idx" ON "public"."Game"("team2Code");
CREATE INDEX IF NOT EXISTS "Game_winnerCode_idx" ON "public"."Game"("winnerCode");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'Team_captainId_fkey' AND conrelid = 'public."Team"'::regclass
    ) THEN
        ALTER TABLE "public"."Team"
            ADD CONSTRAINT "Team_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "public"."UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'Team_viceCaptainId_fkey' AND conrelid = 'public."Team"'::regclass
    ) THEN
        ALTER TABLE "public"."Team"
            ADD CONSTRAINT "Team_viceCaptainId_fkey" FOREIGN KEY ("viceCaptainId") REFERENCES "public"."UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'Game_team1Code_fkey' AND conrelid = 'public."Game"'::regclass
    ) THEN
        ALTER TABLE "public"."Game"
            ADD CONSTRAINT "Game_team1Code_fkey" FOREIGN KEY ("team1Code") REFERENCES "public"."Team"("teamCode") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'Game_team2Code_fkey' AND conrelid = 'public."Game"'::regclass
    ) THEN
        ALTER TABLE "public"."Game"
            ADD CONSTRAINT "Game_team2Code_fkey" FOREIGN KEY ("team2Code") REFERENCES "public"."Team"("teamCode") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'Game_winnerCode_fkey' AND conrelid = 'public."Game"'::regclass
    ) THEN
        ALTER TABLE "public"."Game"
            ADD CONSTRAINT "Game_winnerCode_fkey" FOREIGN KEY ("winnerCode") REFERENCES "public"."Team"("teamCode") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
