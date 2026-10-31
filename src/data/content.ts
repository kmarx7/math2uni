import type { ContentDocument } from "@/contracts";
export const lesson: ContentDocument = {
  unitId: "M0-01",
  version: "1.0.0",
  blocks: [
    {
      id: "goals",
      type: "ConceptBlock",
      title: "작은 숫자에서, 큰 수의 구조로",
      body: "오늘의 목표는 숫자가 놓인 자리에 따라 값이 어떻게 달라지는지 설명하는 것입니다. 자연수는 여기서 1, 2, 3, …으로 정의해요. 0을 자연수에 포함하는 관례도 있지만, 이번에는 자리를 채우는 숫자로 다룹니다.",
    },
    {
      id: "diagnostic",
      type: "ExplanationBlock",
      readinessCheck: true,
      title: "시작 전, 준비를 확인해요",
      body: "1부터 9까지 셀 수 있나요? 낱개 10개를 묶으면 십 묶음 1개가 됩니다. 낯설다면 아래 자리표에서 일의 자리와 십의 자리부터 움직여 보세요. 서두르지 않아도 괜찮아요.",
    },
    {
      id: "concept",
      type: "ExplanationBlock",
      title: "숫자는 같아도, 자릿값은 달라요",
      body: "3,042에서 3은 천의 자리에 있어 3,000을 나타냅니다. 4는 십의 자리에 있어 40을 나타내요. 백의 자리의 0은 백 묶음이 없다는 뜻입니다. 0을 빼서 342로 쓰면 다른 수가 됩니다.",
    },
    {
      id: "lab",
      type: "InteractiveBlock",
      title: "직접 움직이는 자리값 실험실",
      interaction: "place-value",
    },
    {
      id: "example",
      type: "WorkedExampleBlock",
      title: "함께 풀기 · 2,507을 분해해 볼까요?",
      steps: [
        "오른쪽부터 일, 십, 백, 천의 자리를 찾습니다.",
        "천의 자리 2 → 2,000, 백의 자리 5 → 500입니다.",
        "십의 자리 0 → 0, 일의 자리 7 → 7입니다.",
        "2,507 = 2,000 + 500 + 0 + 7입니다. 숫자 5의 자릿값은 500입니다.",
      ],
    },
    {
      id: "practice",
      type: "PracticeBlock",
      title: "이제 혼자 풀어봐요",
      purpose: "practice",
    },
    {
      id: "feedback",
      type: "FeedbackBlock",
      title: "실수를 다음 이해로 바꾸기",
      body: "틀린 문항은 오답노트에 남습니다. 숫자 자체와 자릿값을 혼동했다면 먼저 자리 이름을 말해 보고, 그 자리의 단위(1, 10, 100, 1,000)를 곱해 보세요. 해설을 읽고 다시 풀기는 독립 첫 정답과 구분해서 기록합니다.",
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
      title: "기억이 오래 남도록",
      body: "오늘 풀었던 문항은 다음 날 다시 확인해요. 복습에서 맞히면 3일, 7일로 간격을 늘립니다. 오답노트에서는 바로 다시 연습할 수도 있어요. 모든 블록 확인, 세 개념 숙달, 형성평가 80% 이상이면 이 단원 완료입니다. 다음 단원은 콘텐츠 검토 후 열립니다.",
    },
  ],
};
