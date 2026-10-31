import type { Unit } from "@/contracts";
import type { CurriculumProposal } from "@/contracts/curriculum-proposal";
import { curriculum } from "./curriculum";
import seeds from "./proposals/units.json";

const checkedAt = "2026-10-31T17:34:13.000Z";
const proposedUnits: Unit[] = seeds.map((seed, index) => {
  const level = Number(seed.id[1]);
  return {
    id: seed.id,
    level,
    order: 13 + index,
    title: seed.title,
    status: "draft",
    version: "0.1.0-proposed",
    concepts: seed.concepts.map((label, i) => ({
      id: `${seed.id.toLowerCase()}-c${i + 1}`,
      label,
    })),
    objectives: [
      `${seed.concepts[0]}: 뜻과 성립 조건을 설명하고 예를 구분한다`,
      `${seed.concepts[1]}: 풀이 단계를 쓰고 결과를 검산한다`,
    ],
    // New unit references resolve to both explicitly named concepts. Existing
    // units retain their concept IDs, so no old learning records are relabelled.
    prerequisites: seed.prerequisiteUnits.flatMap((unitId) => {
      const existing = curriculum.units.find((unit) => unit.id === unitId);
      if (existing) return existing.concepts.map((concept) => concept.id);
      const prerequisite = seeds.find((candidate) => candidate.id === unitId);
      if (!prerequisite) throw new Error(`제안안 선수 단원 누락: ${unitId}`);
      return prerequisite.concepts.map(
        (_, i) => `${unitId.toLowerCase()}-c${i + 1}`,
      );
    }),
    visualization: [seed.visualization],
    problemTypes: [...seed.concepts],
    assessmentPlan:
      level === 8
        ? "독립 응답·풀이 근거·지연 재평가 계획. 모의평가 출처와 도구는 구현 시 별도 검수"
        : "선수 진단 → 기본·변형·응용 연습 → 분리 평가 → 오답 교정 → 지연 복습. 문항 수·기준은 콘텐츠 검수 시 확정",
    standards: [],
  };
});

export const curriculumProposal: CurriculumProposal = {
  id: "math90-course-proposal",
  version: "0.1.0",
  status: "proposed",
  baseVersion: "0.2.0-level-zero-draft",
  createdAt: checkedAt,
  levels: [
    { level: 0, title: "수학의 언어 익히기", count: 12, role: "foundation" },
    { level: 1, title: "수와 식·도형의 기초", count: 20, role: "foundation" },
    {
      level: 2,
      title: "방정식·함수·도형의 연결",
      count: 20,
      role: "foundation",
    },
    { level: 3, title: "공통수학1의 기반", count: 22, role: "foundation" },
    { level: 4, title: "공통수학2의 기반", count: 20, role: "foundation" },
    { level: 5, title: "대수", count: 24, role: "target" },
    { level: 6, title: "미적분Ⅰ", count: 24, role: "target" },
    { level: 7, title: "확률과 통계", count: 20, role: "target" },
    {
      level: 8,
      title: "통합 문제해결과 독립 평가",
      count: 8,
      role: "integration",
    },
  ],
  sources: [
    {
      title: "교육부 · 2028 대학입시제도 개편 확정안 (2023-12-27)",
      url: "https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=294&boardSeq=97551&lev=0",
      checkedAt,
      purpose:
        "수능 과목 범위 확인. 프로젝트의 170단원 구성·ID·성취기준 매핑을 승인하는 자료는 아님",
    },
    {
      title: "교육부 · 2028학년도 수능 예시문항 안내 (2025-04-15)",
      url: "https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=294&boardSeq=103113&lev=0&m=020402&opType=N&s=moe&statusYN=W",
      checkedAt,
      purpose:
        "추후 평가 설계의 참고 경로. 문항을 복제하거나 독립 모의평가로 제공하지 않음",
    },
    {
      title: "한국과학창의재단 · 고등학교 수학 용어 안내자료 개발 (2025-12)",
      url: "https://cdn.kosac.re.kr/files/cms/attach/202601/4cfcbd23d3b144bb93df4a1b5f15abc5_1769567020530.pdf",
      checkedAt,
      purpose:
        "2022 개정 수학 용어 점검, 표본비율·모비율 포함 확인. 단원별 공식 성취기준 매핑은 별도 검증 필요",
    },
  ],
  curriculum: {
    version: "0.1.0-proposed",
    coverage: "partial",
    targetCount: 170,
    canonicalManifest: [],
    registeredManifest: [
      ...curriculum.registeredManifest,
      ...proposedUnits.map((unit) => unit.id),
    ],
    units: [...curriculum.units, ...proposedUnits],
  },
};
