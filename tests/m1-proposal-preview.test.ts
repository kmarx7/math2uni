import { afterEach, describe, expect, it } from "vitest";
import { getDraftLessonForPreview, getDraftUnitForPreview } from "@/data/proposal-lessons";
import { proposalProblems, proposalProblemFamilies } from "@/data/proposal-problems";
import { curriculumProposal } from "@/data/curriculum-proposal";
import { gradeAnswer } from "@/modules/math-validation";
import { scoreProblem } from "@/modules/assessment";
import { lessonForDelivery } from "@/modules/content/server";
import { draftLessonForPreview, draftUnitForPreview } from "@/modules/content/preview-server";
import { privateProblems, publicProblems } from "@/modules/question-bank/server";

const originalNodeEnv = process.env.NODE_ENV;
const originalPreview = process.env.MATH90_CONTENT_PREVIEW;
const setNodeEnv = (value: string) => Reflect.set(process.env, "NODE_ENV", value);
afterEach(() => {
  setNodeEnv(originalNodeEnv);
  if (originalPreview === undefined) delete process.env.MATH90_CONTENT_PREVIEW;
  else process.env.MATH90_CONTENT_PREVIEW = originalPreview;
});

describe("M1 proposal preview boundary", () => {
  it("keeps five draft lessons outside production delivery", () => {
    setNodeEnv("production");
    process.env.MATH90_CONTENT_PREVIEW = "1";
    for (const unitId of ["M1-01", "M1-02", "M1-03", "M1-04", "M1-05"]) {
      expect(getDraftUnitForPreview(unitId)?.status).toBe("draft");
      expect(getDraftLessonForPreview(unitId)?.learningPhases).toHaveLength(15);
      const lesson = getDraftLessonForPreview(unitId)!;
      const concept = lesson.blocks.find((block) => block.id === "concept");
      expect(concept?.type).toBe("ExplanationBlock");
      expect(concept?.type === "ExplanationBlock" ? concept.sections : []).toHaveLength(6);
      expect(lesson.blocks.some((block) => block.type === "AssessmentBlock")).toBe(false);
      expect(lessonForDelivery(unitId)).toBeUndefined();
      expect(draftUnitForPreview(unitId)).toBeUndefined();
      expect(draftLessonForPreview(unitId)).toBeUndefined();
    }
  });

  it("validates all 30 draft instances against the proposal units", () => {
    expect(proposalProblems).toHaveLength(30);
    expect(new Set(proposalProblems.map((problem) => problem.id)).size).toBe(30);
    expect(new Set(proposalProblems.map((problem) => problem.prompt.replace(/[\s,]/g, ""))).size).toBe(30);
    expect(proposalProblems.every((problem) => problem.status === "draft" && problem.reviewHistory.length === 0)).toBe(true);
    for (const problem of proposalProblems) {
      expect(curriculumProposal.curriculum.units.find((unit) => unit.id === problem.unitId)?.concepts.some((skill) => skill.id === problem.skillId)).toBe(true);
      expect(proposalProblemFamilies.some((family) => family.id === problem.familyId)).toBe(true);
      expect(gradeAnswer(problem.answerRule, problem.answerRule.expected).status).toBe("correct");
      expect(problem.explanation).toContain(problem.answerDisplay);
      expect(problem.steps.join(" ")).toContain(problem.answerDisplay);
      expect(scoreProblem(problem, problem.answerRule.expected).status).toBe("correct");
    }
  });

  it("serves answer-free practice DTOs only in development preview", () => {
    setNodeEnv("development");
    process.env.MATH90_CONTENT_PREVIEW = "1";
    expect(draftUnitForPreview("M1-01")?.status).toBe("draft");
    expect(draftLessonForPreview("M1-01")?.unitId).toBe("M1-01");
    expect(draftUnitForPreview("M1-06")).toBeUndefined();
    const publicSet = publicProblems("practice", "M1-01");
    expect(publicSet).toHaveLength(6);
    expect(JSON.stringify(publicSet)).not.toMatch(/answerRule|explanation|steps/);
    expect(privateProblems("assessment", "M1-01")).toEqual([]);
    setNodeEnv("production");
    expect(publicProblems("practice", "M1-01")).toEqual([]);
  });
});
