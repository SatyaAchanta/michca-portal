import { describe, expect, it } from "vitest";

import {
  buildTeamCode,
  getFormatForGameDivision,
  getFormatForTeamDivision,
  normalizeTeamDivision,
  parseTeamsCsv,
} from "@/lib/team-data";

describe("team-data", () => {
  it("normalizes the teams csv into stable team codes", () => {
    const rows = parseTeamsCsv(`Format,Division,TeamShortCode,TeamName
T20,Division-1,DARI,Dark Invaders CC DARI
T20,Divison-3,PRSD,Prime Strikers PRSD
YOUTH,YOUTH,PCAS,Prime Cricket Academy Strikers`);

    expect(rows).toEqual([
      {
        format: "T20",
        division: "Division-1",
        teamShortCode: "DARI",
        teamCode: "T20-DARI",
        teamName: "Dark Invaders CC DARI",
      },
      {
        format: "T20",
        division: "Division-3",
        teamShortCode: "PRSD",
        teamCode: "T20-PRSD",
        teamName: "Prime Strikers PRSD",
      },
      {
        format: "YOUTH",
        division: "YOUTH",
        teamShortCode: "PCAS",
        teamCode: "YOUTH-PCAS",
        teamName: "Prime Cricket Academy Strikers",
      },
    ]);
  });

  it("maps team division values to the format used in team codes", () => {
    expect(getFormatForTeamDivision("Premier")).toBe("T20");
    expect(getFormatForTeamDivision("F40")).toBe("F40");
    expect(getFormatForTeamDivision("T30")).toBe("T30");
    expect(getFormatForTeamDivision("YOUTH")).toBe("YOUTH");
    expect(getFormatForTeamDivision("GLT")).toBe("GLT");
  });

  it("maps game divisions to team formats when building team codes for games", () => {
    expect(getFormatForGameDivision("PREMIER_T20")).toBe("T20");
    expect(getFormatForGameDivision("F40")).toBe("F40");
    expect(getFormatForGameDivision("T30")).toBe("T30");
    expect(getFormatForGameDivision("U15")).toBe("YOUTH");
    expect(getFormatForGameDivision("GLT")).toBe("GLT");
  });

  it("builds canonical team codes", () => {
    expect(buildTeamCode("T20", " odcc ")).toBe("T20-ODCC");
  });

  it("rejects unsupported divisions", () => {
    expect(() => normalizeTeamDivision("Division-99")).toThrow(
      "Unsupported division value: Division-99"
    );
  });
});
