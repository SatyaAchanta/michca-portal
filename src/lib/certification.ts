import type {
  CertificationAttemptResult,
  CertificationAttemptQuestion,
  CertificationQuestion,
  CertificationQuestionOption,
} from "@/generated/prisma/client";

export const CERTIFICATION_QUESTION_COUNT = 20;
export const CERTIFICATION_DURATION_MINUTES = 30;
export const CERTIFICATION_PASS_PERCENT = 80;
export const CERTIFICATION_TIMEZONE = "America/Detroit";

export type CertificationSnapshotOption = {
  id: string;
  label: string;
  isCorrect: boolean;
  sortOrder: number;
};

export function getDetroitDateString(value = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: CERTIFICATION_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(value);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (!year || !month || !day) {
    throw new Error("Unable to derive Detroit local date.");
  }
  return `${year}-${month}-${day}`;
}

export function toDateOnlyValue(localDate: string) {
  return new Date(`${localDate}T00:00:00.000Z`);
}

export function shuffleArray<T>(items: readonly T[]): T[] {
  const output = [...items];
  for (let i = output.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
}

export function validateQuestionPayload(prompt: string, options: string[], correctIndex: number) {
  const normalizedPrompt = prompt.trim();
  const normalizedOptions = options.map((value) => value.trim());

  if (!normalizedPrompt) {
    return { ok: false as const, message: "Question prompt is required." };
  }
  if (normalizedOptions.length < 2) {
    return { ok: false as const, message: "At least two answers are required." };
  }
  if (normalizedOptions.some((value) => !value)) {
    return { ok: false as const, message: "All answer options must be filled." };
  }
  if (correctIndex < 0 || correctIndex >= normalizedOptions.length) {
    return { ok: false as const, message: "Select one correct answer." };
  }

  return {
    ok: true as const,
    prompt: normalizedPrompt,
    options: normalizedOptions,
    correctIndex,
  };
}

export function buildOptionSnapshot(options: CertificationQuestionOption[]): CertificationSnapshotOption[] {
  return options
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((option) => ({
      id: option.id,
      label: option.label,
      isCorrect: option.isCorrect,
      sortOrder: option.sortOrder,
    }));
}

export function gradeAttempt(
  questions: Pick<CertificationAttemptQuestion, "selectedOptionIdOriginal" | "optionsSnapshotJson">[]
) {
  let correctCount = 0;
  for (const question of questions) {
    const options = question.optionsSnapshotJson as CertificationSnapshotOption[];
    const selected = question.selectedOptionIdOriginal;
    if (!selected) {
      continue;
    }
    if (options.some((option) => option.id === selected && option.isCorrect)) {
      correctCount += 1;
    }
  }

  const totalQuestions = questions.length;
  const scorePercent = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);
  const result: CertificationAttemptResult =
    scorePercent >= CERTIFICATION_PASS_PERCENT ? "PASS" : "FAIL";

  return { correctCount, totalQuestions, scorePercent, result };
}

export function buildAttemptSnapshots(
  questions: (CertificationQuestion & { options: CertificationQuestionOption[] })[]
) {
  return questions.map((question, index) => ({
    displayOrder: index + 1,
    questionIdOriginal: question.id,
    promptSnapshot: question.prompt,
    imageUrlSnapshot: question.imageUrl ?? null,
    optionsSnapshotJson: buildOptionSnapshot(question.options),
  }));
}
