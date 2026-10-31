// Import only through modules/question-bank/server.ts in application code.
import type {
  ProblemFamily,
  ProblemInstance,
  ProblemTemplate,
} from "@/contracts";
export const families: ProblemFamily[] = [
  { id: "identify", title: "자릿값 식별", strategy: "자리 단위를 곱하기" },
  { id: "compose", title: "분해·합성", strategy: "각 자리의 값을 더하기" },
  {
    id: "infer",
    title: "조건 역추론",
    strategy: "조건에 맞춰 자리를 배치하기",
  },
];
const common = {
  unitId: "M0-01",
  version: "1.0.0",
  status: "reviewed" as const,
  provenance: {
    author: "Math 90 프로젝트",
    license: "project-original",
    source: "M0-01 초기 편집본",
    aiGenerated: true,
  },
  reviewHistory: [
    {
      version: "1.0.0",
      reviewer: "Math 90 자동 정합성 검사 (관리자 승인 아님)",
      at: "2026-10-31T00:00:00.000Z",
      decision: "reviewed" as const,
      actorType: "automated" as const,
      mathChecked: true,
    },
  ],
};
export const fixedProblems: ProblemInstance[] = [
  {
    ...common,
    id: "p-place-1",
    skillId: "place",
    familyId: "identify",
    reasoning: "basic",
    difficulty: "D1",
    input: "choice",
    prompt: "3,582에서 숫자 5가 나타내는 값은 얼마인가요?",
    choices: [
      { id: "a", label: "5" },
      { id: "b", label: "50" },
      { id: "c", label: "500" },
      { id: "d", label: "5,000" },
    ],
    answerRule: { kind: "choice", expected: "c" },
    answerDisplay: "500",
    explanation: "5는 백의 자리에 있으므로 5 × 100 = 500입니다.",
    steps: ["오른쪽에서 세 번째가 백의 자리입니다.", "5 × 100 = 500입니다."],
    misconceptions: ["숫자 5와 자릿값 500은 달라요."],
    purpose: "practice",
  },
  {
    ...common,
    id: "p-compose-1",
    skillId: "compose",
    familyId: "compose",
    reasoning: "variation",
    difficulty: "D2",
    input: "integer",
    prompt: "4,000 + 60 + 8을 하나의 자연수로 쓰세요.",
    answerRule: { kind: "integer", expected: "4068" },
    answerDisplay: "4068",
    explanation: "백의 자리는 0으로 채웁니다. 4,000 + 60 + 8 = 4068입니다.",
    steps: [
      "천의 자리는 4, 백의 자리는 0입니다.",
      "십의 자리는 6, 일의 자리는 8이므로 4068입니다.",
    ],
    misconceptions: [
      "없는 자리를 지우면 다른 수가 됩니다. 백의 자리 0을 남겨 두세요.",
    ],
    purpose: "practice",
  },
  {
    ...common,
    id: "p-infer-1",
    skillId: "infer",
    familyId: "infer",
    reasoning: "application",
    difficulty: "D3",
    input: "integer",
    prompt:
      "네 자리 자연수입니다. 천의 자리 2, 백의 자리 0, 십의 자리는 일의 자리 3의 두 배입니다. 이 수는 무엇인가요?",
    answerRule: { kind: "integer", expected: "2063" },
    answerDisplay: "2063",
    explanation:
      "십의 자리 숫자는 3 × 2 = 6입니다. 천·백·십·일 순서로 쓰면 2063입니다.",
    steps: [
      "일의 자리 3에서 십의 자리 6을 구합니다.",
      "2, 0, 6, 3을 순서대로 놓으면 2063입니다.",
    ],
    misconceptions: ["십의 자리 숫자 6의 자릿값은 60입니다."],
    purpose: "practice",
  },
  {
    ...common,
    id: "a-place-1",
    skillId: "place",
    familyId: "identify",
    reasoning: "basic",
    difficulty: "D1",
    input: "integer",
    prompt: "7,294에서 숫자 2가 나타내는 값을 쓰세요.",
    answerRule: { kind: "integer", expected: "200" },
    answerDisplay: "200",
    explanation: "2는 백의 자리에 있습니다. 2 × 100 = 200입니다.",
    steps: ["백의 자리 숫자는 2입니다.", "2 × 100 = 200입니다."],
    misconceptions: ["자리 이름과 그 자리 숫자를 함께 확인하세요."],
    purpose: "assessment",
  },
  {
    ...common,
    id: "a-compose-1",
    skillId: "compose",
    familyId: "compose",
    reasoning: "variation",
    difficulty: "D2",
    input: "integer",
    prompt: "6,000 + 500 + 9를 하나의 자연수로 쓰세요.",
    answerRule: { kind: "integer", expected: "6509" },
    answerDisplay: "6509",
    explanation: "십의 자리를 0으로 채웁니다. 합성한 자연수는 6509입니다.",
    steps: ["천 6, 백 5, 십 0, 일 9입니다.", "순서대로 쓰면 6509입니다."],
    misconceptions: ["십 묶음이 없으면 십의 자리에 0을 씁니다."],
    purpose: "assessment",
  },
  {
    ...common,
    id: "a-infer-1",
    skillId: "infer",
    familyId: "infer",
    reasoning: "application",
    difficulty: "D3",
    input: "integer",
    prompt:
      "천의 자리 3, 백의 자리 0, 일의 자리 4인 네 자리 자연수입니다. 십의 자리 숫자는 일의 자리 숫자보다 2 큽니다. 이 수를 쓰세요.",
    answerRule: { kind: "integer", expected: "3064" },
    answerDisplay: "3064",
    explanation: "십의 자리 숫자는 4 + 2 = 6입니다. 따라서 3064입니다.",
    steps: [
      "십의 자리 숫자를 계산하면 6입니다.",
      "3, 0, 6, 4 순서로 쓰면 3064입니다.",
    ],
    misconceptions: ["숫자의 크기 조건을 먼저 계산하고 자리표에 배치하세요."],
    purpose: "assessment",
  },
];
export const placeTemplate: ProblemTemplate = {
  id: "t-place",
  familyId: "identify",
  version: "1.0.0",
  constraints: { min: 1000, max: 9999, places: [1, 10, 100, 1000] },
};
export function generatePlace(number: number, place: number): ProblemInstance {
  if (
    !Number.isInteger(number) ||
    number < 1000 ||
    number > 9999 ||
    !placeTemplate.constraints.places.includes(place)
  )
    throw new Error("템플릿 매개변수 범위 오류");
  const digit = Math.floor(number / place) % 10;
  if (digit === 0) throw new Error("목표 숫자는 0이 아니어야 함");
  const value = String(digit * place);
  const label = (
    { 1: "일", 10: "십", 100: "백", 1000: "천" } as Record<number, string>
  )[place];
  return {
    ...common,
    id: `g-place-${number}-${place}`,
    templateId: placeTemplate.id,
    skillId: "place",
    familyId: "identify",
    reasoning: "basic",
    difficulty: "D1",
    input: "integer",
    prompt: `${number.toLocaleString("en-US")}의 ${label}의 자리 숫자가 나타내는 값을 쓰세요.`,
    answerRule: { kind: "integer", expected: value },
    answerDisplay: value,
    explanation: `${label}의 자리 숫자는 ${digit}입니다. ${digit} × ${place} = ${value}입니다.`,
    steps: [
      `${label}의 자리를 찾습니다.`,
      `${digit} × ${place} = ${value}입니다.`,
    ],
    misconceptions: ["숫자에 자리의 단위를 곱해 주세요."],
    purpose: "practice",
    provenance: {
      ...common.provenance,
      source: `승인 템플릿 ${placeTemplate.id}@1.0.0; number=${number}; place=${place}`,
    },
  };
}
