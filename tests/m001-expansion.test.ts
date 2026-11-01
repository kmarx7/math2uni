import {
  foundationFamilies,
  foundationProblems,
} from "@/data/level-zero-problems";
import { afterEach, describe, expect, it, vi } from "vitest";
import { lesson } from "@/data/content";
import { emptyProgress } from "@/modules/progress/repository";
import {
  applySubmission,
  completeLearningBlock,
} from "@/modules/progress/mutations";
import { isComplete } from "@/modules/progress";
import raw from "@/data/m001-expansion.json";
import { curriculum } from "@/data/curriculum";
import { families, fixedProblems } from "@/data/problems";
import {
  m001ExpansionFamilies,
  m001ExpansionProblems,
  m001ExpansionVerification,
  validateM001Expansion,
  verifyM001Answer,
  type M001Verification,
} from "@/data/m001-expansion";
import { canPublish } from "@/modules/administration";
import { scoreAssessment, scoreProblem } from "@/modules/assessment";
import { gradeAnswer } from "@/modules/math-validation";
import { toPublic, validateBank } from "@/modules/question-bank/core";
import {
  privateProblems,
  publicFamilies,
  publicProblems,
} from "@/modules/question-bank/server";

// A second implementation uses decimal strings, exact integer addition, and
// exhaustive permutations rather than the production arithmetic shortcuts.
function digitAt(number: number, place: number) {
  const index = String(number).length - String(place).length;
  return Number(String(number)[index] ?? 0);
}
function exactTerms(items: { count: number; unit: number }[]) {
  let total = 0n;
  for (const item of items)
    for (let i = 0; i < item.count; i++) total += BigInt(item.unit);
  return total;
}
function permutations(items: number[]): number[][] {
  return items.length === 0
    ? [[]]
    : items.flatMap((item, i) =>
        permutations(items.filter((_, j) => j !== i)).map((rest) => [
          item,
          ...rest,
        ]),
      );
}
function reference(check: M001Verification): string {
  switch (check.kind) {
    case "digit-value":
      return String(
        BigInt(digitAt(check.params.number, check.params.place)) *
          BigInt(check.params.place),
      );
    case "compose":
      return String(exactTerms(check.params.terms));
    case "constraint-number": {
      const { thousands, hundreds, ones, tensAdd, tensMultiplier } =
        check.params;
      const tens =
        tensAdd === undefined
          ? Array.from({ length: tensMultiplier! }, () => ones).reduce(
              (a, b) => a + b,
              0,
            )
          : ones + tensAdd;
      return `${thousands}${hundreds}${tens}${ones}`;
    }
    case "remove-zero":
      return String(
        parseInt(
          [...String(check.params.number)]
            .filter((_, i) => i !== check.params.zeroIndex)
            .join(""),
          10,
        ),
      );
    case "representation-match":
      return check.params.choices.filter(
        (choice) => exactTerms(choice.terms) === BigInt(check.params.number),
      )[0].id;
    case "regroup":
      return String(
        (BigInt(check.params.number) - exactTerms(check.params.knownTerms)) /
          BigInt(check.params.unknownUnit),
      );
    case "compare": {
      const sorted = check.params.numbers
        .map(String)
        .sort((a, b) => a.length - b.length || a.localeCompare(b));
      return check.params.ask === "greatest" ? sorted.at(-1)! : sorted[0];
    }
    case "digit-change": {
      const digits = [...String(check.params.number)];
      digits[digits.length - String(check.params.place).length] = String(
        check.params.newDigit,
      );
      const value = digits.join("");
      return check.params.ask === "difference"
        ? String(Math.abs(Number(value) - check.params.number))
        : value;
    }
    case "error-diagnosis":
      return check.params.claims.filter(
        (claim) =>
          digitAt(check.params.number, claim.place) !== claim.digit ||
          BigInt(claim.value) !== BigInt(claim.digit) * BigInt(claim.place),
      )[0].id;
    case "extrema": {
      const possible = permutations(check.params.digits)
        .filter((digits) => digits[0] !== 0)
        .map((digits) => Number(digits.join("")))
        .sort((a, b) => a - b);
      return String(
        check.params.mode === "greatest" ? possible.at(-1) : possible[0],
      );
    }
  }
}

