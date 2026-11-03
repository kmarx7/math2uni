import { afterEach, describe, expect, it } from "vitest";
import { contentSchema } from "@/contracts";
import { getDraftLessonForPreview } from "@/data/proposal-lessons";
import { proposalProblems, proposalAssessmentProblems, proposalProblemFamilies } from "@/data/proposal-problems";
import { publicProblems, privateProblems } from "@/modules/question-bank/server";
import { gradeAnswer } from "@/modules/math-validation";
import { draftLessonForPreview } from "@/modules/content/preview-server";
import { applySubmission, completeLearningBlock } from "@/modules/progress/mutations";
import { biquadraticRoots, vietaCoefficients, solveQuadratic, intervalExtrema, factorRoots, symmetricIntersections } from "@/modules/math-validation/m3-roots-preview";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { M3RootsLab } from "@/components/m3-roots-labs";

const previousEnv = { node: process.env.NODE_ENV, preview: process.env.MATH90_CONTENT_PREVIEW };
afterEach(() => {
  Reflect.set(process.env, "NODE_ENV", previousEnv.node);
  if (previousEnv.preview === undefined) delete process.env.MATH90_CONTENT_PREVIEW;
  else process.env.MATH90_CONTENT_PREVIEW = previousEnv.preview;
});

const units = ["M3-11", "M3-12", "M3-13", "M3-14", "M3-15"];
const interactions = ["root-coefficient", "quadratic-intersection", "quadratic-interval-optimization", "polynomial-root-factory", "system-intersections"] as const;

describe("M3-11~M3-15 개발 미리보기", () => {
  it("parses all five lesson JSON documents and registers the specified interaction", () => {
    Reflect.set(process.env, "NODE_ENV", "development");
    process.env.MATH90_CONTENT_PREVIEW = "1";
    units.forEach((unit, i) => {
      const lesson = getDraftLessonForPreview(unit);
      expect(lesson).toBeDefined();
      expect(contentSchema.parse(lesson)).toBeDefined();
      expect(lesson?.blocks.some((b) => b.type === "AssessmentBlock")).toBe(false);
      expect(lesson?.blocks.find((b) => b.type === "InteractiveBlock")?.type === "InteractiveBlock" ? lesson.blocks.find((b) => b.type === "InteractiveBlock")?.interaction : undefined).toBe(interactions[i]);
      expect(draftLessonForPreview(unit)).toBeDefined();
    });
  });

  it("validates math helpers across root cases, closed interval endpoints, and invalid inputs", () => {
    expect(vietaCoefficients(2, 1, 3)).toEqual({ a: 2, b: -8, c: 6, sum: 4, product: 3 });
    expect(vietaCoefficients(0, 1, 3)).toBeNull();
    expect(solveQuadratic(1, 0, -4)).toEqual({ kind: "two", values: [-2, 2] });
    expect(solveQuadratic(1, -2, 1)).toEqual({ kind: "one", values: [1] });
    expect(solveQuadratic(1, 0, 2)).toEqual({ kind: "none" });
    expect(solveQuadratic(0, 1, 2)).toBeNull();
    expect(intervalExtrema(1, 1, 0, 1, 4)?.min).toEqual({ x: 1, y: 0 });
    expect(intervalExtrema(1, 10, 0, -2, 4)?.min).toEqual({ x: 4, y: 36 });
    expect(intervalExtrema(-1, 0, 2, -2, 3)?.max).toEqual({ x: 0, y: 2 });
    expect(intervalExtrema(1, 0, 0, 3, 2)).toBeNull();
    expect(factorRoots([-2, 1, 1])).toEqual([-2, 1]);
    expect(factorRoots([100])).toBeNull();
    expect(biquadraticRoots([1, 4])).toEqual([-2, -1, 1, 2]);
    expect(biquadraticRoots([-1, 0])).toEqual([0]);
    expect(biquadraticRoots([-1, -2])).toEqual([]);
    expect(symmetricIntersections(5, 6)).toEqual({ kind: "two", values: [2, 3] });
    expect(symmetricIntersections(1, 2)).toEqual({ kind: "none" });
  });

  it("registers 30 unique draft practice items in 15 families, with valid skills and answers", () => {
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
        expect(item.explanation).toContain(item.answerDisplay);
        expect(proposalProblemFamilies.some((family) => family.id === item.familyId)).toBe(true);
      }
      expect(privateProblems("assessment", unit, "proposal-preview")).toEqual([]);
    }
    expect(new Set(ids).size).toBe(30);
    expect(new Set(proposalProblems.filter((p) => units.includes(p.unitId)).map((p) => p.familyId)).size).toBe(15);
    expect(proposalAssessmentProblems.filter((p) => units.includes(p.unitId))).toHaveLength(0);
  });

  it("keeps answer keys hidden and blocks preview in production", () => {
    Reflect.set(process.env, "NODE_ENV", "development");
    process.env.MATH90_CONTENT_PREVIEW = "1";
    for (const unit of units) {
      const publicItems = publicProblems("practice", unit, "proposal-preview");
      expect(publicItems).toHaveLength(6);
      expect(JSON.stringify(publicItems)).not.toMatch(/answerRule|answerDisplay|explanation|steps/);
    }
    Reflect.set(process.env, "NODE_ENV", "production");
    for (const unit of units) {
      expect(publicProblems("practice", unit, "proposal-preview")).toEqual([]);
      expect(draftLessonForPreview(unit)).toBeUndefined();
    }
  });

  it("renders five keyboard-operated interactive labs with announced output", () => {
    units.forEach((unit, i) => {
      const block = getDraftLessonForPreview(unit)?.blocks.find((b) => b.type === "InteractiveBlock");
      if (block?.type !== "InteractiveBlock") throw new Error(`missing lab: ${unit}`);
      expect(block.interaction).toBe(interactions[i]);
      const html = renderToStaticMarkup(createElement(M3RootsLab, { block }));
      expect(html).toContain('type="range"');
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain('aria-label=');
      if (interactions[i] === "quadratic-intersection") {
        expect(html).toContain("<svg");
        expect(html).toContain("<circle");
      }
    });
  });

  it("stores attempt and completion only inside each unit progress", () => {
    const p = proposalProblems.find((problem) => problem.unitId === "M3-11")!;
    const initial = { schemaVersion: 1 as const, profileId: "a1695b5a-a3d4-4554-b56f-e0aa6e60e4f0", attempts: [], completedBlocks: ["legacy"], assessmentScore: 73, unitProgress: {} };
    const next = applySubmission(initial, { unitId: p.unitId, collection: "proposal-preview", requestId: "c3a98bd9-33d6-430c-9842-8ecc9e8c2e96", answers: { [p.id]: p.answerRule.expected }, feedback: [], hintUsed: false, purpose: "practice", at: "2026-11-03T00:00:00.000Z" });
    const done = completeLearningBlock(next, "concept", "M3-11");
    expect(done.completedBlocks).toEqual(["legacy"]);
    expect(done.assessmentScore).toBe(73);
    expect(done.unitProgress?.["M3-11"]?.completedBlocks).toEqual(["concept"]);
    expect(done.unitProgress?.["M3-12"]).toBeUndefined();
  });
});
