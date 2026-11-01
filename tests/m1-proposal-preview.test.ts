import { afterEach, describe, expect, it } from "vitest";
import { getDraftLessonForPreview, getDraftUnitForPreview } from "@/data/proposal-lessons";
import { proposalProblems, proposalProblemFamilies, proposalAssessmentProblems } from "@/data/proposal-problems";
import { curriculumProposal } from "@/data/curriculum-proposal";
import { gradeAnswer } from "@/modules/math-validation";
import { scoreProblem } from "@/modules/assessment";
import { lessonForDelivery } from "@/modules/content/server";
import { draftLessonForPreview, draftUnitForPreview } from "@/modules/content/preview-server";
import { privateProblems, publicProblems } from "@/modules/question-bank/server";
import { scoreAssessment } from "@/modules/assessment";
import { mastery, reviewSchedule, wrongAnswers } from "@/modules/progress";

const originalNodeEnv = process.env.NODE_ENV;
const originalPreview = process.env.MATH90_CONTENT_PREVIEW;
const setNodeEnv = (value: string) => Reflect.set(process.env, "NODE_ENV", value);
afterEach(() => {
  setNodeEnv(originalNodeEnv);
  if (originalPreview === undefined) delete process.env.MATH90_CONTENT_PREVIEW;
  else process.env.MATH90_CONTENT_PREVIEW = originalPreview;
});

describe("M1 proposal preview boundary", () => {
  it("keeps ten draft lessons outside production delivery", () => {
    setNodeEnv("production");
    process.env.MATH90_CONTENT_PREVIEW = "1";
    for (const unitId of Array.from({ length: 10 }, (_, index) => `M1-${String(index + 1).padStart(2, "0")}`)) {
      expect(getDraftUnitForPreview(unitId)?.status).toBe("draft");
      expect(getDraftLessonForPreview(unitId)?.learningPhases).toHaveLength(15);
      const lesson = getDraftLessonForPreview(unitId)!;
      const concept = lesson.blocks.find((block) => block.id === "concept");
      expect(concept?.type).toBe("ExplanationBlock");
      expect(concept?.type === "ExplanationBlock" ? concept.sections : []).toHaveLength(6);
      expect(lesson.blocks.some((block) => block.type === "AssessmentBlock")).toBe(Number(unitId.slice(-2)) <= 5);
      expect(lessonForDelivery(unitId)).toBeUndefined();
      expect(draftUnitForPreview(unitId)).toBeUndefined();
      expect(draftLessonForPreview(unitId)).toBeUndefined();
    }
  });

  it("validates 60 practice and 15 separate assessment draft instances", () => {
    expect(proposalProblems).toHaveLength(60);
    expect(proposalAssessmentProblems).toHaveLength(15);
    expect(new Set([...proposalProblems, ...proposalAssessmentProblems].map((problem) => problem.id)).size).toBe(75);
    expect(new Set(proposalProblems.map((problem) => problem.prompt.replace(/[\s,]/g, ""))).size).toBe(60);
    expect(proposalProblems.every((problem) => problem.status === "draft" && problem.reviewHistory.length === 0)).toBe(true);
    for (const problem of proposalProblems) {
      expect(curriculumProposal.curriculum.units.find((unit) => unit.id === problem.unitId)?.concepts.some((skill) => skill.id === problem.skillId)).toBe(true);
      expect(proposalProblemFamilies.some((family) => family.id === problem.familyId)).toBe(true);
      expect(gradeAnswer(problem.answerRule, problem.answerRule.expected).status).toBe("correct");
      expect(problem.explanation).toContain(problem.answerDisplay);
      expect(problem.steps.join(" ")).toContain(problem.answerDisplay);
      expect(scoreProblem(problem, problem.answerRule.expected).status).toBe("correct");
    }
    for (const problem of proposalAssessmentProblems) {
      expect(problem.purpose).toBe("assessment");
      expect(problem.status).toBe("draft");
      expect(problem.reviewHistory).toEqual([]);
      expect(problem.provenance.aiGenerated).toBe(true);
      expect(gradeAnswer(problem.answerRule, problem.answerRule.expected).status).toBe("correct");
      expect(scoreProblem(problem, problem.answerRule.expected).status).toBe("correct");
    }
    const firstAssessment = proposalAssessmentProblems.filter((problem) => problem.unitId === "M1-01");
    const fullAnswers = Object.fromEntries(firstAssessment.map((problem) => [problem.id, problem.answerRule.expected]));
    expect(scoreAssessment(firstAssessment, fullAnswers).score).toBe(100);
    expect(() => scoreAssessment(firstAssessment, { [firstAssessment[0].id]: firstAssessment[0].answerRule.expected })).toThrow();
  });

  it("serves answer-free practice DTOs only in development preview", () => {
    setNodeEnv("development");
    process.env.MATH90_CONTENT_PREVIEW = "1";
    expect(draftUnitForPreview("M1-01")?.status).toBe("draft");
    expect(draftLessonForPreview("M1-01")?.unitId).toBe("M1-01");
    expect(draftUnitForPreview("M1-06")?.status).toBe("draft");
    const publicSet = publicProblems("practice", "M1-01", "proposal-preview");
    expect(publicSet).toHaveLength(6);
    expect(JSON.stringify(publicSet)).not.toMatch(/answerRule|explanation|steps/);
    const publicAssessment = publicProblems("assessment", "M1-01", "proposal-preview");
    expect(publicAssessment).toHaveLength(3);
    expect(JSON.stringify(publicAssessment)).not.toMatch(/answerRule|answerDisplay|explanation|steps/);
    expect(privateProblems("assessment", "M1-06", "proposal-preview")).toEqual([]);
    expect(privateProblems("assessment", "M1-01", "proposal-preview")).toHaveLength(3);
    setNodeEnv("production");
    expect(publicProblems("practice", "M1-01", "proposal-preview")).toEqual([]);
  });

  it("keeps preview attempts out of official mastery and review lists", () => {
    const attempt = {
      collection: "proposal-preview" as const,
      unitId: "M1-01",
      id: "preview-attempt",
      problemId: "a-m1-01-a101-01",
      version: "0.1.0-draft",
      skillId: "m1-01-c1",
      purpose: "assessment" as const,
      answer: "B",
      correct: true,
      hintUsed: false,
      retry: false,
      at: "2026-11-02T00:00:00.000Z",
      feedback: { answerDisplay: "-7, -4, 1", explanation: "x", steps: ["x"] },
    };
    expect(mastery([attempt], attempt.skillId)).toBe(0);
    expect(reviewSchedule([attempt])).toEqual([]);
    expect(wrongAnswers([attempt])).toEqual([]);
    expect(mastery([{ ...attempt, collection: "extended" }], attempt.skillId)).toBe(0);
    expect(reviewSchedule([{ ...attempt, collection: "extended" }])).toHaveLength(1);
  });
});
