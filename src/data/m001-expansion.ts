import "server-only";
// Private draft bank. Application code imports this only through question-bank/server.
import { z } from "zod";
import {
  id,
  problemSchema,
  type ProblemFamily,
  type ProblemInstance,
} from "@/contracts";
import raw from "./m001-expansion.json";

const natural = z.number().int().min(1).max(9999);
const digit = z.number().int().min(0).max(9);
const place = z.union([
  z.literal(1),
  z.literal(10),
  z.literal(100),
  z.literal(1000),
]);
const term = z
  .object({ count: z.number().int().min(0).max(9999), unit: place })
  .strict();
const terms = z.array(term).min(1).max(8);
const base = { problemId: id };
export const m001VerificationSchema = z.discriminatedUnion("kind", [
  z.object({
    ...base,
    kind: z.literal("digit-value"),
    params: z.object({ number: natural, place }).strict(),
  }),
  z.object({
    ...base,
    kind: z.literal("compose"),
    params: z.object({ terms }).strict(),
  }),
  z.object({
    ...base,
    kind: z.literal("constraint-number"),
    params: z
      .object({
        thousands: digit,
        hundreds: digit,
        ones: digit,
        tensMultiplier: z.number().int().min(0).max(9).optional(),
        tensAdd: z.number().int().min(-9).max(9).optional(),
      })
      .strict(),
  }),
  z.object({
    ...base,
    kind: z.literal("remove-zero"),
    params: z
      .object({
        number: natural,
        zeroIndex: z.number().int().min(0).max(3),
        ask: z.literal("number"),
      })
      .strict(),
  }),
  z.object({
    ...base,
    kind: z.literal("representation-match"),
    params: z
      .object({
        number: natural,
        choices: z.array(z.object({ id, terms }).strict()).min(2).max(6),
      })
      .strict(),
  }),
  z.object({
    ...base,
    kind: z.literal("regroup"),
    params: z
      .object({ number: natural, knownTerms: terms, unknownUnit: place })
      .strict(),
  }),
  z.object({
    ...base,
    kind: z.literal("compare"),
    params: z
      .object({
        numbers: z.array(natural).min(2).max(6),
        ask: z.enum(["greatest", "smallest"]),
      })
      .strict(),
  }),
  z.object({
    ...base,
    kind: z.literal("digit-change"),
    params: z
      .object({
        number: natural,
        place,
        newDigit: digit,
        ask: z.enum(["result", "difference"]),
      })
      .strict(),
  }),
  z.object({
    ...base,
    kind: z.literal("error-diagnosis"),
    params: z
      .object({
        number: natural,
        claims: z
          .array(
            z
              .object({
                id,
                place,
                digit,
                value: z.number().int().min(0).max(9000),
              })
              .strict(),
          )
          .min(2)
          .max(6),
        ask: z.literal("incorrect"),
      })
      .strict(),
  }),
  z.object({
    ...base,
    kind: z.literal("extrema"),
    params: z
      .object({
        digits: z.array(digit).min(2).max(4),
        mode: z.enum(["greatest", "smallest"]),
      })
      .strict(),
  }),
]);
export type M001Verification = z.infer<typeof m001VerificationSchema>;
const draftSchema = z
  .object({
    families: z
      .array(z.object({ id, title: id, strategy: id }).strict())
      .length(10),
    problems: z.array(problemSchema).min(30),
    verification: z.array(m001VerificationSchema).min(30),
  })
  .strict();
const parsed = draftSchema.parse(raw);
export const m001ExpansionFamilies: ProblemFamily[] = parsed.families;
export const m001ExpansionProblems: ProblemInstance[] = parsed.problems;
export const m001ExpansionVerification = parsed.verification;
const termTotal = (items: z.infer<typeof terms>) =>
  items.reduce((sum, item) => sum + item.count * item.unit, 0);

