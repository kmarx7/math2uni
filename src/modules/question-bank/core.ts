import {
  problemSchema,
  type ProblemInstance,
  type PublicProblem,
  type Unit,
  type ProblemFamily,
} from "@/contracts";
import { gradeAnswer } from "@/modules/math-validation";
import { canPublish } from "@/modules/administration";
export function toPublic(p: ProblemInstance): PublicProblem {
  return {
    id: p.id,
    unitId: p.unitId,
    skillId: p.skillId,
    familyId: p.familyId,
    reasoning: p.reasoning,
    difficulty: p.difficulty,
    input: p.input,
    prompt: p.prompt,
    choices: p.choices,
    purpose: p.purpose,
    version: p.version,
  };
}
export function validateBank(
  problems: ProblemInstance[],
  units: Unit[],
  families: ProblemFamily[],
): string[] {
  const errors: string[] = [];
  const ids = new Set<string>(),
    prompts = new Set<string>();
  for (const p of problems) {
    const parsed = problemSchema.safeParse(p);
    if (!parsed.success) {
      errors.push(`스키마 오류 ${p.id}`);
      continue;
    }
    if (ids.has(p.id)) errors.push(`문항 ID 중복 ${p.id}`);
    ids.add(p.id);
    const normalized = p.prompt.replace(/[\s,]/g, "");
    if (prompts.has(normalized)) errors.push(`문항 본문 중복 ${p.id}`);
    prompts.add(normalized);
    const unit = units.find((u) => u.id === p.unitId);
    if (!unit || !unit.concepts.some((c) => c.id === p.skillId))
      errors.push(`단원/개념 참조 오류 ${p.id}`);
    if (!families.some((f) => f.id === p.familyId))
      errors.push(`원형 참조 오류 ${p.id}`);
    if (p.input !== p.answerRule.kind) errors.push(`입력/규칙 불일치 ${p.id}`);
    if (
      p.input === "choice" &&
      (!p.choices?.some((c) => c.id === p.answerRule.expected) ||
        new Set(p.choices.map((c) => c.id)).size !== p.choices.length)
    )
      errors.push(`선택지 오류 ${p.id}`);
    if (gradeAnswer(p.answerRule, p.answerRule.expected).status !== "correct")
      errors.push(`정답 규칙 오류 ${p.id}`);
    if (
      !p.steps.join(" ").includes(p.answerDisplay) ||
      !p.explanation.includes(p.answerDisplay)
    )
      errors.push(`해설 정답 불일치 ${p.id}`);
    if (p.status === "approved" && !canPublish(p))
      errors.push(`승인 이력/권리 오류 ${p.id}`);
  }
  return errors;
}
