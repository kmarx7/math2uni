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
  circleFromCenterRadius,
  circleFromGeneralForm,
  circleLineRelation,
  pointLineProjection,
  projectM4Point,
  reflectLine,
  reflectPoint,
  translateLine,
  translatePoint,
} from "@/modules/math-validation/m4-08-preview";

const previousEnv = { node: process.env.NODE_ENV, preview: process.env.MATH90_CONTENT_PREVIEW };
afterEach(() => {
  Reflect.set(process.env, "NODE_ENV", previousEnv.node);
  if (previousEnv.preview === undefined) delete process.env.MATH90_CONTENT_PREVIEW;
  else process.env.MATH90_CONTENT_PREVIEW = previousEnv.preview;
});

const units = ["M4-04", "M4-05", "M4-06", "M4-07", "M4-08"];

describe("M4-04~M4-08 development preview", () => {
  it("registers five valid lesson drafts with interactive, non-assessment content", () => {
    Reflect.set(process.env, "NODE_ENV", "development");
    process.env.MATH90_CONTENT_PREVIEW = "1";
    for (const unit of units) {
      const lesson = getDraftLessonForPreview(unit);
      expect(lesson).toBeDefined();
      expect(contentSchema.parse(lesson)).toBeDefined();
      expect(draftLessonForPreview(unit)).toBeDefined();
      expect(lesson?.blocks.some((block) => block.type === "AssessmentBlock")).toBe(false);
      expect(lesson?.blocks.some((block) => block.type === "InteractiveBlock")).toBe(true);
    }
  });

  it("checks distance projection, perpendicular foot, square scaling, and invalid lines", () => {
    const result = pointLineProjection([2, 3], 2, 1, -2)!;
    expect(result.foot).toEqual([0, 2]);
    expect(result.distance).toBeCloseTo(Math.sqrt(5));
    expect(pointLineProjection([1, 2], 0, 0, 3)).toBeNull();
    const boundary = pointLineProjection([-5, 5], -1, -1, -5)!;
    expect(boundary.foot).toEqual([-7.5, 2.5]);
    expect(projectM4Point(boundary.foot)).toEqual([30, 110]);
    expect(projectM4Point([0, 0])).toEqual([150, 150]);
    expect(projectM4Point([8, -8])).toEqual([278, 278]);
  });

  it("converts circle forms and distinguishes circle-line cases", () => {
    expect(circleFromCenterRadius([2, -3], 5)).toMatchObject({ center: [2, -3], radiusSquared: 25, radius: 5, realCircle: true });
    expect(circleFromCenterRadius([0, 0], -1)).toBeNull();
    expect(circleFromGeneralForm(-6, 4, -12)).toMatchObject({ center: [3, -2], radiusSquared: 25, radius: 5, realCircle: true });
    expect(circleFromGeneralForm(2, -4, 8)?.realCircle).toBe(false);
    expect(circleLineRelation(5, 3)).toBe("secant");
    expect(circleLineRelation(5, 5)).toBe("tangent");
    expect(circleLineRelation(3, 4)).toBe("disjoint");
    expect(circleLineRelation(0, 0)).toBe("invalid");
  });

  it("applies translations and reflections to points and line equations", () => {
    expect(translatePoint([1, 2], 3, -2)).toEqual([4, 0]);
    expect(translateLine(2, 1, 3, -2)).toEqual({ slope: 2, intercept: -7 });
    expect(reflectPoint([2, 3], "x-axis")).toEqual([2, -3]);
    expect(reflectPoint([2, 3], "y-axis")).toEqual([-2, 3]);
    expect(reflectPoint([2, 3], "origin")).toEqual([-2, -3]);
    expect(reflectLine(2, 1, "x-axis")).toEqual({ slope: -2, intercept: -1 });
    expect(reflectLine(2, 1, "y-axis")).toEqual({ slope: -2, intercept: 1 });
    expect(reflectLine(2, 1, "origin")).toEqual({ slope: 2, intercept: -1 });
  });

  it("loads six draft practice problems per unit with distinct families and supported answers", () => {
    const allIds: string[] = [];
    for (const unit of units) {
      const items = proposalProblems.filter((problem) => problem.unitId === unit);
      expect(items).toHaveLength(6);
      expect(new Set(items.map((item) => item.familyId)).size).toBe(3);
      expect(privateProblems("assessment", unit, "proposal-preview")).toEqual([]);
      for (const item of items) {
        allIds.push(item.id);
        expect(item.status).toBe("draft");
        expect(item.purpose).toBe("practice");
        expect(item.reviewHistory).toEqual([]);
        expect(proposalProblemFamilies.some((family) => family.id === item.familyId)).toBe(true);
        const expected = item.answerRule.expected;
        expect(gradeAnswer(item.answerRule, expected).status).toBe("correct");
        if (item.answerRule.kind === "choice") {
          expect(item.choices?.some((choice) => choice.id === expected)).toBe(true);
        }
      }
    }
    expect(new Set(allIds).size).toBe(30);
    expect(new Set(proposalProblems.filter((item) => units.includes(item.unitId)).map((item) => item.familyId)).size).toBe(15);
  });

  it("keeps answers private and blocks draft lessons in production", () => {
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

  it("renders unit-specific labs with labeled controls and square coordinate geometry", () => {
    const expected = ["최단 거리", "중심과 반지름", "중심에서 직선까지", "같은 이동벡터", "대칭"];
    units.forEach((unit, index) => {
      const block = getDraftLessonForPreview(unit)?.blocks.find((candidate) => candidate.type === "InteractiveBlock");
      if (block?.type !== "InteractiveBlock") throw new Error(`missing lab for ${unit}`);
      const html = renderToStaticMarkup(createElement(MathLab, { block, unitId: unit }));
      expect(html).toContain('viewBox="0 0 300 300"');
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain("aria-label=");
      expect(html).toContain(expected[index]);
      if (unit === "M4-06") expect(html).toContain("두 점에서 만나요");
    });
  });

  it("stores activity only under its unitProgress key and preserves legacy root score", () => {
    const problem = proposalProblems.find((item) => item.unitId === "M4-04")!;
    const initial = { schemaVersion: 1 as const, profileId: "a1695b5a-a3d4-4554-b56f-e0aa6e60e4f0", attempts: [], completedBlocks: ["legacy"], assessmentScore: 73, unitProgress: {} };
    const next = applySubmission(initial, { unitId: problem.unitId, collection: "proposal-preview", requestId: "7e2f30df-7834-4717-8422-e95eb982dbdd", answers: { [problem.id]: problem.answerRule.expected }, feedback: [], hintUsed: false, purpose: "practice", at: "2026-11-03T00:00:00.000Z" });
    const done = completeLearningBlock(next, "concept", "M4-04");
    expect(done.completedBlocks).toEqual(["legacy"]);
    expect(done.assessmentScore).toBe(73);
    expect(done.unitProgress?.["M4-04"]?.completedBlocks).toEqual(["concept"]);
    expect(done.unitProgress?.["M4-05"]).toBeUndefined();
  });
});
