import {
  formatName,
  formatPreferredDate,
  resultBadgeClass,
} from "@/components/umpiring-training/admin-formatters";

describe("admin-formatters", () => {
  it("formats name with fallback", () => {
    expect(formatName("John", "Doe")).toBe("John Doe");
    expect(formatName("John", null)).toBe("John");
    expect(formatName(null, null)).toBe("-");
  });

  it("formats preferred date labels for known dates", () => {
    expect(formatPreferredDate(new Date("2026-03-28T00:00:00.000Z"))).toBe("March 28, 2026");
    expect(formatPreferredDate(new Date("2026-03-29T00:00:00.000Z"))).toBe("March 29, 2026");
  });

  it("falls back to ISO date for unknown preferred date", () => {
    expect(formatPreferredDate(new Date("2026-04-01T00:00:00.000Z"))).toBe("2026-04-01");
  });

  it("returns badge classes for each result state", () => {
    expect(resultBadgeClass("PASS")).toContain("green");
    expect(resultBadgeClass("FAIL")).toContain("red");
    expect(resultBadgeClass("PENDING")).toContain("amber");
  });
});