/** Small bounded arithmetic verifier; never evaluates text, expressions or code. */
export function verifyM001Answer(check: M001Verification): string {
  switch (check.kind) {
    case "digit-value":
      return String(
        (Math.floor(check.params.number / check.params.place) % 10) *
          check.params.place,
      );
    case "compose":
      return String(termTotal(check.params.terms));
    case "constraint-number": {
      const { thousands, hundreds, ones, tensMultiplier, tensAdd } =
        check.params;
      if (
        (tensMultiplier === undefined) === (tensAdd === undefined) ||
        thousands === 0
      )
        throw new Error(
          "자리 조건은 하나의 연산과 0이 아닌 천의 자리가 필요합니다.",
        );
      const tens =
        tensMultiplier === undefined ? ones + tensAdd! : ones * tensMultiplier;
      if (tens < 0 || tens > 9)
        throw new Error("조건을 만족하는 십의 자리 숫자가 없습니다.");
      return String(thousands * 1000 + hundreds * 100 + tens * 10 + ones);
    }
    case "remove-zero": {
      const digits = String(check.params.number);
      if (digits[check.params.zeroIndex] !== "0")
        throw new Error("지우는 자리에 0이 없습니다.");
      return String(
        Number(
          digits.slice(0, check.params.zeroIndex) +
            digits.slice(check.params.zeroIndex + 1),
        ),
      );
    }
    case "representation-match": {
      const correct = check.params.choices.filter(
        (choice) => termTotal(choice.terms) === check.params.number,
      );
      if (correct.length !== 1)
        throw new Error("같은 수를 나타내는 보기가 하나여야 합니다.");
      return correct[0].id;
    }
    case "regroup": {
      const result =
        (check.params.number - termTotal(check.params.knownTerms)) /
        check.params.unknownUnit;
      if (!Number.isInteger(result) || result < 0)
        throw new Error("묶음 수는 음이 아닌 정수여야 합니다.");
      return String(result);
    }
    case "compare":
      return String(
        check.params.ask === "greatest"
          ? Math.max(...check.params.numbers)
          : Math.min(...check.params.numbers),
      );
    case "digit-change": {
      const { number, place, newDigit } = check.params;
      if (place > number || (number < place * 10 && newDigit === 0))
        throw new Error("존재하는 자리를 바꾸고 맨 앞자리 0을 피해야 합니다.");
      const result =
        number - (Math.floor(number / place) % 10) * place + newDigit * place;
      return String(
        check.params.ask === "difference" ? Math.abs(result - number) : result,
      );
    }
    case "error-diagnosis": {
      const incorrect = check.params.claims.filter(
        (claim) =>
          claim.digit !== Math.floor(check.params.number / claim.place) % 10 ||
          claim.value !== claim.digit * claim.place,
      );
      if (incorrect.length !== 1)
        throw new Error("틀린 설명이 하나여야 합니다.");
      return incorrect[0].id;
    }
    case "extrema": {
      const digits = [...check.params.digits].sort((a, b) => a - b);
      if (digits.every((value) => value === 0))
        throw new Error("자연수를 만들 수 없습니다.");
      if (check.params.mode === "greatest") digits.reverse();
      else if (digits[0] === 0) {
        const nonzero = digits.findIndex((value) => value !== 0);
        [digits[0], digits[nonzero]] = [digits[nonzero], digits[0]];
      }
      return digits.join("");
    }
  }
}

