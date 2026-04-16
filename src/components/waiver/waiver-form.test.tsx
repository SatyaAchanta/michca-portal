import { fireEvent, render, screen } from "@testing-library/react";

import { WaiverForm } from "@/components/waiver/waiver-form";
import { WAIVER_RULEBOOK_URL } from "@/lib/waiver-constants";

vi.mock("@/app/waiver/actions", () => ({
  submitMyWaiver: vi.fn(),
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("WaiverForm", () => {
  beforeAll(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("renders the rulebook acknowledgment link", () => {
    render(<WaiverForm waiver={null} t20Divisions={[]} teams={[]} />);

    expect(
      screen.getByRole("link", { name: /2026 mich-ca rulebook/i }),
    ).toHaveAttribute("href", WAIVER_RULEBOOK_URL);
  });

  it("requires both checkboxes before enabling review", () => {
    render(<WaiverForm waiver={null} t20Divisions={[]} teams={[]} />);

    const reviewButton = screen.getByRole("button", {
      name: /review & submit waiver/i,
    });
    const [waiverCheckbox, rulebookCheckbox] = screen.getAllByRole("checkbox");

    expect(reviewButton).toBeDisabled();

    fireEvent.click(waiverCheckbox);
    expect(reviewButton).toBeDisabled();

    fireEvent.click(rulebookCheckbox);
    expect(reviewButton).toBeEnabled();
  });

  it("renders State, City, and Address in that order", () => {
    const { container } = render(
      <WaiverForm waiver={null} t20Divisions={[]} teams={[]} />,
    );

    const labels = Array.from(container.querySelectorAll("label")).map((label) =>
      label.textContent?.replace(/\s+/g, " ").trim(),
    );

    expect(labels.indexOf("State")).toBeLessThan(labels.indexOf("City"));
    expect(labels.indexOf("City")).toBeLessThan(labels.indexOf("Address"));
  });
});
