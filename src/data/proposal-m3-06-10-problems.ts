import "server-only";
import { problemSchema, type ProblemInstance } from "@/contracts";
import blueprint from "../../docs/research/NEXT_BATCH/M3-06-10-problem-blueprint.json";
import { curriculumProposal } from "@/data/curriculum-proposal";

const units = blueprint.units;

function conceptSkillId(unitId: string, skillLabel: string) {
  const unit = curriculumProposal.curriculum.units.find((candidate) => candidate.id === unitId);
  const match = /-skill-(\d+)$/.exec(skillLabel);
  if (!unit || !match) throw new Error(`M3 target skill metadata missing: ${unitId}/${skillLabel}`);
  const concept = unit.concepts[Number(match[1]) - 1];
  if (!concept) throw new Error(`M3 target skill does not map to a unit concept: ${unitId}/${skillLabel}`);
  return concept.id;
}

export const m3NextProblemFamilies = units.flatMap((unit) => unit.families.map((family) => ({
  id: family.id,
  title: family.title,
  strategy: family.reasoningStructure,
})));

export const m3NextProblems: ProblemInstance[] = units.flatMap((unit) =>
  unit.families.flatMap((family, familyIndex) => family.items.map((item) => {
    const choices = item.choices?.map((choice) => ({ id: choice.id, label: choice.label }));
    const input = item.inputType;
    const expected = item.answer.value;
    const answerRule = input === "choice"
      ? { kind: "choice" as const, expected }
      : input === "fraction"
        ? { kind: "fraction" as const, expected: expected.includes("/") ? expected : `${expected}/1` }
        : input === "decimal"
          ? { kind: "decimal" as const, expected }
          : { kind: "integer" as const, expected };
    const answerDisplay = choices?.find((choice) => choice.id === expected)?.label ?? expected;
    return problemSchema.parse({
      id: `p-${unit.unitId.toLowerCase()}-${item.id}`,
      unitId: unit.unitId,
      skillId: conceptSkillId(unit.unitId, item.skillLabel),
      familyId: family.id,
      reasoning: familyIndex === 0 ? "basic" : familyIndex === 1 ? "variation" : "application",
      difficulty: item.difficulty,
      input,
      prompt: item.prompt,
      ...(choices ? { choices } : {}),
      answerRule,
      answerDisplay,
      explanation: `${item.rationale} 정답은 ${answerDisplay}입니다.`,
      steps: [item.rationale, `정답은 ${answerDisplay}입니다.`],
      misconceptions: [item.misconceptionHypothesis],
      status: "draft",
      version: item.contentVersion,
      provenance: { author: "Math 90 Research & Content draft", license: item.provenance.rightsStatus, source: "자체 제작 초안; docs/research/NEXT_BATCH/M3-06-10-problem-blueprint.json", aiGenerated: true },
      reviewHistory: [],
      purpose: "practice",
    });
  })),
);
