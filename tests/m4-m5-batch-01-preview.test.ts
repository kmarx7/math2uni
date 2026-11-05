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
  commonDomainOnIntegers, linearRadicalDomain, logarithm, logarithmDirection,
  rationalPower, realPower, rootRealDomain,
} from "@/modules/math-validation/m4-19-m5-03-preview";
import { MathLab } from "@/components/math-lab";

const previousEnv = { node: process.env.NODE_ENV, preview: process.env.MATH90_CONTENT_PREVIEW };
afterEach(() => {
  Reflect.set(process.env, "NODE_ENV", previousEnv.node);
  if (previousEnv.preview === undefined) delete process.env.MATH90_CONTENT_PREVIEW;
  else process.env.MATH90_CONTENT_PREVIEW = previousEnv.preview;
});

const units = ["M4-19", "M4-20", "M5-01", "M5-02", "M5-03"];

describe("M4-19~M5-03 development preview", () => {
  it("registers five schema-valid draft lessons with 15 phases and no assessment items", () => {
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

  it("keeps 30 unique draft practice items in distinct families with no assessment collection", () => {
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
        const unit = curriculumProposal.curriculum.units.find((candidate) => candidate.id === unitId)!;
        if (unitId === "M4-20") {
          expect(item.skillId).toMatch(/^m4-20-local-review-/);
          expect(unit.concepts.some((skill) => skill.id === item.skillId)).toBe(false);
        } else {
          expect(unit.concepts.some((skill) => skill.id === item.skillId)).toBe(true);
        }
        if (item.answerRule.kind === "choice") {
          expect(item.choices?.filter((choice) => choice.id === item.answerRule.expected)).toHaveLength(1);
          expect(new Set(item.choices?.map((choice) => choice.id)).size).toBe(item.choices?.length);
          expect(new Set(item.choices?.map((choice) => choice.label)).size).toBe(item.choices?.length);
        }
      }
      const choiceAnswers = items.filter((item) => item.answerRule.kind === "choice").map((item) => item.answerRule.expected);
      expect(new Set(choiceAnswers).size).toBeGreaterThan(1);
    }
    expect(new Set(ids).size).toBe(30);
    expect(new Set(proposalProblems.filter((problem) => units.includes(problem.unitId)).map((problem) => problem.prompt)).size).toBe(30);
    expect(proposalProblems.filter((problem) => units.includes(problem.unitId) && problem.purpose === "assessment")).toEqual([]);
  });

  it("keeps answers private and blocks draft preview content in production", () => {
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

  it("checks domain and exponent/logarithm boundary conditions", () => {
    expect(linearRadicalDomain(2, -4)).toEqual({ lower: 2, upper: null, lowerClosed: true, upperClosed: false });
    expect(linearRadicalDomain(-2, 4)).toEqual({ lower: null, upper: 2, lowerClosed: false, upperClosed: true });
    expect(linearRadicalDomain(0, 2)).toEqual({ lower: null, upper: null, lowerClosed: false, upperClosed: false });
    expect(linearRadicalDomain(0, -1)).toBeNull();
    expect(rootRealDomain(-8, 3)).toBe(true);
    expect(rootRealDomain(-8, 2)).toBe(false);
    expect(rationalPower(-8, 2, 3)).toBe(4);
    expect(rationalPower(-8, 1, 2)).toBeNull();
    expect(rationalPower(0, -1, 3)).toBeNull();
    expect(rationalPower(0, 0, 3)).toBeNull();
    expect(realPower(2, 1.5)).toBeCloseTo(2.828427, 5);
    expect(realPower(0, 2)).toBeNull();
    expect(realPower(-2, 2)).toBeNull();
    expect(logarithm(2, 8)).toBeCloseTo(3);
    expect(logarithm(1, 8)).toBeNull();
    expect(logarithm(2, 0)).toBeNull();
    expect(logarithmDirection(2)).toBe("increasing");
    expect(logarithmDirection(0.5)).toBe("decreasing");
    expect(logarithmDirection(1)).toBeNull();
    expect(commonDomainOnIntegers([-1, 0, 1, 2, 3], [(x) => x >= 1, (x) => x !== 2])).toEqual([1, 3]);
    expect(proposalProblems.filter((item) => item.unitId === "M4-20").every((item) => item.skillId.startsWith("m4-20-local-review-"))).toBe(true);
  });

  it("renders labelled labs and the intended mathematical constraints", () => {
    const expected = ["근호 안이 0인 경계값을 포함", "새 정의를 추가하지 않으며", "유리수 지수와 거듭제곱근", "양수 밑에서 다뤄요", "a&gt;1이므로 로그 함수는 증가해요"];
    units.forEach((unitId, index) => {
      const block = getDraftLessonForPreview(unitId)?.blocks.find((candidate) => candidate.type === "InteractiveBlock");
      if (block?.type !== "InteractiveBlock") throw new Error(`missing lab for ${unitId}`);
      const html = renderToStaticMarkup(createElement(MathLab, { block, unitId }));
      expect(html).toContain(expected[index]);
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain("aria-label=");
      if (unitId === "M5-01") {
        expect(html).toContain('aria-label="양수 밑"');
        expect(html).toContain("선택 활동: 음수 밑과 기약분수 분모의 홀짝 조건");
      }
      if (unitId === "M4-20") expect(html).toContain("표본 목록은 설명용이며 전체 실수 정의역을 대신하지 않아요.");
    });
  });

  it("stores progress per unit without overwriting legacy root records", () => {
    const problem = proposalProblems.find((item) => item.unitId === "M4-19")!;
    const initial = { schemaVersion: 1 as const, profileId: "a1695b5a-a3d4-4554-b56f-e0aa6e60e4f0", attempts: [], completedBlocks: ["legacy"], assessmentScore: 73, unitProgress: {} };
    const next = applySubmission(initial, { unitId: problem.unitId, collection: "proposal-preview", requestId: "d75a817e-7855-4ac0-b699-799242022d38", answers: { [problem.id]: problem.answerRule.expected }, feedback: [], hintUsed: false, purpose: "practice", at: "2026-11-05T00:00:00.000Z" });
    const done = completeLearningBlock(next, "concept", "M4-19");
    expect(done.completedBlocks).toEqual(["legacy"]);
    expect(done.assessmentScore).toBe(73);
    expect(done.unitProgress?.["M4-19"]?.completedBlocks).toEqual(["concept"]);
    expect(done.unitProgress?.["M5-01"]).toBeUndefined();
    const synthesisItem = proposalProblems.find((item) => item.unitId === "M4-20")!;
    const synthesisAttempt = applySubmission(initial, { unitId: "M4-20", collection: "proposal-preview", requestId: "5f39207f-1d28-4052-bb0c-c0e7197b287d", answers: { [synthesisItem.id]: synthesisItem.answerRule.expected }, feedback: [{ status: "correct", message: "정답이에요!", unitId: "M4-20", problemId: synthesisItem.id, version: synthesisItem.version, skillId: synthesisItem.skillId, purpose: "practice", answerDisplay: synthesisItem.answerDisplay, explanation: synthesisItem.explanation, steps: synthesisItem.steps }], hintUsed: false, purpose: "practice", at: "2026-11-05T00:00:00.000Z" });
    expect(synthesisAttempt.attempts).toHaveLength(1);
    expect(synthesisAttempt.attempts[0].skillId).toMatch(/^m4-20-local-review-/);
    expect(mastery(synthesisAttempt.attempts, synthesisItem.skillId)).toBe(0);
  });
});
