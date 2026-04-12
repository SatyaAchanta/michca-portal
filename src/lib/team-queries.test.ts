import { getTeams } from "@/lib/team-queries";

const { findManyMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    team: {
      findMany: findManyMock,
      findUnique: vi.fn(),
    },
    userProfile: {
      findMany: vi.fn(),
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
