import {
  foundationUnits,
  foundationConcepts,
  foundationPrerequisites,
} from "./level-zero-units";
import type { Curriculum, Unit } from "@/contracts";
const titles = [
  "자연수와 자리값",
  "자연수의 덧셈과 뺄셈",
  "자연수의 곱셈",
  "자연수의 나눗셈",
  "혼합 계산과 괄호",
  "약수와 배수",
  "분수의 의미",
  "분수의 계산",
  "소수의 의미와 계산",
  "비와 비율",
  "음수와 수직선",
  "기초 학습 종합 점검",
];
export const curriculum: Curriculum = {
  version: "0.2.0-level-zero-draft",
  coverage: "partial",
  targetCount: 170,
  canonicalManifest: [],
  registeredManifest: [
    "M0-01",
    "M0-02",
    "M0-03",
    "M0-04",
    "M0-05",
    "M0-06",
    "M0-07",
    "M0-08",
    "M0-09",
    "M0-10",
    "M0-11",
    "M0-12",
  ],
  units: titles.map((title, i): Unit => ({
    id: `M0-${String(i + 1).padStart(2, "0")}`,
    level: 0,
    order: i + 1,
    title,
    status: "published",
    version: "1.0.0",
    objectives:
      i === 0
        ? [
            "숫자와 자릿값을 구분한다",
            "0이 있는 수를 읽고 분해한다",
            "조건에 맞는 자연수를 구성한다",
          ]
        : foundationUnits[i - 1].objectives,
    concepts:
      i === 0
        ? [
            { id: "place", label: "자리와 자릿값" },
            { id: "compose", label: "수의 분해와 합성" },
            { id: "infer", label: "조건으로 수 찾기" },
          ]
        : foundationConcepts(i + 1, foundationUnits[i - 1].concepts),
    prerequisites: i === 0 ? [] : foundationPrerequisites[i + 1],
    visualization:
      i === 0
        ? ["십진 자리표와 묶음 조작"]
        : [foundationUnits[i - 1].lab.interaction],
    problemTypes:
      i === 0
        ? ["자릿값 식별", "분해·합성", "조건 역추론"]
        : foundationUnits[i - 1].concepts,
    assessmentPlan:
      i === 0
        ? "선수 진단 + 연습 3원형 + 독립 형성평가 3문항, 80% 이상"
        : "선수 자기 점검 + 연습 3원형 + 분리된 형성평가 3문항, 80% 이상",
    standards: [],
  })),
};
