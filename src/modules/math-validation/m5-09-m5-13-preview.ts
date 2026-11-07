/** Bounded, deterministic calculations for M5-09~M5-13 development previews. */

export type Comparison = "<" | "<=" | ">" | ">=";

export type SolutionInterval = {
  kind: "interval";
  lower: number | null;
  upper: number | null;
  lowerClosed: boolean;
  upperClosed: boolean;
};

export type SolutionSet = SolutionInterval | { kind: "all" } | { kind: "empty" };

const all: SolutionSet = { kind: "all" };
const empty: SolutionSet = { kind: "empty" };
const MAX_ABS_ANGLE_DEGREES = 36_000;
const MAX_POSITIVE_MODEL_VALUE = 1_000_000_000_000;

function validLogBase(base: number) {
  return Number.isFinite(base) && base > 0 && base !== 1;
}

function reverseComparison(operator: Comparison): Comparison {
  switch (operator) {
    case "<": return ">";
    case "<=": return ">=";
    case ">": return "<";
    case ">=": return "<=";
  }
}

function linearRelation(slope: number, intercept: number, operator: Comparison): SolutionSet {
  if (!Number.isFinite(slope) || !Number.isFinite(intercept)) return empty;
  if (slope === 0) {
    const holds = operator === "<" ? intercept < 0
      : operator === "<=" ? intercept <= 0
        : operator === ">" ? intercept > 0
          : intercept >= 0;
    return holds ? all : empty;
  }
  const effectiveOperator = slope < 0 ? reverseComparison(operator) : operator;
  const boundary = -intercept / slope;
  if (!Number.isFinite(boundary)) return empty;
  if (effectiveOperator === "<" || effectiveOperator === "<=") {
    return { kind: "interval", lower: null, upper: boundary, lowerClosed: false, upperClosed: effectiveOperator === "<=" };
  }
  return { kind: "interval", lower: boundary, upper: null, lowerClosed: effectiveOperator === ">=", upperClosed: false };
}

export function intersectSolutionSets(sets: SolutionSet[]): SolutionSet {
  if (!sets.length) return all;
  let current: SolutionSet = all;
  for (const next of sets) {
    if (current.kind === "empty" || next.kind === "empty") return empty;
    if (current.kind === "all") {
      current = next;
      continue;
    }
    if (next.kind === "all") continue;

    let lower: number | null;
    let lowerClosed: boolean;
    if (current.lower === null) {
      lower = next.lower;
      lowerClosed = next.lowerClosed;
    } else if (next.lower === null) {
      lower = current.lower;
      lowerClosed = current.lowerClosed;
    } else if (current.lower > next.lower) {
      lower = current.lower;
      lowerClosed = current.lowerClosed;
    } else if (next.lower > current.lower) {
      lower = next.lower;
      lowerClosed = next.lowerClosed;
    } else {
      lower = current.lower;
      lowerClosed = current.lowerClosed && next.lowerClosed;
    }

    let upper: number | null;
    let upperClosed: boolean;
    if (current.upper === null) {
      upper = next.upper;
      upperClosed = next.upperClosed;
    } else if (next.upper === null) {
      upper = current.upper;
      upperClosed = current.upperClosed;
    } else if (current.upper < next.upper) {
      upper = current.upper;
      upperClosed = current.upperClosed;
    } else if (next.upper < current.upper) {
      upper = next.upper;
      upperClosed = next.upperClosed;
    } else {
      upper = current.upper;
      upperClosed = current.upperClosed && next.upperClosed;
    }

    if (lower !== null && upper !== null && (lower > upper || (lower === upper && !(lowerClosed && upperClosed)))) {
      return empty;
    }
    current = { kind: "interval", lower, upper, lowerClosed, upperClosed };
  }
  return current;
}

