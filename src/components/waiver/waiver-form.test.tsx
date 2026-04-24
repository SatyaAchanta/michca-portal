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
    const waiverCheckbox = screen.getByRole("checkbox", {
      name: /i have read the waiver text and agree to submit this form for the current year/i,
    });
    const rulebookCheckbox = screen.getByRole("checkbox", {
      name: /i have read the 2026 mich-ca rulebook and understand all the conditions/i,
    });

    expect(reviewButton).toBeDisabled();

    fireEvent.click(waiverCheckbox);
    expect(reviewButton).toBeDisabled();

    fireEvent.click(rulebookCheckbox);
    expect(reviewButton).toBeEnabled();
  });

  it("renders Address, City, and State in that order", () => {
    const { container } = render(
      <WaiverForm waiver={null} t20Divisions={[]} teams={[]} />,
    );

    const labels = Array.from(container.querySelectorAll("label")).map((label) =>
      label.textContent?.replace(/\s+/g, " ").trim(),
    );

    expect(labels.indexOf("Address")).toBeLessThan(labels.indexOf("City"));
    expect(labels.indexOf("City")).toBeLessThan(labels.indexOf("State"));
  });

  it("asks the under-18 question before the T20 section", () => {
    const { container } = render(
      <WaiverForm waiver={null} t20Divisions={["Premier"]} teams={[]} />,
    );

    const content = container.textContent ?? "";
    expect(content.indexOf("Are you born after September 1, 2008 ?")).toBeLessThan(
      content.indexOf("T20 Division"),
    );
  });

  it("reveals the parent name field for under-18 submissions", () => {
    render(<WaiverForm waiver={null} t20Divisions={[]} teams={[]} />);

    expect(screen.queryByLabelText(/parent's name/i)).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /yes/i,
      }),
    );

    expect(screen.getByLabelText(/parent's name/i)).toBeInTheDocument();
    expect(
      screen.getByText(/should be filled by parent only/i),
    ).toBeInTheDocument();
  });

  it("switches under-18 players to the two-team T20 selector flow", () => {
    render(
      <WaiverForm
        waiver={null}
        t20Divisions={["Premier", "Division-1"]}
        teams={[
          {
            teamCode: "T20-MOCC",
            teamName: "Michigan OCC",
            division: "Premier",
            format: "T20",
          },
          {
            teamCode: "T20-CCC",
            teamName: "Canton CC",
            division: "Division-1",
            format: "T20",
          },
        ]}
      />,
    );

    expect(screen.getAllByText(/t20 division/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("checkbox", { name: /yes/i }));

    expect(screen.queryByText(/^T20 Division$/i)).not.toBeInTheDocument();
    expect(screen.getByText(/t20 team 1/i)).toBeInTheDocument();
    expect(screen.getByText(/t20 team 2/i)).toBeInTheDocument();
  });

  it("shows the extra under-18 acknowledgement in confirmation dialog", () => {
    render(<WaiverForm waiver={null} t20Divisions={[]} teams={[]} />);

    fireEvent.change(screen.getByLabelText(/player name as in cricclubs/i), {
      target: { value: "Rohan Patel" },
    });
    fireEvent.change(screen.getByLabelText(/player cricclubs id/i), {
      target: { value: "CC-12345" },
    });
    fireEvent.change(screen.getByLabelText(/address/i), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByLabelText(/city/i), {
      target: { value: "Troy" },
    });
    fireEvent.change(screen.getByLabelText(/signature full name/i), {
      target: { value: "Rohan Patel" },
    });

    fireEvent.click(screen.getByRole("checkbox", { name: /yes/i }));
    fireEvent.change(screen.getByLabelText(/parent's name/i), {
      target: { value: "Priya Patel" },
    });
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /i have read the waiver text and agree to submit this form for the current year/i,
      }),
    );
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /i have read the 2026 mich-ca rulebook and understand all the conditions/i,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: /review & submit waiver/i }));

    expect(
      screen.getByText(/i agree that my parents entered their details\./i),
    ).toBeInTheDocument();
  });
});
