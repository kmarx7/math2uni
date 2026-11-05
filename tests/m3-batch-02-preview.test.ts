import { afterEach, describe, expect, it } from "vitest";
import { getDraftLessonForPreview, getDraftUnitForPreview } from "@/data/proposal-lessons";
import { proposalProblems, proposalAssessmentProblems, proposalProblemFamilies } from "@/data/proposal-problems";
import { publicProblems, privateProblems } from "@/modules/question-bank/server";
import { scoreProblem } from "@/modules/assessment";
import { gradeAnswer } from "@/modules/math-validation";
import { factorTheoremValue, complexAdd, complexDivide, complexMultiply, quadraticDiscriminant } from "@/modules/math-validation/m3-preview";
import { lessonForDelivery } from "@/modules/content/server";
import { draftLessonForPreview } from "@/modules/content/preview-server";
import { applySubmission, completeLearningBlock } from "@/modules/progress/mutations";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { M3MathLab } from "@/components/m3-math-labs";

const oldNodeEnv = process.env.NODE_ENV;
const oldPreview = process.env.MATH90_CONTENT_PREVIEW;
afterEach(() => {
  Reflect.set(process.env, "NODE_ENV", oldNodeEnv);
  if (oldPreview === undefined) delete process.env.MATH90_CONTENT_PREVIEW;
  else process.env.MATH90_CONTENT_PREVIEW = oldPreview;
});

