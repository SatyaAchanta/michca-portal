import { documents } from "@/lib/data";

describe("documents", () => {
  it("includes the club info form entry", () => {
    expect(documents).toContainEqual(
      expect.objectContaining({
        title: "Club Info Form",
        category: "Registration",
        fileType: "FORM",
        url: "/club-info",
        isExternal: false,
      })
    );
  });
});
