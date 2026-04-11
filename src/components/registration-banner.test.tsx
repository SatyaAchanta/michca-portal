import { render, screen } from "@testing-library/react";

import { RegistrationBanner } from "@/components/registration-banner";

const { count } = vi.hoisted(() => ({
  count: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    umpiringTraining: {
      count,
    },
  },
}));

describe("RegistrationBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the live umpiring registration count and result CTA", async () => {
    count.mockResolvedValue(48);

    render(await RegistrationBanner());

    expect(screen.getByText("48")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /thank you for strengthening the quality of cricket in mich-ca/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view my result/i })).toHaveAttribute(
      "href",
      "/account"
    );
  });

  it("renders successfully when there are no registrations", async () => {
    count.mockResolvedValue(0);

    render(await RegistrationBanner());

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText(/umpiring registrations/i)).toBeInTheDocument();
  });
});
