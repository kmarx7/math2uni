import type { Block, ContentDocument, Unit } from "@/contracts";
type Lab = Extract<Block, { type: "InteractiveBlock" }>;
export type FoundationUnit = {
  number: number;
  objectives: [string, string, string];
  concepts: [string, string, string];
  prerequisiteText: string;
  explanation: string;
  exampleTitle: string;
  steps: string[];
  hint: string;
  correction: string;
  lab: Pick<Lab, "interaction" | "settings">;
};
export const foundationUnits: FoundationUnit[] = [
  {
    number: 2,
    objectives: [
      "같은 자리끼리 더하고 뺀다",
      "받아올림과 받아내림을 설명한다",
      "덧셈과 뺄셈의 관계로 빈 수를 찾는다",
    ],
    concepts: ["자리 맞춤 계산", "받아올림과 받아내림", "덧셈·뺄셈의 역관계"],
    prerequisiteText:
      "십의 자리 1은 일의 자리 10과 같아요. 47은 40과 7로 분해할 수 있나요?",
    explanation:
      "덧셈과 뺄셈은 같은 자리끼리 계산합니다. 일의 자리의 합이 10 이상이면 십 묶음을 만들어요. 뺄 수 없을 때는 윗자리의 묶음 1개를 낱개 10개로 바꿉니다. a + b = c이면 c − a = b입니다. 자연수 범위의 뺄셈은 빼는 수가 더 크지 않은 경우부터 연습해요.",
    exampleTitle: "52 − 27을 묶음으로 계산하기",
    steps: [
      "52를 십 묶음 5개와 낱개 2개로 봅니다.",
      "십 묶음 하나를 풀면 십 묶음 4개와 낱개 12개입니다.",
      "낱개 12 − 7 = 5, 십 묶음 4 − 2 = 2입니다.",
      "따라서 52 − 27 = 25입니다. 25 + 27 = 52로 검산합니다.",
    ],
    hint: "십 묶음을 풀면 낱개 10개가 됩니다. 계산 뒤에는 반대 연산으로 검산해 보세요.",
    correction:
      "52 − 27에서 7 − 2를 계산하면 안 돼요. 위아래 숫자를 바꾸지 말고 윗자리에서 한 묶음을 풀어 보세요.",
    lab: {
      interaction: "arithmetic",
      settings: { operation: "add", initialA: 14, initialB: 8 },
    },
  },
  {
    number: 3,
    objectives: [
      "같은 수의 반복 덧셈을 곱셈으로 나타낸다",
      "분배법칙으로 곱셈을 나누어 계산한다",
      "묶음 수의 변화를 반영해 전체 양을 구한다",
    ],
    concepts: ["같은 크기의 묶음", "분배법칙", "여러 단계 묶음 해석"],
    prerequisiteText:
      "4 + 4 + 4를 계산할 수 있나요? 합이 같은 항이 반복되는지 살펴보세요.",
    explanation:
      "곱셈은 같은 크기의 묶음이 여러 개 있을 때 전체 수를 구하는 연산입니다. 4개씩 3묶음은 4 × 3 = 12예요. (10 + 2) × 3 = 10 × 3 + 2 × 3처럼 수를 나누어 계산할 수 있습니다. 교환법칙에 따라 a × b = b × a이지만 상황에서 각 수가 뜻하는 것은 구분해요.",
    exampleTitle: "13 × 4를 두 부분으로 나누기",
    steps: [
      "13을 10과 3으로 나눕니다.",
      "10개씩 4묶음은 10 × 4 = 40입니다.",
      "3개씩 4묶음은 3 × 4 = 12입니다.",
      "두 부분을 더하면 40 + 12 = 52이므로 13 × 4 = 52입니다.",
    ],
    hint: "한 묶음의 수와 묶음의 개수를 따로 적고, 큰 수는 십과 일로 나눠 보세요.",
    correction:
      "3개씩 4묶음을 3 + 4로 계산하지 않아요. 3을 네 번 더한 수와 비교해 보세요.",
    lab: {
      interaction: "arithmetic",
      settings: { operation: "multiply", initialA: 3, initialB: 4 },
    },
  },
  {
    number: 4,
    objectives: [
      "등분과 포함 상황을 나눗셈으로 표현한다",
      "몫과 나머지의 조건을 확인한다",
      "곱셈으로 나눗셈을 검산한다",
    ],
    concepts: ["나누는 수와 몫", "몫과 나머지", "나눈 뒤의 변화"],
    prerequisiteText: "6 × 4 = 24에서 24를 6개씩 묶으면 몇 묶음일까요?",
    explanation:
      "나눗셈은 전체를 같은 크기로 나누거나 같은 수씩 묶는 연산입니다. 23 ÷ 5의 몫은 4, 나머지는 3이며 23 = 5 × 4 + 3입니다. 나머지는 0 이상이고 나누는 수보다 작아야 합니다. 0으로 나누는 연산은 정의하지 않아요.",
    exampleTitle: "29개를 6개씩 묶기",
    steps: [
      "6 × 4 = 24, 6 × 5 = 30을 비교합니다.",
      "29를 넘지 않는 가장 큰 묶음 수는 4입니다.",
      "29 − 24 = 5이므로 나머지는 5입니다.",
      "29 = 6 × 4 + 5이고 5 < 6이므로 몫 4, 나머지 5가 맞습니다.",
    ],
    hint: "전체 = 나누는 수 × 몫 + 나머지인지, 나머지가 나누는 수보다 작은지 확인하세요.",
    correction:
      "23 ÷ 5를 몫 3, 나머지 8로 끝내지 않아요. 나머지에서 5개짜리 묶음을 하나 더 만들 수 있어요.",
    lab: {
      interaction: "arithmetic",
      settings: { operation: "divide", initialA: 23, initialB: 5 },
    },
  },
  {
    number: 5,
    objectives: [
      "괄호와 곱셈·나눗셈의 계산 순서를 적용한다",
      "같은 우선순위의 연산은 왼쪽부터 계산한다",
      "괄호가 식의 뜻을 바꾸는 이유를 설명한다",
    ],
    concepts: ["계산 순서", "괄호의 역할", "식을 단계로 해석"],
    prerequisiteText:
      "덧셈·뺄셈·곱셈·나눗셈을 각각 계산할 수 있나요? 한 식에서 어느 부분부터 묶을지도 생각해요.",
    explanation:
      "괄호 안을 먼저, 그다음 곱셈·나눗셈, 마지막으로 덧셈·뺄셈을 계산합니다. 곱셈과 나눗셈은 같은 우선순위이므로 왼쪽부터 계산해요. 12 ÷ 3 × 2는 4 × 2 = 8이며 12 ÷ (3 × 2)와 다릅니다.",
    exampleTitle: "18 − 2 × (3 + 4) 계산하기",
    steps: [
      "괄호 안 3 + 4 = 7을 먼저 계산합니다.",
      "식을 18 − 2 × 7로 다시 씁니다.",
      "곱셈 2 × 7 = 14를 계산합니다.",
      "마지막으로 18 − 14 = 4입니다.",
    ],
    hint: "지금 먼저 계산할 부분에 밑줄을 긋고, 한 번에 한 연산만 바꿔 적어 보세요.",
    correction:
      "앞에서부터 무조건 계산하지 않아요. 2 + 3 × 4에서 2 + 3을 먼저 계산하면 원래 식의 뜻이 달라집니다.",
    lab: {
      interaction: "arithmetic",
      settings: { operation: "mixed", initialA: 2, initialB: 3, initialC: 4 },
    },
  },
  {
    number: 6,
    objectives: [
      "나머지 0을 이용해 약수를 찾는다",
      "공통인 약수 중 가장 큰 수를 찾는다",
      "공통인 배수 중 가장 작은 양수를 찾는다",
    ],
    concepts: ["약수와 배수", "최대공약수", "최소공배수"],
    prerequisiteText:
      "나머지가 0인 나눗셈을 찾을 수 있나요? 12 ÷ 3 = 4와 12 ÷ 5를 비교해요.",
    explanation:
      "자연수 a를 b로 나누어 나머지가 0이면 b는 a의 약수이고 a는 b의 배수입니다. 두 수의 공통 약수 중 가장 큰 수가 최대공약수예요. 두 수의 공통인 양의 배수 중 가장 작은 수가 최소공배수입니다. 약수는 한정되지만 배수는 끝없이 이어집니다.",
    exampleTitle: "8과 12의 공통 약수와 배수 찾기",
    steps: [
      "8의 약수는 1, 2, 4, 8입니다.",
      "12의 약수는 1, 2, 3, 4, 6, 12입니다. 공통 약수 중 가장 큰 수는 4입니다.",
      "8의 양의 배수는 8, 16, 24, …이고 12의 양의 배수는 12, 24, …입니다.",
      "따라서 최대공약수는 4, 최소공배수는 24입니다.",
    ],
    hint: "똑같이 나누어 담는 문제는 공약수, 주기가 다시 만나는 문제는 공배수와 연결해 보세요.",
    correction:
      "최소공배수를 항상 두 수의 곱이라고 생각하지 않아요. 공통 약수가 있으면 더 작은 공배수가 있을 수 있어요.",
    lab: {
      interaction: "arithmetic",
      settings: { operation: "factors", initialA: 12, initialB: 3 },
    },
  },
  {
    number: 7,
    objectives: [
      "전체를 같은 크기로 나눈 분수의 뜻을 설명한다",
      "분자와 분모에 같은 수를 곱해 동치분수를 만든다",
      "부분의 양으로 전체의 양을 구한다",
    ],
    concepts: ["분수의 의미", "동치분수", "부분과 전체"],
    prerequisiteText:
      "같은 크기로 나눈 조각과 크기가 다른 조각을 구분할 수 있나요? 분수는 같은 크기로 나눈 조각을 기준으로 해요.",
    explanation:
      "분모는 전체를 같은 크기로 나눈 조각의 수, 분자는 그중 선택한 조각의 수입니다. 분모는 0일 수 없어요. 분자와 분모에 같은 0이 아닌 수를 곱하거나 나누어도 분수의 값은 같습니다. 1/2 = 2/4입니다. 전체의 2/3이 10개라면 1/3은 5개, 전체는 15개입니다.",
    exampleTitle: "전체의 3/4이 18개일 때 전체 찾기",
    steps: [
      "3/4은 같은 크기의 1/4이 3개 모인 양입니다.",
      "18 ÷ 3 = 6이므로 전체의 1/4은 6개입니다.",
      "전체는 1/4이 4개이므로 6 × 4 = 24개입니다.",
      "24 × 3/4 = 18로 확인합니다.",
    ],
    hint: "먼저 분모 한 조각이 얼마인지 구해 보세요. 동치분수는 분자와 분모를 같은 배수로 바꿔요.",
    correction:
      "분모만 바꾸면 분수의 값이 바뀝니다. 또 크기가 다른 조각 3개를 셌다고 무조건 3/4이 되지는 않아요.",
    lab: { interaction: "fraction", settings: { initialA: 3, initialB: 4 } },
  },
  {
    number: 8,
    objectives: [
      "분모가 같은 분수를 더하고 뺀다",
      "통분 후 분모가 다른 분수를 더한다",
      "분수의 곱셈과 나눗셈을 구분한다",
    ],
    concepts: ["같은 분모의 계산", "통분과 약분", "분수의 곱셈·나눗셈"],
    prerequisiteText: "1/2 = 2/4인 이유와 12, 18의 공통 배수를 떠올려 보세요.",
    explanation:
      "같은 분모의 덧셈은 같은 크기의 조각 수를 더합니다. 분모가 다르면 공통 분모로 통분한 뒤 계산해요. 곱셈은 분자끼리, 분모끼리 곱하고 약분합니다. 0이 아닌 분수로 나눌 때는 그 분수의 역수를 곱합니다. 0으로 나누거나 분모에 0을 쓸 수는 없습니다.",
    exampleTitle: "1/3 + 1/4를 같은 조각으로 바꾸기",
    steps: [
      "3과 4의 공통 분모로 12를 선택합니다.",
      "1/3 = 4/12, 1/4 = 3/12로 통분합니다.",
      "같은 크기의 조각 수를 더해 4/12 + 3/12 = 7/12입니다.",
      "분모를 3 + 4로 더한 2/7은 올바른 합이 아닙니다.",
    ],
    hint: "덧셈에는 같은 크기의 조각이 필요해요. 나눗셈은 나누는 분수의 역수를 곱하는지 확인하세요.",
    correction:
      "분수를 더할 때 분모끼리 더하지 않아요. 분수로 나눌 때는 나누어지는 분수가 아니라 나누는 분수를 뒤집습니다.",
    lab: {
      interaction: "fraction-sum",
      settings: { initialA: 1, initialB: 4, initialC: 2 },
    },
  },
  {
    number: 9,
    objectives: [
      "소수점을 맞춰 소수를 더하고 뺀다",
      "소수의 곱에서 자릿수를 확인한다",
      "단위가 있는 소수 나눗셈을 해석한다",
    ],
    concepts: ["소수의 덧셈·뺄셈", "소수의 곱셈", "소수의 나눗셈"],
    prerequisiteText: "0.4 = 4/10, 0.25 = 25/100임을 설명할 수 있나요?",
    explanation:
      "소수의 덧셈·뺄셈은 소수점을 맞춰 같은 자릿값끼리 계산합니다. 소수의 곱셈은 자연수처럼 계산한 뒤 소수 자릿수를 합해 소수점을 정해요. 나눗셈은 나누는 수와 나누어지는 수에 같은 10의 거듭제곱을 곱해 값을 유지하며 계산할 수 있습니다.",
    exampleTitle: "0.8 × 0.3의 크기 확인하기",
    steps: [
      "8 × 3 = 24를 먼저 계산합니다.",
      "두 수의 소수 자릿수는 각각 1자리이므로 곱은 소수 두 자리를 씁니다.",
      "따라서 0.8 × 0.3 = 0.24입니다.",
      "0.8의 3/10을 구했으므로 결과는 0.8보다 작습니다.",
    ],
    hint: "계산 전에 결과의 대략적인 크기를 생각하고, 자릿값이나 분수로 바꾸어 확인해 보세요.",
    correction:
      "소수점을 지운 계산 결과를 그대로 쓰지 않아요. 0과 1 사이의 수를 곱하면 원래 양보다 작아질 수 있습니다.",
    lab: { interaction: "decimal", settings: { initialA: 12, initialB: 8 } },
  },
  {
    number: 10,
    objectives: [
      "기준량과 비교하는 양을 구분한다",
      "비율을 분수와 백분율로 바꾼다",
      "비율에서 전체나 할인 후 금액을 구한다",
    ],
    concepts: ["비율과 백분율", "기준량 역산", "비율의 적용"],
    prerequisiteText:
      "3/4을 소수 0.75로 바꿀 수 있나요? 1은 100%라는 뜻도 떠올려요.",
    explanation:
      "비율은 비교하는 양을 기준량으로 나눈 값입니다. 백분율은 비율에 100을 곱해 %로 나타내요. 3/5 = 0.6 = 60%입니다. 어떤 양의 20%를 구하려면 그 양에 20/100을 곱합니다. 20% 할인은 원래 가격의 80%를 지불한다는 뜻입니다.",
    exampleTitle: "18,000원 물건을 25% 할인하면?",
    steps: [
      "25% = 25/100 = 1/4입니다.",
      "할인 금액은 18,000 × 1/4 = 4,500원입니다.",
      "내는 금액은 18,000 − 4,500 = 13,500원입니다.",
      "또는 18,000 × 75/100 = 13,500원으로 검산합니다.",
    ],
    hint: "무엇을 100%로 보는지 먼저 정하세요. 할인 금액과 실제 지불 금액을 구분해요.",
    correction:
      "20% 할인의 20%를 곧바로 지불 금액으로 쓰지 않아요. 원래 가격에서 빠지는 부분이 20%입니다.",
    lab: { interaction: "ratio", settings: { initialA: 3, initialB: 5 } },
  },
  {
    number: 11,
    objectives: [
      "0을 기준으로 양수와 음수를 수직선에 놓는다",
      "음수의 크기를 비교한다",
      "수직선 이동을 덧셈·뺄셈으로 나타낸다",
    ],
    concepts: ["부호 있는 수의 이동", "음수의 크기 비교", "변화량 구하기"],
    prerequisiteText:
      "수직선에서 오른쪽으로 갈수록 수가 커진다는 사실과 0의 위치를 확인해요.",
    explanation:
      "0보다 작은 수를 음수라 하고 −1, −2처럼 나타냅니다. 수직선에서 오른쪽의 수가 더 큽니다. 따라서 −2 > −5입니다. 양수를 더하면 오른쪽으로, 양수를 빼면 왼쪽으로 이동해요. 출발점과 도착점의 차이는 도착점 − 출발점입니다.",
    exampleTitle: "영하 3도에서 7도 오르면?",
    steps: [
      "출발 온도 −3을 수직선에 표시합니다.",
      "7도 상승은 오른쪽으로 7만큼 이동하는 것입니다.",
      "−3에서 0까지 3, 0에서 4까지 4를 이동합니다.",
      "−3 + 7 = 4이므로 도착 온도는 영상 4도입니다.",
    ],
    hint: "부호를 떼고 비교하지 말고 수직선의 위치를 보세요. 변화량은 도착점에서 출발점을 빼요.",
    correction:
      "−8의 숫자 8이 크다고 −3보다 큰 수인 것은 아니에요. 수직선에서는 −8이 −3의 왼쪽에 있습니다.",
    lab: {
      interaction: "number-line",
      settings: { initialA: -3, initialB: 5 },
    },
  },
  {
    number: 12,
    objectives: [
      "계산 순서를 적용해 복합 식을 해결한다",
      "분수와 소수를 같은 수 표현으로 연결한다",
      "비율을 이용한 여러 단계 상황을 해결한다",
    ],
    concepts: ["복합 계산 점검", "분수·소수 연결", "여러 단계 비율 문제"],
    prerequisiteText:
      "앞 단원의 블록을 읽었다는 것과 혼자 풀 수 있다는 것은 달라요. 아직 낯선 계산은 해당 단원으로 돌아가 연습합니다.",
    explanation:
      "기초 학습의 마지막 점검에서는 계산 순서, 수의 여러 표현, 기준량을 함께 사용합니다. 한 단계의 답을 다음 단계의 입력으로 옮겨 적고, 최종 답이 문제에서 묻는 양인지 확인해요. 이 단원의 형성평가는 기초 개념 확인이며 수능 성적을 예측하는 모의평가가 아닙니다.",
    exampleTitle: "40문제 중 25%를 풀고 8문제를 더 풀었다면?",
    steps: [
      "전체 40문제를 기준량 100%로 봅니다.",
      "처음 푼 수는 40 × 25/100 = 10문제입니다.",
      "총 푼 수는 10 + 8 = 18문제입니다.",
      "남은 수는 40 − 18 = 22문제입니다. 전체 = 푼 수 + 남은 수로 확인해요.",
    ],
    hint: "한 번에 암산하지 말고 중간 결과와 단위를 적어 보세요. 분수와 소수 중 더 편한 표현을 선택해도 돼요.",
    correction:
      "중간에 구한 할인액·푼 문제 수를 최종 답으로 착각하지 않아요. 마지막에 묻는 양을 다시 읽어 보세요.",
    lab: {
      interaction: "arithmetic",
      settings: { operation: "mixed", initialA: 4, initialB: 2, initialC: 3 },
    },
  },
];
export function foundationConcepts(
  number: number,
  labels: string[],
): Unit["concepts"] {
  return labels.map((label, index) => ({
    id: index === 0 ? `m0-${number}-core` : `m0-${number}-skill-${index + 1}`,
    label,
  }));
}
export function foundationLesson(
  unit: Unit,
  definition: FoundationUnit,
): ContentDocument {
  return {
    unitId: unit.id,
    version: "1.0.0",
    blocks: [
      {
        id: "goals",
        type: "ConceptBlock",
        title: `오늘 도달할 목표 · ${unit.title}`,
        body: definition.objectives
          .map((goal, i) => `${i + 1}. ${goal}`)
          .join("\n"),
      },
      {
        id: "diagnostic",
        type: "ExplanationBlock",
        title: "선수 개념을 먼저 확인해요",
        readinessCheck: true,
        body: definition.prerequisiteText,
      },
      {
        id: "concept",
        type: "ExplanationBlock",
        title: "개념의 뜻과 계산의 이유",
        body: definition.explanation,
      },
      {
        id: "lab",
        type: "InteractiveBlock",
        title: "직접 조작하고 확인하는 수학 실험실",
        ...definition.lab,
      },
      {
        id: "example",
        type: "WorkedExampleBlock",
        title: `함께 풀기 · ${definition.exampleTitle}`,
        steps: definition.steps,
      },
      {
        id: "practice",
        type: "PracticeBlock",
        title: "세 가지 풀이 전략으로 혼자 연습해요",
        purpose: "practice",
        hint: definition.hint,
      },
      {
        id: "feedback",
        type: "FeedbackBlock",
        title: "자주 하는 실수를 교정해요",
        body: definition.correction,
      },
      {
        id: "assessment",
        type: "AssessmentBlock",
        title: "도움 없이 확인하는 형성평가",
        purpose: "assessment",
      },
      {
        id: "review",
        type: "ReviewBlock",
        title: "복습하고 다음 개념으로 이어가요",
        body: "틀린 문항은 오답노트에서 다시 풀 수 있어요. 학습한 문항은 하루 뒤 복습하고, 맞히면 3일·7일로 간격을 늘립니다. 블록 확인, 개념별 숙달도 80% 이상, 이 단원 형성평가 80점 이상을 모두 충족하면 완료입니다.",
      },
    ],
  };
}

// Prerequisite concepts are intentionally separate from the fixed display order.
export const foundationPrerequisites: Record<number, string[]> = {
  2: ["place", "compose"],
  3: ["m0-2-core", "place"],
  4: ["m0-3-core"],
  5: ["m0-2-core", "m0-3-core", "m0-4-core"],
  6: ["m0-4-core", "m0-4-skill-2"],
  7: ["m0-4-core", "m0-6-core"],
  8: ["m0-7-core", "m0-7-skill-2", "m0-6-skill-3"],
  9: ["place", "m0-7-core", "m0-8-core"],
  10: ["m0-7-skill-3", "m0-9-core", "m0-9-skill-2"],
  11: ["m0-2-core", "m0-2-skill-3"],
  12: ["m0-5-core", "m0-7-skill-2", "m0-9-core", "m0-10-core", "m0-11-core"],
};
