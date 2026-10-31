import { describe, it, expect } from "vitest";
import { curriculum } from "@/data/curriculum";
import { lessons, getLesson } from "@/data/content";
import {
  foundationCases,
  foundationProblems,
  foundationFamilies,
} from "@/data/level-zero-problems";
import { fixedProblems, families } from "@/data/problems";
import { validateContent } from "@/modules/content";
import { validateBank } from "@/modules/question-bank/core";
import { gradeAnswer } from "@/modules/math-validation";
import { scoreProblem } from "@/modules/assessment";
import {
  applySubmission,
  completeLearningBlock,
} from "@/modules/progress/mutations";
import { emptyProgress } from "@/modules/progress/repository";
import { unitProgress, isComplete } from "@/modules/progress";
function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : Math.abs(a);
}
function f(a: number, b: number) {
  const g = gcd(a, b);
  return `${a / g}/${b / g}`;
}
function divisors(n: number) {
  return Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0)
    .length;
}
function lcm(a: number, b: number) {
  return (a * b) / gcd(a, b);
}
const expected: Record<number, { practice: string[]; assessment: string[] }> = {
  2: {
    practice: [34 + 25, 72 - 38, 65 - 27].map(String),
    assessment: [43 + 16, 81 - 46, 54 - 19].map(String),
  },
  3: {
    practice: [6 * 4, 12 * 3, 8 * (7 - 2)].map(String),
    assessment: [7 * 3, 14 * 3, 9 * (6 - 2)].map(String),
  },
  4: {
    practice: [24 / 6, 23 % 5, 32 / 4 + 2].map(String),
    assessment: [35 / 7, 34 % 6, 45 / 9 - 2].map(String),
  },
  5: {
    practice: [2 + 3 * 4, (2 + 3) * 4, 20 - (12 / 3) * 2].map(String),
    assessment: [5 + 2 * 6, (5 + 2) * 6, 30 - (18 / 3) * 2].map(String),
  },
  6: {
    practice: [divisors(8), gcd(12, 18), lcm(4, 6)].map(String),
    assessment: [divisors(10), gcd(16, 24), lcm(6, 9)].map(String),
  },
  7: {
    practice: [f(3, 8), String((2 * 12) / 3), String((12 / 3) * 5)],
    assessment: [f(4, 9), String((3 * 20) / 4), String((14 / 2) * 3)],
  },
  8: {
    practice: [f(1 + 3, 7), f(1 * 3 + 1 * 2, 2 * 3), f(3 * 5, 4 * 2)],
    assessment: [f(2 + 5, 9), f(2 * 4 + 1 * 3, 3 * 4), f(2 * 5, 3 * 4)],
  },
  9: {
    practice: [String((120 + 35) / 100), String((6 * 4) / 100), String(18 / 3)],
    assessment: [
      String((240 + 8) / 100),
      String((7 * 3) / 100),
      String(24 / 4),
    ],
  },
  10: {
    practice: [(3 / 5) * 100, 15 / (25 / 100), 15000 * (1 - 20 / 100)].map(
      String,
    ),
    assessment: [(4 / 8) * 100, 24 / (30 / 100), 24000 * (1 - 10 / 100)].map(
      String,
    ),
  },
  11: {
    practice: [-3 + 5, Math.min(-3, -7), 3 - -4].map(String),
    assessment: [-6 + 2, Math.min(-2, -9), -1 - -5].map(String),
  },
  12: {
    practice: [
      3 * (4 + 2) - 5,
      (75 + 50) / 100,
      80 - ((80 * 25) / 100 + 10),
    ].map(String),
    assessment: [
      4 * (5 + 1) - 7,
      (20 + 60) / 100,
      60 - ((60 * 30) / 100 + 12),
    ].map(String),
  },
};
describe("LEVEL 0 staged content", () => {
  it("models real prerequisite concepts separately from the unit order", () => {
    expect(
      curriculum.units.find((u) => u.id === "M0-08")?.prerequisites,
    ).toContain("m0-7-skill-2");
    expect(
      curriculum.units.find((u) => u.id === "M0-11")?.prerequisites,
    ).toContain("m0-2-core");
    expect(
      curriculum.units.find((u) => u.id === "M0-11")?.prerequisites,
    ).not.toContain("m0-10-core");
  });
  it("multi-step solutions explain the intermediate amount and the final operation", () => {
    const checks = [
      ["p-m0-03-3", `7 − 2 = ${7 - 2}`, `8 × ${7 - 2} = ${8 * (7 - 2)}`],
      ["a-m0-03-3", `6 − 2 = ${6 - 2}`, `9 × ${6 - 2} = ${9 * (6 - 2)}`],
      ["p-m0-04-3", `32 ÷ 4 = ${32 / 4}`, `${32 / 4} + 2 = ${32 / 4 + 2}`],
      ["a-m0-04-3", `45 ÷ 9 = ${45 / 9}`, `${45 / 9} − 2 = ${45 / 9 - 2}`],
    ];
    for (const [id, first, last] of checks) {
      const problem = foundationProblems.find((p) => p.id === id)!;
      expect(problem.steps.join(" ")).toContain(first);
      expect(problem.steps.join(" ")).toContain(last);
    }
  });
  it("covers all 12 registered units using one renderer and eight block kinds", () => {
    expect(lessons).toHaveLength(12);
    expect(new Set(lessons.map((doc) => doc.unitId)).size).toBe(12);
    for (const unit of curriculum.units) {
      const doc = getLesson(unit.id)!;
      expect(doc).toBeDefined();
      expect(validateContent(doc, curriculum.units)).toEqual([]);
      expect(doc.blocks).toHaveLength(9);
      expect(new Set(doc.blocks.map((b) => b.type)).size).toBe(8);
      expect(unit.concepts).toHaveLength(3);
    }
  });
  it("validates all 72 fixed questions and 33 strategy families without counting recap as new types", () => {
    const bank = [...fixedProblems, ...foundationProblems],
      allFamilies = [...families, ...foundationFamilies];
    expect(bank).toHaveLength(72);
    expect(allFamilies).toHaveLength(33);
    expect(validateBank(bank, curriculum.units, allFamilies)).toEqual([]);
    for (const unit of curriculum.units) {
      const items = bank.filter((p) => p.unitId === unit.id);
      expect(items.filter((p) => p.purpose === "practice")).toHaveLength(3);
      expect(items.filter((p) => p.purpose === "assessment")).toHaveLength(3);
      expect(new Set(items.map((p) => p.familyId)).size).toBe(3);
    }
  });
  it("independently recomputes answers for every newly authored fixed question", () => {
    for (const set of foundationCases)
      for (const purpose of ["practice", "assessment"] as const)
        set[purpose].forEach((item, index) => {
          const problem = foundationProblems.find(
            (p) =>
              p.unitId === `M0-${String(set.number).padStart(2, "0")}` &&
              p.purpose === purpose &&
              p.difficulty === `D${index + 1}`,
          )!;
          expect(item[1]).toBe(expected[set.number][purpose][index]);
          expect(
            gradeAnswer(
              problem.answerRule,
              expected[set.number][purpose][index],
            ).status,
          ).toBe("correct");
        });
  });
  it("keeps legacy progress while isolating block and assessment state by unit", () => {
    const original = {
      ...emptyProgress("124d3c71-9359-4cf2-b111-9ba5502df231"),
      completedBlocks: ["goals"],
      assessmentScore: 100,
    };
    let next = completeLearningBlock(original, "concept", "M0-02");
    expect(unitProgress(next, "M0-01")).toEqual({
      completedBlocks: ["goals"],
      assessmentScore: 100,
    });
    expect(unitProgress(next, "M0-02")).toEqual({
      completedBlocks: ["concept"],
      assessmentScore: null,
    });
    const problems = foundationProblems.filter(
      (p) => p.unitId === "M0-02" && p.purpose === "assessment",
    );
    next = applySubmission(next, {
      unitId: "M0-02",
      requestId: "assessment-unit-two",
      answers: Object.fromEntries(
        problems.map((p) => [p.id, p.answerRule.expected]),
      ),
      feedback: problems.map((p) => scoreProblem(p, p.answerRule.expected)),
      hintUsed: false,
      purpose: "assessment",
      score: 67,
      at: "2026-11-01T00:00:00.000Z",
    });
    expect(unitProgress(next, "M0-02").assessmentScore).toBe(67);
    expect(unitProgress(next, "M0-01").assessmentScore).toBe(100);
    expect(next.attempts.every((a) => a.unitId === "M0-02")).toBe(true);
    expect(
      isComplete(
        next,
        curriculum.units[1],
        getLesson("M0-02")!.blocks.map((b) => b.id),
      ),
    ).toBe(false);
  });
  it("rejects mixing different units in a single assessment mutation", () => {
    const feedback = foundationProblems
      .slice(0, 1)
      .map((p) => scoreProblem(p, p.answerRule.expected));
    expect(() =>
      applySubmission(emptyProgress("124d3c71-9359-4cf2-b111-9ba5502df231"), {
        unitId: "M0-03",
        requestId: "mixed",
        answers: {},
        feedback,
        hintUsed: false,
        purpose: "assessment",
        at: "2026-11-01T00:00:00.000Z",
      }),
    ).toThrow("다른 단원");
  });
});