export function validateM001Expansion(input: unknown = raw): string[] {
  const validated = draftSchema.safeParse(input);
  if (!validated.success)
    return validated.error.issues.map(
      (issue) => `확장 스키마 오류 ${issue.path.join(".")}: ${issue.message}`,
    );
  const { families, problems, verification } = validated.data;
  const errors: string[] = [];
  const ids = new Set<string>();
  const checks = new Map<string, M001Verification>();
  for (const check of verification) {
    if (checks.has(check.problemId))
      errors.push(`검증 입력 중복 ${check.problemId}`);
    checks.set(check.problemId, check);
  }
  for (const problem of problems) {
    if (ids.has(problem.id)) errors.push(`문항 ID 중복 ${problem.id}`);
    ids.add(problem.id);
    if (
      problem.unitId !== "M0-01" ||
      !["place", "compose", "infer"].includes(problem.skillId)
    )
      errors.push(`단원/기술 범위 오류 ${problem.id}`);
    if (problem.status !== "draft" || problem.reviewHistory.length)
      errors.push(`초안에 검수·승인을 사칭할 수 없습니다 ${problem.id}`);
    if (!families.some((family) => family.id === problem.familyId))
      errors.push(`원형 참조 오류 ${problem.id}`);
    const check = checks.get(problem.id);
    if (!check) {
      errors.push(`독립 검증 입력 누락 ${problem.id}`);
      continue;
    }
    try {
      const expected = verifyM001Answer(check);
      if (problem.answerRule.expected !== expected)
        errors.push(`정답 계산 불일치 ${problem.id}`);
      if (problem.input !== problem.answerRule.kind)
        errors.push(`입력/규칙 불일치 ${problem.id}`);
      if (problem.input === "choice") {
        const labels = problem.choices?.map((choice) =>
          choice.label.replace(/[\s,]/g, ""),
        );
        if (
          !labels ||
          new Set(labels).size !== labels.length ||
          new Set(problem.choices?.map((choice) => choice.id)).size !==
            labels.length ||
          !problem.choices?.some((choice) => choice.id === expected)
        )
          errors.push(`중복/누락 선택지 ${problem.id}`);
        if (
          check.kind === "representation-match" ||
          check.kind === "error-diagnosis"
        ) {
          const oracleIds = (
            check.kind === "representation-match"
              ? check.params.choices
              : check.params.claims
          )
            .map((choice) => choice.id)
            .sort();
          if (
            JSON.stringify(oracleIds) !==
            JSON.stringify(problem.choices?.map((choice) => choice.id).sort())
          )
            errors.push(`검증 보기와 문항 보기 불일치 ${problem.id}`);
        }
        if (check.kind === "representation-match") {
          for (const choice of check.params.choices) {
            const label = problem.choices
              ?.find((candidate) => candidate.id === choice.id)
              ?.label.replace(/,/g, "");
            if (
              !label ||
              !/^\d{1,5}(?:\s*\+\s*\d{1,5})*$/.test(label) ||
              label
                .split("+")
                .reduce((sum, value) => sum + Number(value.trim()), 0) !==
                termTotal(choice.terms)
            )
              errors.push(`보기 수치와 검증 입력 불일치 ${problem.id}`);
          }
        }
        if (check.kind === "error-diagnosis") {
          const placeNames: Record<number, string> = {
            1: "일",
            10: "십",
            100: "백",
            1000: "천",
          };
          for (const claim of check.params.claims) {
            const expectedLabel = `${placeNames[claim.place]}의 자리 숫자는 ${claim.digit}이고, 나타내는 값은 ${claim.value}이다.`;
            if (
              problem.choices?.find((candidate) => candidate.id === claim.id)
                ?.label !== expectedLabel
            )
              errors.push(`보기 주장과 검증 입력 불일치 ${problem.id}`);
          }
        }
      } else if (problem.input !== "integer")
        errors.push(`M0-01 지원 밖 입력 ${problem.id}`);
      if (
        !problem.explanation.includes(problem.answerDisplay) ||
        !problem.steps.join(" ").includes(problem.answerDisplay)
      )
        errors.push(`해설 정답 불일치 ${problem.id}`);
    } catch (error) {
      errors.push(
        `수학 제약 실패 ${problem.id}: ${error instanceof Error ? error.message : "unknown"}`,
      );
    }
  }
  for (const check of checks.keys())
    if (!ids.has(check)) errors.push(`문항 없는 검증 입력 ${check}`);
  return errors;
}
