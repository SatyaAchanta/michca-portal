import { UserRole } from "@/generated/prisma/client";
import * as XLSX from "xlsx";

import { GET } from "@/app/admin/waivers/export/route";

const {
  auth,
  requireRole,
  AuthenticationRequiredError,
  InsufficientRoleError,
  getWaiverAdminData,
} = vi.hoisted(() => ({
  auth: vi.fn(),
  requireRole: vi.fn(),
  AuthenticationRequiredError: class AuthenticationRequiredError extends Error {},
  InsufficientRoleError: class InsufficientRoleError extends Error {},
  getWaiverAdminData: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth,
}));

vi.mock("@/lib/user-profile", () => ({
  AuthenticationRequiredError,
  InsufficientRoleError,
  requireRole,
}));

vi.mock("@/lib/waiver", () => ({
  getWaiverAdminData,
}));

describe("waiver export route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({ userId: "clerk-1" });
    requireRole.mockResolvedValue({ id: "profile-1" });
    getWaiverAdminData.mockResolvedValue({
      year: 2026,
      rows: [
        {
          playerName: "Rohan Patel",
          userProfile: { email: "rohan@example.com" },
          cricclubsId: "CC-4455",
          state: "Michigan",
          city: "Troy",
          address: "123 Main St",
          t20Division: "Premier",
          t20TeamCode: "T20-MOCC",
          t20Team: { teamName: "Michigan OCC" },
          secondaryDivision: null,
          secondaryTeamCode: null,
          secondaryTeam: null,
          isUnder18: true,
          parentName: "Priya Patel",
          year: 2026,
          submittedAt: new Date("2026-04-23T10:00:00Z"),
        },
      ],
    });
  });

  it("exports excel rows for authorized users including under-18 fields", async () => {
    const response = await GET(
      new Request("http://localhost/admin/waivers/export?division=Premier&player=Rohan"),
    );
    const workbook = XLSX.read(await response.arrayBuffer(), { type: "array" });
    const rows = XLSX.utils.sheet_to_json<Record<string, string | number | null>>(
      workbook.Sheets[workbook.SheetNames[0]!],
    );

    expect(requireRole).toHaveBeenCalled();
    expect(getWaiverAdminData).toHaveBeenCalledWith({
      division: "Premier",
      teamCode: undefined,
      playerName: "Rohan",
    });
    expect(response.headers.get("Content-Type")).toContain("spreadsheetml");
    expect(response.headers.get("Content-Disposition")).toContain("waiver-status-2026.xlsx");
    expect(rows[0]?.["Under 18"]).toBe("Yes");
    expect(rows[0]?.["Parent Name"]).toBe("Priya Patel");
  });

  it("redirects unauthorized users", async () => {
    requireRole.mockRejectedValue(
      new InsufficientRoleError(UserRole.PLAYER, UserRole.WAIVER_COMMITTEE),
    );

    const response = await GET(new Request("http://localhost/admin/waivers/export"));

    expect(response.status).toBe(307);
  });
});
