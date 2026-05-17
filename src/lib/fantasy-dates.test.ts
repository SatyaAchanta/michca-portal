import {
  formatWeekLabel,
  formatWeekendLabel,
  getGameWeekKey,
  toSaturdayKey,
} from "@/lib/fantasy-dates";

describe("fantasy date helpers", () => {
  it("groups Saturday and Sunday games into the same Detroit weekend", () => {
    expect(toSaturdayKey(new Date("2026-05-02T14:00:00.000Z"))).toBe(
      "2026-05-02",
    );
    expect(toSaturdayKey(new Date("2026-05-03T20:00:00.000Z"))).toBe(
      "2026-05-02",
    );
  });

  it("uses Detroit local date when a UTC timestamp crosses midnight", () => {
    expect(toSaturdayKey(new Date("2026-05-04T01:30:00.000Z"))).toBe(
      "2026-05-02",
    );
    expect(getGameWeekKey(new Date("2026-05-04T01:30:00.000Z"))).toBe(
      "2026-W18",
    );
  });

  it("calculates ISO week keys from the Detroit local date at year boundaries", () => {
    expect(getGameWeekKey(new Date("2027-01-01T03:30:00.000Z"))).toBe(
      "2026-W53",
    );
    expect(getGameWeekKey(new Date("2027-01-04T17:00:00.000Z"))).toBe(
      "2027-W01",
    );
  });

  it("formats weekend and week labels consistently", () => {
    expect(formatWeekendLabel("2026-05-02")).toBe("May 2 – May 3");
    expect(formatWeekLabel("2026-W18")).toBe("Apr 27 – May 3");
  });
});
