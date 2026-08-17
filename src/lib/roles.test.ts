import { UserRole } from "@/generated/prisma/client";

import {
  canAccessAdminSection,
  canAccessMichcaMadnessAdmin,
  isAnyAdminRole,
} from "@/lib/roles";

describe("roles", () => {
  it("allows stats committee users into the club info section", () => {
    expect(canAccessAdminSection(UserRole.STATS_COMMITTEE, "clubInfo")).toBe(true);
    expect(canAccessAdminSection(UserRole.STATS_COMMITTEE, "waiver")).toBe(false);
  });

  it("treats stats committee as an admin role", () => {
    expect(isAnyAdminRole(UserRole.STATS_COMMITTEE)).toBe(true);
  });

  it("requires the Madness admin email allowlist for admins", () => {
    expect(
      canAccessMichcaMadnessAdmin(
        UserRole.ADMIN,
        "admin@example.com",
        "madness@example.com",
      ),
    ).toBe(false);

    expect(
      canAccessMichcaMadnessAdmin(
        UserRole.ADMIN,
        "Madness@Example.com",
        "madness@example.com",
      ),
    ).toBe(true);
  });

  it("requires the Madness admin email allowlist for fantasy admins", () => {
    expect(
      canAccessMichcaMadnessAdmin(
        UserRole.FANTASY_ADMIN,
        "fantasy@example.com",
        "madness@example.com",
      ),
    ).toBe(false);

    expect(
      canAccessMichcaMadnessAdmin(
        UserRole.FANTASY_ADMIN,
        "fantasy@example.com",
        "admin@example.com, fantasy@example.com",
      ),
    ).toBe(true);
  });

  it("denies non-admin roles even when their email is allowlisted for Madness", () => {
    expect(
      canAccessMichcaMadnessAdmin(
        UserRole.PLAYER,
        "player@example.com",
        "player@example.com",
      ),
    ).toBe(false);
  });
});
