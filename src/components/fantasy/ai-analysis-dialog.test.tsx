import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AiAnalysisDialog } from "@/components/fantasy/ai-analysis-dialog";

const { track } = vi.hoisted(() => ({
  track: vi.fn(),
}));

vi.mock("@vercel/analytics/react", async () => {
  const actual = await vi.importActual<typeof import("@vercel/analytics/react")>(
    "@vercel/analytics/react",
  );

  return {
    ...actual,
    track,
  };
});

describe("AiAnalysisDialog", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens the dialog and renders generated analysis content", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "ready",
        report: {
          summary: "You are outperforming the field on overall accuracy.",
          strengths: ["Premier T20 reads are sharp.", "You are converting solid value from standard picks."],
          weaknesses: ["Boosters are underperforming.", "Recent Division 1 picks have slipped."],
          recommendations: ["Save boosts for cleaner edges.", "Tighten Division 1 picks next weekend."],
          confidenceNote: "The sample size is large enough for directional advice.",
        },
        metrics: {
          season: {
            scoredPredictions: 12,
            accuracy: 0.667,
            totalPoints: 27,
            rank: 4,
            percentile: 82,
            participationRate: 0.75,
            averagePointsPerPrediction: 1.4,
          },
          recentTrend: {
            weeksAnalyzed: 2,
            weeklyAccuracy: [0.5, 0.8],
            weeklyPoints: [3, 7],
            labels: ["2026-05-03", "2026-05-10"],
            direction: "up",
          },
          boosters: {
            used: 2,
            remaining: 4,
            accuracy: 0.5,
            averagePoints: 1.5,
          },
          comparisons: {
            overallAccuracyDelta: 0.1,
            averagePointsDelta: 0.2,
            boosterAccuracyDelta: -0.1,
            majorityAccuracyDelta: 0.04,
            contrarianAccuracyDelta: -0.05,
          },
          tendencies: {
            majorityPickRate: 0.6,
            majorityAccuracy: 0.71,
            contrarianPickRate: 0.4,
            contrarianAccuracy: 0.5,
          },
          strengthsByDivision: [],
          weaknessesByDivision: [],
          strengthsByGameType: [],
          weaknessesByGameType: [],
        },
        generatedAt: "2026-05-17T12:00:00.000Z",
        expiresAt: "2026-05-24T12:00:00.000Z",
        modelName: "gpt-5-mini",
        source: "generated",
        scoredPredictionCount: 12,
      }),
    });

    render(<AiAnalysisDialog />);

    await user.click(screen.getByRole("button", { name: /ai analysis/i }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(await screen.findByText(/outperforming the field/i)).toBeInTheDocument();
    expect(screen.getByText("Strengths")).toBeInTheDocument();
    expect(screen.getByText("Weaknesses")).toBeInTheDocument();
    expect(screen.getByText("Recommendations")).toBeInTheDocument();
    expect(track).toHaveBeenCalledWith("fantasy_ai_analysis_opened", {
      surface: "fantasy_page",
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/fantasy/analysis", {
      method: "GET",
      cache: "no-store",
    });
  });

  it("shows the insufficient-data state when analysis is not yet available", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "insufficient_data",
        scoredPredictionCount: 4,
        minimumRequired: 10,
        message: "AI Analysis becomes available after 10 scored predictions.",
      }),
    });

    render(<AiAnalysisDialog />);

    await user.click(screen.getByRole("button", { name: /ai analysis/i }));

    await waitFor(() => {
      expect(screen.getByText("More scored picks needed")).toBeInTheDocument();
    });
    expect(screen.getByText("4/10")).toBeInTheDocument();
  });
});