export function positiveLinearDomain(slope: number, intercept: number): SolutionSet | null {
  if (![slope, intercept].every(Number.isFinite)) return null;
  if (slope === 0) return intercept > 0 ? all : empty;
  const boundary = -intercept / slope;
  if (!Number.isFinite(boundary)) return null;
  return slope > 0
    ? { kind: "interval", lower: boundary, upper: null, lowerClosed: false, upperClosed: false }
    : { kind: "interval", lower: null, upper: boundary, lowerClosed: false, upperClosed: false };
}

export function solveSameBaseLogInequality(
  base: number,
  leftSlope: number,
  leftIntercept: number,
  rightSlope: number,
  rightIntercept: number,
  operator: Comparison,
): SolutionSet | null {
  if (!validLogBase(base) || ![leftSlope, leftIntercept, rightSlope, rightIntercept].every(Number.isFinite)) return null;
  const leftDomain = positiveLinearDomain(leftSlope, leftIntercept);
  const rightDomain = positiveLinearDomain(rightSlope, rightIntercept);
  if (leftDomain === null || rightDomain === null) return null;
  const logOperator = base > 1 ? operator : reverseComparison(operator);
  const comparison = linearRelation(leftSlope - rightSlope, leftIntercept - rightIntercept, logOperator);
  return intersectSolutionSets([leftDomain, rightDomain, comparison]);
}

export function solveSameBaseLogEquation(
  base: number,
  leftSlope: number,
  leftIntercept: number,
  rightSlope: number,
  rightIntercept: number,
): SolutionSet | null {
  if (!validLogBase(base) || ![leftSlope, leftIntercept, rightSlope, rightIntercept].every(Number.isFinite)) return null;
  const leftDomain = positiveLinearDomain(leftSlope, leftIntercept);
  const rightDomain = positiveLinearDomain(rightSlope, rightIntercept);
  if (leftDomain === null || rightDomain === null) return null;
  const domain = intersectSolutionSets([leftDomain, rightDomain]);
  const slope = leftSlope - rightSlope;
  const intercept = leftIntercept - rightIntercept;
  if (slope === 0) return intercept === 0 ? domain : empty;
  const candidate = -intercept / slope;
  if (!Number.isFinite(candidate) || domain.kind === "empty" || domain.kind === "all") return domain.kind === "all" ? { kind: "interval", lower: candidate, upper: candidate, lowerClosed: true, upperClosed: true } : empty;
  const aboveLower = domain.lower === null || candidate > domain.lower || (candidate === domain.lower && domain.lowerClosed);
  const belowUpper = domain.upper === null || candidate < domain.upper || (candidate === domain.upper && domain.upperClosed);
  return aboveLower && belowUpper
    ? { kind: "interval", lower: candidate, upper: candidate, lowerClosed: true, upperClosed: true }
    : empty;
}

export function describeSolutionSet(solution: SolutionSet): string {
  if (solution.kind === "all") return "모든 실수";
  if (solution.kind === "empty") return "해 없음";
  if (solution.lower !== null && solution.upper !== null && solution.lower === solution.upper) return `x=${solution.lower}`;
  if (solution.lower === null) return `x${solution.upperClosed ? "≤" : "<"}${solution.upper}`;
  if (solution.upper === null) return `x${solution.lowerClosed ? "≥" : ">"}${solution.lower}`;
  return `${solution.lower}${solution.lowerClosed ? "≤" : "<"}x${solution.upperClosed ? "≤" : "<"}${solution.upper}`;
}

export type DiscreteModelMode = "growth" | "decay";

export type DiscreteModel = {
  initialAmount: number;
  factor: number;
  steps: number;
  amount: number;
  mode: DiscreteModelMode;
  approximate: true;
};

export function discreteExponentialModel(
  initialAmount: number,
  percentChange: number,
  steps: number,
  mode: DiscreteModelMode,
): DiscreteModel | null {
  if (!Number.isFinite(initialAmount) || initialAmount <= 0 || initialAmount > 1_000_000_000) return null;
  if (!Number.isFinite(percentChange) || percentChange <= 0 || percentChange >= 100) return null;
  if (!Number.isInteger(steps) || steps < 0 || steps > 120) return null;
  const factor = mode === "growth" ? 1 + percentChange / 100 : 1 - percentChange / 100;
  const amount = initialAmount * factor ** steps;
  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_POSITIVE_MODEL_VALUE) return null;
  return { initialAmount, factor, steps, amount, mode, approximate: true };
}

