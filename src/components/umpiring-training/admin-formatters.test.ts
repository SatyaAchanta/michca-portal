import {
  getUmpiringResultDescription,
  formatResultLabel,
  formatName,
  formatPreferredDates,
  parseDateFilterParam,
  parseLocationFilterParam,
  resultBadgeClass,
} from "@/components/umpiring-training/admin-formatters";

describe("admin-formatters", () => {
  it("formats name with fallback", () => {
    expect(formatName("John", "Doe")).toBe("John Doe");
    expect(formatName("John", null)).toBe("John");
    expect(formatName(null, null)).toBe("-");
  });

  it("formats preferred date labels for known date options", () => {
    expect(formatPreferredDates(["MARCH_28_2026"])).toBe("March 28, 2026");
    expect(formatPreferredDates(["MARCH_29_2026"])).toBe("March 29, 2026");
  });

  it("formats multiple date options as comma-separated text", () => {
    expect(formatPreferredDates(["MARCH_28_2026", "MARCH_29_2026"])).toBe(
      "March 28, 2026, March 29, 2026"
    );
  });

  it("parses date and location filter query params", () => {
    expect(parseDateFilterParam("MARCH_28_2026,MARCH_29_2026")).toEqual([
      "MARCH_28_2026",
      "MARCH_29_2026",
    ]);
    expect(parseDateFilterParam("MARCH_28_2026,INVALID")).toEqual(["MARCH_28_2026"]);
    expect(parseLocationFilterParam("Troy,Farmington Hills")).toEqual([
      "Troy",
      "Farmington Hills",
    ]);
  });

  it("returns badge classes for each result state", () => {
    expect(resultBadgeClass("PASS")).toContain("green");
    expect(resultBadgeClass("FAIL")).toContain("red");
    expect(resultBadgeClass("PENDING")).toContain("amber");
    expect(resultBadgeClass("REAPPEAR")).toContain("sky");
  });

  it("formats result labels for display", () => {
    expect(formatResultLabel("PASS")).toBe("Pass");
    expect(formatResultLabel("FAIL")).toBe("Fail");
    expect(formatResultLabel("PENDING")).toBe("Pending");
    expect(formatResultLabel("REAPPEAR")).toBe("ReAppear");
  });

  it("returns result descriptions for account messaging", () => {
    expect(getUmpiringResultDescription("PASS")).toBe("You passed the umpiring exam.");
    expect(getUmpiringResultDescription("FAIL")).toBe("You failed the umpiring exam.");
    expect(getUmpiringResultDescription("PENDING")).toBe(
      "Your umpiring exam result is still pending."
    );
    expect(getUmpiringResultDescription("REAPPEAR")).toBe(
      "You need to retake the umpiring test, but do not need to repeat the full training."
    );
  });
});
