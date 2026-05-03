import { GameStatus } from "@/generated/prisma/client";
import { cancelAdminGame, createAdminGame } from "@/app/admin/games/actions";

const { revalidatePath, requireAdminAllowlistedProfile, teamFindUnique, gameCreate, gameFindUnique, gameUpdate } =
  vi.hoisted(() => ({
    revalidatePath: vi.fn(),
    requireAdminAllowlistedProfile: vi.fn(),
    teamFindUnique: vi.fn(),
    gameCreate: vi.fn(),
    gameFindUnique: vi.fn(),
    gameUpdate: vi.fn(),
  }));

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("@/lib/user-profile", () => ({
  requireAdminAllowlistedProfile,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    team: {
      findUnique: teamFindUnique,
    },
    game: {
      create: gameCreate,
      findUnique: gameFindUnique,
      update: gameUpdate,
    },
  },
}));

describe("admin games actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminAllowlistedProfile.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      role: "ADMIN",
    });
  });

  it("creates a scheduled game for matching teams and division", async () => {
    teamFindUnique
      .mockResolvedValueOnce({
        teamCode: "T20-MOCC",
        teamName: "Michigan OCC",
        format: "T20",
        division: "Premier",
      })
      .mockResolvedValueOnce({
        teamCode: "T20-LCC",
        teamName: "Lansing CC",
        format: "T20",
        division: "Premier",
      });

    const formData = new FormData();
    formData.set("date", "2026-05-17");
    formData.set("time", "10:30");
    formData.set("division", "PREMIER_T20");
    formData.set("gameType", "LEAGUE");
    formData.set("venue", "Jayne Field");
    formData.set("team1Code", "T20-MOCC");
    formData.set("team2Code", "T20-LCC");

    const result = await createAdminGame({ status: "idle" }, formData);

    expect(result).toEqual({
      status: "success",
      message: "Michigan OCC vs Lansing CC created.",
    });
    expect(gameCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        division: "PREMIER_T20",
        gameType: "LEAGUE",
        league: "2026 T20",
        status: "SCHEDULED",
        venue: "Jayne Field",
        team1Code: "T20-MOCC",
        team2Code: "T20-LCC",
      }),
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/games");
  });

  it("rejects teams that do not match the selected division", async () => {
    teamFindUnique
      .mockResolvedValueOnce({
        teamCode: "T20-MOCC",
        teamName: "Michigan OCC",
        format: "T20",
        division: "Premier",
      })
      .mockResolvedValueOnce({
        teamCode: "T20-FCC",
        teamName: "Flint CC",
        format: "T20",
        division: "Division-1",
      });

    const formData = new FormData();
    formData.set("date", "2026-05-17");
    formData.set("time", "10:30");
    formData.set("division", "PREMIER_T20");
    formData.set("gameType", "LEAGUE");
    formData.set("team1Code", "T20-MOCC");
    formData.set("team2Code", "T20-FCC");

    const result = await createAdminGame({ status: "idle" }, formData);

    expect(result).toEqual({
      status: "error",
      message: "Selected teams do not match the chosen division.",
    });
    expect(gameCreate).not.toHaveBeenCalled();
  });

  it("cancels a scheduled game", async () => {
    gameFindUnique.mockResolvedValue({
      id: "game-1",
      status: GameStatus.SCHEDULED,
    });

    const formData = new FormData();
    formData.set("gameId", "game-1");

    const result = await cancelAdminGame({ status: "idle" }, formData);

    expect(result).toEqual({ status: "success", message: "Game canceled." });
    expect(gameUpdate).toHaveBeenCalledWith({
      where: { id: "game-1" },
      data: {
        status: GameStatus.CANCELLED,
        winnerCode: null,
        isDraw: false,
        isCancelled: true,
      },
    });
  });
});
