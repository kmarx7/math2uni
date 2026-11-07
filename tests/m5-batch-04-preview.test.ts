import { afterEach, describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { contentSchema } from "@/contracts";
import { proposalProblemBlueprintSchema } from "@/contracts/handoff";
import { curriculumProposal } from "@/data/curriculum-proposal";
import { getDraftLessonForPreview } from "@/data/proposal-lessons";
import { proposalProblemFamilies, proposalProblems } from "@/data/proposal-problems";
import { publicProblems, privateProblems } from "@/modules/question-bank/server";
import { draftLessonForPreview } from "@/modules/content/preview-server";
import { applySubmission, completeLearningBlock } from "@/modules/progress/mutations";
import { gradeAnswer } from "@/modules/math-validation";
import { mastery } from "@/modules/progress";
import { MathLab } from "@/components/math-lab";
import {
  cosineLawAngle,
  cosineLawThirdSide,
  includedAngleTriangleArea,
  sineLawSideFromPair,
  solveSsaTriangles,
  solveTrigEquation,
  solveTrigInequality,
  trigGraphProfile,
  type BoundedInterval,
} from "@/modules/math-validation/m5-14-m5-18-preview";
import bp14 from "../docs/research/NEXT_BATCH/M5-14/problem-blueprint.json";
import bp15 from "../docs/research/NEXT_BATCH/M5-15/problem-blueprint.json";
import bp16 from "../docs/research/NEXT_BATCH/M5-16/problem-blueprint.json";
import bp17 from "../docs/research/NEXT_BATCH/M5-17/problem-blueprint.json";
import bp18 from "../docs/research/NEXT_BATCH/M5-18/problem-blueprint.json";
import source14 from "../docs/specifications/NEXT_BATCH/M5-14/content-draft.json";
import source15 from "../docs/specifications/NEXT_BATCH/M5-15/content-draft.json";
import source16 from "../docs/specifications/NEXT_BATCH/M5-16/content-draft.json";
import source17 from "../docs/specifications/NEXT_BATCH/M5-17/content-draft.json";
import source18 from "../docs/specifications/NEXT_BATCH/M5-18/content-draft.json";
import runtime14 from "@/data/proposal-lessons/drafts/M5-14.json";
import runtime15 from "@/data/proposal-lessons/drafts/M5-15.json";
import runtime16 from "@/data/proposal-lessons/drafts/M5-16.json";
import runtime17 from "@/data/proposal-lessons/drafts/M5-17.json";
import runtime18 from "@/data/proposal-lessons/drafts/M5-18.json";

const units = ["M5-14", "M5-15", "M5-16", "M5-17", "M5-18"];
const blueprints = [bp14, bp15, bp16, bp17, bp18];
const sourceLessons = [source14, source15, source16, source17, source18];
const runtimeLessons = [runtime14, runtime15, runtime16, runtime17, runtime18];
const previousEnv = { node: process.env.NODE_ENV, preview: process.env.MATH90_CONTENT_PREVIEW };
afterEach(() => {
  Reflect.set(process.env, "NODE_ENV", previousEnv.node);
  if (previousEnv.preview === undefined) delete process.env.MATH90_CONTENT_PREVIEW;
  else process.env.MATH90_CONTENT_PREVIEW = previousEnv.preview;
});

describe("M5-14~M5-18 development preview", () => {
  it("registers matching schema-valid lessons with 15 phases, accessible labs and no assessment", () => {
    Reflect.set(process.env, "NODE_ENV", "development"); process.env.MATH90_CONTENT_PREVIEW = "1";
    for (const [index, unitId] of units.entries()) {
      const lesson = getDraftLessonForPreview(unitId);
      expect(contentSchema.parse(lesson)).toBeDefined();
      expect(lesson?.learningPhases).toHaveLength(15);
      expect(lesson?.blocks.some((block) => block.type === "InteractiveBlock")).toBe(true);
      expect(lesson?.blocks.some((block) => block.type === "AssessmentBlock")).toBe(false);
      expect(lesson).toEqual(contentSchema.parse(runtimeLessons[index]));
      expect(runtimeLessons[index]).toEqual(sourceLessons[index]);
      const block = lesson?.blocks.find((item) => item.type === "InteractiveBlock");
      if (block?.type !== "InteractiveBlock") throw new Error(`Missing lab block ${unitId}`);
      const html = renderToStaticMarkup(createElement(MathLab, { block, unitId }));
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain("aria-label=");
      if (unitId === "M5-14" || unitId === "M5-18") expect(html).toContain('role="img"');
      expect(draftLessonForPreview(unitId)).toBeDefined();
    }
  });

  it("parses five proposal blueprints and registers thirty unique draft practice problems", () => {
    const allIds: string[] = [];
    blueprints.forEach((input, index) => {
      const blueprint = proposalProblemBlueprintSchema.parse(input);
      const unitId = units[index]!;
      expect(blueprint.unitId).toBe(unitId);
      expect(blueprint.publicationApproved).toBe(false);
      expect(blueprint.officialMappingStatus).toBe("unverified");
      expect(blueprint.families).toHaveLength(3);
      const items = proposalProblems.filter((problem) => problem.unitId === unitId);
      expect(items).toHaveLength(6);
      expect(new Set(items.map((item) => item.familyId)).size).toBe(3);
      expect(privateProblems("assessment", unitId, "proposal-preview")).toEqual([]);
      for (const item of items) {
        allIds.push(item.id);
        expect(item.status).toBe("draft"); expect(item.purpose).toBe("practice");
        expect(item.reviewHistory).toEqual([]);
        expect(proposalProblemFamilies.some((family) => family.id === item.familyId)).toBe(true);
        expect(gradeAnswer(item.answerRule, item.answerRule.expected).status).toBe("correct");
        expect(curriculumProposal.curriculum.units.find((unit) => unit.id === unitId)?.concepts.some((skill) => skill.id === item.skillId)).toBe(true);
        expect(item.choices?.map((choice) => choice.id).sort()).toEqual(["A", "B", "C"]);
      }
    });
    expect(new Set(allIds).size).toBe(30);
    expect(proposalProblems.filter((item) => units.includes(item.unitId) && item.purpose === "assessment")).toEqual([]);
  });

  it("builds bounded transformed sine/cosine graphs and handles constant-function periods", () => {
    const graph = trigGraphProfile("sin", 2, -2, Math.PI / 4, 1);
    expect(graph).toMatchObject({ amplitude: 2, period: Math.PI, phaseShift: Math.PI / 4, verticalShift: 1, minimum: -1, maximum: 3, constant: false });
    expect(graph?.points).toHaveLength(33);
    expect(graph?.points[0]?.y).toBeCloseTo(1);
    expect(graph?.points[8]?.y).toBeCloseTo(-1);
    expect(trigGraphProfile("cos", 3, 0, 0, 2)).toMatchObject({ constant: true, period: null, minimum: 5, maximum: 5 });
    expect(trigGraphProfile("sin", 0, 2, 0, 4)).toMatchObject({ constant: true, period: null, minimum: 4, maximum: 4 });
    expect(trigGraphProfile("sin", 1, 13, 0, 0)).toBeNull();
  });

  it("solves trigonometric equations over finite radian intervals with endpoint rules", () => {
    const halfOpen: BoundedInterval = { lower: 0, upper: 2 * Math.PI, lowerClosed: true, upperClosed: false };
    const closed: BoundedInterval = { ...halfOpen, upperClosed: true };
    const sineRoots = solveTrigEquation("sin", 0.5, halfOpen)!;
    expect(sineRoots).toHaveLength(2); expect(sineRoots[0]! / Math.PI).toBeCloseTo(1 / 6); expect(sineRoots[1]! / Math.PI).toBeCloseTo(5 / 6);
    const cosineRoots = solveTrigEquation("cos", -0.5, halfOpen)!;
    expect(cosineRoots).toHaveLength(2); expect(cosineRoots[0]! / Math.PI).toBeCloseTo(2 / 3); expect(cosineRoots[1]! / Math.PI).toBeCloseTo(4 / 3);
    expect(solveTrigEquation("tan", 0, { lower: -Math.PI, upper: Math.PI, lowerClosed: true, upperClosed: true })?.map((value) => value / Math.PI)).toEqual([-1, 0, 1]);
    expect(solveTrigEquation("sin", 0, halfOpen)?.map((value) => value / Math.PI)).toEqual([0, 1]);
    expect(solveTrigEquation("sin", 0, closed)?.map((value) => value / Math.PI)).toEqual([0, 1, 2]);
    expect(solveTrigEquation("sin", 2, halfOpen)).toEqual([]);
    expect(solveTrigEquation("tan", 101, halfOpen)).toBeNull();
    expect(solveTrigEquation("cos", 0, { lower: -9 * Math.PI, upper: 0, lowerClosed: true, upperClosed: true })).toBeNull();
  });

  it("solves finite interval inequalities and excludes tangent poles", () => {
    const closed: BoundedInterval = { lower: 0, upper: 2 * Math.PI, lowerClosed: true, upperClosed: true };
    expect(solveTrigInequality("sin", 0, ">=", closed)).toEqual([
      { lower: 0, upper: Math.PI, lowerClosed: true, upperClosed: true },
      { lower: 2 * Math.PI, upper: 2 * Math.PI, lowerClosed: true, upperClosed: true },
    ]);
    expect(solveTrigInequality("cos", 0, "<", closed)).toEqual([
      { lower: Math.PI / 2, upper: 3 * Math.PI / 2, lowerClosed: false, upperClosed: false },
    ]);
    expect(solveTrigInequality("sin", 0, ">=", { lower: 0, upper: Math.PI, lowerClosed: false, upperClosed: false })).toEqual([
      { lower: 0, upper: Math.PI, lowerClosed: false, upperClosed: false },
    ]);
    expect(solveTrigInequality("tan", 0, ">", { lower: 0, upper: Math.PI, lowerClosed: true, upperClosed: true })).toEqual([
      { lower: 0, upper: Math.PI / 2, lowerClosed: false, upperClosed: false },
    ]);
    expect(solveTrigInequality("sin", 2, "<", closed)).toBeNull();
    expect(solveTrigInequality("sin", 0, ">=", { lower: 0, upper: 0, lowerClosed: true, upperClosed: false })).toEqual([]);
  });

  it("validates sine law correspondences and all zero/one/two SSA branches", () => {
    expect(sineLawSideFromPair(10, 30, 60)).toBeCloseTo(10 * Math.sqrt(3));
    expect(sineLawSideFromPair(10, 90, 90)).toBeNull();
    expect(solveSsaTriangles(10, 30, 12)?.status).toBe("two");
    const twoSolutions = solveSsaTriangles(10, 30, 12);
    expect(twoSolutions?.status).toBe("two");
    expect(twoSolutions?.candidates[0]?.angleBDegrees).toBeCloseTo(36.8698976458);
    expect(twoSolutions?.candidates[1]?.angleBDegrees).toBeCloseTo(143.1301023542);
    expect(solveSsaTriangles(10, 30, 10)?.status).toBe("one");
    expect(solveSsaTriangles(5, 30, 11)).toEqual({ status: "none", candidates: [] });
    expect(solveSsaTriangles(10, 30, 0)).toBeNull();
  });

  it("checks cosine-law triangle existence and included-angle area units", () => {
    expect(cosineLawThirdSide(3, 4, 90)).toBeCloseTo(5);
    expect(cosineLawThirdSide(3, 4, 0)).toBeNull();
    expect(cosineLawAngle(3, 4, 5)).toMatchObject({ angleDegrees: 90, kind: "right", cosine: 0 });
    expect(cosineLawAngle(3, 4, 6)?.kind).toBe("obtuse");
    expect(cosineLawAngle(1, 2, 3)).toBeNull();
    expect(cosineLawAngle(0, 2, 2)).toBeNull();
    expect(includedAngleTriangleArea(8, 5, 30)).toBeCloseTo(10);
    expect(includedAngleTriangleArea(8, 5, 180)).toBeNull();
    expect(includedAngleTriangleArea(-8, 5, 30)).toBeNull();
  });

  it("keeps answers private, preview development-only, and progress isolated per unit", () => {
    Reflect.set(process.env, "NODE_ENV", "development"); delete process.env.MATH90_CONTENT_PREVIEW;
    expect(publicProblems("practice", "M5-14", "proposal-preview")).toEqual([]);
    expect(draftLessonForPreview("M5-14")).toBeUndefined();
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
    const problem = proposalProblems.find((item) => item.unitId === "M5-14")!;
    const initial = { schemaVersion: 1 as const, profileId: "a1695b5a-a3d4-4554-b56f-e0aa6e60e4f0", attempts: [], completedBlocks: ["legacy"], assessmentScore: 72, unitProgress: {} };
    const submitted = applySubmission(initial, { unitId: problem.unitId, collection: "proposal-preview", requestId: "a1695b5a-d3d4-4554-b56f-e0aa6e60e4f1", answers: { [problem.id]: problem.answerRule.expected }, feedback: [{ status: "correct", message: "정답이에요!", unitId: problem.unitId, problemId: problem.id, version: problem.version, skillId: problem.skillId, purpose: "practice", answerDisplay: problem.answerDisplay, explanation: problem.explanation, steps: problem.steps }], hintUsed: false, purpose: "practice", at: "2026-11-07T00:00:00.000Z" });
    const completed = completeLearningBlock(submitted, "concept", "M5-14");
    expect(completed.completedBlocks).toEqual(["legacy"]);
    expect(completed.assessmentScore).toBe(72);
    expect(completed.unitProgress?.["M5-14"]?.completedBlocks).toEqual(["concept"]);
    expect(completed.unitProgress?.["M5-15"]).toBeUndefined();
    expect(mastery(completed.attempts, problem.skillId)).toBe(0);
  });
});
