import type { GameResult } from "@/generated/prisma/client";
import { buildTeamFormMap } from "@/lib/team-form";

function game({
  date,
  team1Code = "A",
  team2Code = "B",
  winnerCode,
  resultType = "WIN",
  isDraw = false,
}: {
  date: string;
  team1Code?: string;
  team2Code?: string;
  winnerCode: string | null;
  resultType?: GameResult;
  isDraw?: boolean;
}) {
  return {
    date: new Date(date),
    team1Code,
    team2Code,
    winnerCode,
    resultType,
    isDraw,
  };
}

describe("buildTeamFormMap", () => {
  it("returns the last five resolved results oldest to newest", () => {
    const formMap = buildTeamFormMap(
      [
        game({ date: "2026-05-29T12:00:00Z", winnerCode: "A" }),
        game({ date: "2026-05-22T12:00:00Z", winnerCode: "B" }),
        game({
          date: "2026-05-15T12:00:00Z",
          winnerCode: null,
          resultType: "DRAW" as GameResult,
          isDraw: true,
        }),
        game({ date: "2026-05-08T12:00:00Z", winnerCode: "A" }),
        game({ date: "2026-05-01T12:00:00Z", winnerCode: "B" }),
        game({ date: "2026-04-24T12:00:00Z", winnerCode: "A" }),
      ],
      ["A"],
    );

    expect(formMap.get("A")).toEqual(["L", "W", "D", "L", "W"]);
  });

  it("ignores pending, abandoned, and cancelled games", () => {
    const formMap = buildTeamFormMap(
      [
        game({
          date: "2026-06-12T12:00:00Z",
          winnerCode: null,
          resultType: "PENDING" as GameResult,
        }),
        game({
          date: "2026-06-05T12:00:00Z",
          winnerCode: null,
          resultType: "ABANDONED" as GameResult,
          isDraw: true,
        }),
        game({
          date: "2026-05-29T12:00:00Z",
          winnerCode: null,
          resultType: "CANCELLED" as GameResult,
        }),
        game({ date: "2026-05-22T12:00:00Z", winnerCode: "A" }),
      ],
      ["A"],
    );

    expect(formMap.get("A")).toEqual(["W"]);
  });
});
