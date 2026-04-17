import { UserRole } from "@/generated/prisma/client";

import { canAccessAdminSection, isAnyAdminRole } from "@/lib/roles";

describe("roles", () => {
  it("allows stats committee users into the club info section", () => {
    expect(canAccessAdminSection(UserRole.STATS_COMMITTEE, "clubInfo")).toBe(true);
    expect(canAccessAdminSection(UserRole.STATS_COMMITTEE, "waiver")).toBe(false);
  });

  it("treats stats committee as an admin role", () => {
    expect(isAnyAdminRole(UserRole.STATS_COMMITTEE)).toBe(true);
  });
});
