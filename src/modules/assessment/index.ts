import type { Feedback, ProblemInstance } from "@/contracts";
import { gradeAnswer } from "@/modules/math-validation";
export function scoreProblem(p: ProblemInstance, answer: string): Feedback {
  if (p.input === "choice" && !p.choices?.some((c) => c.id === answer))
    return {
      status: "invalid",
      message: "보기 중 하나를 선택하세요.",
      problemId: p.id,
      version: p.version,
      skillId: p.skillId,
      purpose: p.purpose,
    };
  const grade = gradeAnswer(p.answerRule, answer);
  const result: Feedback = {
    ...grade,
    problemId: p.id,
    version: p.version,
    skillId: p.skillId,
    purpose: p.purpose,
  };
  return grade.status === "correct" || grade.status === "incorrect"
    ? {
        ...result,
        answerDisplay: p.answerDisplay,
        explanation: p.explanation,
        steps: p.steps,
        misconception:
          grade.status === "incorrect" ? p.misconceptions[0] : undefined,
      }
    : result;
}
export function scoreAssessment(
  problems: ProblemInstance[],
  answers: Record<string, string>,
) {
  if (!problems.length) throw new Error("승인된 평가 문항이 없습니다.");
  if (
    Object.keys(answers).length !== problems.length ||
    !problems.every((p) => Object.hasOwn(answers, p.id))
  )
    throw new Error("평가 전체 문항에 답해야 합니다.");
  const results = problems.map((p) => scoreProblem(p, answers[p.id]));
  if (results.some((r) => r.status === "invalid" || r.status === "unsupported"))
    throw new Error("답안 형식을 확인해 주세요.");
  return {
    score: Math.round(
      (100 * results.filter((r) => r.status === "correct").length) /
        results.length,
    ),
    results,
  };
}
