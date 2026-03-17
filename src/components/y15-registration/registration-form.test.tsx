import { fireEvent, render, screen } from "@testing-library/react";

import { Youth15RegistrationForm } from "@/components/y15-registration/registration-form";

vi.mock("@/app/y15-registration/actions", () => ({
  upsertMyYouth15Registration: vi.fn(),
}));

describe("Youth15RegistrationForm", () => {
  it("opens the declaration dialog before submit", () => {
    render(<Youth15RegistrationForm registration={null} />);

    fireEvent.click(screen.getByRole("button", { name: "Review & Submit" }));

    expect(screen.getByText("Confirm declaration")).toBeInTheDocument();
    expect(screen.getByText(/waive the rights to file any legal action/i)).toBeInTheDocument();
  });

  it("submits the form only after confirmation", () => {
    const requestSubmit = vi.fn();
    const original = HTMLFormElement.prototype.requestSubmit;
    HTMLFormElement.prototype.requestSubmit = requestSubmit;

    render(
      <Youth15RegistrationForm
        registration={{
          clubName: "Michigan Falcons",
          presidentName: "Ava Patel",
          presidentEmail: "ava@example.com",
          presidentPhoneNumber: "248-555-0101",
          secretaryName: "N/A",
          secretaryEmail: "N/A",
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Review & Resubmit" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(requestSubmit).toHaveBeenCalledTimes(1);

    HTMLFormElement.prototype.requestSubmit = original;
  });
});
