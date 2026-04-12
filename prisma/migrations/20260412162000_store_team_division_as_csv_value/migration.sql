ALTER TABLE "public"."Team"
ALTER COLUMN "division" TYPE TEXT
USING CASE
    WHEN "division" = 'DIV1_T20' THEN 'Division-1'
    WHEN "division" = 'DIV2_T20' THEN 'Division-2'
    WHEN "division" = 'DIV3_T20' THEN 'Division-3'
    WHEN "division" = 'PREMIER_T20' THEN 'Premier'
    WHEN "division" = 'F40' THEN 'F40'
    WHEN "division" = 'T30' THEN 'T30'
    WHEN "division" = 'U15' THEN 'YOUTH'
    WHEN "division" = 'GLT' THEN 'GLT'
    ELSE "division"::text
END;
