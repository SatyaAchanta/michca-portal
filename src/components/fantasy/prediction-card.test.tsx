import { render, screen } from "@testing-library/react";

import { PredictionCard } from "@/components/fantasy/prediction-card";

vi.mock("@/lib/actions/fantasy", () => ({
  submitPrediction: vi.fn(),
}));

describe("PredictionCard", () => {
  const baseGame = {
    id: "game-1",
    date: new Date("2026-05-03T20:00:00.000Z"),
    status: "SCHEDULED",
    division: "PREMIER_T20",
    gameType: "LEAGUE" as const,
    venue: "Farmington",
    team1Code: "MOCC",
    team2Code: "LCC",
    team1: {
      teamName: "Michigan OCC",
      teamShortCode: "MOCC",
      logo: null,
    },
    team2: {
      teamName: "Lansing CC",
      teamShortCode: "LCC",
      logo: null,
    },
  };

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a lock indicator after the one-hour deadline passes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-03T19:05:00.000Z"));

    render(
      <PredictionCard
        game={baseGame}
        canBoost
        boostersRemaining={3}
        picks={{ team1Count: 4, drawCount: 1, team2Count: 2, total: 7 }}
      />,
    );

    expect(screen.getAllByText(/game locked/i)).toHaveLength(2);
    expect(screen.getByText(/Venue: Farmington/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /boost/i }),
    ).not.toBeInTheDocument();
  });

  it("shows a read-only boosted badge beside the lock indicator", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-03T19:05:00.000Z"));

    render(
      <PredictionCard
        game={baseGame}
        existing={{
          gameId: baseGame.id,
          predictedWinnerCode: baseGame.team1Code,
          isBoosted: true,
          isScored: false,
          isCorrect: null,
          pointsEarned: null,
        }}
        canBoost
        boostersRemaining={3}
      />,
    );

    expect(screen.getByText("Boosted")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /boost/i }),
    ).not.toBeInTheDocument();
  });

  it("does not show a boosted badge for a locked unboosted prediction", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-03T19:05:00.000Z"));

    render(
      <PredictionCard
        game={baseGame}
        existing={{
          gameId: baseGame.id,
          predictedWinnerCode: baseGame.team1Code,
          isBoosted: false,
          isScored: false,
          isCorrect: null,
          pointsEarned: null,
        }}
        canBoost
        boostersRemaining={3}
      />,
    );

    expect(screen.queryByText("Boosted")).not.toBeInTheDocument();
  });

  it("does not show the lock indicator before the deadline", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-03T18:30:00.000Z"));

    render(
      <PredictionCard
        game={baseGame}
        canBoost
        boostersRemaining={3}
      />,
    );

    expect(screen.queryByText(/game locked/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /boost/i })).toBeInTheDocument();
  });

  it("renders labeled form chips with latest emphasis when form exists", () => {
    render(
      <PredictionCard
        game={{
          ...baseGame,
          team1Form: ["W", "L", "D"],
          team2Form: ["L", "W"],
        }}
        canBoost
        boostersRemaining={3}
      />,
    );

    const formRows = screen.getAllByTestId("team-form");
    expect(formRows).toHaveLength(2);

    const winChip = screen.getAllByLabelText("Win")[0];
    const lossChip = screen.getAllByLabelText("Loss")[0];
    const drawChip = screen.getByLabelText("Draw");

    expect(winChip).toHaveTextContent("W");
    expect(winChip.className).toContain("bg-emerald-100");
    expect(lossChip).toHaveTextContent("L");
    expect(lossChip.className).toContain("bg-red-100");
    expect(drawChip).toHaveTextContent("-");
    expect(drawChip.className).toContain("bg-slate-200");
    expect(drawChip).toHaveAttribute("data-latest", "true");
    expect(drawChip.className).toContain("ring-1");
  });

  it("does not render a form row when team form is absent", () => {
    render(
      <PredictionCard
        game={baseGame}
        canBoost
        boostersRemaining={3}
      />,
    );

    expect(screen.queryByTestId("team-form")).not.toBeInTheDocument();
  });

  it("renders venue stats and hides the tie button for playoff games", () => {
    render(
      <PredictionCard
        game={{
          ...baseGame,
          gameType: "PLAYOFF",
          venue: "Lyon Oaks",
          team1VenueStats: { gamesPlayed: 5, gamesWon: 3 },
          team2VenueStats: { gamesPlayed: 0, gamesWon: 0 },
        }}
        canBoost
        boostersRemaining={3}
      />,
    );

    expect(screen.queryByRole("button", { name: /^tie$/i })).not.toBeInTheDocument();
    const venueStats = screen.getByTestId("venue-stats");
    expect(venueStats).toBeInTheDocument();
    expect(venueStats).toHaveTextContent("MOCC -Won 3 of 5 games");
    expect(venueStats).toHaveTextContent("LCC -No prior games");
  });
});
