import "server-only";
import { problemSchema, type ProblemInstance } from "@/contracts";
import { curriculumProposal } from "@/data/curriculum-proposal";
import m321 from "../../docs/research/NEXT_BATCH/M3-21/problem-blueprint.json";
import m322 from "../../docs/research/NEXT_BATCH/M3-22/problem-blueprint.json";
import m401 from "../../docs/research/NEXT_BATCH/M4-01/problem-blueprint.json";
import m402 from "../../docs/research/NEXT_BATCH/M4-02/problem-blueprint.json";
import m403 from "../../docs/research/NEXT_BATCH/M4-03/problem-blueprint.json";

const blueprints = [m321, m322, m401, m402, m403] as const;
function conceptSkillId(unitId: string, targetSkill: string) {
  const unit = curriculumProposal.curriculum.units.find((candidate) => candidate.id === unitId);
  const match = /-skill-(\d+)$/.exec(targetSkill);
  const concept = unit?.concepts[Number(match?.[1]) - 1];
  if (!unit || !match || !concept) throw new Error(`Proposal skill mapping missing: ${unitId}/${targetSkill}`);
  return concept.id;
}

export const m3m4PreviewProblemFamilies = blueprints.flatMap((unit) => unit.families.map((family) => ({
  id: family.id,
  title: family.title,
  strategy: family.reasoningStructure,
})));

export const m3m4PreviewProblems: ProblemInstance[] = blueprints.flatMap((unit) =>
  unit.families.flatMap((family, familyIndex) => family.items.map((item) => {
    const choices = "choices" in item && item.choices
      ? item.choices.map((choice) => ({ id: choice.id, label: choice.label }))
      : undefined;
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
