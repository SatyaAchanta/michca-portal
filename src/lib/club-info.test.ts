import { getClubInfoAdminData } from "@/lib/club-info";

const { findManySubmissionMock, findManyTeamMock } = vi.hoisted(() => ({
  findManySubmissionMock: vi.fn(),
  findManyTeamMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    clubInfoSubmission: {
      findMany: findManySubmissionMock,
    },
    team: {
      findMany: findManyTeamMock,
    },
  },
}));

describe("getClubInfoAdminData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findManySubmissionMock.mockResolvedValue([
      {
        id: "club-1",
        accountEmail: "captain@example.com",
        captainName: "Rohan Patel",
        cricclubsId: "CC-4455",
        contactNumber: "248-555-0101",
        t20Division: "Premier",
        t20TeamCode: "T20-MOCC",
        secondaryDivision: null,
        secondaryTeamCode: null,
        createdAt: new Date("2026-04-17T10:00:00Z"),
        updatedAt: new Date("2026-04-17T10:00:00Z"),
        userProfile: {
          email: "captain@example.com",
        },
      },
    ]);
    findManyTeamMock.mockResolvedValue([
      {
        teamCode: "T20-MOCC",
        teamName: "Michigan OCC",
        division: "Premier",
        format: "T20",
      },
    ]);
  });

  it("loads related teams for club info rows", async () => {
    const result = await getClubInfoAdminData();

    expect(result.rows[0].t20Team?.teamName).toBe("Michigan OCC");
  });

  it("filters by team name", async () => {
    const result = await getClubInfoAdminData({ teamName: "Falcons" });

    expect(result.rows).toEqual([]);
  });

  it("filters by division", async () => {
    const result = await getClubInfoAdminData({ division: "Premier" });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].t20Team?.division).toBe("Premier");
  });
});