describe("M3-06~M3-10 개발 미리보기", () => {
  const unitIds = ["M3-06", "M3-07", "M3-08", "M3-09", "M3-10"];
  it("loads five draft lessons with 15 phases, six concepts and the specified interactive lab", () => {
    const interactions = ["factor-theorem", "polynomial-factorization", "complex-plane", "complex-operations", "quadratic-discriminant"];
    unitIds.forEach((unitId, index) => {
      expect(getDraftUnitForPreview(unitId)?.status).toBe("draft");
      const lesson = getDraftLessonForPreview(unitId)!;
      expect(lesson.learningPhases).toHaveLength(15);
      expect(lesson.blocks.some((block) => block.type === "AssessmentBlock")).toBe(false);
      const concept = lesson.blocks.find((block) => block.id === "concept");
      expect(concept?.type === "ExplanationBlock" ? concept.sections : []).toHaveLength(6);
      const lab = lesson.blocks.find((block) => block.type === "InteractiveBlock");
      expect(lab?.type === "InteractiveBlock" ? lab.interaction : undefined).toBe(interactions[index]);
      expect(lessonForDelivery(unitId)).toBeUndefined();
    });
  });

  it("registers 30 draft practice items in 15 reasoning families with no assessments or approvals", () => {
    for (const unitId of unitIds) {
      const problems = proposalProblems.filter((problem) => problem.unitId === unitId);
      expect(problems).toHaveLength(6);
      expect(new Set(problems.map((problem) => problem.familyId)).size).toBe(3);
      expect(problems.every((problem) => problem.purpose === "practice" && problem.status === "draft" && problem.reviewHistory.length === 0)).toBe(true);
      for (const problem of problems) {
        expect(proposalProblemFamilies.some((family) => family.id === problem.familyId)).toBe(true);
        expect(gradeAnswer(problem.answerRule, problem.answerRule.expected).status).toBe("correct");
        expect(scoreProblem(problem, problem.answerRule.expected).status).toBe("correct");
        expect(problem.explanation).toContain(problem.answerDisplay);
      }
      expect(proposalAssessmentProblems.some((problem) => problem.unitId === unitId)).toBe(false);
    }
    expect(proposalProblems).toHaveLength(510);
    expect(new Set(proposalProblems.map((problem) => problem.id)).size).toBe(510);
    expect(new Set(proposalProblems.map((problem) => problem.prompt.replace(/[\s,]/g, ""))).size).toBe(510);
  });

  it("keeps answer data private, allows practice only in development preview, and blocks production", () => {
    Reflect.set(process.env, "NODE_ENV", "development");
    process.env.MATH90_CONTENT_PREVIEW = "1";
    for (const unitId of unitIds) {
      const exposed = publicProblems("practice", unitId, "proposal-preview");
      expect(exposed).toHaveLength(6);
      expect(JSON.stringify(exposed)).not.toMatch(/answerRule|answerDisplay|explanation|steps/);
      expect(publicProblems("assessment", unitId, "proposal-preview")).toEqual([]);
      expect(privateProblems("assessment", unitId, "proposal-preview")).toEqual([]);
    }
    Reflect.set(process.env, "NODE_ENV", "production");
    for (const unitId of unitIds) {
      expect(publicProblems("practice", unitId, "proposal-preview")).toEqual([]);
      expect(draftLessonForPreview(unitId)).toBeUndefined();
    }
  });

  it("checks independent arithmetic used by the five interactive labs", () => {
    expect(factorTheoremValue(2)).toBe(0);
    expect(factorTheoremValue(3)).toBe(0);
    expect(factorTheoremValue(0)).toBe(6);
    expect(complexAdd({ real: 1, imaginary: 2 }, { real: 3, imaginary: -4 })).toEqual({ real: 4, imaginary: -2 });
    expect(complexMultiply({ real: 1, imaginary: 2 }, { real: 3, imaginary: -4 })).toEqual({ real: 11, imaginary: 2 });
    expect(complexDivide({ real: 3, imaginary: 2 }, { real: 1, imaginary: -1 })).toEqual({ real: 0.5, imaginary: 2.5 });
    expect(complexDivide({ real: 1, imaginary: 2 }, { real: 0, imaginary: 0 })).toBeNull();
    expect(quadraticDiscriminant(1, 2, 1)).toEqual({ value: 0, roots: "repeated-real" });
    expect(quadraticDiscriminant(1, 0, 1)).toEqual({ value: -4, roots: "two-complex" });
    expect(quadraticDiscriminant(0, 2, 1)).toBeNull();
  });

  it("renders keyboard-operated controls and readable results for every new lab", () => {
    for (const unitId of unitIds) {
      const lab = getDraftLessonForPreview(unitId)?.blocks.find((block) => block.type === "InteractiveBlock");
      expect(lab?.type).toBe("InteractiveBlock");
      if (lab?.type !== "InteractiveBlock") throw new Error(`lab missing for ${unitId}`);
      const markup = renderToStaticMarkup(createElement(M3MathLab, { block: lab }));
      expect(markup).toContain('type="range"');
      expect(markup).toContain('aria-label=');
      expect(markup).toContain('aria-live="polite"');
      expect(markup).toContain('class="helper"');
    }
  });

  it("stores M3 preview attempts and completed blocks under unitProgress without changing the legacy root", () => {
    const problem = proposalProblems.find((item) => item.unitId === "M3-06")!;
    const feedback = scoreProblem(problem, problem.answerRule.expected);
    const initial = { schemaVersion: 1 as const, profileId: "a1695b5a-a3d4-4554-b56f-e0aa6e60e4f0", attempts: [], completedBlocks: ["legacy-root"], assessmentScore: 73, unitProgress: {} };
    const submitted = applySubmission(initial, { unitId: problem.unitId, collection: "proposal-preview", requestId: "c3a98bd9-33d6-430c-9842-8ecc9e8c2e96", answers: { [problem.id]: problem.answerRule.expected }, feedback: [feedback], hintUsed: false, purpose: "practice", at: "2026-11-03T00:00:00.000Z" });
    expect(submitted.completedBlocks).toEqual(["legacy-root"]);
    expect(submitted.assessmentScore).toBe(73);
    expect(submitted.attempts[0]?.unitId).toBe("M3-06");
    expect(submitted.attempts[0]?.collection).toBe("proposal-preview");
    const completed = completeLearningBlock(submitted, "concept", "M3-06");
    expect(completed.completedBlocks).toEqual(["legacy-root"]);
    expect(completed.unitProgress?.["M3-06"]?.completedBlocks).toEqual(["concept"]);
  });
});
