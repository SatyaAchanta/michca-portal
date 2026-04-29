import { compareWaiverRows, getWaiverAdminData } from "@/lib/waiver";

const { findManyWaiverMock, findManyTeamMock } = vi.hoisted(() => ({
  findManyWaiverMock: vi.fn(),
  findManyTeamMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    waiverSubmission: {
      findMany: findManyWaiverMock,
    },
    team: {
      findMany: findManyTeamMock,
    },
  },
}));

describe("compareWaiverRows", () => {
  it("sorts by t20 division desc, team asc, then player name asc", () => {
    const rows = [
      {
        playerName: "Zara",
        t20Division: "Division-1",
        secondaryDivision: "T30",
        t20Team: { teamName: "Falcons" },
        secondaryTeam: { teamName: "Lions" },
      },
      {
        playerName: "Aarav",
        t20Division: "Premier",
        secondaryDivision: "F40",
        t20Team: { teamName: "Bulls" },
        secondaryTeam: { teamName: "Tigers" },
      },
      {
        playerName: "Milan",
        t20Division: "Premier",
        secondaryDivision: "T30",
        t20Team: { teamName: "Bulls" },
        secondaryTeam: { teamName: "Warriors" },
      },
    ];

    rows.sort(compareWaiverRows);

    expect(rows.map((row) => row.playerName)).toEqual(["Aarav", "Milan", "Zara"]);
  });
});

describe("getWaiverAdminData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queries current-year waivers and matches team names", async () => {
    findManyWaiverMock.mockResolvedValue([
      {
        id: "w1",
        playerName: "Rohan Patel",
        cricclubsId: "123",
        state: "Michigan",
        city: "Troy",
        address: "123 Main St",
        t20Division: "Premier",
        additionalT20Division: "Division-1",
        secondaryDivision: "T30",
        year: new Date().getFullYear(),
        submittedAt: new Date("2026-04-12T10:00:00.000Z"),
        userProfile: { email: "rohan@example.com" },
        t20TeamCode: "T20-MOCC",
        additionalT20TeamCode: "T20-CCC",
        secondaryTeamCode: "T30-MOCC",
      },
    ]);
    findManyTeamMock.mockResolvedValue([
      { teamCode: "T20-MOCC", teamName: "Michigan OCC" },
      { teamCode: "T20-CCC", teamName: "Canton CC" },
      { teamCode: "T30-MOCC", teamName: "Michigan OCC T30" },
    ]);

    const result = await getWaiverAdminData({
      division: "Premier",
      teamCode: "T20-MOCC",
      playerName: "Rohan",
    });

    expect(findManyWaiverMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          year: new Date().getFullYear(),
          OR: [
            { t20Division: "Premier" },
            { additionalT20Division: "Premier" },
            { secondaryDivision: "Premier" },
          ],
          AND: [
            {
              OR: [
                { t20TeamCode: "T20-MOCC" },
                { additionalT20TeamCode: "T20-MOCC" },
                { secondaryTeamCode: "T20-MOCC" },
              ],
            },
          ],
          playerName: {
            contains: "Rohan",
            mode: "insensitive",
          },
        }),
      })
    );
    expect(result.count).toBe(1);
    expect(result.rows[0]?.state).toBe("Michigan");
    expect(result.rows[0]?.t20Team?.teamName).toBe("Michigan OCC");
    expect(result.rows[0]?.additionalT20Team?.teamName).toBe("Canton CC");
    expect(result.rows[0]?.secondaryTeam?.teamName).toBe("Michigan OCC T30");
  });
});
