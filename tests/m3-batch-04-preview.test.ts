import { afterEach, describe, expect, it } from "vitest";
import { contentSchema } from "@/contracts";
import { getDraftLessonForPreview } from "@/data/proposal-lessons";
import { proposalProblemFamilies, proposalProblems, proposalAssessmentProblems } from "@/data/proposal-problems";
import { publicProblems, privateProblems } from "@/modules/question-bank/server";
import { gradeAnswer } from "@/modules/math-validation";
import { draftLessonForPreview } from "@/modules/content/preview-server";
import { applySubmission, completeLearningBlock } from "@/modules/progress/mutations";
import {
  combinations,
  countPairsAtParameter,
  intersectIntervals,
  permutations,
  productRuleCounts,
  quadraticInequalitySolution,
  sumRuleCounts,
  type Interval,
} from "@/modules/math-validation/m3-inequalities-preview";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { M3InequalitiesLab } from "@/components/m3-inequalities-labs";

const previousEnv = { node: process.env.NODE_ENV, preview: process.env.MATH90_CONTENT_PREVIEW };
afterEach(() => {
  Reflect.set(process.env, "NODE_ENV", previousEnv.node);
  if (previousEnv.preview === undefined) delete process.env.MATH90_CONTENT_PREVIEW;
  else process.env.MATH90_CONTENT_PREVIEW = previousEnv.preview;
});

const units = ["M3-16", "M3-17", "M3-18", "M3-19", "M3-20"];
const interactions = ["linear-inequality-intersection", "quadratic-inequality-sign", "parameter-case-table", "counting-tree", "permutation-combination-cards"] as const;

