import {
  progressSchema,
  type ProgressState,
  type Feedback,
  type Attempt,
} from "@/contracts";
export type Submission = {
  requestId: string;
  answers: Record<string, string>;
  feedback: Feedback[];
  hintUsed: boolean;
  purpose: "practice" | "assessment" | "review";
  at: string;
  score?: number;
};
export function applySubmission(
  state: ProgressState,
  submission: Submission,
): ProgressState {
  const added: Attempt[] = [];
  for (const feedback of submission.feedback) {
    if (feedback.status !== "correct" && feedback.status !== "incorrect")
      throw new Error("채점되지 않은 답안은 저장할 수 없습니다.");
    const id = `${submission.requestId}:${feedback.problemId}`;
    const previous = state.attempts.find((a) => a.id === id);
    const answer = submission.answers[feedback.problemId];
    if (previous) {
      if (
        previous.answer !== answer ||
        previous.hintUsed !== submission.hintUsed
      )
        throw new Error("같은 제출 ID의 답안이 다릅니다.");
      continue;
    }
    added.push({
      id,
      problemId: feedback.problemId,
      version: feedback.version,
      skillId: feedback.skillId,
      purpose: submission.purpose,
      answer,
      correct: feedback.status === "correct",
      hintUsed: submission.hintUsed,
      retry: state.attempts.some(
        (a) =>
          a.problemId === feedback.problemId &&
          a.version === feedback.version &&
          Date.parse(submission.at) - Date.parse(a.at) < 86_400_000,
      ),
      at: submission.at,
      feedback: {
        answerDisplay: feedback.answerDisplay!,
        explanation: feedback.explanation!,
        steps: feedback.steps!,
        misconception: feedback.misconception,
      },
    });
  }
  if (!added.length) return state;
  return progressSchema.parse({
    ...state,
    attempts: [...state.attempts, ...added],
    assessmentScore: submission.score ?? state.assessmentScore,
  });
}
export function completeLearningBlock(
  state: ProgressState,
  blockId: string,
): ProgressState {
  return state.completedBlocks.includes(blockId)
    ? state
    : { ...state, completedBlocks: [...state.completedBlocks, blockId] };
}
