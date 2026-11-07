import "server-only";
import { problemSchema, type ProblemInstance } from "@/contracts";
import { proposalProblemBlueprintSchema } from "@/contracts/handoff";
import { curriculumProposal } from "@/data/curriculum-proposal";
import m514 from "../../docs/research/NEXT_BATCH/M5-14/problem-blueprint.json";
import m515 from "../../docs/research/NEXT_BATCH/M5-15/problem-blueprint.json";
import m516 from "../../docs/research/NEXT_BATCH/M5-16/problem-blueprint.json";
import m517 from "../../docs/research/NEXT_BATCH/M5-17/problem-blueprint.json";
import m518 from "../../docs/research/NEXT_BATCH/M5-18/problem-blueprint.json";

const blueprints = [m514, m515, m516, m517, m518].map((blueprint) =>
  proposalProblemBlueprintSchema.parse(blueprint),
);

function skillIdFor(unitId: string, skillLabel: string) {
  const unit = curriculumProposal.curriculum.units.find((candidate) => candidate.id === unitId);
  const match = /-skill-(\d+)$/.exec(skillLabel);
  const concept = unit?.concepts[Number(match?.[1]) - 1];
  if (!unit || !match || !concept) throw new Error(`Proposal skill mapping missing: ${unitId}/${skillLabel}`);
  return concept.id;
}

export const m514To518ProblemFamilies = blueprints.flatMap((unit) => unit.families.map((family) => ({
  id: family.id,
  title: family.title,
  strategy: family.reasoningStructure,
})));

export const m514To518Problems: ProblemInstance[] = blueprints.flatMap((unit) =>
  unit.families.flatMap((family, familyIndex) => family.items.map((item) => {
    const answerDisplay = item.choices.find((choice) => choice.id === item.answer.value)?.label;
    if (!answerDisplay || answerDisplay !== item.semanticAnswer) {
      throw new Error(`Proposal semantic answer mismatch: ${unit.unitId}/${item.id}`);
    }
    return problemSchema.parse({
      id: `p-${unit.unitId.toLowerCase()}-${item.id}`,
      unitId: unit.unitId,
      skillId: skillIdFor(unit.unitId, item.skillLabel),
      familyId: family.id,
      reasoning: familyIndex === 0 ? "basic" : familyIndex === 1 ? "variation" : "application",
      difficulty: item.difficulty,
      input: "choice",
      prompt: item.prompt,
      choices: item.choices,
      answerRule: { kind: "choice", expected: item.answer.value },
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
