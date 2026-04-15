import { fireEvent, render, screen } from "@testing-library/react";

import { WaiverForm } from "@/components/waiver/waiver-form";
import {
  WAIVER_ROLE_OPTIONS,
  WAIVER_RULEBOOK_URL,
} from "@/lib/waiver-constants";

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

  it("renders role after the team selectors and exposes the requested options", () => {
    const { container } = render(
      <WaiverForm
        waiver={{
          playerName: "Rohan Patel",
          cricclubsId: "CC-12345",
          state: "Michigan",
          city: "Troy",
          address: "123 Main St",
          t20Division: "Premier",
          t20TeamCode: "T20-MOCC",
          secondaryDivision: "T30",
          secondaryTeamCode: "T30-MOCC",
          role: "Bowler",
          signatureName: "Rohan Patel",
          submittedAt: "2026-04-14T10:00:00.000Z",
        }}
        t20Divisions={["Premier"]}
        teams={[
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
        ]}
      />,
    );

    const labels = Array.from(container.querySelectorAll("label")).map((label) =>
      label.textContent?.replace(/\s+/g, " ").trim(),
    );
    expect(labels.indexOf("Role")).toBeGreaterThan(
      labels.indexOf("Team Name (T30)"),
    );

    const selects = Array.from(container.querySelectorAll("select"));
    const roleSelect = selects.at(-1);
    const roleOptions = Array.from(
      roleSelect?.querySelectorAll("option") ?? [],
    ).map((option) => option.textContent);

    expect(roleOptions).toEqual([...WAIVER_ROLE_OPTIONS]);
  });
});
