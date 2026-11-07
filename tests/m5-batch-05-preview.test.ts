import { afterEach, describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { contentSchema } from "@/contracts";
import { proposalProblemBlueprintSchema } from "@/contracts/handoff";
import { MathLab } from "@/components/math-lab";
import { draftLessonForPreview } from "@/modules/content/preview-server";
import { applySubmission, completeLearningBlock } from "@/modules/progress/mutations";
import { gradeAnswer } from "@/modules/math-validation";
import { mastery } from "@/modules/progress";
import {
  arithmeticSum, arithmeticTerm, geometricSum, geometricTerms, inductionProgress, sequenceTerms, sigmaSum,
} from "@/modules/math-validation/m5-19-m5-23-preview";
import { curriculumProposal } from "@/data/curriculum-proposal";
import { getDraftLessonForPreview } from "@/data/proposal-lessons";
import { proposalProblemFamilies, proposalProblems } from "@/data/proposal-problems";
import { privateProblems, publicProblems } from "@/modules/question-bank/server";
import bp19 from "../docs/research/NEXT_BATCH/M5-19/problem-blueprint.json";
import bp20 from "../docs/research/NEXT_BATCH/M5-20/problem-blueprint.json";
import bp21 from "../docs/research/NEXT_BATCH/M5-21/problem-blueprint.json";
import bp22 from "../docs/research/NEXT_BATCH/M5-22/problem-blueprint.json";
import bp23 from "../docs/research/NEXT_BATCH/M5-23/problem-blueprint.json";
import source19 from "../docs/specifications/NEXT_BATCH/M5-19/content-draft.json";
import source20 from "../docs/specifications/NEXT_BATCH/M5-20/content-draft.json";
import source21 from "../docs/specifications/NEXT_BATCH/M5-21/content-draft.json";
import source22 from "../docs/specifications/NEXT_BATCH/M5-22/content-draft.json";
import source23 from "../docs/specifications/NEXT_BATCH/M5-23/content-draft.json";
import runtime19 from "@/data/proposal-lessons/drafts/M5-19.json";
import runtime20 from "@/data/proposal-lessons/drafts/M5-20.json";
import runtime21 from "@/data/proposal-lessons/drafts/M5-21.json";
import runtime22 from "@/data/proposal-lessons/drafts/M5-22.json";
import runtime23 from "@/data/proposal-lessons/drafts/M5-23.json";

const units = ["M5-19", "M5-20", "M5-21", "M5-22", "M5-23"];
const blueprints = [bp19, bp20, bp21, bp22, bp23];
const sourceLessons = [source19, source20, source21, source22, source23];
const runtimeLessons = [runtime19, runtime20, runtime21, runtime22, runtime23];
const previousEnv = { node: process.env.NODE_ENV, preview: process.env.MATH90_CONTENT_PREVIEW };
afterEach(() => {
  Reflect.set(process.env, "NODE_ENV", previousEnv.node);
  if (previousEnv.preview === undefined) delete process.env.MATH90_CONTENT_PREVIEW;
  else process.env.MATH90_CONTENT_PREVIEW = previousEnv.preview;
});

describe("M5-19~M5-23 development preview", () => {
  it("registers schema-valid renderer lessons and keyboard-accessible labs without assessments", () => {
    Reflect.set(process.env, "NODE_ENV", "development"); process.env.MATH90_CONTENT_PREVIEW = "1";
    for (const [index, unitId] of units.entries()) {
      const lesson = getDraftLessonForPreview(unitId);
      expect(contentSchema.parse(lesson)).toBeDefined();
      expect(lesson?.learningPhases).toHaveLength(15);
      expect(lesson?.blocks.some((block) => block.type === "AssessmentBlock")).toBe(false);
      expect(lesson).toEqual(contentSchema.parse(runtimeLessons[index]));
      expect(runtimeLessons[index]).toEqual(sourceLessons[index]);
      const block = lesson?.blocks.find((item) => item.type === "InteractiveBlock");
      if (block?.type !== "InteractiveBlock") throw new Error(`Missing lab block ${unitId}`);
      const html = renderToStaticMarkup(createElement(MathLab, { block, unitId }));
      expect(html).toContain('aria-live="polite"');
      expect(html.includes("aria-label=") || html.includes("<button")).toBe(true);
      expect(draftLessonForPreview(unitId)).toBeDefined();
    }
  });

  it("parses five proposal blueprints and registers only thirty draft practice items", () => {
    const ids: string[] = [];
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
        ids.push(item.id);
        expect(item.status).toBe("draft"); expect(item.purpose).toBe("practice");
        expect(item.reviewHistory).toEqual([]);
        expect(proposalProblemFamilies.some((family) => family.id === item.familyId)).toBe(true);
        expect(gradeAnswer(item.answerRule, item.answerRule.expected).status).toBe("correct");
        expect(curriculumProposal.curriculum.units.find((unit) => unit.id === unitId)?.concepts.some((skill) => skill.id === item.skillId)).toBe(true);
        expect(item.choices?.map((choice) => choice.id).sort()).toEqual(["A", "B", "C"]);
      }
    });
    expect(new Set(ids).size).toBe(30);
    expect(proposalProblems.filter((item) => units.includes(item.unitId) && item.purpose === "assessment")).toEqual([]);
  });

  it("handles explicit finite sequence examples without evaluating arbitrary formulas", () => {
    expect(sequenceTerms("linear", 4)).toEqual([1, 2, 3, 4]);
    expect(sequenceTerms("squares", 4)).toEqual([1, 2, 3, 10]);
    expect(sequenceTerms("alternating", 4, 0)).toEqual([0, -1, 2, -3]);
    expect(sequenceTerms("linear", 101)).toBeNull();
    expect(sequenceTerms("linear", 3, -1)).toBeNull();
  });

  it("computes arithmetic terms and sums for positive, zero, and negative differences", () => {
    expect(arithmeticTerm(3, -2, 5)).toBe(-5);
    expect(arithmeticSum(3, -2, 5)).toBe(-5);
    expect(arithmeticTerm(4, 0, 10)).toBe(4);
    expect(arithmeticSum(4, 0, 6)).toBe(24);
    expect(arithmeticTerm(1, 2, 0)).toBeNull();
    expect(arithmeticSum(1, 1, 101)).toBeNull();
  });

  it("handles geometric q=0, q=1, negative ratio and bounded overflow", () => {
    expect(geometricTerms(2, 0, 4)).toEqual([2, 0, 0, 0]);
    expect(geometricSum(2, 0, 4)).toBe(2);
    expect(geometricSum(5, 1, 4)).toBe(20);
    expect(geometricTerms(2, -2, 4)).toEqual([2, -4, 8, -16]);
    expect(geometricSum(2, -2, 4)).toBe(-10);
    expect(geometricTerms(1, 100, 10)).toBeNull();
    expect(geometricTerms(1, 2, 101)).toBeNull();
  });

  it("sums inclusive sigma ranges and handles empty and unsafe bounds", () => {
    expect(sigmaSum("linear", 1, 4, 1, 0)).toBe(10);
    expect(sigmaSum("square", 1, 5)).toBe(55);
    expect(sigmaSum("cube", 1, 4)).toBe(100);
    expect(sigmaSum("constant", 3, 2, 1, 7)).toBe(0);
    expect(sigmaSum("square", 1, 10_001)).toBeNull();
  });

  it("tracks induction proof structure without claiming symbolic proof", () => {
    expect(inductionProgress([])).toEqual({ completed: [], next: "base", complete: false });
    expect(inductionProgress(["base", "hypothesis"])).toEqual({ completed: ["base", "hypothesis"], next: "step", complete: false });
    expect(inductionProgress(["base", "hypothesis", "step", "conclusion"])).toEqual({ completed: ["base", "hypothesis", "step", "conclusion"], next: null, complete: true });
    expect(inductionProgress(["base", "step"])).toBeNull();
  });

  it("keeps answer data private, preview development-only, and progress isolated per unit", () => {
    Reflect.set(process.env, "NODE_ENV", "development"); delete process.env.MATH90_CONTENT_PREVIEW;
    expect(publicProblems("practice", "M5-19", "proposal-preview")).toEqual([]);
    expect(draftLessonForPreview("M5-19")).toBeUndefined();
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
    const problem = proposalProblems.find((item) => item.unitId === "M5-19")!;
    const initial = { schemaVersion: 1 as const, profileId: "a1695b5a-a3d4-4554-b56f-e0aa6e60e4f0", attempts: [], completedBlocks: ["legacy"], assessmentScore: 72, unitProgress: {} };
    const submitted = applySubmission(initial, { unitId: problem.unitId, collection: "proposal-preview", requestId: "a1695b5a-d3d4-4554-b56f-e0aa6e60e4f1", answers: { [problem.id]: problem.answerRule.expected }, feedback: [{ status: "correct", message: "정답이에요!", unitId: problem.unitId, problemId: problem.id, version: problem.version, skillId: problem.skillId, purpose: "practice", answerDisplay: problem.answerDisplay, explanation: problem.explanation, steps: problem.steps }], hintUsed: false, purpose: "practice", at: "2026-11-07T00:00:00.000Z" });
    const completed = completeLearningBlock(submitted, "concept", "M5-19");
    expect(completed.completedBlocks).toEqual(["legacy"]);
    expect(completed.assessmentScore).toBe(72);
    expect(completed.unitProgress?.["M5-19"]?.completedBlocks).toEqual(["concept"]);
    expect(completed.unitProgress?.["M5-20"]).toBeUndefined();
    expect(mastery(completed.attempts, problem.skillId)).toBe(0);
  });
});