export function logarithmicScaleLevel(value: number, reference: number, base: number): number | null {
  if (![value, reference, base].every(Number.isFinite) || value <= 0 || reference <= 0 || base <= 1) return null;
  const level = Math.log(value / reference) / Math.log(base);
  return Number.isFinite(level) ? level : null;
}

export function logarithmicScaleRatio(levelDifference: number, base: number): number | null {
  if (!Number.isFinite(levelDifference) || Math.abs(levelDifference) > 40 || !Number.isFinite(base) || base <= 1) return null;
  const ratio = base ** levelDifference;
  return Number.isFinite(ratio) && ratio > 0 && ratio <= MAX_POSITIVE_MODEL_VALUE ? ratio : null;
}

function gcd(a: number, b: number): number {
  let left = Math.abs(a);
  let right = Math.abs(b);
  while (right !== 0) [left, right] = [right, left % right];
  return left || 1;
}

export function normalizeDegrees(degrees: number): number | null {
  if (!Number.isFinite(degrees) || Math.abs(degrees) > MAX_ABS_ANGLE_DEGREES) return null;
  const normalized = ((degrees % 360) + 360) % 360;
  return Object.is(normalized, -0) ? 0 : normalized;
}

export function coterminalAngleDegrees(degrees: number): number | null {
  return normalizeDegrees(degrees);
}

export function degreesToRadians(degrees: number): number | null {
  if (!Number.isFinite(degrees) || Math.abs(degrees) > MAX_ABS_ANGLE_DEGREES) return null;
  const result = degrees * Math.PI / 180;
  return Number.isFinite(result) ? result : null;
}

export function radiansToDegrees(radians: number): number | null {
  if (!Number.isFinite(radians) || Math.abs(radians) > 200 * Math.PI) return null;
  const result = radians * 180 / Math.PI;
  return Number.isFinite(result) ? result : null;
}

export function exactRadianMultipleOfPi(degrees: number): string | null {
  if (!Number.isInteger(degrees) || Math.abs(degrees) > MAX_ABS_ANGLE_DEGREES) return null;
  if (degrees === 0) return "0 rad";
  const divisor = gcd(degrees, 180);
  const numerator = degrees / divisor;
  const denominator = 180 / divisor;
  const sign = numerator < 0 ? "−" : "";
  const absolute = Math.abs(numerator);
  const coefficient = absolute === 1 ? "" : String(absolute);
  const piTerm = `${coefficient}π`;
  return `${sign}${denominator === 1 ? piTerm : `${piTerm}/${denominator}`} rad`;
}

export function arcLengthFromRadians(radius: number, radians: number): number | null {
  if (!Number.isFinite(radius) || radius <= 0 || radius > 1_000_000 || !Number.isFinite(radians) || Math.abs(radians) > 200 * Math.PI) return null;
  const length = radius * Math.abs(radians);
  return Number.isFinite(length) && length <= MAX_POSITIVE_MODEL_VALUE ? length : null;
}

export function sectorAreaFromRadians(radius: number, radians: number): number | null {
  if (!Number.isFinite(radius) || radius <= 0 || radius > 1_000_000 || !Number.isFinite(radians) || Math.abs(radians) > 200 * Math.PI) return null;
  const area = 0.5 * radius ** 2 * Math.abs(radians);
  return Number.isFinite(area) && area <= MAX_POSITIVE_MODEL_VALUE ? area : null;
}

type ExactCoordinate = { value: number; exact: string };
export type UnitCirclePoint = {
  degrees: number;
  normalizedDegrees: number;
  quadrant: "I" | "II" | "III" | "IV" | "axis";
  sine: ExactCoordinate;
  cosine: ExactCoordinate;
  tangent: number | null;
};

