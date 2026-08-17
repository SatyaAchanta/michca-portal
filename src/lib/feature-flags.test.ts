import { isMichcaMadnessEnabled } from "@/lib/feature-flags";

describe("isMichcaMadnessEnabled", () => {
  it("only enables MichCA-Madness for the exact true value", () => {
    expect(isMichcaMadnessEnabled("true")).toBe(true);
    expect(isMichcaMadnessEnabled("false")).toBe(false);
    expect(isMichcaMadnessEnabled("TRUE")).toBe(false);
    expect(isMichcaMadnessEnabled(undefined)).toBe(false);
  });
});
