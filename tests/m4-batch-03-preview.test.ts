import { afterEach, describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { contentSchema } from "@/contracts";
import { curriculumProposal } from "@/data/curriculum-proposal";
import { getDraftLessonForPreview } from "@/data/proposal-lessons";
import { proposalProblemFamilies, proposalProblems } from "@/data/proposal-problems";
import { publicProblems, privateProblems } from "@/modules/question-bank/server";
import { draftLessonForPreview } from "@/modules/content/preview-server";
import { applySubmission, completeLearningBlock } from "@/modules/progress/mutations";
import { gradeAnswer } from "@/modules/math-validation";
import {
  arithmeticGeometricMean, compositionDomains, isFiniteFunction, isInjective,
  projectInversePoint, rangeOf, rationalFunctionValue,
} from "@/modules/math-validation/m4-14-18-preview";
import { MathLab } from "@/components/math-lab";

const previousEnv = { node: process.env.NODE_ENV, preview: process.env.MATH90_CONTENT_PREVIEW };
afterEach(() => {
  Reflect.set(process.env, "NODE_ENV", previousEnv.node);
  if (previousEnv.preview === undefined) delete process.env.MATH90_CONTENT_PREVIEW;
  else process.env.MATH90_CONTENT_PREVIEW = previousEnv.preview;
});

const units = ["M4-14", "M4-15", "M4-16", "M4-17", "M4-18"];

describe("M4-14~M4-18 development preview", () => {
  it("registers five schema-valid 15-phase lesson drafts with no assessment blocks", () => {
    Reflect.set(process.env, "NODE_ENV", "development");
    process.env.MATH90_CONTENT_PREVIEW = "1";
    for (const unitId of units) {
      const lesson = getDraftLessonForPreview(unitId);
      expect(lesson).toBeDefined();
      expect(contentSchema.parse(lesson)).toBeDefined();
      expect(lesson?.learningPhases).toHaveLength(15);
      expect(lesson?.blocks.some((block) => block.type === "InteractiveBlock")).toBe(true);
      expect(lesson?.blocks.some((block) => block.type === "AssessmentBlock")).toBe(false);
      expect(draftLessonForPreview(unitId)).toBeDefined();
    }
  });

  it("keeps 30 unique draft practice items in 15 distinct families and zero assessments", () => {
    const ids: string[] = [];
    for (const unitId of units) {
      const items = proposalProblems.filter((problem) => problem.unitId === unitId);
      expect(items).toHaveLength(6);
      expect(new Set(items.map((problem) => problem.familyId)).size).toBe(3);
      expect(privateProblems("assessment", unitId, "proposal-preview")).toEqual([]);
      for (const item of items) {
        ids.push(item.id);
        expect(item.status).toBe("draft");
        expect(item.purpose).toBe("practice");
        expect(item.reviewHistory).toEqual([]);
        expect(proposalProblemFamilies.some((family) => family.id === item.familyId)).toBe(true);
        expect(gradeAnswer(item.answerRule, item.answerRule.expected).status).toBe("correct");
        const unit = curriculumProposal.curriculum.units.find((candidate) => candidate.id === unitId)!;
        expect(unit.concepts.some((skill) => skill.id === item.skillId)).toBe(true);
        if (item.answerRule.kind === "choice") expect(item.choices?.filter((choice) => choice.id === item.answerRule.expected)).toHaveLength(1);
      }
    }
    expect(new Set(ids).size).toBe(30);
    expect(new Set(proposalProblems.filter((problem) => units.includes(problem.unitId)).map((problem) => problem.prompt)).size).toBe(30);
    expect(proposalProblems.filter((problem) => units.includes(problem.unitId) && problem.purpose === "assessment")).toEqual([]);
  });

  it("keeps answers private and blocks preview content in production", () => {
    Reflect.set(process.env, "NODE_ENV", "development");
    process.env.MATH90_CONTENT_PREVIEW = "1";
    for (const unitId of units) {
      const visible = publicProblems("practice", unitId, "proposal-preview");
      expect(visible).toHaveLength(6);
      expect(JSON.stringify(visible)).not.toMatch(/answerRule|answerDisplay|explanation|steps/);
    }
    Reflect.set(process.env, "NODE_ENV", "production");
    for (const unitId of units) {
      expect(publicProblems("practice", unitId, "proposal-preview")).toEqual([]);
      expect(draftLessonForPreview(unitId)).toBeUndefined();
    }
  });

  it("validates AM-GM, finite functions, injectivity, composition domains, and rational exclusions", () => {
    expect(arithmeticGeometricMean(4, 9)).toEqual({ arithmeticMean: 6.5, geometricMean: 6, difference: 0.5, equality: false });
    expect(arithmeticGeometricMean(4, 4)?.equality).toBe(true);
    expect(arithmeticGeometricMean(-1, 4)).toBeNull();
    expect(isFiniteFunction([1, 2], { 1: [2], 2: [2] })).toBe(true);
    expect(isFiniteFunction([1, 2], { 1: [2, 3], 2: [2] })).toBe(false);
    expect(isFiniteFunction([1, 2], { 1: [2] })).toBe(false);
    expect(rangeOf({ 1: [3, 1], 2: [3] })).toEqual([1, 3]);
    expect(isInjective([-1, 0, 1], { [-1]: 1, 0: 0, 1: 1 })).toBe(false);
    expect(isInjective([0, 1, 2], { 0: 0, 1: 1, 2: 4 })).toBe(true);
    for (const point of [[-2, 4], [2, 4], [4, 2]] as const) {
      const [x, y] = projectInversePoint(point[0], point[1]);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(300);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(300);
    }
    const [originalX, originalY] = projectInversePoint(1, 2);
    const [inverseX, inverseY] = projectInversePoint(2, 1);
    expect(originalX + originalY + inverseX + inverseY).toBe(600);
    expect(compositionDomains([-1, 0, 1, 2], { [-1]: 0, 0: 1, 1: 2, 2: 3 }, [0, 1, 2, 3], { 0: 0, 1: 1, 2: 4, 3: 9 })).toEqual({ gAfterF: [-1, 0, 1, 2], fAfterG: [0, 1] });
    expect(rationalFunctionValue(2, 1, -1, 0)).toBe(-3);
    expect(rationalFunctionValue(2, 1, -1, 1)).toBeNull();
    expect(rationalFunctionValue(0, 1, -1, 0)).toBeNull();
  });

  it("renders labelled unit labs and correct conceptual outputs", () => {
    const expected = ["a,b≥0", "이 대응은 함수예요", "먼저 안쪽 함수를", "역관계는 함수가 아니에요", "정의역에서 x≠1"];
    units.forEach((unitId, index) => {
      const block = getDraftLessonForPreview(unitId)?.blocks.find((candidate) => candidate.type === "InteractiveBlock");
      if (block?.type !== "InteractiveBlock") throw new Error(`missing lab for ${unitId}`);
      const html = renderToStaticMarkup(createElement(MathLab, { block, unitId }));
      expect(html).toContain(expected[index]);
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain("aria-label=");
      if (unitId === "M4-17") {
        expect(html).toContain("유한 표본 함수 f(x)=x²");
        expect(html).toContain("D={-2,-1,0,1,2}");
        expect(html).toContain("표본의 치역은 {0, 1, 4}");
        expect(html).toContain("f⁻¹은 1/f를 뜻하지 않아요");
      }
      if (unitId === "M4-18") {
        expect(html).toContain("수직 점근선 x=1, 수평 점근선 y=-1");
        expect(html).toContain('aria-label="가로 이동 p"');
        expect(html).toContain('aria-label="세로 이동 q"');
      }
    });
  });

  it("stores progress per unit and preserves legacy root records", () => {
    const problem = proposalProblems.find((item) => item.unitId === "M4-14")!;
    const initial = { schemaVersion: 1 as const, profileId: "a1695b5a-a3d4-4554-b56f-e0aa6e60e4f0", attempts: [], completedBlocks: ["legacy"], assessmentScore: 73, unitProgress: {} };
    const next = applySubmission(initial, { unitId: problem.unitId, collection: "proposal-preview", requestId: "d75a817e-7855-4ac0-b699-799242022d38", answers: { [problem.id]: problem.answerRule.expected }, feedback: [], hintUsed: false, purpose: "practice", at: "2026-11-05T00:00:00.000Z" });
    const done = completeLearningBlock(next, "concept", "M4-14");
    expect(done.completedBlocks).toEqual(["legacy"]);
    expect(done.assessmentScore).toBe(73);
    expect(done.unitProgress?.["M4-14"]?.completedBlocks).toEqual(["concept"]);
    expect(done.unitProgress?.["M4-15"]).toBeUndefined();
  });
});
