import { render, screen } from "@testing-library/react";

import { AccountForm } from "@/components/account/account-form";
import { WAIVER_ROLE_OPTIONS } from "@/lib/waiver-constants";
import { UserRole } from "@/generated/prisma/client";

vi.mock("@/app/account/actions", () => ({
  updateProfile: vi.fn(),
  deleteAccount: vi.fn(),
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("AccountForm", () => {
  beforeAll(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("renders current player info controls with saved values", () => {
    const { container } = render(
      <AccountForm
        profile={{
          id: "profile-1",
          clerkUserId: "clerk-1",
          email: "rohan@example.com",
          firstName: "Rohan",
          lastName: "Patel",
          notificationsEnabled: true,
          newsletterSubscribed: false,
          role: UserRole.PLAYER,
          t20TeamCode: "T20-MOCC",
          secondaryTeamCode: "T30-MOCC",
          playingRole: "Bowler",
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
        umpiringResult={null}
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
        waiverSubmission={null}
      />
    );

    expect(screen.getByText(/current t20 team/i)).toBeInTheDocument();
    expect(screen.getByText(/current f40\/t30 team/i)).toBeInTheDocument();
    expect(screen.getByText(/playing role/i)).toBeInTheDocument();

    const hiddenInputs = Array.from(
      container.querySelectorAll("input[type='hidden']")
    );
    expect(hiddenInputs.find((input) => input.getAttribute("name") === "t20TeamCode")).toHaveValue(
      "T20-MOCC"
    );
    expect(
      hiddenInputs.find((input) => input.getAttribute("name") === "secondaryTeamCode")
    ).toHaveValue("T30-MOCC");
    expect(
      hiddenInputs.find((input) => input.getAttribute("name") === "playingRole")
    ).toHaveValue("Bowler");
  });

  it("exposes the allowed playing role options", () => {
    const { container } = render(
      <AccountForm
        profile={null}
        umpiringResult={null}
        teams={[]}
        waiverSubmission={null}
      />
    );

    const selects = Array.from(container.querySelectorAll("select"));
    const roleSelect = selects.at(-1);
    const roleOptions = Array.from(
      roleSelect?.querySelectorAll("option") ?? []
    ).map((option) => option.textContent);

    expect(roleOptions).toEqual(["N/A", ...WAIVER_ROLE_OPTIONS]);
  });

  it("renders compact mobile status summaries", () => {
    render(
      <AccountForm
        profile={null}
        umpiringResult={null}
        teams={[]}
        waiverSubmission={null}
      />
    );

    expect(screen.getByText("Umpiring")).toBeInTheDocument();
    expect(screen.getByText("No umpiring result yet.")).toBeInTheDocument();
    expect(screen.getByText("Waiver")).toBeInTheDocument();
    expect(screen.getByText("Waiver not submitted yet.")).toBeInTheDocument();
  });

  it("shows under-18 parent details in the waiver summary", () => {
    render(
      <AccountForm
        profile={null}
        umpiringResult={null}
        teams={[]}
        waiverSubmission={{
          submittedAt: "2026-04-23T10:00:00.000Z",
          state: "Michigan",
          city: "Troy",
          address: "123 Main St",
          t20Division: "Premier",
          additionalT20Division: "Division-1",
          secondaryDivision: "T30",
          t20TeamCode: "T20-MOCC",
          additionalT20TeamCode: "T20-CCC",
          secondaryTeamCode: "T30-MOCC",
          isUnder18: true,
          parentName: "Priya Patel",
        }}
      />
    );

    expect(
      screen.getByRole("heading", { name: /waiver submitted/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/under 18:/i)).toBeInTheDocument();
    expect(screen.getByText(/parent's name:/i)).toBeInTheDocument();
    expect(screen.getByText("Priya Patel")).toBeInTheDocument();
    expect(screen.getByText(/additional t20:/i)).toBeInTheDocument();
    expect(screen.getByText(/Division-1 \(T20-CCC\)/)).toBeInTheDocument();
  });
});
