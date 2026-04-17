import { UserRole } from "@/generated/prisma/client";

import { GET } from "@/app/admin/club-info/export/route";

const {
  auth,
  requireRole,
  AuthenticationRequiredError,
  InsufficientRoleError,
  getClubInfoAdminData,
} = vi.hoisted(() => ({
  auth: vi.fn(),
  requireRole: vi.fn(),
  AuthenticationRequiredError: class AuthenticationRequiredError extends Error {},
  InsufficientRoleError: class InsufficientRoleError extends Error {},
  getClubInfoAdminData: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth,
}));

vi.mock("@/lib/user-profile", () => ({
  AuthenticationRequiredError,
  InsufficientRoleError,
  requireRole,
}));

vi.mock("@/lib/club-info", () => ({
  getClubInfoAdminData,
}));

describe("club info export route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({ userId: "clerk-1" });
    requireRole.mockResolvedValue({ id: "profile-1" });
    getClubInfoAdminData.mockResolvedValue({
      rows: [
        {
          captainName: "Rohan Patel",
          accountEmail: "captain@example.com",
          userProfile: { email: "captain@example.com" },
          contactNumber: "248-555-0101",
          cricclubsId: "CC-4455",
          t20Division: "Premier",
          t20TeamCode: "T20-MOCC",
          t20Team: { teamName: "Michigan OCC" },
          secondaryDivision: null,
          secondaryTeamCode: null,
          secondaryTeam: null,
          createdAt: new Date("2026-04-17T10:00:00Z"),
          updatedAt: new Date("2026-04-17T10:00:00Z"),
        },
      ],
    });
  });

  it("exports excel rows for authorized users", async () => {
    const response = await GET(
      new Request("http://localhost/admin/club-info/export?club=Michigan&clubDivision=Premier"),
    );

    expect(requireRole).toHaveBeenCalled();
    expect(getClubInfoAdminData).toHaveBeenCalledWith({
      teamName: "Michigan",
      division: "Premier",
    });
    expect(response.headers.get("Content-Type")).toContain("spreadsheetml");
  });

  it("redirects unauthorized users", async () => {
    requireRole.mockRejectedValue(
      new InsufficientRoleError(UserRole.PLAYER, UserRole.STATS_COMMITTEE),
    );

    const response = await GET(new Request("http://localhost/admin/club-info/export"));

    expect(response.status).toBe(307);
  });
});
