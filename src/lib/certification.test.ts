import {
  buildAttemptSnapshots,
  CERTIFICATION_PASS_PERCENT,
  getDetroitDateString,
  gradeAttempt,
  validateQuestionPayload,
} from "@/lib/certification";

describe("validateQuestionPayload", () => {
  it("validates a complete payload", () => {
    const result = validateQuestionPayload(" Question? ", [" A ", "B"], 1);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.prompt).toBe("Question?");
      expect(result.options).toEqual(["A", "B"]);
      expect(result.correctIndex).toBe(1);
    }
  });

  it("rejects missing prompt and invalid correct index", () => {
    expect(validateQuestionPayload("", ["A", "B"], 0).ok).toBe(false);
    expect(validateQuestionPayload("Q", ["A", "B"], 5).ok).toBe(false);
  });
});

describe("gradeAttempt", () => {
  it("grades pass/fail correctly", () => {
    const passing = gradeAttempt([
      {
        selectedOptionIdOriginal: "o1",
        optionsSnapshotJson: [
          { id: "o1", label: "A", isCorrect: true, sortOrder: 1 },
          { id: "o2", label: "B", isCorrect: false, sortOrder: 2 },
        ],
      },
    ]);
    expect(passing.correctCount).toBe(1);
    expect(passing.scorePercent).toBe(100);
    expect(passing.result).toBe("PASS");

    const failing = gradeAttempt([
      {
        selectedOptionIdOriginal: "o2",
        optionsSnapshotJson: [
          { id: "o1", label: "A", isCorrect: true, sortOrder: 1 },
          { id: "o2", label: "B", isCorrect: false, sortOrder: 2 },
        ],
      },
    ]);
    expect(failing.scorePercent).toBeLessThan(CERTIFICATION_PASS_PERCENT);
    expect(failing.result).toBe("FAIL");
  });
});

describe("getDetroitDateString", () => {
  it("returns YYYY-MM-DD", () => {
    expect(getDetroitDateString(new Date("2026-02-26T12:00:00.000Z"))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("buildAttemptSnapshots", () => {
  it("includes image url in snapshots", () => {
    const snapshots = buildAttemptSnapshots([
      {
        id: "q1",
        prompt: "Question",
        imageUrl: "https://example.com/image.webp",
        isActive: true,
        createdByUserId: "u1",
        createdAt: new Date(),
        updatedAt: new Date(),
        options: [
          {
            id: "o1",
            questionId: "q1",
            label: "Yes",
            isCorrect: true,
            sortOrder: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
    ]);

    expect(snapshots[0]).toMatchObject({
      questionIdOriginal: "q1",
      imageUrlSnapshot: "https://example.com/image.webp",
    });
  });
});
