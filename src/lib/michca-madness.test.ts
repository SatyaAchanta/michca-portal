import { describe, expect, it } from "vitest";

import {
  getOpeningSlotKeys,
  requireMichcaMadnessTemplate,
  validateBracketPicks,
} from "@/lib/michca-madness";

describe("michca-madness templates", () => {
  it("models the F40 Page playoff loser path", () => {
    const template = requireMichcaMadnessTemplate("F40");
    const seeds = new Map([
      ["S1", "F40-A"],
      ["S2", "F40-B"],
      ["S3", "F40-C"],
      ["S4", "F40-D"],
    ]);
    const picks = new Map([
      ["G1", "F40-A"],
      ["G2", "F40-C"],
      ["G3", "F40-B"],
      ["G4", "F40-A"],
    ]);

    const validation = validateBracketPicks(template, seeds, picks);

    expect(validation.isValid).toBe(true);
    expect(validation.resolvedSlots.get("G3")).toMatchObject({
      team1Code: "F40-B",
      team2Code: "F40-C",
    });
  });

  it("rejects winners that are not in a resolved matchup", () => {
    const template = requireMichcaMadnessTemplate("PREMIER_T20");
    const seeds = new Map(
      Array.from({ length: 8 }, (_, index) => [
        `S${index + 1}`,
        `TEAM-${index + 1}`,
      ]),
    );
    const picks = new Map(template.slots.map((slot) => [slot.key, "TEAM-1"]));

    const validation = validateBracketPicks(template, seeds, picks);

    expect(validation.isValid).toBe(false);
    expect(validation.errors[0]).toContain("invalid winner");
  });

  it("matches the expected opening rounds for each format", () => {
    expect(getOpeningSlotKeys(requireMichcaMadnessTemplate("PREMIER_T20"))).toEqual([
      "QF3",
      "QF2",
      "QF4",
      "QF1",
    ]);
    expect(getOpeningSlotKeys(requireMichcaMadnessTemplate("DIV1_T20"))).toEqual([
      "ELIM_A2",
      "ELIM_B2",
      "ELIM_A3",
      "ELIM_B3",
      "ELIM_A4",
      "ELIM_B4",
    ]);
    expect(getOpeningSlotKeys(requireMichcaMadnessTemplate("DIV3_T20"))).toEqual([
      "ELIM_B1",
      "ELIM_A2",
      "ELIM_A1",
      "ELIM_B2",
    ]);
    expect(getOpeningSlotKeys(requireMichcaMadnessTemplate("F40"))).toEqual([
      "G1",
      "G2",
    ]);
  });
});

