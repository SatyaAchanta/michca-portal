import { updateProfile } from "@/app/account/actions";

const { auth, revalidatePath, findUnique, update, getWaiverTeamOptions } =
  vi.hoisted(() => ({
    auth: vi.fn(),
    revalidatePath: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    getWaiverTeamOptions: vi.fn(),
  }));

vi.mock("server-only", () => ({}));

vi.mock("@clerk/nextjs/server", () => ({
  auth,
}));

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("@/lib/team-queries", () => ({
  getWaiverTeamOptions,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userProfile: {
      findUnique,
      update,
    },
  },
}));

function createProfileFormData() {
  const formData = new FormData();
  formData.set("firstName", "Rohan");
  formData.set("lastName", "Patel");
  formData.set("t20TeamCode", "T20-MOCC");
  formData.set("secondaryTeamCode", "T30-MOCC");
  formData.set("playingRole", "Bowler");
  return formData;
}

describe("updateProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({ userId: "clerk-1" });
    findUnique.mockResolvedValue({ id: "profile-1" });
    getWaiverTeamOptions.mockResolvedValue([
      {
        teamCode: "T20-MOCC",
        teamName: "Michigan OCC",
        division: "Premier",
        format: "T20",
      },
      {
        teamCode: "T30-MOCC",
        teamName: "Michigan OCC T30",
        division: "T30",
        format: "T30",
      },
    ]);
  });

  it("updates the current player profile fields", async () => {
    const result = await updateProfile(
      { status: "idle" },
      createProfileFormData()
    );

    expect(update).toHaveBeenCalledWith({
      where: { id: "profile-1" },
      data: {
        firstName: "Rohan",
        lastName: "Patel",
        t20TeamCode: "T20-MOCC",
        secondaryTeamCode: "T30-MOCC",
        playingRole: "Bowler",
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/account");
    expect(revalidatePath).toHaveBeenCalledWith("/teams");
    expect(result.status).toBe("success");
  });

  it("rejects invalid team codes", async () => {
    const formData = createProfileFormData();
    formData.set("t20TeamCode", "BAD-TEAM");

    const result = await updateProfile({ status: "idle" }, formData);

    expect(result.status).toBe("error");
    expect(result.message).toContain("valid current T20 team");
    expect(update).not.toHaveBeenCalled();
  });

  it("rejects invalid playing roles", async () => {
    const formData = createProfileFormData();
    formData.set("playingRole", "Captain");

    const result = await updateProfile({ status: "idle" }, formData);

    expect(result.status).toBe("error");
    expect(result.message).toContain("valid playing role");
    expect(update).not.toHaveBeenCalled();
  });

  it("allows clearing current teams and playing role", async () => {
    const formData = createProfileFormData();
    formData.set("t20TeamCode", "NONE");
    formData.set("secondaryTeamCode", "NONE");
    formData.set("playingRole", "NONE");

    await updateProfile({ status: "idle" }, formData);

    expect(update).toHaveBeenCalledWith({
      where: { id: "profile-1" },
      data: expect.objectContaining({
        t20TeamCode: null,
        secondaryTeamCode: null,
        playingRole: null,
      }),
    });
  });
});
