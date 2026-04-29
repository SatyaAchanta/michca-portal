import { describe, expect, it } from "vitest";

import {
  buildScheduleTeamCode,
  formatDryRunPreview,
  normalizeGameDivision,
  normalizeGameType,
  normalizeVenue,
  parseDetroitDateTime,
  parseScheduleCsv,
  parseScheduleRows,
  validateScheduleGames,
} from "@/lib/schedule-import";

const csv = `Match Type,Date,Time (EST),Team One,Team two,Venue,League,Division Name,Umpire One
league,2026-05-03,16:00:00,Sylhet Express SHEP,Sparks CC SPCC,Jayne Field,2026 T20,Division III,
playoff,2026-08-01,09:00:00,Nirvana CC NCC,Samrats Cricket Club SCC,"Boulan Park, Troy",2026 F40 & T30,F40,`;

describe("schedule-import", () => {
  it("parses schedule csv rows with quoted venues", () => {
    expect(parseScheduleCsv(csv)).toEqual([
      {
        rowNumber: 2,
        matchType: "league",
        date: "2026-05-03",
        time: "16:00:00",
        teamOne: "Sylhet Express SHEP",
        teamTwo: "Sparks CC SPCC",
        venue: "Jayne Field",
        league: "2026 T20",
        divisionName: "Division III",
      },
      {
        rowNumber: 3,
        matchType: "playoff",
        date: "2026-08-01",
        time: "09:00:00",
        teamOne: "Nirvana CC NCC",
        teamTwo: "Samrats Cricket Club SCC",
        venue: "Boulan Park, Troy",
        league: "2026 F40 & T30",
        divisionName: "F40",
      },
    ]);
  });

  it("normalizes game type and division values", () => {
    expect(normalizeGameType("league")).toBe("LEAGUE");
    expect(normalizeGameType("playoff")).toBe("PLAYOFF");
    expect(normalizeGameDivision("Premier")).toBe("PREMIER_T20");
    expect(normalizeGameDivision("Division I")).toBe("DIV1_T20");
    expect(normalizeGameDivision("Division II")).toBe("DIV2_T20");
    expect(normalizeGameDivision("Division III")).toBe("DIV3_T20");
    expect(normalizeGameDivision("F40")).toBe("F40");
    expect(normalizeGameDivision("T30")).toBe("T30");
  });

  it("builds T20 team codes from the final team token", () => {
    expect(buildScheduleTeamCode("2026 T20", "Division III", "Sylhet Express SHEP"))
      .toBe("T20-SHEP");
    expect(buildScheduleTeamCode("2026 T20", "Division II", "Lions Cricket Club LCC"))
      .toBe("T20-LCC");
  });

  it("builds F40 and T30 team code prefixes from division name", () => {
    expect(buildScheduleTeamCode("2026 F40 & T30", "F40", "Nirvana CC NCC"))
      .toBe("F40-NCC");
    expect(buildScheduleTeamCode("2026 F40 & T30", "T30", "United CC UNCC"))
      .toBe("T30-UNCC");
  });

  it("stores exact venues and replaces unknown venues with N/A", () => {
    expect(normalizeVenue("Jayne Field")).toBe("Jayne Field");
    expect(normalizeVenue("Boulan Park, Troy")).toBe("Boulan Park, Troy");
    expect(normalizeVenue("Millennium Park")).toBe("Millennium Park");
    expect(normalizeVenue("Winterfield Park")).toBe("Winterfield Park");
    expect(normalizeVenue("Unknown Park")).toBe("N/A");
  });

  it("parses Detroit-local date and time into UTC", () => {
    expect(parseDetroitDateTime("2026-05-03", "16:00:00").toISOString())
      .toBe("2026-05-03T20:00:00.000Z");
  });

  it("validates unknown teams and same-team rows", () => {
    const [game] = parseScheduleRows(parseScheduleCsv(csv));
    const result = validateScheduleGames(
      [{ ...game, team2Code: game.team1Code }],
      new Set([game.team1Code])
    );

    expect(result.errors).toEqual([
      "Row 2: Team One and Team two resolve to T20-SHEP.",
    ]);

    expect(validateScheduleGames([game], new Set()).errors).toEqual([
      "Row 2: Team code T20-SHEP does not exist.",
      "Row 2: Team code T20-SPCC does not exist.",
    ]);
  });

  it("formats the latest dry-run preview first", () => {
    const games = parseScheduleRows(parseScheduleCsv(csv));

    expect(formatDryRunPreview(games, 1)).toEqual([
      {
        row: 3,
        dateTime: "2026-08-01 09:00:00 EDT",
        division: "F40",
        gameType: "PLAYOFF",
        venue: "Boulan Park, Troy",
        team1: "Nirvana CC NCC (F40-NCC)",
        team2: "Samrats Cricket Club SCC (F40-SCC)",
      },
    ]);
  });
});
