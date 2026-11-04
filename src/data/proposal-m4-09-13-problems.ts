import "server-only";
import { problemSchema, type ProblemInstance } from "@/contracts";
import { curriculumProposal } from "@/data/curriculum-proposal";
import m409 from "../../docs/research/NEXT_BATCH/M4-09/problem-blueprint.json";
import m410 from "../../docs/research/NEXT_BATCH/M4-10/problem-blueprint.json";
import m411 from "../../docs/research/NEXT_BATCH/M4-11/problem-blueprint.json";
import m412 from "../../docs/research/NEXT_BATCH/M4-12/problem-blueprint.json";
import m413 from "../../docs/research/NEXT_BATCH/M4-13/problem-blueprint.json";

const blueprints = [m409, m410, m411, m412, m413] as const;

function skillIdFor(unitId: string, skillLabel: string) {
  const unit = curriculumProposal.curriculum.units.find((candidate) => candidate.id === unitId);
  const match = /-skill-(\d+)$/.exec(skillLabel);
  const concept = unit?.concepts[Number(match?.[1]) - 1];
  if (!unit || !match || !concept) throw new Error(`Proposal skill mapping missing: ${unitId}/${skillLabel}`);
  return concept.id;
}

export const m4FoundationsProblemFamilies = blueprints.flatMap((unit) => unit.families.map((family) => ({
  id: family.id,
  title: family.title,
  strategy: family.reasoningStructure,
})));

export const m4FoundationsProblems: ProblemInstance[] = blueprints.flatMap((unit) =>
  unit.families.flatMap((family, familyIndex) => family.items.map((item) => {
    const choices = "choices" in item ? item.choices : undefined;
    const expected = item.answer.value;
    const answerRule = item.inputType === "choice"
      ? { kind: "choice" as const, expected }
      : item.inputType === "fraction"
        ? { kind: "fraction" as const, expected: expected.includes("/") ? expected : `${expected}/1` }
        : { kind: "integer" as const, expected };
    const answerDisplay = choices?.find((choice) => choice.id === expected)?.label ?? expected;
    return problemSchema.parse({
      id: `p-${unit.unitId.toLowerCase()}-${item.id}`,
      unitId: unit.unitId,
      skillId: skillIdFor(unit.unitId, item.skillLabel),
      familyId: family.id,
      reasoning: familyIndex === 0 ? "basic" : familyIndex === 1 ? "variation" : "application",
      difficulty: item.difficulty,
      input: item.inputType,
      prompt: item.prompt,
      ...(choices ? { choices } : {}),
      answerRule,
      answerDisplay,
      explanation: `${item.rationale} 정답은 ${answerDisplay}입니다.`,
      steps: [item.rationale, `정답은 ${answerDisplay}입니다.`],
      misconceptions: [item.misconceptionHypothesis],
      status: "draft",
      version: item.contentVersion,
      provenance: {
        author: "Math 90 Research & Content draft",
        license: item.provenance.rightsStatus,
        source: `자체 제작 미검수 초안; docs/research/NEXT_BATCH/${unit.unitId}/problem-blueprint.json`,
        aiGenerated: true,
      },
      reviewHistory: [],
      purpose: "practice",
    });
  })),
);