afterEach(() => vi.unstubAllEnvs());
describe("M0-01 additive research drafts", () => {
  it("has ten distinct strategy families, 30 original drafts and 20/10 purpose split", () => {
    expect(m001ExpansionFamilies).toHaveLength(10);
    expect(new Set(m001ExpansionFamilies.map((family) => family.id)).size).toBe(
      10,
    );
    expect(
      new Set(m001ExpansionFamilies.map((family) => family.strategy)).size,
    ).toBe(10);
    expect(m001ExpansionProblems).toHaveLength(30);
    expect(
      m001ExpansionProblems.filter((problem) => problem.purpose === "practice"),
    ).toHaveLength(20);
    expect(
      m001ExpansionProblems.filter(
        (problem) => problem.purpose === "assessment",
      ),
    ).toHaveLength(10);
    expect(m001ExpansionVerification).toHaveLength(30);
    for (const family of m001ExpansionFamilies) {
      const problems = m001ExpansionProblems.filter(
        (problem) => problem.familyId === family.id,
      );
      expect(problems).toHaveLength(3);
      expect(
        problems.filter((problem) => problem.purpose === "practice"),
      ).toHaveLength(2);
      expect(
        problems.filter((problem) => problem.purpose === "assessment"),
      ).toHaveLength(1);
    }
    expect(validateM001Expansion()).toEqual([]);
    expect(
      validateBank(
        m001ExpansionProblems,
        curriculum.units,
        m001ExpansionFamilies,
      ),
    ).toEqual([]);
    expect(
      validateBank(
        [...fixedProblems, ...m001ExpansionProblems],
        curriculum.units,
        m001ExpansionFamilies,
      ),
    ).toEqual([]);
    const allFamilies = [
      ...new Map(
        [...families, ...foundationFamilies, ...m001ExpansionFamilies].map(
          (family) => [family.id, family],
        ),
      ).values(),
    ];
    const allFixed = [
      ...fixedProblems,
      ...foundationProblems,
      ...m001ExpansionProblems,
    ];
    expect(allFamilies).toHaveLength(40);
    expect(allFixed).toHaveLength(102);
    expect(validateBank(allFixed, curriculum.units, allFamilies)).toEqual([]);
    for (const family of families)
      expect(
        m001ExpansionFamilies.find((candidate) => candidate.id === family.id),
      ).toEqual(family);
  });
  it("recalculates every answer using an independent reference model and checks grading/explanations", () => {
    for (const problem of m001ExpansionProblems) {
      const check = m001ExpansionVerification.find(
        (candidate) => candidate.problemId === problem.id,
      )!;
      const independentlyCalculated = reference(check);
      expect(problem.answerRule.expected, problem.id).toBe(
        independentlyCalculated,
      );
      expect(verifyM001Answer(check), problem.id).toBe(independentlyCalculated);
      expect(
        scoreProblem(problem, independentlyCalculated).status,
        problem.id,
      ).toBe("correct");
      expect(problem.steps.join(" "), problem.id).toContain(
        problem.answerDisplay,
      );
      expect(problem.explanation, problem.id).toContain(problem.answerDisplay);
      expect(problem.steps.length, problem.id).toBeGreaterThanOrEqual(2);
    }
  });
  it("ensures choice labels and numeric alternatives contain exactly one correct answer", () => {
    for (const problem of m001ExpansionProblems.filter(
      (candidate) => candidate.input === "choice",
    )) {
      const choices = problem.choices!;
      expect(new Set(choices.map((choice) => choice.id)).size).toBe(
        choices.length,
      );
      expect(
        new Set(choices.map((choice) => choice.label.replace(/[\s,]/g, "")))
          .size,
      ).toBe(choices.length);
      expect(
        choices.filter(
          (choice) =>
            gradeAnswer(problem.answerRule, choice.id).status === "correct",
        ),
      ).toHaveLength(1);
      const check = m001ExpansionVerification.find(
        (candidate) => candidate.problemId === problem.id,
      )!;
      if (check.kind === "representation-match")
        expect(
          check.params.choices.filter(
            (choice) =>
              exactTerms(choice.terms) === BigInt(check.params.number),
          ),
        ).toHaveLength(1);
      if (check.kind === "error-diagnosis")
        expect(
          check.params.claims.filter(
            (claim) =>
              digitAt(check.params.number, claim.place) !== claim.digit ||
              claim.value !== claim.digit * claim.place,
          ),
        ).toHaveLength(1);
    }
  });
  it("rejects invalid parameters rather than inventing a valid mathematical result", () => {
    expect(() =>
      verifyM001Answer({
        problemId: "invalid",
        kind: "remove-zero",
        params: { number: 4052, zeroIndex: 0, ask: "number" },
      }),
    ).toThrow();
    expect(() =>
      verifyM001Answer({
        problemId: "invalid",
        kind: "constraint-number",
        params: { thousands: 2, hundreds: 0, ones: 8, tensMultiplier: 2 },
      }),
    ).toThrow();
    expect(() =>
      verifyM001Answer({
        problemId: "invalid",
        kind: "regroup",
        params: {
          number: 4052,
          knownTerms: [{ count: 4, unit: 1000 }],
          unknownUnit: 100,
        },
      }),
    ).toThrow();
    expect(() =>
      verifyM001Answer({
        problemId: "invalid",
        kind: "digit-change",
        params: { number: 4052, place: 1000, newDigit: 0, ask: "result" },
      }),
    ).toThrow();
    expect(() =>
      verifyM001Answer({
        problemId: "invalid",
        kind: "representation-match",
        params: {
          number: 100,
          choices: [
            { id: "a", terms: [{ count: 1, unit: 100 }] },
            { id: "b", terms: [{ count: 10, unit: 10 }] },
          ],
        },
      }),
    ).toThrow();
    expect(() =>
      verifyM001Answer({
        problemId: "invalid",
        kind: "extrema",
        params: { digits: [0, 0], mode: "smallest" },
      }),
    ).toThrow();
  });
  it("blocks wrong answer keys and duplicated correct alternatives before preview", () => {
    const wrong = structuredClone(raw);
    wrong.problems[0].answerRule.expected = "601";
    expect(validateM001Expansion(wrong).join()).toContain("정답 계산 불일치");
    const duplicate = structuredClone(raw);
    const check = duplicate.verification.find(
      (item) => item.kind === "representation-match",
    )!;
    const choices = check.params.choices!;
    choices[0].terms = structuredClone(choices[1].terms);
    expect(validateM001Expansion(duplicate).join()).toContain("수학 제약 실패");
    const alteredLabel = structuredClone(raw);
    alteredLabel.problems.find(
      (problem) => problem.familyId === "m001x-representation-match",
    )!.choices![0].label = "9999";
    expect(validateM001Expansion(alteredLabel).join()).toContain(
      "보기 수치와 검증 입력 불일치",
    );
    const missing = structuredClone(raw);
    missing.verification.pop();
    expect(validateM001Expansion(missing).join()).toContain("스키마 오류");
  });
  it("preserves the core bank and scopes public family metadata to the selected collection", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("MATH90_CONTENT_PREVIEW", "1");
    expect(privateProblems("assessment")).toHaveLength(3);
    expect(privateProblems("practice")).toHaveLength(5);
    expect(privateProblems("assessment", "M0-01", "extended")).toHaveLength(10);
    expect(privateProblems("practice", "M0-01", "extended")).toHaveLength(20);
    expect(privateProblems("practice", "M0-02", "extended")).toEqual([]);
    expect(publicFamilies("practice", "M0-01", "extended")).toHaveLength(10);
    expect(publicFamilies("practice", "M0-01", "core")).toHaveLength(3);
    const assessment = privateProblems("assessment", "M0-01", "extended");
    expect(() => scoreAssessment(assessment, {})).toThrow();
    const answers = Object.fromEntries(
      assessment.map((problem) => [problem.id, problem.answerRule.expected]),
    );
    expect(scoreAssessment(assessment, answers).score).toBe(100);
    expect(() =>
      scoreAssessment(privateProblems("assessment"), answers),
    ).toThrow();
  });
  it("preserves a completed legacy unit when optional extended attempts are wrong", () => {
    let state = emptyProgress("124d3c71-9359-4cf2-b111-9ba5502df231");
    const at = "2026-11-01T00:00:00.000Z";
    for (const purpose of ["practice", "assessment"] as const) {
      const problems = fixedProblems.filter(
        (problem) => problem.purpose === purpose,
      );
      state = applySubmission(state, {
        collection: "core",
        unitId: "M0-01",
        requestId: `core-${purpose}`,
        answers: Object.fromEntries(
          problems.map((problem) => [problem.id, problem.answerRule.expected]),
        ),
        feedback: problems.map((problem) =>
          scoreProblem(problem, problem.answerRule.expected),
        ),
        purpose,
        hintUsed: false,
        score: purpose === "assessment" ? 100 : undefined,
        at,
      });
    }
    for (const block of lesson.blocks)
      state = completeLearningBlock(state, block.id, "M0-01");
    expect(
      isComplete(
        state,
        curriculum.units[0],
        lesson.blocks.map((block) => block.id),
      ),
    ).toBe(true);
    const coreAttempts = structuredClone(state.attempts);
    const answers = Object.fromEntries(
      m001ExpansionProblems.map((problem) => [
        problem.id,
        problem.input === "choice"
          ? problem.choices!.find(
              (choice) => choice.id !== problem.answerRule.expected,
            )!.id
          : "0",
      ]),
    );
    for (const purpose of ["practice", "assessment"] as const) {
      state = applySubmission(state, {
        collection: "extended",
        unitId: "M0-01",
        requestId: `extended-wrong-${purpose}`,
        answers,
        feedback: m001ExpansionProblems
          .filter((problem) => problem.purpose === purpose)
          .map((problem) => scoreProblem(problem, answers[problem.id])),
        purpose,
        hintUsed: false,
        at,
      });
    }
    expect(state.attempts.slice(0, 6)).toEqual(coreAttempts);
    expect(
      state.attempts
        .slice(6)
        .every((attempt) => attempt.collection === "extended"),
    ).toBe(true);
    expect(state.assessmentScore).toBe(100);
    expect(
      isComplete(
        state,
        curriculum.units[0],
        lesson.blocks.map((block) => block.id),
      ),
    ).toBe(true);
  });
  it("keeps every new draft unapproved and private in production even with preview enabled", () => {
    for (const problem of m001ExpansionProblems) {
      expect(problem.status).toBe("draft");
      expect(problem.reviewHistory).toEqual([]);
      expect(canPublish(problem)).toBe(false);
      expect(problem.provenance.aiGenerated).toBe(true);
      expect(problem.provenance.license).toBe("project-original");
      const dto = toPublic(problem);
      for (const key of [
        "answerRule",
        "answerDisplay",
        "explanation",
        "steps",
        "reviewHistory",
        "provenance",
      ])
        expect(dto).not.toHaveProperty(key);
    }
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MATH90_CONTENT_PREVIEW", "1");
    expect(publicProblems("practice", "M0-01", "extended")).toEqual([]);
    expect(publicProblems("assessment", "M0-01", "extended")).toEqual([]);
    expect(publicFamilies("practice", "M0-01", "extended")).toEqual([]);
  });
});
