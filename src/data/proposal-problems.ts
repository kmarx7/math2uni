import "server-only";
import { problemSchema, type ProblemInstance } from "@/contracts";
import blueprint from "../../docs/research/NEXT_BATCH/problem-blueprint.json";
import algebraBlueprint from "../../docs/research/NEXT_BATCH/M1-06-10-problem-blueprint.json";
import assessmentBlueprint from "../../docs/research/NEXT_BATCH/M1-assessment-blueprint.json";
import { curriculumProposal } from "@/data/curriculum-proposal";

const choiceDrafts: Record<string, { id: string; label: string }[]> = {
  "m101-02": [{ id: "same", label: "같다" }, { id: "four", label: "4" }, { id: "zero", label: "0" }],
  "m101-06": [{ id: "a", label: "-6, -2, 0" }, { id: "b", label: "-2, -6, 0" }, { id: "c", label: "0, -2, -6" }],
  "m104-01": [{ id: "a", label: "3×3×3×3=81" }, { id: "b", label: "3×4=12" }, { id: "c", label: "3+3+3+3=12" }],
  "m105-01": [{ id: "a", label: "700x" }, { id: "b", label: "700+x" }, { id: "c", label: "x-700" }],
  "m105-02": [{ id: "a", label: "x+3" }, { id: "b", label: "3x" }, { id: "c", label: "x-3" }],
  "m105-03": [{ id: "a", label: "2x+8" }, { id: "b", label: "x+4" }, { id: "c", label: "4x+2" }],
};

function toProblem(item: (typeof blueprint)[number]["families"][number]["items"][number], unitId: string, familyId: string, skillId: string, reasoning: "basic" | "variation"): ProblemInstance {
  const options = choiceDrafts[item.id];
  const input = options ? "choice" : item.answer.value.includes("/") ? "fraction" : "integer";
  const expected = options
    ? options.find((option) => option.label === item.answer.value)?.id
    : item.answer.value;
  if (!expected) throw new Error(`M1 draft answer mapping missing: ${item.id}`);
  const answerRule = input === "choice"
    ? { kind: "choice" as const, expected }
    : input === "fraction"
      ? { kind: "fraction" as const, expected }
      : { kind: "integer" as const, expected };
  const answerDisplay = options?.find((option) => option.id === expected)?.label ?? expected;
  return problemSchema.parse({
    id: `p-${unitId.toLowerCase()}-${item.id}`,
    unitId,
    skillId,
    familyId,
    reasoning,
    difficulty: "D1",
    input,
    prompt: item.prompt,
    ...(options ? { choices: options } : {}),
    answerRule,
    answerDisplay,
    explanation: `${item.rationale} 정답은 ${answerDisplay}입니다.`,
    steps: [item.rationale, `정답은 ${answerDisplay}입니다.`],
    misconceptions: [item.misconceptionHypothesis],
    status: "draft",
    version: "0.1.0-draft",
    provenance: { author: "Math 90 Research & Content draft", license: "project-original", source: "자체 제작 초안; docs/research/NEXT_BATCH/research-report.md", aiGenerated: true },
    reviewHistory: [],
    purpose: "practice",
  });
}

const firstBatchFamilies = blueprint.flatMap((unit) =>
  unit.families.map((family) => ({ id: family.id, title: family.title, strategy: family.reasoningStructure })),
);

const firstBatchProblems: ProblemInstance[] = blueprint.flatMap((unit) =>
  unit.families.flatMap((family, familyIndex) =>
    family.items.map((item) => toProblem(
      item,
      unit.unitId,
      family.id,
      `${unit.unitId.toLowerCase()}-c${familyIndex + 1}`,
      familyIndex === 0 ? "basic" : "variation",
    )),
  ),
);

const algebraFamilies = algebraBlueprint.flatMap((unit) =>
  unit.families.map((family) => ({
    id: family.id,
    title: family.title,
    strategy: family.reasoningStructure,
  })),
);

