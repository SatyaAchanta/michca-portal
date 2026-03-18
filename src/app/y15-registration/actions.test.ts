import { upsertMyYouth15Registration } from "@/app/y15-registration/actions";

const { revalidatePath, requireRole, upsert, AuthenticationRequiredError } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  requireRole: vi.fn(),
  upsert: vi.fn(),
  AuthenticationRequiredError: class AuthenticationRequiredError extends Error {},
}));

vi.mock("server-only", () => ({}));

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("@/lib/user-profile", () => ({
  AuthenticationRequiredError,
  requireRole,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    youth15Registration: {
      upsert,
    },
  },
}));

function createValidFormData() {
  const formData = new FormData();
  formData.set("clubName", "Michigan Falcons");
  formData.set("presidentName", "Ava Patel");
  formData.set("presidentEmail", "ava@example.com");
  formData.set("presidentPhoneNumber", "248-555-0101");
  formData.set("secretaryName", "Maya Shah");
  formData.set("secretaryEmail", "maya@example.com");
  formData.set("secretaryPhoneNumber", "248-555-0102");
  return formData;
}

describe("upsertMyYouth15Registration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an auth error when the user is not signed in", async () => {
    requireRole.mockRejectedValue(new AuthenticationRequiredError());

    const result = await upsertMyYouth15Registration(
      { status: "idle", fieldErrors: {} },
      createValidFormData()
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors.form).toContain("signed in");
    expect(upsert).not.toHaveBeenCalled();
  });

  it("creates or updates the current user's registration", async () => {
    requireRole.mockResolvedValue({ id: "user-1" });

    const result = await upsertMyYouth15Registration(
      { status: "idle", fieldErrors: {} },
      createValidFormData()
    );

    expect(upsert).toHaveBeenCalledWith({
      where: { userProfileId: "user-1" },
      create: {
        userProfile: {
          connect: { id: "user-1" },
        },
        clubName: "Michigan Falcons",
        presidentName: "Ava Patel",
        presidentEmail: "ava@example.com",
        presidentPhoneNumber: "248-555-0101",
        secretaryName: "Maya Shah",
        secretaryEmail: "maya@example.com",
        secretaryPhoneNumber: "248-555-0102",
      },
      update: {
        clubName: "Michigan Falcons",
        presidentName: "Ava Patel",
        presidentEmail: "ava@example.com",
        presidentPhoneNumber: "248-555-0101",
        secretaryName: "Maya Shah",
        secretaryEmail: "maya@example.com",
        secretaryPhoneNumber: "248-555-0102",
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/y15-registration");
    expect(result.status).toBe("success");
  });

  it("returns validation errors without writing invalid data", async () => {
    requireRole.mockResolvedValue({ id: "user-1" });

    const result = await upsertMyYouth15Registration(
      { status: "idle", fieldErrors: {} },
      new FormData()
    );

    expect(result.status).toBe("error");
    expect(result.message).toContain("highlighted");
    expect(upsert).not.toHaveBeenCalled();
  });
});
