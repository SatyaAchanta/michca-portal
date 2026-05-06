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
  const seasonEntries = [
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
  const weeklyEntries = [
    {
      id: "user-1",
      firstName: "Aarav",
      lastName: "Patel",
      email: "aarav@example.com",
      t20TeamCode: "MOCC",
      weeklyPoints: 6,
      correctPredictions: 2,
      totalPredictions: 2,
    },
    {
      id: "user-2",
      firstName: "Rohan",
      lastName: "Shah",
      email: "rohan@example.com",
      t20TeamCode: "LCC",
      weeklyPoints: 4,
      correctPredictions: 1,
      totalPredictions: 2,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hides the picks action on the season leaderboard", () => {
    render(
      <LeaderboardTable
        entries={seasonEntries}
        currentUserId="user-1"
        canViewPredictions
      />,
    );

    expect(screen.queryByText("Picks")).not.toBeInTheDocument();
    expect(screen.queryByText("Full Weeks")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /view picks/i })).not.toBeInTheDocument();
  });

  it("loads and displays grouped participant picks in a dialog for weekly view", async () => {
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
        entries={weeklyEntries}
        currentUserId="user-1"
        canViewPredictions
        mode="weekly"
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
        entries={weeklyEntries}
        currentUserId="user-1"
        canViewPredictions
        mode="weekly"
      />,
    );

    await user.click(screen.getAllByRole("button", { name: /view picks/i })[1]);

    expect(await screen.findByText("No revealed picks yet.")).toBeInTheDocument();
  });

  it("paginates leaderboard entries", async () => {
    const user = userEvent.setup();
    const manyEntries = Array.from({ length: 11 }, (_, index) => ({
      id: `user-${index + 1}`,
      firstName: `Player${index + 1}`,
      lastName: "Test",
      email: `player${index + 1}@example.com`,
      fantasyPoints: 20 - index,
      fullParticipationWeeks: 2,
      t20TeamCode: null,
    }));

    render(
      <LeaderboardTable
        entries={manyEntries}
        currentUserId={null}
        canViewPredictions={false}
      />,
    );

    expect(screen.getAllByText("Showing 1-10 of 11")).toHaveLength(2);
    expect(screen.getByText("Player1 Test")).toBeInTheDocument();
    expect(screen.queryByText("Player11 Test")).not.toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Next" })[0]);

    expect(screen.getAllByText("Showing 11-11 of 11")).toHaveLength(2);
    expect(screen.getByText("Player11 Test")).toBeInTheDocument();
    expect(screen.queryByText("Player1 Test")).not.toBeInTheDocument();
  });
});