describe("M3-16~M3-20 개발 미리보기", () => {
  it("parses lesson drafts and registers the matching interaction for all five units", () => {
    Reflect.set(process.env, "NODE_ENV", "development");
    process.env.MATH90_CONTENT_PREVIEW = "1";
    units.forEach((unit, index) => {
      const lesson = getDraftLessonForPreview(unit);
      expect(lesson).toBeDefined();
      expect(contentSchema.parse(lesson)).toBeDefined();
      expect(lesson?.blocks.some((block) => block.type === "AssessmentBlock")).toBe(false);
      const interaction = lesson?.blocks.find((block) => block.type === "InteractiveBlock");
      expect(interaction?.type === "InteractiveBlock" ? interaction.interaction : undefined).toBe(interactions[index]);
      expect(draftLessonForPreview(unit)).toBeDefined();
    });
  });

  it("intersects intervals with correct open, closed, touching, empty, and invalid boundaries", () => {
    const first: Interval = { lower: -2, lowerInclusive: false, upper: 3, upperInclusive: true };
    const second: Interval = { lower: 0, lowerInclusive: true, upper: 5, upperInclusive: false };
    expect(intersectIntervals(first, second)).toEqual({ lower: 0, lowerInclusive: true, upper: 3, upperInclusive: true });
    expect(intersectIntervals(
      { lower: 0, lowerInclusive: true, upper: 2, upperInclusive: true },
      { lower: 2, lowerInclusive: true, upper: 4, upperInclusive: false },
    )).toEqual({ lower: 2, lowerInclusive: true, upper: 2, upperInclusive: true });
    expect(intersectIntervals(
      { lower: 0, lowerInclusive: false, upper: 2, upperInclusive: false },
      { lower: 2, lowerInclusive: true, upper: 4, upperInclusive: true },
    )).toBeNull();
    expect(intersectIntervals(
      { lower: 4, lowerInclusive: true, upper: 2, upperInclusive: true },
      second,
    )).toBeNull();
  });

  it("solves bounded quadratic sign cases including a repeated root and no real roots", () => {
    expect(quadraticInequalitySolution(1, [-2, 2], "<=" )).toEqual([
      { lower: -2, lowerInclusive: true, upper: 2, upperInclusive: true },
    ]);
    expect(quadraticInequalitySolution(1, [-2, 2], ">" )).toEqual([
      { lower: null, lowerInclusive: false, upper: -2, upperInclusive: false },
      { lower: 2, lowerInclusive: false, upper: null, upperInclusive: false },
    ]);
    expect(quadraticInequalitySolution(-1, [-2, 2], ">=" )).toEqual([
      { lower: -2, lowerInclusive: true, upper: 2, upperInclusive: true },
    ]);
    expect(quadraticInequalitySolution(1, [1, 1], ">=" )).toEqual([
      { lower: null, lowerInclusive: false, upper: null, upperInclusive: false },
    ]);
    expect(quadraticInequalitySolution(1, [1, 1], ">" )).toEqual([
      { lower: null, lowerInclusive: false, upper: 1, upperInclusive: false },
      { lower: 1, lowerInclusive: false, upper: null, upperInclusive: false },
    ]);
    expect(quadraticInequalitySolution(1, null, "<=" )).toEqual([]);
    expect(quadraticInequalitySolution(-1, null, "<=" )?.[0]?.lower).toBeNull();
    expect(quadraticInequalitySolution(0, [1, 2], "<=" )).toBeNull();
  });

  it("counts parameter cases and applies the sum, product, permutation, and combination rules safely", () => {
    const pairs = [{ x: 1, y: 2 }, { x: 2, y: 1 }];
    expect(countPairsAtParameter(pairs, 0, true)).toBe(0);
    expect(countPairsAtParameter(pairs, 1, true)).toBe(1);
    expect(countPairsAtParameter(pairs, 2, true)).toBe(2);
    expect(countPairsAtParameter(pairs, 1, false)).toBe(0);
    expect(countPairsAtParameter(pairs, 2, false)).toBe(1);
    expect(countPairsAtParameter(pairs, 3, false)).toBe(2);
    expect(sumRuleCounts([2, 3])).toBe(5);
    expect(sumRuleCounts([-1, 3])).toBeNull();
    expect(productRuleCounts([2, 3, 4])).toBe(24);
    expect(productRuleCounts([2, 0])).toBe(0);
    expect(permutations(5, 2)).toBe(20);
    expect(combinations(5, 2)).toBe(10);
    expect(combinations(3, 0)).toBe(1);
    expect(permutations(13, 2)).toBeNull();
    expect(combinations(3, 4)).toBeNull();
  });

  it("registers 30 unique draft practice problems from 15 families with valid answer rules", () => {
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
      expect(proposalAssessmentProblems.filter((problem) => problem.unitId === unit)).toHaveLength(0);
    }
    expect(new Set(ids).size).toBe(30);
    expect(new Set(proposalProblems.filter((problem) => units.includes(problem.unitId)).map((problem) => problem.familyId)).size).toBe(15);
  });

  it("keeps public DTOs answer-free and blocks draft lessons in production", () => {
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

  it("renders five keyboard-operable labs with a live result and labeled controls", () => {
    units.forEach((unit, index) => {
      const block = getDraftLessonForPreview(unit)?.blocks.find((item) => item.type === "InteractiveBlock");
      if (block?.type !== "InteractiveBlock") throw new Error(`missing lab: ${unit}`);
      expect(block.interaction).toBe(interactions[index]);
      const html = renderToStaticMarkup(createElement(M3InequalitiesLab, { block }));
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain('aria-label=');
      if (unit === "M3-16") expect(html).toContain("<svg");
      if (unit === "M3-17") expect(html).toContain("이차식 부호표");
      if (unit === "M3-18") expect(html).toContain("<table");
      if (unit === "M3-19") expect(html).toContain("<ul");
    });
  });

  it("keeps attempts and lesson completion under their own unit progress key", () => {
    const problem = proposalProblems.find((item) => item.unitId === "M3-16")!;
    const initial = { schemaVersion: 1 as const, profileId: "a1695b5a-a3d4-4554-b56f-e0aa6e60e4f0", attempts: [], completedBlocks: ["legacy"], assessmentScore: 73, unitProgress: {} };
    const next = applySubmission(initial, { unitId: problem.unitId, collection: "proposal-preview", requestId: "7e2f30df-7834-4717-8422-e95eb982dbbd", answers: { [problem.id]: problem.answerRule.expected }, feedback: [], hintUsed: false, purpose: "practice", at: "2026-11-03T00:00:00.000Z" });
    const done = completeLearningBlock(next, "concept", "M3-16");
    expect(done.completedBlocks).toEqual(["legacy"]);
    expect(done.assessmentScore).toBe(73);
    expect(done.unitProgress?.["M3-16"]?.completedBlocks).toEqual(["concept"]);
    expect(done.unitProgress?.["M3-17"]).toBeUndefined();
  });
});
