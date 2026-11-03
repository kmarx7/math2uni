import { afterEach, describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { contentSchema } from "@/contracts";
import { getDraftLessonForPreview } from "@/data/proposal-lessons";
import { proposalProblemFamilies, proposalProblems } from "@/data/proposal-problems";
import { publicProblems, privateProblems } from "@/modules/question-bank/server";
import { draftLessonForPreview } from "@/modules/content/preview-server";
import { applySubmission, completeLearningBlock } from "@/modules/progress/mutations";
import { gradeAnswer } from "@/modules/math-validation";
import { MathLab } from "@/components/math-lab";
import {
  addMatrix2,
  compareLines,
  countConditionIntersection,
  countTwoStepPaths,
  distanceBetween,
  internalSectionPoint,
  multiplyMatrix2,
  partitionIntegers,
  projectCoordinate,
  scaleMatrix2,
  slopeBetween,
} from "@/modules/math-validation/m3-m4-preview";

const previousEnv = { node: process.env.NODE_ENV, preview: process.env.MATH90_CONTENT_PREVIEW };
afterEach(() => {
  Reflect.set(process.env, "NODE_ENV", previousEnv.node);
  if (previousEnv.preview === undefined) delete process.env.MATH90_CONTENT_PREVIEW;
  else process.env.MATH90_CONTENT_PREVIEW = previousEnv.preview;
});

const units = ["M3-21", "M3-22", "M4-01", "M4-02", "M4-03"];
describe("M3-21~M4-03 development preview", () => {
  it("registers valid lesson drafts and dedicated interactions for the five units", () => {
    Reflect.set(process.env, "NODE_ENV", "development");
    process.env.MATH90_CONTENT_PREVIEW = "1";
    units.forEach((unit) => {
      const lesson = getDraftLessonForPreview(unit);
      expect(lesson).toBeDefined();
      expect(contentSchema.parse(lesson)).toBeDefined();
      expect(lesson?.blocks.some((block) => block.type === "AssessmentBlock")).toBe(false);
      expect(lesson?.blocks.some((block) => block.type === "InteractiveBlock")).toBe(true);
      expect(draftLessonForPreview(unit)).toBeDefined();
    });
  });

  it("calculates bounded matrix, coordinate, condition, path, and line relationships", () => {
    const a = [[1, 2], [0, -1]] as const;
    const b = [[3, 1], [2, 4]] as const;
    expect(addMatrix2(a, b)).toEqual([[4, 3], [2, 3]]);
    expect(scaleMatrix2(a, -2)).toEqual([[-2, -4], [0, 2]]);
    expect(multiplyMatrix2(a, b)).toEqual([[7, 9], [-2, -4]]);
    expect(countConditionIntersection([0, 1, 2, 3, 4, 5, 6, 7, 8], [(n) => n % 2 === 0, (n) => n % 3 === 0])).toBe(2);
    expect(partitionIntegers([-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8])).toEqual({
      even: [-2, 0, 2, 4, 6, 8],
      oddMultiplesOfThree: [3],
      remaining: [-1, 1, 5, 7],
    });
    expect(countTwoStepPaths([[1, 1, 0], [0, 1, 1], [1, 0, 1]], 0, 2)).toBe(1);
    expect(countTwoStepPaths([[1, 2], [0]], 0, 1)).toBeNull();
    expect(distanceBetween([-2, 1], [4, 5])).toBeCloseTo(2 * Math.sqrt(13));
    expect(internalSectionPoint([-2, 1], [4, 5], 1, 2)).toEqual([0, 7 / 3]);
    expect(internalSectionPoint([0, 0], [1, 1], 0, 2)).toBeNull();
    for (const point of [[-5, -5], [-5, 5], [5, -5], [5, 5]] as const) {
      const [x, y] = projectCoordinate(point);
      expect(x).toBeGreaterThanOrEqual(20);
      expect(x).toBeLessThanOrEqual(285);
      expect(y).toBeGreaterThanOrEqual(15);
      expect(y).toBeLessThanOrEqual(155);
    }
    expect(slopeBetween([1, 2], [1, 5])).toBeNull();
    expect(compareLines({ slope: 2, intercept: 1 }, { slope: -0.5, intercept: 4 })).toBe("perpendicular");
    expect(compareLines({ slope: 2, intercept: 1 }, { slope: 2, intercept: 1 })).toBe("same");
    expect(compareLines({ slope: 2, intercept: 1 }, { slope: 2, intercept: 3 })).toBe("parallel");
    expect(compareLines({ slope: null, intercept: 2 }, { slope: 0, intercept: 3 })).toBe("perpendicular");
  });

  it("provides six draft practice items per unit with three distinct families", () => {
    const ids: string[] = [];
    for (const unit of units) {
      const items = proposalProblems.filter((problem) => problem.unitId === unit);
      expect(items).toHaveLength(6);
      expect(new Set(items.map((problem) => problem.familyId)).size).toBe(3);
      for (const item of items) {
        ids.push(item.id);
        expect(item.status).toBe("draft");
        expect(item.purpose).toBe("practice");
        expect(item.reviewHistory).toEqual([]);
        expect(item.skillId.startsWith(`${unit.toLowerCase()}-`)).toBe(true);
        expect(gradeAnswer(item.answerRule, item.answerRule.expected).status).toBe("correct");
        expect(proposalProblemFamilies.some((family) => family.id === item.familyId)).toBe(true);
      }
      expect(privateProblems("assessment", unit, "proposal-preview")).toEqual([]);
    }
    expect(new Set(ids).size).toBe(30);
    const batchItems = proposalProblems.filter((problem) => units.includes(problem.unitId));
    expect(new Set(batchItems.map((problem) => problem.familyId)).size).toBe(15);
    expect(new Set(batchItems.map((problem) => problem.prompt.replace(/[\s,]/g, ""))).size).toBe(30);
  });

  it("keeps answers server-only and draft previews blocked in production", () => {
    Reflect.set(process.env, "NODE_ENV", "development");
    process.env.MATH90_CONTENT_PREVIEW = "1";
    for (const unit of units) {
      const visible = publicProblems("practice", unit, "proposal-preview");
      expect(visible).toHaveLength(6);
      expect(JSON.stringify(visible)).not.toMatch(/answerRule|answerDisplay|explanation|steps/);
    }
    Reflect.set(process.env, "NODE_ENV", "production");
    for (const unit of units) {
      expect(publicProblems("practice", unit, "proposal-preview")).toEqual([]);
      expect(draftLessonForPreview(unit)).toBeUndefined();
    }
  });

  it("renders accessible unit-specific labs with worked interaction feedback", () => {
    const expected = ["행렬", "조건과 표현", "좌표 거리와 내분점", "점과 기울기", "기울기와 절편 비교"];
    units.forEach((unit, index) => {
      const block = getDraftLessonForPreview(unit)?.blocks.find((item) => item.type === "InteractiveBlock");
      if (block?.type !== "InteractiveBlock") throw new Error(`missing lab: ${unit}`);
      const html = renderToStaticMarkup(createElement(MathLab, { block, unitId: unit }));
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain('aria-label=');
      expect(html).toContain(expected[index]);
      if (unit === "M3-21") expect(html).toContain("A의 행과 B의 열");
      if (unit === "M3-22") expect(html).toContain("두 단계 경로");
      if (unit === "M4-01") expect(html).toContain('viewBox="0 0 300 200"');
      if (unit === "M4-02") expect(html).toContain("Δx=0");
      if (unit === "M4-03") expect(html).toContain("기울기가 같으면 절편도 비교");
    });
  });

  it("keeps extension attempts and block completion inside each unitProgress key", () => {
    const problem = proposalProblems.find((item) => item.unitId === "M3-21")!;
    const initial = { schemaVersion: 1 as const, profileId: "a1695b5a-a3d4-4554-b56f-e0aa6e60e4f0", attempts: [], completedBlocks: ["legacy"], assessmentScore: 73, unitProgress: {} };
    const next = applySubmission(initial, { unitId: problem.unitId, collection: "proposal-preview", requestId: "7e2f30df-7834-4717-8422-e95eb982dbbd", answers: { [problem.id]: problem.answerRule.expected }, feedback: [], hintUsed: false, purpose: "practice", at: "2026-11-03T00:00:00.000Z" });
    const done = completeLearningBlock(next, "concept", "M3-21");
    expect(done.completedBlocks).toEqual(["legacy"]);
    expect(done.assessmentScore).toBe(73);
    expect(done.unitProgress?.["M3-21"]?.completedBlocks).toEqual(["concept"]);
    expect(done.unitProgress?.["M3-22"]).toBeUndefined();
  });
});
