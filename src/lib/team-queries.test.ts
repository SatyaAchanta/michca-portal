import { getTeamByCode, getTeams } from "@/lib/team-queries";

const { findManyMock, findUniqueMock, userFindManyMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  findUniqueMock: vi.fn(),
  userFindManyMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    team: {
      findMany: findManyMock,
      findUnique: findUniqueMock,
    },
    userProfile: {
      findMany: userFindManyMock,
    },
  },
}));

describe("getTeams", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findManyMock.mockResolvedValue([]);
  });

  it("ignores one-character search terms", async () => {
    await getTeams({
      format: "T20",
      division: "Division-2",
      search: "d",
    });

    expect(findManyMock).toHaveBeenCalledWith({
      where: {
        format: "T20",
        division: "Division-2",
      },
      include: {
        captain: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        viceCaptain: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [{ format: "asc" }, { division: "asc" }, { teamName: "asc" }],
    });
  });

  it("uses two-character search terms for both name and short code", async () => {
    await getTeams({
      format: "T20",
      division: "Division-2",
      search: "da",
    });

    expect(findManyMock).toHaveBeenCalledWith({
      where: {
        format: "T20",
        division: "Division-2",
        OR: [
          { teamName: { contains: "da", mode: "insensitive" } },
          { teamShortCode: { contains: "DA", mode: "insensitive" } },
        ],
      },
      include: {
        captain: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        viceCaptain: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [{ format: "asc" }, { division: "asc" }, { teamName: "asc" }],
    });
  });
});

describe("getTeamByCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads T20 roster players from current user profiles", async () => {
    findUniqueMock.mockResolvedValue({
      teamCode: "T20-MOCC",
      format: "T20",
      division: "Premier",
      teamShortCode: "MOCC",
      teamName: "Michigan OCC",
      description: null,
      captain: null,
      viceCaptain: null,
      gamesAsTeam1: [],
      gamesAsTeam2: [],
    });
    userFindManyMock.mockResolvedValue([
      {
        id: "player-1",
        firstName: "Rohan",
        lastName: "Patel",
        email: "rohan@example.com",
        playingRole: "Bowler",
      },
    ]);

    const result = await getTeamByCode("T20-MOCC");

    expect(userFindManyMock).toHaveBeenCalledWith({
      where: { t20TeamCode: "T20-MOCC" },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }, { email: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        playingRole: true,
      },
    });
    expect(result?.players).toEqual([
      {
        id: "player-1",
        firstName: "Rohan",
        lastName: "Patel",
        email: "rohan@example.com",
        playingRole: "Bowler",
      },
    ]);
  });

  it("loads secondary-format roster players from current user profiles", async () => {
    findUniqueMock.mockResolvedValue({
      teamCode: "T30-MOCC",
      format: "T30",
      division: "T30",
      teamShortCode: "MOCC-T30",
      teamName: "Michigan OCC T30",
      description: null,
      captain: null,
      viceCaptain: null,
      gamesAsTeam1: [],
      gamesAsTeam2: [],
    });
    userFindManyMock.mockResolvedValue([]);

    await getTeamByCode("T30-MOCC");

    expect(userFindManyMock).toHaveBeenCalledWith({
      where: { secondaryTeamCode: "T30-MOCC" },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }, { email: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        playingRole: true,
      },
    });
  });
});
