import { render, screen } from "@testing-library/react";

import { RegistrationBanner } from "@/components/registration-banner";

describe("RegistrationBanner", () => {
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
});
