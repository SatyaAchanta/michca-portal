import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LeaderboardTable } from "@/components/fantasy/leaderboard-table";

const { getLeaderboardParticipantPredictions } = vi.hoisted(() => ({
  getLeaderboardParticipantPredictions: vi.fn(),
}));

vi.mock("@/lib/actions/fantasy", () => ({
  getLeaderboardParticipantPredictions,
}));

describe("LeaderboardTable", () => {
  const entries = [
    {
      id: "user-1",
      firstName: "Aarav",
      lastName: "Patel",
      email: "aarav@example.com",
      fantasyPoints: 12,
      fullParticipationWeeks: 3,
      t20TeamCode: "MOCC",
    },
    {
      id: "user-2",
      firstName: "Rohan",
      lastName: "Shah",
      email: "rohan@example.com",
      fantasyPoints: 9,
      fullParticipationWeeks: 2,
      t20TeamCode: "LCC",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the picks action and no full-weeks column", () => {
    render(
      <LeaderboardTable
        entries={entries}
        currentUserId="user-1"
        canViewPredictions
      />,
    );

    expect(screen.getByText("Picks")).toBeInTheDocument();
    expect(screen.queryByText("Full Weeks")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /view picks/i })).toHaveLength(2);
  });

  it("loads and displays grouped participant picks in a dialog", async () => {
    const user = userEvent.setup();
    getLeaderboardParticipantPredictions.mockResolvedValue({
      success: true,
      participant: {
        id: "user-1",
        displayName: "Aarav Patel",
      },
      weeks: [
        {
          weekKey: "2026-05-02",
          label: "May 2 – May 3",
          predictions: [
            {
              id: "pred-1",
              gameId: "game-1",
              date: new Date("2026-05-03T14:00:00.000Z"),
              division: "PREMIER_T20",
              gameType: "PLAYOFF",
              matchupLabel: "MOCC vs LCC",
              pickLabel: "MOCC",
              resultLabel: "MOCC",
              isBoosted: true,
              isCorrect: true,
              pointsEarned: 3,
            },
          ],
        },
      ],
    });

    render(
      <LeaderboardTable
        entries={entries}
        currentUserId="user-1"
        canViewPredictions
      />,
    );

    await user.click(screen.getAllByRole("button", { name: /view picks/i })[0]);

    await waitFor(() => {
      expect(getLeaderboardParticipantPredictions).toHaveBeenCalledWith("user-1");
    });
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("May 2 – May 3")).toBeInTheDocument();
    expect(screen.getByText("MOCC vs LCC")).toBeInTheDocument();
    expect(screen.getByText("Boosted")).toBeInTheDocument();
    expect(screen.getByText("+3 pts")).toBeInTheDocument();
  });

  it("shows the empty state when a participant has no revealed picks", async () => {
    const user = userEvent.setup();
    getLeaderboardParticipantPredictions.mockResolvedValue({
      success: true,
      participant: {
        id: "user-2",
        displayName: "Rohan Shah",
      },
      weeks: [],
    });

    render(
      <LeaderboardTable
        entries={entries}
        currentUserId="user-1"
        canViewPredictions
      />,
    );

    await user.click(screen.getAllByRole("button", { name: /view picks/i })[1]);

    expect(await screen.findByText("No revealed picks yet.")).toBeInTheDocument();
  });
});
