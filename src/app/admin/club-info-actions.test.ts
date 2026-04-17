import { deleteClubInfoSubmission } from "@/app/admin/club-info-actions";

const {
  revalidatePath,
  requireAnyAdminRole,
  AuthenticationRequiredError,
  InsufficientRoleError,
  findUnique,
  deleteMock,
  updateMany,
  transaction,
} = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  requireAnyAdminRole: vi.fn(),
  AuthenticationRequiredError: class AuthenticationRequiredError extends Error {},
  InsufficientRoleError: class InsufficientRoleError extends Error {},
  findUnique: vi.fn(),
  deleteMock: vi.fn(),
  updateMany: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("@/lib/user-profile", () => ({
  AuthenticationRequiredError,
  InsufficientRoleError,
  requireAnyAdminRole,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    clubInfoSubmission: {
      findUnique,
    },
    $transaction: transaction,
  },
}));

describe("deleteClubInfoSubmission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAnyAdminRole.mockResolvedValue({ id: "admin-1", role: "STATS_COMMITTEE" });
    findUnique.mockResolvedValue({
      id: "club-1",
      userProfileId: "profile-1",
      t20TeamCode: "T20-MOCC",
      secondaryTeamCode: "T30-MOCC",
    });
    transaction.mockImplementation(async (callback: (tx: unknown) => Promise<void>) =>
      callback({
        team: { updateMany },
        clubInfoSubmission: { delete: deleteMock },
      }),
    );
  });

  it("returns an auth error for unauthorized users", async () => {
    requireAnyAdminRole.mockRejectedValue(new AuthenticationRequiredError());

    const formData = new FormData();
    formData.set("id", "club-1");

    const result = await deleteClubInfoSubmission({ status: "idle" }, formData);

    expect(result.status).toBe("error");
    expect(result.message).toContain("authorized admins");
  });

  it("returns an error when the submission is missing", async () => {
    findUnique.mockResolvedValue(null);

    const formData = new FormData();
    formData.set("id", "club-1");

    const result = await deleteClubInfoSubmission({ status: "idle" }, formData);

    expect(result.status).toBe("error");
    expect(result.message).toContain("not found");
  });

  it("deletes the submission and clears matching captain assignments", async () => {
    const formData = new FormData();
    formData.set("id", "club-1");

    const result = await deleteClubInfoSubmission({ status: "idle" }, formData);

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        teamCode: { in: ["T20-MOCC", "T30-MOCC"] },
        captainId: "profile-1",
      },
      data: {
        captainId: null,
      },
    });
    expect(deleteMock).toHaveBeenCalledWith({
      where: { id: "club-1" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
    expect(result.status).toBe("success");
  });
});
