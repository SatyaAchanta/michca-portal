import { render, screen } from "@testing-library/react";

import { RegistrationBanner } from "@/components/registration-banner";

const { auth, findProfile, findWaiver } = vi.hoisted(() => ({
  auth: vi.fn(),
  findProfile: vi.fn(),
  findWaiver: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userProfile: {
      findUnique: findProfile,
    },
    waiverSubmission: {
      findUnique: findWaiver,
    },
  },
}));

describe("RegistrationBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({ userId: null });
    findProfile.mockResolvedValue(null);
    findWaiver.mockResolvedValue(null);
  });

  it("renders the waiver CTA", async () => {
    render(await RegistrationBanner());

    expect(
      screen.getByRole("heading", {
        name: /complete the required player waiver for the 2026 season/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open waiver form/i })).toHaveAttribute(
      "href",
      "/waiver"
    );
    expect(
      screen.getByText(/review the waiver and submit it once from your account before match play/i)
    ).toBeInTheDocument();
  });

  it("renders for a signed-in user who has not submitted the current waiver", async () => {
    auth.mockResolvedValue({ userId: "clerk-1" });
    findProfile.mockResolvedValue({ id: "profile-1" });
    findWaiver.mockResolvedValue(null);

    render(await RegistrationBanner());

    expect(
      screen.getByRole("heading", {
        name: /complete the required player waiver for the 2026 season/i,
      })
    ).toBeInTheDocument();
  });

  it("does not render for a signed-in user who already submitted the current waiver", async () => {
    auth.mockResolvedValue({ userId: "clerk-1" });
    findProfile.mockResolvedValue({ id: "profile-1" });
    findWaiver.mockResolvedValue({ id: "waiver-1" });

    render(await RegistrationBanner());

    expect(
      screen.queryByRole("heading", {
        name: /complete the required player waiver for the 2026 season/i,
      })
    ).not.toBeInTheDocument();
  });
});
