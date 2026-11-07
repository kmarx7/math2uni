/** Bounded deterministic sequence helpers for draft M5-19~M5-23 labs. */

const MAX_TERMS = 100;
const MAX_INDEX = 10_000;
const MAX_TERM_MAGNITUDE = 1_000_000_000;

function isSafeInput(...values: number[]) {
  return values.every(Number.isSafeInteger);
}

function bounded(value: number) {
  return Number.isFinite(value) && Math.abs(value) <= MAX_TERM_MAGNITUDE;
}

export type SequenceRule = "linear" | "squares" | "alternating";

/** Small fixed family of examples; does not parse or evaluate user formulas. */
export function sequenceTerms(rule: SequenceRule, count: number, startIndex = 1): number[] | null {
  if (!isSafeInput(count, startIndex) || count < 1 || count > MAX_TERMS || startIndex < 0 || startIndex + count > MAX_INDEX) return null;
  return Array.from({ length: count }, (_, offset) => {
    const n = startIndex + offset;
    switch (rule) {
      case "linear": return n;
      case "squares": return n + (n - 1) * (n - 2) * (n - 3);
      case "alternating": return offset % 2 === 0 ? n : -n;
    }
  });
}

export function arithmeticTerm(first: number, difference: number, n: number): number | null {
  if (!isSafeInput(first, difference, n) || n < 1 || n > MAX_INDEX) return null;
  const value = first + (n - 1) * difference;
  return bounded(value) ? value : null;
}

export function arithmeticSum(first: number, difference: number, count: number): number | null {
  if (!isSafeInput(first, difference, count) || count < 1 || count > MAX_TERMS) return null;
  const last = first + (count - 1) * difference;
  const sum = (count * (first + last)) / 2;
  return bounded(last) && bounded(sum) ? sum : null;
}

export function geometricTerms(first: number, ratio: number, count: number): number[] | null {
  if (!Number.isFinite(first) || !Number.isFinite(ratio) || !isSafeInput(count) ||
      Math.abs(first) > MAX_TERM_MAGNITUDE || Math.abs(ratio) > 100 || count < 1 || count > MAX_TERMS) return null;
  const terms: number[] = [];
  let value = first;
  for (let index = 0; index < count; index += 1) {
    if (!bounded(value)) return null;
    terms.push(value);
    value *= ratio;
  }
  return terms;
}

export function geometricSum(first: number, ratio: number, count: number): number | null {
  const terms = geometricTerms(first, ratio, count);
  if (!terms) return null;
  const sum = ratio === 1
    ? first * count
    : terms.reduce((total, term) => total + term, 0);
  return bounded(sum) ? sum : null;
}

export type SigmaRule = "constant" | "linear" | "square" | "cube";

/** Inclusive integer sum over a bounded range. Empty ranges correctly sum to zero. */
export function sigmaSum(rule: SigmaRule, lower: number, upper: number, coefficient = 1, constant = 0): number | null {
  if (!isSafeInput(lower, upper, coefficient, constant) || lower < 0 || lower > MAX_INDEX || upper > MAX_INDEX || upper - lower > MAX_TERMS) return null;
  let total = 0;
  for (let index = lower; index <= upper; index += 1) {
    const value = rule === "constant" ? constant
      : rule === "linear" ? coefficient * index + constant
        : rule === "square" ? coefficient * index ** 2 + constant
          : coefficient * index ** 3 + constant;
    total += value;
    if (!bounded(value) || !bounded(total)) return null;
  }
  return total;
}

export type InductionStage = "base" | "hypothesis" | "step" | "conclusion";

const inductionOrder: InductionStage[] = ["base", "hypothesis", "step", "conclusion"];

/** Proof-structure progress only; this does not establish a symbolic proof. */
export function inductionProgress(stages: InductionStage[]): { completed: InductionStage[]; next: InductionStage | null; complete: boolean } | null {
  if (stages.length > inductionOrder.length || stages.some((stage, index) => stage !== inductionOrder[index])) return null;
  const completed = [...stages];
  const next = inductionOrder[completed.length] ?? null;
  return { completed, next, complete: next === null };
}
