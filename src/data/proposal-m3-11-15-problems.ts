import "server-only";
import { problemSchema, type ProblemInstance } from "@/contracts";
import blueprint from "../../docs/research/NEXT_BATCH/M3-11-15-problem-blueprint.json";
import { curriculumProposal } from "@/data/curriculum-proposal";

function conceptSkillId(unitId: string, targetSkill: string) {
  const unit = curriculumProposal.curriculum.units.find((candidate) => candidate.id === unitId);
  const match = /-skill-(\d+)$/.exec(targetSkill);
  if (!unit || !match) throw new Error(`M3 skill metadata missing: ${unitId}/${targetSkill}`);
  const concept = unit.concepts[Number(match[1]) - 1];
  if (!concept) throw new Error(`M3 skill does not map to a unit concept: ${unitId}/${targetSkill}`);
  return concept.id;
}

const units = blueprint.units;
export const m3LatestProblemFamilies = units.flatMap((unit) => unit.families.map((family) => ({
  id: family.id, title: family.title, strategy: family.reasoningStructure,
})));

export const m3LatestProblems: ProblemInstance[] = units.flatMap((unit) =>
  unit.families.flatMap((family, familyIndex) => family.items.map((item) => {
    const input = item.inputType;
    const expected = item.answer.value;
    const answerRule = input === "fraction"
      ? { kind: "fraction" as const, expected: expected.includes("/") ? expected : `${expected}/1` }
      : input === "decimal"
        ? { kind: "decimal" as const, expected }
        : { kind: "integer" as const, expected };
    const answerDisplay = expected;
    return problemSchema.parse({
      id: `p-${unit.unitId.toLowerCase()}-${item.id}`,
      unitId: unit.unitId,
      skillId: conceptSkillId(unit.unitId, item.skillLabel),
      familyId: family.id,
      reasoning: familyIndex === 0 ? "basic" : familyIndex === 1 ? "variation" : "application",
      difficulty: item.difficulty, input, prompt: item.prompt,
      answerRule, answerDisplay, explanation: `${item.rationale} 정답은 ${answerDisplay}입니다.`,
      steps: [item.rationale, `정답은 ${answerDisplay}입니다.`],
      misconceptions: [item.misconceptionHypothesis],
      status: "draft", version: item.contentVersion,
      provenance: { author: "Math 90 Research & Content draft", license: item.provenance.rightsStatus, source: "자체 제작 초안; docs/research/NEXT_BATCH/M3-11-15-problem-blueprint.json", aiGenerated: true },
      reviewHistory: [], purpose: "practice",
    });
  })),
);
