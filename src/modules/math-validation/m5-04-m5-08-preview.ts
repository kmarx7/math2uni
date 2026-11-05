/** Bounded, deterministic calculations for M5-04~M5-08 preview lessons only. */

export type Comparison = "<" | "<=" | ">" | ">=";

export type RealInterval = {
  kind: "interval";
  lower: number | null;
  upper: number | null;
  lowerClosed: boolean;
  upperClosed: boolean;
};

export type IntervalResult = RealInterval | { kind: "all" } | { kind: "empty" } | null;

const allReals: IntervalResult = { kind: "all" };
const emptySet: IntervalResult = { kind: "empty" };

function validLogBase(base: number) {
  return Number.isFinite(base) && base > 0 && base !== 1;
}

export function logValue(base: number, argument: number): number | null {
  if (!validLogBase(base) || !Number.isFinite(argument) || argument <= 0) return null;
  const value = Math.log(argument) / Math.log(base);
  return Number.isFinite(value) ? value : null;
}

export function expandLogProduct(base: number, left: number, right: number): number | null {
  const leftValue = logValue(base, left);
  const rightValue = logValue(base, right);
  if (leftValue === null || rightValue === null || !Number.isFinite(left * right)) return null;
  const expanded = leftValue + rightValue;
  const combined = logValue(base, left * right);
  return combined !== null && Number.isFinite(expanded) ? expanded : null;
}

export function expandLogQuotient(base: number, numerator: number, denominator: number): number | null {
  const top = logValue(base, numerator);
  const bottom = logValue(base, denominator);
  if (top === null || bottom === null || !Number.isFinite(numerator / denominator)) return null;
  const expanded = top - bottom;
  const combined = logValue(base, numerator / denominator);
  return combined !== null && Number.isFinite(expanded) ? expanded : null;
}

export function expandLogPower(base: number, argument: number, exponent: number): number | null {
  const value = logValue(base, argument);
  if (value === null || !Number.isFinite(exponent)) return null;
  const expanded = exponent * value;
  const powered = argument ** exponent;
  return Number.isFinite(expanded) && Number.isFinite(powered) && powered > 0 ? expanded : null;
}

export function combineLogs(
  base: number,
  leftArgument: number,
  rightArgument: number,
  operation: "sum" | "difference",
): number | null {
  const left = logValue(base, leftArgument);
  const right = logValue(base, rightArgument);
  if (left === null || right === null) return null;
  const argument = operation === "sum"
    ? leftArgument * rightArgument
    : leftArgument / rightArgument;
  if (!Number.isFinite(argument) || argument <= 0) return null;
  return logValue(base, argument);
}

export function changeLogBase(base: number, argument: number, newBase: number): number | null {
  if (!validLogBase(base) || !validLogBase(newBase) || !Number.isFinite(argument) || argument <= 0) return null;
  const denominator = Math.log(base);
  if (denominator === 0) return null;
  // The new base cancels algebraically; validate it above, then evaluate directly to avoid double rounding.
  const result = Math.log(argument) / denominator;
  return Number.isFinite(result) ? result : null;
}

export function commonLogParts(value: number): {
  characteristic: number;
  mantissa: number;
  exactLog: number;
  approximateMantissaLog: number;
  approximateLog: number;
} | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  const exactLog = Math.log10(value);
  let characteristic = Math.floor(exactLog);
  let mantissa = value / 10 ** characteristic;
  if (mantissa < 1) {
    characteristic -= 1;
    mantissa = value / 10 ** characteristic;
  } else if (mantissa >= 10) {
    characteristic += 1;
    mantissa = value / 10 ** characteristic;
  }
  if (!(mantissa >= 1 && mantissa < 10)) return null;
  const approximateMantissaLog = Number(Math.log10(mantissa).toFixed(4));
  return {
    characteristic,
    mantissa,
    exactLog,
    approximateMantissaLog,
    approximateLog: characteristic + approximateMantissaLog,
  };
}

export function decimalDigitCount(value: number): number | null {
  if (!Number.isSafeInteger(value) || value < 1) return null;
  let count = Math.floor(Math.log10(value)) + 1;
  if (value < 10 ** (count - 1)) count -= 1;
  if (value >= 10 ** count) count += 1;
  return count;
}

export type ExponentialGraphShape = {
  domain: "all-real";
  range: { lower: number | null; upper: number | null; lowerClosed: boolean; upperClosed: boolean };
  horizontalAsymptote: number | null;
  anchor: { x: number; y: number };
  direction: "increasing" | "decreasing" | "constant";
};

