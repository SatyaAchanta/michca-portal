import { render, screen } from "@testing-library/react";

import { ClubInfoForm } from "@/components/club-info/club-info-form";

vi.mock("@/app/club-info/actions", () => ({
  submitMyClubInfo: vi.fn(),
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("ClubInfoForm", () => {
  beforeAll(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("renders the account email as read-only", () => {
    render(
      <ClubInfoForm
        accountEmail="captain@example.com"
        initialCaptainName="Rohan Patel"
        initialContactNumber="248-555-0101"
        submission={null}
        t20Divisions={["Premier"]}
        teams={[]}
      />,
    );

    expect(screen.getByDisplayValue("captain@example.com")).toBeDisabled();
  });

  it("renders a locked state after submission", () => {
    render(
      <ClubInfoForm
        accountEmail="captain@example.com"
        initialCaptainName="Rohan Patel"
        initialContactNumber="248-555-0101"
        submission={{
          accountEmail: "captain@example.com",
          captainName: "Rohan Patel",
          cricclubsId: "CC-4455",
          contactNumber: "248-555-0101",
          t20Division: "Premier",
          t20TeamCode: "T20-MOCC",
          secondaryDivision: null,
          secondaryTeamCode: null,
          createdAt: new Date().toISOString(),
        }}
        t20Divisions={["Premier"]}
        teams={[
          {
            teamCode: "T20-MOCC",
            teamName: "Michigan OCC",
            division: "Premier",
            format: "T20",
          },
        ]}
      />,
    );

    expect(screen.getByText(/club info submitted/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /submit club info/i })).not.toBeInTheDocument();
  });
});
