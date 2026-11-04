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
import {
  implicationForms, isSubset, setComplement, setDifference, setIntersection,
  setUnion, truthSet, partitionMembership,
} from "@/modules/math-validation/m4-09-13-preview";
import { MathLab } from "@/components/math-lab";

const previousEnv = { node: process.env.NODE_ENV, preview: process.env.MATH90_CONTENT_PREVIEW };
afterEach(() => {
  Reflect.set(process.env, "NODE_ENV", previousEnv.node);
  if (previousEnv.preview === undefined) delete process.env.MATH90_CONTENT_PREVIEW;
  else process.env.MATH90_CONTENT_PREVIEW = previousEnv.preview;
});

const units = ["M4-09", "M4-10", "M4-11", "M4-12", "M4-13"];

describe("M4-09~M4-13 development preview", () => {
  it("registers five schema-valid 15-phase lesson drafts without an assessment block", () => {
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

  it("keeps each unit at six draft practice items across three distinct families", () => {
    const ids: string[] = [];
    for (const unitId of units) {
      const items = proposalProblems.filter((problem) => problem.unitId === unitId);
      expect(items).toHaveLength(6);
      expect(new Set(items.map((problem) => problem.familyId)).size).toBe(3);
      expect(privateProblems("assessment", unitId, "proposal-preview")).toEqual([]);
      for (const item of items) {
        ids.push(item.id);
        expect(item.status).toBe("draft");
        expect(item.purpose).toBe("practice");
        expect(item.reviewHistory).toEqual([]);
        expect(proposalProblemFamilies.some((family) => family.id === item.familyId)).toBe(true);
        expect(gradeAnswer(item.answerRule, item.answerRule.expected).status).toBe("correct");
        const meta = curriculumProposal.curriculum.units.find((unit) => unit.id === unitId)!;
        expect(meta.concepts.some((skill) => skill.id === item.skillId)).toBe(true);
        if (item.answerRule.kind === "choice") expect(item.choices?.some((choice) => choice.id === item.answerRule.expected)).toBe(true);
      }
    }
    expect(new Set(ids).size).toBe(30);
    expect(new Set(proposalProblems.filter((problem) => units.includes(problem.unitId)).map((problem) => problem.prompt)).size).toBe(30);
    expect(proposalProblems.filter((problem) => units.includes(problem.unitId) && problem.purpose === "assessment")).toEqual([]);
  });

  it("keeps answers server-side and denies drafts outside development preview", () => {
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

  it("supports bounded set, truth-set, and proposition logic calculations", () => {
    const universe = [1, 2, 3, 4, 5, 6];
    expect(setUnion([1, 3], [3, 5], universe)).toEqual([1, 3, 5]);
    expect(setIntersection([1, 3, 5], [2, 3, 5], universe)).toEqual([3, 5]);
    expect(setComplement([2, 4], universe)).toEqual([1, 3, 5, 6]);
    expect(setDifference([1, 3, 5], [3], universe)).toEqual([1, 5]);
    expect(isSubset([2, 4], [1, 2, 3, 4])).toBe(true);
    expect(isSubset([2, 5], [1, 2, 3, 4])).toBe(false);
    expect(partitionMembership(universe, [1, 2, 4], [2, 3, 5])).toEqual({ onlyA: [1, 4], both: [2], onlyB: [3, 5], outside: [6] });
    expect(truthSet(universe, (n) => n % 2 === 0)).toEqual([2, 4, 6]);
    for (const p of [false, true]) for (const q of [false, true]) {
      const result = implicationForms(p, q);
      expect(result.original).toBe(result.contrapositive);
      expect(result.converse).toBe(result.inverse);
    }
  });

  it("renders accessible unit-specific labs with text alternatives and labelled controls", () => {
    const expected = ["원소 ∈", "전체집합 U", "진리집합 T=", "원명제 p⇒q", "증명 단계"];
    units.forEach((unitId, index) => {
      const block = getDraftLessonForPreview(unitId)?.blocks.find((candidate) => candidate.type === "InteractiveBlock");
      if (block?.type !== "InteractiveBlock") throw new Error(`missing lab: ${unitId}`);
      const html = renderToStaticMarkup(createElement(MathLab, { block, unitId }));
      expect(html).toContain(expected[index]);
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain("aria-label=");
      if (unitId === "M4-09") expect(html).toContain("A⊆B는 참");
      if (unitId === "M4-10") expect(html).toContain("A∪B = {1, 2, 3, 4, 5}");
      if (unitId === "M4-13") {
        expect(html).toContain("n²이 홀수라고 가정한다");
        expect(html).toContain("만약 n이 짝수라면");
        expect(html).not.toContain("n이 짝수 아님, 즉 n=2k+1이라 가정한다");
      }
    });
  });

  it("stores work under the unitProgress key and preserves legacy M0 root records", () => {
    const problem = proposalProblems.find((item) => item.unitId === "M4-09")!;
    const initial = { schemaVersion: 1 as const, profileId: "a1695b5a-a3d4-4554-b56f-e0aa6e60e4f0", attempts: [], completedBlocks: ["legacy"], assessmentScore: 73, unitProgress: {} };
    const next = applySubmission(initial, { unitId: problem.unitId, collection: "proposal-preview", requestId: "7e2f30df-7834-4c55-8555-123456789abc", answers: { [problem.id]: problem.answerRule.expected }, feedback: [], hintUsed: false, purpose: "practice", at: "2026-11-04T00:00:00.000Z" });
    const done = completeLearningBlock(next, "concept", "M4-09");
    expect(done.completedBlocks).toEqual(["legacy"]);
    expect(done.assessmentScore).toBe(73);
    expect(done.unitProgress?.["M4-09"]?.completedBlocks).toEqual(["concept"]);
    expect(done.unitProgress?.["M4-10"]).toBeUndefined();
  });
});
