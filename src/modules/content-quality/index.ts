import type { ContentDocument, ProblemInstance } from "@/contracts";
import {
  learningPhases,
  lessonSpecSchema,
  problemBlueprintSchema,
  reviewEvidenceSchema,
  workflowStages,
  type ReviewEvidence,
} from "@/contracts/handoff";

export function validateLessonHandoff(
  specInput: unknown,
  blueprintInput: unknown,
  content: ContentDocument,
  problems: ProblemInstance[],
): string[] {
  const spec = lessonSpecSchema.safeParse(specInput),
    blueprint = problemBlueprintSchema.safeParse(blueprintInput);
  if (!spec.success || !blueprint.success)
    return [
      "인계 스키마 오류",
      ...(!spec.success ? spec.error.issues.map((e) => e.message) : []),
      ...(!blueprint.success
        ? blueprint.error.issues.map((e) => e.message)
        : []),
    ];
  const s = spec.data,
    b = blueprint.data,
    errors: string[] = [];
  if (
    s.reviewStatus !== "reviewed" ||
    s.designReview.decision !== "implementation-ready" ||
    s.implementationReadiness.status !== "implementation-ready"
  )
    errors.push("교육 명세의 독립 설계 검토 대기");
  if (s.unitId !== b.unitId || s.unitId !== content.unitId)
    errors.push("단원 인계 불일치");
  if (
    s.contentVersion !== b.contentVersion ||
    s.contentVersion !== content.version
  )
    errors.push("콘텐츠 버전 불일치");
  if (new Set(s.subunits.map((u) => u.id)).size !== s.subunits.length)
    errors.push("소단원 ID 중복");
  if (
    new Set(s.lessonBlocks.map((phase) => phase.phaseId)).size !== 15 ||
    learningPhases.some(
      (id) => !s.lessonBlocks.some((phase) => phase.phaseId === id),
    )
  )
    errors.push("15단계 누락/중복");
  for (const phase of s.lessonBlocks)
    if (!content.blocks.some((block) => block.id === phase.existingBlockId))
      errors.push(`학습 단계 블록 누락 ${phase.phaseId}`);
  for (const subunit of s.subunits)
    if (subunit.targetSkills.some((skill) => !s.targetSkills.includes(skill)))
      errors.push(`소단원 기술 누락 ${subunit.id}`);
  if (new Set(b.families.map((family) => family.id)).size !== b.families.length)
    errors.push("원형 ID 중복");
  if (
    b.families.length !== b.counts.totalDistinctFamilies ||
    b.counts.newFamilies + b.counts.reusedFamilies !== b.families.length
  )
    errors.push("원형 수 불일치");
  if (
    problems.length !== b.counts.newFixedDrafts ||
    problems.filter((p) => p.purpose === "practice").length !==
      b.counts.newPracticeDrafts ||
    problems.filter((p) => p.purpose === "assessment").length !==
      b.counts.newAssessmentDrafts
  )
    errors.push("문항 수 불일치");
  for (const family of b.families) {
    const items = problems.filter((p) => p.familyId === family.id);
    if (
      items.filter((p) => p.purpose === "practice").length !==
        family.practiceCount ||
      items.filter((p) => p.purpose === "assessment").length !==
        family.assessmentCount
    )
      errors.push(`원형별 문항 수 불일치 ${family.id}`);
    if (
      items.some(
        (p) =>
          p.skillId !== family.skillId ||
          !family.difficulty.includes(p.difficulty),
      )
    )
      errors.push(`원형 기술/난도 불일치 ${family.id}`);
  }
  if (
    problems.some((p) => !b.families.some((family) => family.id === p.familyId))
  )
    errors.push("설계 밖 원형");
  if (
    b.requiredPractice.extensionRecommended >
    b.requiredPractice.extensionBankCount
  )
    errors.push("필수량이 은행 수량 초과");
  return errors;
}

/** A supplied human record is trusted only after the actual administrator verifies it.
 * Agents must never manufacture this record. Version/digest binding rejects stale evidence. */
export function canTransitionWorkflow(
  from: (typeof workflowStages)[number],
  to: (typeof workflowStages)[number],
  evidence: ReviewEvidence[],
  version: string,
  digest: string,
  authorId: string,
) {
  if (
    workflowStages.indexOf(from) < 0 ||
    workflowStages.indexOf(to) < 0 ||
    workflowStages.indexOf(to) !== workflowStages.indexOf(from) + 1
  )
    return false;
  const records = evidence.filter(
    (event) =>
      reviewEvidenceSchema.safeParse(event).success &&
      event.artifactVersion === version &&
      event.contentDigest === digest,
  );
  const target = records.find((event) => event.stage === to);
  if (!target) return false;
  if (to === "reviewed" && target.actorId === authorId) return false;
  const approved = records.find(
    (event) =>
      event.stage === "approved" &&
      event.actorType === "human" &&
      event.actorId !== authorId &&
      event.mathChecked &&
      event.rightsChecked,
  );
  if (
    workflowStages.indexOf(to) >= workflowStages.indexOf("approved") &&
    !approved
  )
    return false;
  if (
    to === "published" &&
    !records.some((event) => event.stage === "tested" && event.mathChecked)
  )
    return false;
  return true;
}