const firstQuadrantValues = new Map<number, { sine: ExactCoordinate; cosine: ExactCoordinate }>([
  [0, { sine: { value: 0, exact: "0" }, cosine: { value: 1, exact: "1" } }],
  [30, { sine: { value: 0.5, exact: "1/2" }, cosine: { value: Math.sqrt(3) / 2, exact: "√3/2" } }],
  [45, { sine: { value: Math.SQRT1_2, exact: "√2/2" }, cosine: { value: Math.SQRT1_2, exact: "√2/2" } }],
  [60, { sine: { value: Math.sqrt(3) / 2, exact: "√3/2" }, cosine: { value: 0.5, exact: "1/2" } }],
  [90, { sine: { value: 1, exact: "1" }, cosine: { value: 0, exact: "0" } }],
]);

function signedCoordinate(coordinate: ExactCoordinate, sign: 1 | -1): ExactCoordinate {
  if (coordinate.value === 0) return { value: 0, exact: "0" };
  return sign > 0
    ? coordinate
    : { value: -coordinate.value, exact: `−${coordinate.exact}` };
}

export function unitCircleCoordinates(degrees: number): UnitCirclePoint | null {
  const normalized = normalizeDegrees(degrees);
  if (normalized === null || !Number.isInteger(degrees)) return null;
  let referenceAngle: number;
  let sineSign: 1 | -1;
  let cosineSign: 1 | -1;
  let quadrant: UnitCirclePoint["quadrant"];
  if (normalized <= 90) {
    referenceAngle = normalized;
    sineSign = 1;
    cosineSign = 1;
    quadrant = normalized === 0 || normalized === 90 ? "axis" : "I";
  } else if (normalized <= 180) {
    referenceAngle = 180 - normalized;
    sineSign = 1;
    cosineSign = -1;
    quadrant = normalized === 180 ? "axis" : "II";
  } else if (normalized <= 270) {
    referenceAngle = normalized - 180;
    sineSign = -1;
    cosineSign = -1;
    quadrant = normalized === 270 ? "axis" : "III";
  } else {
    referenceAngle = 360 - normalized;
    sineSign = -1;
    cosineSign = 1;
    quadrant = "IV";
  }
  const firstQuadrant = firstQuadrantValues.get(referenceAngle);
  if (!firstQuadrant) return null;
  const sine = signedCoordinate(firstQuadrant.sine, sineSign);
  const cosine = signedCoordinate(firstQuadrant.cosine, cosineSign);
  return {
    degrees,
    normalizedDegrees: normalized,
    quadrant,
    sine,
    cosine,
    tangent: cosine.value === 0 ? null : sine.value / cosine.value,
  };
}

export type Quadrant = "I" | "II" | "III" | "IV";

export function deriveSineFromCosine(cosine: number, quadrant: Quadrant): number | null {
  if (!Number.isFinite(cosine) || cosine < -1 || cosine > 1 || cosine === 0 || Math.abs(cosine) === 1) return null;
  const cosineShouldBePositive = quadrant === "I" || quadrant === "IV";
  if ((cosine > 0) !== cosineShouldBePositive) return null;
  const radicand = 1 - cosine ** 2;
  if (radicand < 0) return null;
  const magnitude = Math.sqrt(radicand);
  const sineShouldBePositive = quadrant === "I" || quadrant === "II";
  return sineShouldBePositive ? magnitude : -magnitude;
}

export function pythagoreanIdentityValue(sine: number, cosine: number): number | null {
  if (![sine, cosine].every(Number.isFinite) || Math.abs(sine) > 1 || Math.abs(cosine) > 1) return null;
  const result = sine ** 2 + cosine ** 2;
  return Number.isFinite(result) ? result : null;
}

export function tangentFromSineCosine(sine: number, cosine: number): number | null {
  if (![sine, cosine].every(Number.isFinite) || Math.abs(sine) > 1 || Math.abs(cosine) > 1 || cosine === 0) return null;
  if (Math.abs(pythagoreanIdentityValue(sine, cosine)! - 1) > 1e-9) return null;
  const result = sine / cosine;
  return Number.isFinite(result) ? result : null;
}
