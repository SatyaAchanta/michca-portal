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
    expect(
      screen.queryByRole("button", { name: /boost/i }),
    ).not.toBeInTheDocument();
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
});
