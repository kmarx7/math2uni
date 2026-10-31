import type { Curriculum } from "@/contracts";
import { curriculumProposalSchema } from "@/contracts/curriculum-proposal";
import { validateCurriculum } from "./index";

/** Read-only review validation. This function never registers or publishes units. */
export function validateProposal(
  input: unknown,
  registered: Curriculum,
): string[] {
  const parsed = curriculumProposalSchema.safeParse(input);
  if (!parsed.success)
    return parsed.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`,
    );
  const proposal = parsed.data;
  const plan = proposal.curriculum;
  const errors = validateCurriculum(plan);
  if (proposal.baseVersion !== registered.version)
    errors.push("기준 교육과정 버전 불일치");
  if (plan.units.length !== 170) errors.push("제안안은 170단원이어야 합니다");
  if (new Set(proposal.levels.map((item) => item.level)).size !== 9)
    errors.push("LEVEL 0~8 중복 또는 누락");
  if (proposal.levels.reduce((sum, item) => sum + item.count, 0) !== 170)
    errors.push("LEVEL별 합계는 170이어야 합니다");
  for (const item of proposal.levels) {
    if (
      plan.units.filter((unit) => unit.level === item.level).length !==
      item.count
    )
      errors.push(`LEVEL ${item.level} 수량 불일치`);
  }
  for (const existing of registered.units) {
    const candidate = plan.units.find((unit) => unit.id === existing.id);
    if (JSON.stringify(candidate) !== JSON.stringify(existing))
      errors.push(`기존 단원 보존 위반 ${existing.id}`);
  }
  const concepts = new Map(
    plan.units.flatMap((unit) =>
      unit.concepts.map((concept) => [concept.id, unit] as const),
    ),
  );
  const titles = new Set<string>();
  const counters = new Map<number, number>();
  let previousLevel = -1;
  for (const unit of plan.units) {
    if (unit.level < previousLevel) errors.push(`LEVEL 순서 역전 ${unit.id}`);
    previousLevel = unit.level;
    const ordinal = (counters.get(unit.level) ?? 0) + 1;
    counters.set(unit.level, ordinal);
    if (unit.id !== `M${unit.level}-${String(ordinal).padStart(2, "0")}`)
      errors.push(`단원 ID 순번 불일치 ${unit.id}`);
    const title = unit.title.replace(/\s+/g, "").normalize("NFKC");
    if (titles.has(title)) errors.push(`중복 제목 ${unit.title}`);
    titles.add(title);
    if (
      !registered.units.some((existing) => existing.id === unit.id) &&
      unit.status !== "draft"
    )
      errors.push(`미승인 제안 단원 공개 금지 ${unit.id}`);
    if (unit.standards.length)
      errors.push(`제안안 공식 코드 매핑 미검증 ${unit.id}`);
    for (const prerequisite of unit.prerequisites) {
      const owner = concepts.get(prerequisite);
      if (owner && owner.order >= unit.order)
        errors.push(
          `선수 개념은 먼저 학습해야 합니다 ${unit.id}: ${prerequisite}`,
        );
    }
  }
  return errors;
}
