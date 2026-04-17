import { submitMyWaiver } from "@/app/waiver/actions";

const {
  revalidatePath,
  requireRole,
  AuthenticationRequiredError,
  getWaiverTeamOptions,
  findUnique,
  create,
  update,
  transaction,
} = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  requireRole: vi.fn(),
  AuthenticationRequiredError: class AuthenticationRequiredError extends Error {},
  getWaiverTeamOptions: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("@/lib/user-profile", () => ({
  AuthenticationRequiredError,
  requireRole,
}));

vi.mock("@/lib/team-queries", () => ({
  getWaiverTeamOptions,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    waiverSubmission: {
      findUnique,
    },
    $transaction: transaction,
  },
}));

function createValidWaiverFormData() {
  const formData = new FormData();
  formData.set("playerName", "Rohan Patel");
  formData.set("cricclubsId", "CC-12345");
  formData.set("state", "Michigan");
  formData.set("city", "Troy");
  formData.set("address", "123 Main St");
  formData.set("t20Division", "Premier");
  formData.set("t20TeamCode", "T20-MOCC");
  formData.set("secondaryDivision", "T30");
  formData.set("secondaryTeamCode", "T30-MOCC");
  formData.set("signatureName", "Rohan Patel");
  formData.set("submitAcknowledgement", "yes");
  formData.set("rulebookAcknowledgement", "yes");
  return formData;
}

describe("submitMyWaiver", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireRole.mockResolvedValue({ id: "profile-1" });
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
    findUnique.mockResolvedValue(null);
    transaction.mockImplementation(async (callback: (tx: unknown) => Promise<void>) =>
      callback({
        waiverSubmission: { create },
        userProfile: { update },
      })
    );
  });

  it("creates the waiver and syncs only current profile team fields", async () => {
    const result = await submitMyWaiver(
      { status: "idle", fieldErrors: {} },
      createValidWaiverFormData()
    );

    expect(create).toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith({
      where: { id: "profile-1" },
      data: {
        t20TeamCode: "T20-MOCC",
        secondaryTeamCode: "T30-MOCC",
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/account");
    expect(result.status).toBe("success");
  });

  it("returns an auth error when the user is not signed in", async () => {
    requireRole.mockRejectedValue(new AuthenticationRequiredError());

    const result = await submitMyWaiver(
      { status: "idle", fieldErrors: {} },
      createValidWaiverFormData()
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors.form).toContain("signed in");
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});
