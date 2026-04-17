import { submitMyClubInfo } from "@/app/club-info/actions";

const {
  revalidatePath,
  requireRole,
  AuthenticationRequiredError,
  findUnique,
  getWaiverTeamOptions,
  findConflictingCaptainAssignments,
  create,
  update,
  updateMany,
  transaction,
} = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  requireRole: vi.fn(),
  AuthenticationRequiredError: class AuthenticationRequiredError extends Error {},
  findUnique: vi.fn(),
  getWaiverTeamOptions: vi.fn(),
  findConflictingCaptainAssignments: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
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

vi.mock("@/lib/club-info", () => ({
  findConflictingCaptainAssignments,
  splitCaptainName: vi.fn(() => ({ firstName: "Rohan", lastName: "Patel" })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    clubInfoSubmission: {
      findUnique,
    },
    $transaction: transaction,
  },
}));

function createValidFormData() {
  const formData = new FormData();
  formData.set("captainName", "Rohan Patel");
  formData.set("cricclubsId", "CC-4455");
  formData.set("contactNumber", "248-555-0101");
  formData.set("t20Division", "Premier");
  formData.set("t20TeamCode", "T20-MOCC");
  formData.set("secondaryDivision", "T30");
  formData.set("secondaryTeamCode", "T30-MOCC");
  return formData;
}

describe("submitMyClubInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireRole.mockResolvedValue({ id: "profile-1", email: "captain@example.com" });
    findUnique.mockResolvedValue(null);
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
    findConflictingCaptainAssignments.mockResolvedValue([]);
    transaction.mockImplementation(async (callback: (tx: unknown) => Promise<void>) =>
      callback({
        clubInfoSubmission: { create },
        userProfile: { update },
        team: { updateMany },
      }),
    );
  });

  it("returns an auth error when the user is not signed in", async () => {
    requireRole.mockRejectedValue(new AuthenticationRequiredError());

    const result = await submitMyClubInfo(
      { status: "idle", fieldErrors: {} },
      createValidFormData(),
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors.form).toContain("signed in");
  });

  it("rejects duplicate submissions", async () => {
    findUnique.mockResolvedValue({ id: "club-info-1" });

    const result = await submitMyClubInfo(
      { status: "idle", fieldErrors: {} },
      createValidFormData(),
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors.form).toContain("already been submitted");
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects conflicting team assignments", async () => {
    findConflictingCaptainAssignments.mockResolvedValue([{ teamName: "Michigan OCC" }]);

    const result = await submitMyClubInfo(
      { status: "idle", fieldErrors: {} },
      createValidFormData(),
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors.form).toContain("Michigan OCC");
    expect(create).not.toHaveBeenCalled();
  });

  it("creates the submission and syncs profile and captain teams", async () => {
    const result = await submitMyClubInfo(
      { status: "idle", fieldErrors: {} },
      createValidFormData(),
    );

    expect(create).toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith({
      where: { id: "profile-1" },
      data: {
        firstName: "Rohan",
        lastName: "Patel",
        contactNumber: "248-555-0101",
      },
    });
    expect(updateMany).toHaveBeenCalledWith({
      where: { teamCode: { in: ["T20-MOCC", "T30-MOCC"] } },
      data: { captainId: "profile-1" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/account");
    expect(result.status).toBe("success");
  });
});