export function exponentialGraphShape(
  base: number,
  scale = 1,
  horizontalShift = 0,
  verticalShift = 0,
): ExponentialGraphShape | null {
  if (!validLogBase(base) || ![scale, horizontalShift, verticalShift].every(Number.isFinite)) return null;
  if (scale === 0) {
    return {
      domain: "all-real",
      range: { lower: verticalShift, upper: verticalShift, lowerClosed: true, upperClosed: true },
      horizontalAsymptote: verticalShift,
      anchor: { x: horizontalShift, y: verticalShift },
      direction: "constant",
    };
  }
  const baseIncreasing = base > 1;
  const direction = (baseIncreasing === (scale > 0)) ? "increasing" : "decreasing";
  return {
    domain: "all-real",
    range: scale > 0
      ? { lower: verticalShift, upper: null, lowerClosed: false, upperClosed: false }
      : { lower: null, upper: verticalShift, lowerClosed: false, upperClosed: false },
    horizontalAsymptote: verticalShift,
    anchor: { x: horizontalShift, y: scale + verticalShift },
    direction,
  };
}

export function exponentialGraphValue(
  base: number,
  x: number,
  scale = 1,
  horizontalShift = 0,
  verticalShift = 0,
): number | null {
  if (!validLogBase(base) || ![x, scale, horizontalShift, verticalShift].every(Number.isFinite)) return null;
  const result = scale * base ** (x - horizontalShift) + verticalShift;
  return Number.isFinite(result) ? result : null;
}

export type LogarithmGraphShape = {
  domain: { lower: number; lowerClosed: false; upper: null };
  range: { lower: number | null; upper: number | null; lowerClosed: boolean; upperClosed: boolean };
  verticalAsymptote: number | null;
  anchor: { x: number; y: number };
  direction: "increasing" | "decreasing" | "constant";
};

export function logarithmGraphShape(
  base: number,
  scale = 1,
  horizontalShift = 0,
  verticalShift = 0,
): LogarithmGraphShape | null {
  if (!validLogBase(base) || ![scale, horizontalShift, verticalShift].every(Number.isFinite)) return null;
  const baseIncreasing = base > 1;
  const direction = scale === 0
    ? "constant"
    : ((baseIncreasing === (scale > 0)) ? "increasing" : "decreasing");
  return {
    domain: { lower: horizontalShift, lowerClosed: false, upper: null },
    range: scale === 0
      ? { lower: verticalShift, upper: verticalShift, lowerClosed: true, upperClosed: true }
      : { lower: null, upper: null, lowerClosed: false, upperClosed: false },
    verticalAsymptote: scale === 0 ? null : horizontalShift,
    anchor: { x: horizontalShift + 1, y: verticalShift },
    direction,
  };
}

export function logarithmGraphValue(
  base: number,
  x: number,
  scale = 1,
  horizontalShift = 0,
  verticalShift = 0,
): number | null {
  if (!validLogBase(base) || ![x, scale, horizontalShift, verticalShift].every(Number.isFinite) || x <= horizontalShift) return null;
  const value = scale * (Math.log(x - horizontalShift) / Math.log(base)) + verticalShift;
  return Number.isFinite(value) ? value : null;
}

function reverseComparison(operator: Comparison): Comparison {
  switch (operator) {
    case "<": return ">";
    case "<=": return ">=";
    case ">": return "<";
    case ">=": return "<=";
  }
}

export function solveSameBaseExponentialEquation(
  base: number,
  coefficient: number,
  constant: number,
  targetExponent: number,
): number | null {
  if (!validLogBase(base) || ![coefficient, constant, targetExponent].every(Number.isFinite) || coefficient === 0) return null;
  const result = (targetExponent - constant) / coefficient;
  return Number.isFinite(result) ? result : null;
}

export function solveSameBaseExponentialInequality(
  base: number,
  coefficient: number,
  constant: number,
  targetExponent: number,
  operator: Comparison,
): IntervalResult {
  if (!validLogBase(base) || ![coefficient, constant, targetExponent].every(Number.isFinite)) return null;
  let exponentOperator = base > 1 ? operator : reverseComparison(operator);
  if (coefficient === 0) {
    const holds = exponentOperator === "<" ? constant < targetExponent
      : exponentOperator === "<=" ? constant <= targetExponent
        : exponentOperator === ">" ? constant > targetExponent
          : constant >= targetExponent;
    return holds ? allReals : emptySet;
  }
  if (coefficient < 0) exponentOperator = reverseComparison(exponentOperator);
  const boundary = (targetExponent - constant) / coefficient;
  if (!Number.isFinite(boundary)) return null;
  return exponentOperator === "<" || exponentOperator === "<="
    ? { kind: "interval", lower: null, upper: boundary, lowerClosed: false, upperClosed: exponentOperator === "<=" }
    : { kind: "interval", lower: boundary, upper: null, lowerClosed: exponentOperator === ">=", upperClosed: false };
}
