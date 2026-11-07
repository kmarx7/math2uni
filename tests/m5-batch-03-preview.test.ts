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
import * as math from "@/modules/math-validation/m5-09-m5-13-preview";
import { MathLab } from "@/components/math-lab";

const units = ["M5-09", "M5-10", "M5-11", "M5-12", "M5-13"];
const previousEnv = { node: process.env.NODE_ENV, preview: process.env.MATH90_CONTENT_PREVIEW };
afterEach(() => {
  Reflect.set(process.env, "NODE_ENV", previousEnv.node);
  if (previousEnv.preview === undefined) delete process.env.MATH90_CONTENT_PREVIEW;
  else process.env.MATH90_CONTENT_PREVIEW = previousEnv.preview;
});

describe("M5-09~M5-13 development preview", () => {
  it("registers valid lesson drafts with interactive blocks and no assessment", () => {
    Reflect.set(process.env, "NODE_ENV", "development"); process.env.MATH90_CONTENT_PREVIEW = "1";
    for (const unitId of units) {
      const lesson = getDraftLessonForPreview(unitId);
      expect(contentSchema.parse(lesson)).toBeDefined();
      expect(lesson?.learningPhases).toHaveLength(15);
      expect(lesson?.blocks.some((block) => block.type === "InteractiveBlock")).toBe(true);
      expect(lesson?.blocks.some((block) => block.type === "AssessmentBlock")).toBe(false);
      expect(draftLessonForPreview(unitId)).toBeDefined();
    }
  });

  it("registers 30 unique draft practice questions, three families per unit, and no assessments", () => {
    const ids: string[] = [];
    for (const unitId of units) {
      const items = proposalProblems.filter((problem) => problem.unitId === unitId);
      expect(items).toHaveLength(6);
      expect(new Set(items.map((item) => item.familyId)).size).toBe(3);
      expect(privateProblems("assessment", unitId, "proposal-preview")).toEqual([]);
      for (const item of items) {
        ids.push(item.id); expect(item.status).toBe("draft"); expect(item.purpose).toBe("practice");
        expect(proposalProblemFamilies.some((family) => family.id === item.familyId)).toBe(true);
        expect(gradeAnswer(item.answerRule, item.answerRule.expected).status).toBe("correct");
        expect(curriculumProposal.curriculum.units.find((unit) => unit.id === unitId)?.concepts.some((skill) => skill.id === item.skillId)).toBe(true);
      }
    }
    expect(new Set(ids).size).toBe(30);
  });

  it("intersects logarithm domains, excludes extraneous roots, and reverses decreasing-log inequalities", () => {
    expect(math.solveSameBaseLogEquation(2, 1, -1, 0, 3)).toEqual({ kind: "interval", lower: 4, upper: 4, lowerClosed: true, upperClosed: true });
    expect(math.solveSameBaseLogEquation(2, 1, 1, 1, -1)).toEqual({ kind: "empty" });
    expect(math.solveSameBaseLogInequality(0.5, 1, 0, 0, 2, "<")).toEqual({ kind: "interval", lower: 2, upper: null, lowerClosed: false, upperClosed: false });
    expect(math.solveSameBaseLogInequality(2, 1, 0, -1, 2, ">=")).toEqual({ kind: "interval", lower: 1, upper: 2, lowerClosed: true, upperClosed: false });
    expect(math.solveSameBaseLogInequality(1, 1, 0, 0, 1, "<")).toBeNull();
    expect(math.intersectSolutionSets([math.positiveLinearDomain(1, -2)!, math.positiveLinearDomain(-1, 5)!])).toEqual({ kind: "interval", lower: 2, upper: 5, lowerClosed: false, upperClosed: false });
  });

  it("bounds exponential models and logarithmic scale conversions", () => {
    expect(math.discreteExponentialModel(100, 10, 3, "growth")?.amount).toBeCloseTo(133.1);
    expect(math.discreteExponentialModel(100, 10, 3, "decay")?.amount).toBeCloseTo(72.9);
    expect(math.discreteExponentialModel(0, 10, 2, "growth")).toBeNull();
    expect(math.discreteExponentialModel(10, 100, 2, "decay")).toBeNull();
    expect(math.discreteExponentialModel(10, 5, 121, "growth")).toBeNull();
    expect(math.logarithmicScaleRatio(2, 10)).toBe(100);
    expect(math.logarithmicScaleRatio(100, 10)).toBeNull();
    expect(math.logarithmicScaleLevel(0, 1, 10)).toBeNull();
  });

  it("handles signed/coterminal angles, radians-only arc formulas, quadrants, axes and trig identities", () => {
    expect(math.coterminalAngleDegrees(-90)).toBe(270);
    expect(math.coterminalAngleDegrees(360)).toBe(0);
    expect(math.normalizeDegrees(36001)).toBeNull();
    expect(math.exactRadianMultipleOfPi(-90)).toBe("−π/2 rad");
    expect(math.radiansToDegrees(Math.PI)).toBeCloseTo(180);
    expect(math.arcLengthFromRadians(2, -Math.PI / 2)).toBeCloseTo(Math.PI);
    expect(math.sectorAreaFromRadians(2, -Math.PI / 2)).toBeCloseTo(Math.PI);
    expect(math.unitCircleCoordinates(120)).toMatchObject({ quadrant: "II", sine: { exact: "√3/2" }, cosine: { exact: "−1/2" } });
    expect(math.unitCircleCoordinates(270)).toMatchObject({ quadrant: "axis", tangent: null });
    expect(math.deriveSineFromCosine(-0.6, "II")).toBeCloseTo(0.8);
    expect(math.deriveSineFromCosine(-0.6, "I")).toBeNull();
    expect(math.pythagoreanIdentityValue(0.8, -0.6)).toBeCloseTo(1);
    expect(math.tangentFromSineCosine(1, 0)).toBeNull();
    expect(math.tangentFromSineCosine(0.5, 0.5)).toBeNull();
    expect(math.tangentFromSineCosine(0.8, -0.6)).toBeCloseTo(-4 / 3);
  });

  it("redacts server answers, blocks production preview, renders labelled labs, and isolates progress", () => {
    Reflect.set(process.env, "NODE_ENV", "development"); delete process.env.MATH90_CONTENT_PREVIEW;
    expect(publicProblems("practice", "M5-09", "proposal-preview")).toEqual([]);
    expect(draftLessonForPreview("M5-09")).toBeUndefined();
    Reflect.set(process.env, "NODE_ENV", "development"); process.env.MATH90_CONTENT_PREVIEW = "1";
    for (const unitId of units) {
      const visible = publicProblems("practice", unitId, "proposal-preview");
      expect(visible).toHaveLength(6);
      expect(JSON.stringify(visible)).not.toMatch(/answerRule|answerDisplay|explanation|steps/);
      const block = getDraftLessonForPreview(unitId)?.blocks.find((entry) => entry.type === "InteractiveBlock");
      if (block?.type !== "InteractiveBlock") throw new Error(`Missing interactive block: ${unitId}`);
      const html = renderToStaticMarkup(createElement(MathLab, { block, unitId }));
      expect(html).toContain('aria-live="polite"'); expect(html).toContain("aria-label=");
    }
    Reflect.set(process.env, "NODE_ENV", "production");
    for (const unitId of units) { expect(publicProblems("practice", unitId, "proposal-preview")).toEqual([]); expect(draftLessonForPreview(unitId)).toBeUndefined(); }

    const problem = proposalProblems.find((item) => item.unitId === "M5-09")!;
    const initial = { schemaVersion: 1 as const, profileId: "a1695b5a-a3d4-4554-b56f-e0aa6e60e4f0", attempts: [], completedBlocks: ["legacy"], assessmentScore: 72, unitProgress: {} };
    const submitted = applySubmission(initial, { unitId: problem.unitId, collection: "proposal-preview", requestId: "b28a8517-d38b-4d24-9a84-e0c8bcfbf889", answers: { [problem.id]: problem.answerRule.expected }, feedback: [{ status: "correct", message: "정답이에요!", unitId: problem.unitId, problemId: problem.id, version: problem.version, skillId: problem.skillId, purpose: "practice", answerDisplay: problem.answerDisplay, explanation: problem.explanation, steps: problem.steps }], hintUsed: false, purpose: "practice", at: "2026-11-07T00:00:00.000Z" });
    const completed = completeLearningBlock(submitted, "concept", "M5-09");
    expect(completed.completedBlocks).toEqual(["legacy"]); expect(completed.assessmentScore).toBe(72);
    expect(completed.unitProgress?.["M5-09"]?.completedBlocks).toEqual(["concept"]);
    expect(completed.unitProgress?.["M5-10"]).toBeUndefined(); expect(mastery(completed.attempts, problem.skillId)).toBe(0);
  });
});
