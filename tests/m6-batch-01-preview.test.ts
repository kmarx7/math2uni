import { afterEach, describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { contentSchema } from "@/contracts";
import { proposalProblemBlueprintSchema } from "@/contracts/handoff";
import { MathLab } from "@/components/math-lab";
import { draftLessonForPreview } from "@/modules/content/preview-server";
import { applySubmission, completeLearningBlock } from "@/modules/progress/mutations";
import { gradeAnswer } from "@/modules/math-validation";
import { checkContinuity, continuousCubic, getBridgeScenario, getLimitCalculation, getLimitScenario, getSqueezeScenario, intermediateValueConclusion, twoSidedLimit } from "@/modules/math-validation/m5-24-m6-04-preview";
import { mastery } from "@/modules/progress";
import { curriculumProposal } from "@/data/curriculum-proposal";
import { getDraftLessonForPreview } from "@/data/proposal-lessons";
import { proposalProblemFamilies, proposalProblems } from "@/data/proposal-problems";
import { privateProblems, publicProblems } from "@/modules/question-bank/server";
import bp524 from "../docs/research/NEXT_BATCH/M5-24/problem-blueprint.json";
import bp601 from "../docs/research/NEXT_BATCH/M6-01/problem-blueprint.json";
import bp602 from "../docs/research/NEXT_BATCH/M6-02/problem-blueprint.json";
import bp603 from "../docs/research/NEXT_BATCH/M6-03/problem-blueprint.json";
import bp604 from "../docs/research/NEXT_BATCH/M6-04/problem-blueprint.json";
import source524 from "../docs/specifications/NEXT_BATCH/M5-24/content-draft.json";
import source601 from "../docs/specifications/NEXT_BATCH/M6-01/content-draft.json";
import source602 from "../docs/specifications/NEXT_BATCH/M6-02/content-draft.json";
import source603 from "../docs/specifications/NEXT_BATCH/M6-03/content-draft.json";
import source604 from "../docs/specifications/NEXT_BATCH/M6-04/content-draft.json";
import runtime524 from "@/data/proposal-lessons/drafts/M5-24.json";
import runtime601 from "@/data/proposal-lessons/drafts/M6-01.json";
import runtime602 from "@/data/proposal-lessons/drafts/M6-02.json";
import runtime603 from "@/data/proposal-lessons/drafts/M6-03.json";
import runtime604 from "@/data/proposal-lessons/drafts/M6-04.json";

const units = ["M5-24", "M6-01", "M6-02", "M6-03", "M6-04"];
const blueprints = [bp524, bp601, bp602, bp603, bp604];
const sourceLessons = [source524, source601, source602, source603, source604];
const runtimeLessons = [runtime524, runtime601, runtime602, runtime603, runtime604];
const previousEnv = { node: process.env.NODE_ENV, preview: process.env.MATH90_CONTENT_PREVIEW };
afterEach(() => {
  Reflect.set(process.env, "NODE_ENV", previousEnv.node);
  if (previousEnv.preview === undefined) delete process.env.MATH90_CONTENT_PREVIEW;
  else process.env.MATH90_CONTENT_PREVIEW = previousEnv.preview;
});

describe("M5-24 and M6-01~M6-04 preview", () => {
  it("registers schema-valid content, 15 phases, five labs and no assessment blocks", () => {
    Reflect.set(process.env, "NODE_ENV", "development"); process.env.MATH90_CONTENT_PREVIEW = "1";
    for (const [index, unitId] of units.entries()) {
      const lesson = getDraftLessonForPreview(unitId);
      expect(contentSchema.parse(lesson)).toBeDefined();
      expect(lesson?.learningPhases).toHaveLength(15);
      expect(lesson?.blocks.some((block) => block.type === "AssessmentBlock")).toBe(false);
      expect(lesson).toEqual(contentSchema.parse(runtimeLessons[index]));
      expect(runtimeLessons[index]).toEqual(sourceLessons[index]);
      const block = lesson?.blocks.find((item) => item.type === "InteractiveBlock");
      if (block?.type !== "InteractiveBlock") throw new Error(`Missing interactive block ${unitId}`);
      const html = renderToStaticMarkup(createElement(MathLab, { block, unitId }));
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain("aria-label=");
      expect(html).toContain('role="img"');
      expect(draftLessonForPreview(unitId)).toBeDefined();
    }
  });

  it("registers thirty distinct draft practice questions with valid semantic keys and no assessment", () => {
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

  it("separates one-sided limits, two-sided existence and point value using fixed cases", () => {
    expect(getLimitScenario("jump")).toMatchObject({ leftLimit: 1, rightLimit: 2, functionValue: 2 });
    expect(twoSidedLimit(1, 2)).toBeNull();
    expect(twoSidedLimit(2, 2)).toBe(2);
    expect(twoSidedLimit(null, 2)).toBeNull();
    expect(getLimitScenario("hole").functionValue).toBe(7);
  });

  it("enforces limit-law denominator conditions and preserves canceled-point exclusions", () => {
    expect(getLimitCalculation("sum").result).toBe(8);
    expect(getLimitCalculation("zero-denominator").result).toBeNull();
    expect(getLimitCalculation("cancel-hole")).toMatchObject({ result: 2, originalDefinedAtPoint: false });
  });

  it("applies squeeze only when bounds hold in a punctured neighborhood", () => {
    expect(getSqueezeScenario("squared-sine")).toMatchObject({ lowerLimit: 0, upperLimit: 0, conclusion: 0, validNearPoint: true });
    expect(getSqueezeScenario("point-only")).toMatchObject({ conclusion: null, validNearPoint: false });
    expect(getBridgeScenario("excluded-point").condition).toContain("x≠1");
  });

  it("checks interior and one-sided endpoint continuity conditions separately", () => {
    expect(checkContinuity("interior", 2, 2, 7).continuous).toBe(false);
    expect(checkContinuity("interior", 1, 2, 2).requiredLimitsExist).toBe(false);
    expect(checkContinuity("interior", 1, 1, 1).continuous).toBe(true);
    expect(checkContinuity("left-endpoint", null, 2, 2).continuous).toBe(true);
    expect(checkContinuity("right-endpoint", 2, null, 2).continuous).toBe(true);
    expect(checkContinuity("interior", 1e9, 1e9, 1e9).functionDefined).toBe(false);
  });

  it("limits IVT to existence under continuity and closed-interval endpoint conditions", () => {
    expect(continuousCubic(-2)).toBe(-6);
    expect(continuousCubic(2)).toBe(6);
    expect(continuousCubic(3)).toBeNull();
    expect(intermediateValueConclusion(-6, 6, 0, true)?.guaranteedAtLeastOne).toBe(true);
    expect(intermediateValueConclusion(-6, 6, 7, true)?.guaranteedAtLeastOne).toBe(false);
    expect(intermediateValueConclusion(-6, 6, 0, false)?.guaranteedAtLeastOne).toBe(false);
    expect(intermediateValueConclusion(-6, 6, 0, true)?.reason).toContain("유일성은 결론하지 않아요");
  });

  it("keeps keys private, preview development-only and progress isolated per unit", () => {
    Reflect.set(process.env, "NODE_ENV", "development"); delete process.env.MATH90_CONTENT_PREVIEW;
    expect(publicProblems("practice", "M5-24", "proposal-preview")).toEqual([]);
    expect(draftLessonForPreview("M5-24")).toBeUndefined();
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
    const problem = proposalProblems.find((item) => item.unitId === "M5-24")!;
    const initial = { schemaVersion: 1 as const, profileId: "a1695b5a-a3d4-4554-b56f-e0aa6e60e4f0", attempts: [], completedBlocks: ["legacy"], assessmentScore: 72, unitProgress: {} };
    const submitted = applySubmission(initial, { unitId: problem.unitId, collection: "proposal-preview", requestId: "a1695b5a-d3d4-4554-b56f-e0aa6e60e4f1", answers: { [problem.id]: problem.answerRule.expected }, feedback: [{ status: "correct", message: "정답이에요!", unitId: problem.unitId, problemId: problem.id, version: problem.version, skillId: problem.skillId, purpose: "practice", answerDisplay: problem.answerDisplay, explanation: problem.explanation, steps: problem.steps }], hintUsed: false, purpose: "practice", at: "2026-11-07T00:00:00.000Z" });
    const completed = completeLearningBlock(submitted, "concept", "M5-24");
    expect(completed.completedBlocks).toEqual(["legacy"]);
    expect(completed.assessmentScore).toBe(72);
    expect(completed.unitProgress?.["M5-24"]?.completedBlocks).toEqual(["concept"]);
    expect(completed.unitProgress?.["M6-01"]).toBeUndefined();
    expect(mastery(completed.attempts, problem.skillId)).toBe(0);
  });
});