function algebraItemToProblem(
  item: (typeof algebraBlueprint)[number]["families"][number]["items"][number],
  unit: (typeof algebraBlueprint)[number],
  family: (typeof algebraBlueprint)[number]["families"][number],
  familyIndex: number,
): ProblemInstance {
  const choices = "choices" in item && item.choices
    ? Object.entries(item.choices).map(([id, label]) => ({ id, label }))
    : undefined;
  const input = item.inputType;
  const expected = item.answer.value;
  const answerRule = input === "choice"
    ? { kind: "choice" as const, expected }
    : input === "fraction"
      ? { kind: "fraction" as const, expected: expected.includes("/") ? expected : `${expected}/1` }
      : { kind: "integer" as const, expected };
  const answerDisplay = choices?.find((choice) => choice.id === expected)?.label ?? item.answer.value;
  const unitMeta = curriculumProposal.curriculum.units.find((candidate) => candidate.id === unit.unitId)!;
  const skillIndex = Math.max(0, unitMeta.concepts.findIndex((concept) => "skillLabel" in item && concept.label === item.skillLabel));
  return problemSchema.parse({
    id: `p-${unit.unitId.toLowerCase()}-${item.id}`,
    unitId: unit.unitId,
    skillId: unitMeta.concepts[skillIndex % unitMeta.concepts.length].id,
    familyId: family.id,
    reasoning: familyIndex === 0 ? "basic" : "variation",
    difficulty: item.difficulty,
    input,
    prompt: item.prompt,
    ...(choices ? { choices } : {}),
    answerRule,
    answerDisplay,
    explanation: `${item.rationale} 정답은 ${answerDisplay}입니다.`,
    steps: [item.rationale, `정답은 ${answerDisplay}입니다.`],
    misconceptions: ["misconceptionHypothesis" in item ? item.misconceptionHypothesis : "조건과 계산을 다시 확인한다."],
    status: "draft",
    version: unit.contentVersion,
    provenance: { author: "Math 90 Research & Content draft", license: "project-original", source: "자체 제작 초안; docs/research/NEXT_BATCH/M1-06-10-research-report.md", aiGenerated: true },
    reviewHistory: [],
    purpose: "practice",
  });
}

const algebraProblems: ProblemInstance[] = algebraBlueprint.flatMap((unit) =>
  unit.families.flatMap((family, familyIndex) =>
    family.items.map((item) => algebraItemToProblem(item, unit, family, familyIndex)),
  ),
);

const assessmentProblems: ProblemInstance[] = assessmentBlueprint.flatMap((unit) => {
  const unitMeta = curriculumProposal.curriculum.units.find((candidate) => candidate.id === unit.unitId)!;
  const practiceFamilies = blueprint
    .find((candidate) => candidate.unitId === unit.unitId)!
    .families;
  return unit.items.map((item, index) => {
    const family = practiceFamilies[index % practiceFamilies.length];
    const choices = item.choices
      ? Object.entries(item.choices).map(([id, label]) => ({ id, label }))
      : undefined;
    const expected = item.answer.value;
    const input = item.inputType;
    const answerRule = input === "choice"
      ? { kind: "choice" as const, expected }
      : input === "fraction"
        ? { kind: "fraction" as const, expected: expected.includes("/") ? expected : `${expected}/1` }
        : { kind: "integer" as const, expected };
    const answerDisplay = choices?.find((choice) => choice.id === expected)?.label ?? item.answer.value;
    const exactConcept = unitMeta.concepts.find((concept) => concept.label === item.skillLabel);
    const skill = exactConcept ?? unitMeta.concepts[index % unitMeta.concepts.length];
    return problemSchema.parse({
      id: `a-${unit.unitId.toLowerCase()}-${item.id}`,
      unitId: unit.unitId,
      skillId: skill.id,
      familyId: family.id,
      reasoning: index === 2 ? "variation" : "basic",
      difficulty: item.difficulty,
      input,
      prompt: item.prompt,
      ...(choices ? { choices } : {}),
      answerRule,
      answerDisplay,
      explanation: `${item.rationale} 정답은 ${answerDisplay}입니다.`,
      steps: [item.rationale, `정답은 ${answerDisplay}입니다.`],
      misconceptions: [`${item.skillLabel}의 조건을 다시 확인한다.`],
      status: "draft",
      version: unit.contentVersion,
      provenance: { author: "Math 90 Research & Content draft", license: "project-original", source: "자체 제작 평가 초안; docs/research/NEXT_BATCH/M1-assessment-blueprint.json", aiGenerated: true },
      reviewHistory: [],
      purpose: "assessment",
    });
  });
});

export const proposalProblemFamilies = [...firstBatchFamilies, ...algebraFamilies];
export const proposalProblems: ProblemInstance[] = [...firstBatchProblems, ...algebraProblems];
export const proposalAssessmentProblems: ProblemInstance[] = assessmentProblems;
