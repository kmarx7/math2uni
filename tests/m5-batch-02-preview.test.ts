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
import { mastery } from "@/modules/progress";
import {
  changeLogBase,
  combineLogs,
  commonLogParts,
  decimalDigitCount,
  expandLogPower,
  expandLogProduct,
  expandLogQuotient,
  exponentialGraphShape,
  logarithmGraphShape,
  logarithmGraphValue,
  logValue,
  solveSameBaseExponentialEquation,
  solveSameBaseExponentialInequality,
} from "@/modules/math-validation/m5-04-m5-08-preview";
import { MathLab } from "@/components/math-lab";

const units = ["M5-04", "M5-05", "M5-06", "M5-07", "M5-08"];
const previousEnv = { node: process.env.NODE_ENV, preview: process.env.MATH90_CONTENT_PREVIEW };

afterEach(() => {
  Reflect.set(process.env, "NODE_ENV", previousEnv.node);
  if (previousEnv.preview === undefined) delete process.env.MATH90_CONTENT_PREVIEW;
  else process.env.MATH90_CONTENT_PREVIEW = previousEnv.preview;
});

describe("M5-04~M5-08 development preview", () => {
  it("registers schema-valid lesson drafts with 15 phases and no assessment blocks", () => {
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

  it("registers 30 unique practice drafts in three families per unit with zero assessments", () => {
    const allIds: string[] = [];
    for (const unitId of units) {
      const unitItems = proposalProblems.filter((problem) => problem.unitId === unitId);
      expect(unitItems).toHaveLength(6);
      expect(new Set(unitItems.map((item) => item.familyId)).size).toBe(3);
      expect(privateProblems("assessment", unitId, "proposal-preview")).toEqual([]);
      const choices = unitItems.filter((item) => item.answerRule.kind === "choice");
      expect(new Set(choices.map((item) => item.answerRule.expected)).size).toBeGreaterThan(1);
      for (const item of unitItems) {
        allIds.push(item.id);
        expect(item.status).toBe("draft");
        expect(item.purpose).toBe("practice");
        expect(item.reviewHistory).toEqual([]);
        expect(proposalProblemFamilies.some((family) => family.id === item.familyId)).toBe(true);
        expect(gradeAnswer(item.answerRule, item.answerRule.expected).status).toBe("correct");
        const unit = curriculumProposal.curriculum.units.find((candidate) => candidate.id === unitId)!;
        expect(unit.concepts.some((skill) => skill.id === item.skillId)).toBe(true);
        if (item.answerRule.kind === "choice") {
          expect(item.choices?.filter((choice) => choice.id === item.answerRule.expected)).toHaveLength(1);
          expect(new Set(item.choices?.map((choice) => choice.id)).size).toBe(item.choices?.length);
          expect(new Set(item.choices?.map((choice) => choice.label)).size).toBe(item.choices?.length);
        }
      }
    }
    expect(new Set(allIds).size).toBe(30);
    expect(new Set(proposalProblems.filter((item) => units.includes(item.unitId)).map((item) => item.prompt)).size).toBe(30);
    expect(proposalProblems.filter((item) => units.includes(item.unitId) && item.purpose === "assessment")).toEqual([]);
  });

  it("keeps M5-05 choices unique and marks approximate table values as approximate", () => {
    const items = proposalProblems.filter((problem) => problem.unitId === "M5-05");
    expect(items).toHaveLength(6);
    expect(items.every((item) => item.choices?.length === 3 && new Set(item.choices.map((choice) => choice.label)).size === 3)).toBe(true);
    const approximationItems = items.filter((item) => item.prompt.includes("≈") || item.answerDisplay.includes("약"));
    expect(approximationItems.length).toBeGreaterThanOrEqual(2);
    expect(approximationItems.every((item) => item.answerDisplay.includes("약"))).toBe(true);
    expect(commonLogParts(200)?.approximateLog).toBeCloseTo(2.301, 3);
    expect(commonLogParts(0.03)?.characteristic).toBe(-2);
    expect(commonLogParts(0)?.characteristic).toBeUndefined();
    expect(decimalDigitCount(1000)).toBe(4);
    expect(decimalDigitCount(999)).toBe(3);
    expect(decimalDigitCount(0)).toBeNull();
    expect(decimalDigitCount(10.5)).toBeNull();
  });

  it("checks log identities and change-of-base domain conditions", () => {
    expect(logValue(2, 8)).toBeCloseTo(3);
    expect(logValue(1, 8)).toBeNull();
    expect(logValue(-2, 8)).toBeNull();
    expect(logValue(2, 0)).toBeNull();
    expect(expandLogProduct(2, 8, 4)).toBeCloseTo(5);
    expect(expandLogProduct(2, 0, 4)).toBeNull();
    expect(expandLogQuotient(3, 81, 3)).toBeCloseTo(3);
    expect(expandLogQuotient(3, 81, -3)).toBeNull();
    expect(expandLogPower(2, 8, 2)).toBeCloseTo(6);
    expect(combineLogs(2, 8, 4, "sum")).toBeCloseTo(5);
    expect(combineLogs(2, 8, 0, "difference")).toBeNull();
    expect(changeLogBase(2, 8, 5)).toBeCloseTo(3);
    expect(changeLogBase(2, 8, 1)).toBeNull();
    expect(changeLogBase(1, 8, 5)).toBeNull();
  });

  it("handles common logarithm characteristic, mantissa and approximation boundaries", () => {
    expect(commonLogParts(0.04)).toMatchObject({ characteristic: -2, mantissa: 4 });
    expect(commonLogParts(0.04)?.approximateLog).toBeCloseTo(-1.3979, 4);
    expect(commonLogParts(1)).toMatchObject({ characteristic: 0, mantissa: 1, approximateLog: 0 });
    expect(commonLogParts(10)).toMatchObject({ characteristic: 1, mantissa: 1, approximateLog: 1 });
    expect(commonLogParts(-1)).toBeNull();
    expect(commonLogParts(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it("checks exponential/log graph domain, range, asymptote and direction cases", () => {
    expect(exponentialGraphShape(2)).toMatchObject({ domain: "all-real", range: { lower: 0, upper: null, lowerClosed: false }, horizontalAsymptote: 0, direction: "increasing" });
    expect(exponentialGraphShape(0.5)?.direction).toBe("decreasing");
    expect(exponentialGraphShape(2, -1, 3, 4)).toMatchObject({ range: { lower: null, upper: 4 }, horizontalAsymptote: 4, anchor: { x: 3, y: 3 }, direction: "decreasing" });
    expect(exponentialGraphShape(2, 0, 3, 4)).toMatchObject({ range: { lower: 4, upper: 4, lowerClosed: true, upperClosed: true }, horizontalAsymptote: 4, direction: "constant" });
    expect(exponentialGraphShape(1)).toBeNull();

    expect(logarithmGraphShape(2, 1, 4, -3)).toMatchObject({ domain: { lower: 4, lowerClosed: false }, range: { lower: null, upper: null }, verticalAsymptote: 4, anchor: { x: 5, y: -3 }, direction: "increasing" });
    expect(logarithmGraphShape(0.5)?.direction).toBe("decreasing");
    expect(logarithmGraphShape(0.5, -1)?.direction).toBe("increasing");
    expect(logarithmGraphShape(2, 0, 4, 3)).toMatchObject({ domain: { lower: 4, lowerClosed: false }, range: { lower: 3, upper: 3, lowerClosed: true, upperClosed: true }, verticalAsymptote: null, direction: "constant" });
    expect(logarithmGraphValue(2, 4, 1, 4, 0)).toBeNull();
    expect(logarithmGraphValue(2, 5, 1, 4, 0)).toBeCloseTo(0);
    expect(logarithmGraphShape(1)).toBeNull();
  });

  it("solves same-base exponential equations and preserves/reverses inequalities safely", () => {
    expect(solveSameBaseExponentialEquation(2, 2, -1, 3)).toBe(2);
    expect(solveSameBaseExponentialEquation(1, 2, -1, 3)).toBeNull();
    expect(solveSameBaseExponentialInequality(2, 2, -1, 3, ">=")).toEqual({ kind: "interval", lower: 2, upper: null, lowerClosed: true, upperClosed: false });
    expect(solveSameBaseExponentialInequality(0.5, 2, -1, 3, ">=")).toEqual({ kind: "interval", lower: null, upper: 2, lowerClosed: false, upperClosed: true });
    expect(solveSameBaseExponentialInequality(2, -2, 3, 1, "<")).toEqual({ kind: "interval", lower: 1, upper: null, lowerClosed: false, upperClosed: false });
    expect(solveSameBaseExponentialInequality(2, 0, 1, 3, "<")).toEqual({ kind: "all" });
    expect(solveSameBaseExponentialInequality(2, 0, 4, 3, "<")).toEqual({ kind: "empty" });
    expect(solveSameBaseExponentialInequality(1, 2, -1, 3, ">=")).toBeNull();
  });

  it("keeps answers private and development previews blocked in production", () => {
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

  it("renders labelled accessible labs and stores preview attempts under unitProgress only", () => {
    Reflect.set(process.env, "NODE_ENV", "development");
    process.env.MATH90_CONTENT_PREVIEW = "1";
    const expected = ["로그의 성질은 밑과 진수 조건", "k=-2, m≈4", "수평점근선 y=0", "수직점근선 x=0", "부등호를 뒤집어요"];
    units.forEach((unitId, index) => {
      const block = getDraftLessonForPreview(unitId)?.blocks.find((candidate) => candidate.type === "InteractiveBlock");
      if (block?.type !== "InteractiveBlock") throw new Error(`Missing interactive block: ${unitId}`);
      const html = renderToStaticMarkup(createElement(MathLab, { block, unitId }));
      expect(html).toContain(expected[index]);
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain("aria-label=");
    });

    const problem = proposalProblems.find((item) => item.unitId === "M5-04")!;
    const initial = { schemaVersion: 1 as const, profileId: "a1695b5a-a3d4-4554-b56f-e0aa6e60e4f0", attempts: [], completedBlocks: ["legacy"], assessmentScore: 72, unitProgress: {} };
    const submitted = applySubmission(initial, {
      unitId: problem.unitId,
      collection: "proposal-preview",
      requestId: "b28a8517-d38b-4d24-9a84-e0c8bcfbf88f",
      answers: { [problem.id]: problem.answerRule.expected },
      feedback: [{ status: "correct", message: "정답이에요!", unitId: problem.unitId, problemId: problem.id, version: problem.version, skillId: problem.skillId, purpose: "practice", answerDisplay: problem.answerDisplay, explanation: problem.explanation, steps: problem.steps }],
      hintUsed: false,
      purpose: "practice",
      at: "2026-11-06T00:00:00.000Z",
    });
    const completed = completeLearningBlock(submitted, "concept", "M5-04");
    expect(completed.completedBlocks).toEqual(["legacy"]);
    expect(completed.assessmentScore).toBe(72);
    expect(completed.unitProgress?.["M5-04"]?.completedBlocks).toEqual(["concept"]);
    expect(completed.unitProgress?.["M5-05"]).toBeUndefined();
    expect(mastery(completed.attempts, problem.skillId)).toBe(0);
  });
});
