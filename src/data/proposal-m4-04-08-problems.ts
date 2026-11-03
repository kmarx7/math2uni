import "server-only";
import { problemSchema, type ProblemInstance } from "@/contracts";
import { curriculumProposal } from "@/data/curriculum-proposal";
import m404 from "../../docs/research/NEXT_BATCH/M4-04/problem-blueprint.json";
import m405 from "../../docs/research/NEXT_BATCH/M4-05/problem-blueprint.json";
import m406 from "../../docs/research/NEXT_BATCH/M4-06/problem-blueprint.json";
import m407 from "../../docs/research/NEXT_BATCH/M4-07/problem-blueprint.json";
import m408 from "../../docs/research/NEXT_BATCH/M4-08/problem-blueprint.json";

const blueprints = [m404, m405, m406, m407, m408] as const;

function conceptSkillId(unitId: string, targetSkill: string) {
  const unit = curriculumProposal.curriculum.units.find((candidate) => candidate.id === unitId);
  const match = /-skill-(\d+)$/.exec(targetSkill);
  const concept = unit?.concepts[Number(match?.[1]) - 1];
  if (!unit || !match || !concept) throw new Error(`Proposal skill mapping missing: ${unitId}/${targetSkill}`);
  return concept.id;
}

export const m4PreviewProblemFamilies = blueprints.flatMap((unit) => unit.families.map((family) => ({
  id: family.id,
  title: family.title,
  strategy: family.reasoningStructure,
})));

export const m4PreviewProblems: ProblemInstance[] = blueprints.flatMap((unit) =>
  unit.families.flatMap((family, familyIndex) => family.items.map((item) => {
    const choices = "choices" in item ? item.choices : undefined;
    const expected = item.answer.value;
    const input = item.inputType;
    const answerRule = input === "choice"
      ? { kind: "choice" as const, expected }
      : input === "fraction"
        ? { kind: "fraction" as const, expected: expected.includes("/") ? expected : `${expected}/1` }
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
