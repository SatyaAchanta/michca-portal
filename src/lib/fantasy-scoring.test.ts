import { describe, expect, it } from "vitest";

import {
  calculateBoostersRemaining,
  calculateBoostersRemainingWithAbandonedRefunds,
} from "@/lib/fantasy-scoring";

describe("calculateBoostersRemainingWithAbandonedRefunds", () => {
  it("keeps boosters locked before enough full weeks", () => {
    expect(
      calculateBoostersRemainingWithAbandonedRefunds({
        fullParticipationWeeks: 1,
        boostedPredictionCount: 3,
        refundedBoostedPredictionCount: 2,
      }),
    ).toBe(0);
  });

  it("refunds abandoned boosted predictions while preserving other spent boosters", () => {
    expect(
      calculateBoostersRemainingWithAbandonedRefunds({
        fullParticipationWeeks: 3,
        boostedPredictionCount: 4,
        refundedBoostedPredictionCount: 2,
      }),
    ).toBe(8);
  });

  it("caps the corrected balance at the season maximum", () => {
    expect(
      calculateBoostersRemainingWithAbandonedRefunds({
        fullParticipationWeeks: 4,
        boostedPredictionCount: 1,
        refundedBoostedPredictionCount: 2,
      }),
    ).toBe(calculateBoostersRemaining({ fullParticipationWeeks: 4, boostedPredictionCount: 0 }));
  });
});
