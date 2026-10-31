import type { AnswerRule, Grade } from "@/contracts";
function rational(
  value: string,
  kind: AnswerRule["kind"],
): [bigint, bigint] | null {
  if (kind === "integer")
    return /^[-+]?\d{1,12}$/.test(value) ? [BigInt(value), 1n] : null;
  if (kind === "fraction") {
    if (!/^[-+]?\d{1,12}\/-?\d{1,12}$/.test(value)) return null;
    const [n, d] = value.split("/").map(BigInt);
    return d === 0n ? null : [n, d];
  }
  if (kind === "decimal") {
    if (!/^[-+]?\d{1,12}(\.\d{1,12})?$/.test(value)) return null;
    const sign = value.startsWith("-") ? -1n : 1n;
    const [a, b = ""] = value.replace(/^[-+]/, "").split(".");
    return [sign * BigInt(a + b), 10n ** BigInt(b.length)];
  }
  return null;
}
export function gradeAnswer(rule: AnswerRule, raw: string): Grade {
  if (typeof raw !== "string" || raw.length > 64)
    return { status: "invalid", message: "답안은 64자 이내로 입력해 주세요." };
  const answer = raw.trim();
  if (!answer) return { status: "invalid", message: "답안을 입력해 주세요." };
  if (rule.kind === "expression")
    return {
      status: "unsupported",
      message: "수식 자동 채점은 아직 지원하지 않습니다.",
    };
  if (rule.kind === "choice")
    return {
      status: answer === rule.expected ? "correct" : "incorrect",
      message:
        answer === rule.expected
          ? "정답이에요!"
          : "다시 자리 이름부터 확인해 보세요.",
    };
  const actual = rational(answer, rule.kind),
    expected = rational(rule.expected, rule.kind);
  if (!actual || !expected)
    return {
      status: "invalid",
      message:
        rule.kind === "fraction"
          ? "a/b 형태로 입력하세요. 분모는 0일 수 없어요."
          : rule.kind === "decimal"
            ? "숫자로 된 유한 소수를 입력하세요."
            : "12자리 이내 정수로 입력해 주세요. 쉼표나 계산식은 넣지 않아요.",
    };
  const correct = actual[0] * expected[1] === expected[0] * actual[1];
  return {
    status: correct ? "correct" : "incorrect",
    message: correct
      ? "정답이에요!"
      : "숫자가 놓인 자리와 자릿값을 다시 확인해 보세요.",
  };
}
