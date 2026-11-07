/** Bounded deterministic trigonometry helpers for M5-14~M5-18 previews. */

export type TrigFunction = "sin" | "cos" | "tan";
export type TrigComparison = "<" | "<=" | ">" | ">=";
export type BoundedInterval = {
  lower: number;
  upper: number;
  lowerClosed: boolean;
  upperClosed: boolean;
};
export type TrigGraphPoint = { x: number; y: number };
export type TrigGraphProfile = {
  functionName: "sin" | "cos";
  amplitude: number;
  period: number | null;
  phaseShift: number;
  verticalShift: number;
  minimum: number;
  maximum: number;
  constant: boolean;
  points: TrigGraphPoint[];
};

const MAX_SIDE = 1_000;
const MAX_GRAPH_COEFFICIENT = 12;
const MAX_GRAPH_SHIFT = 8 * Math.PI;
const MAX_INTERVAL_ANGLE = 8 * Math.PI;
const MAX_TAN_LEVEL = 100;
const EPSILON = 1e-10;

function finite(...values: number[]) {
  return values.every(Number.isFinite);
}

function inInterval(value: number, interval: BoundedInterval) {
  return (value > interval.lower || (interval.lowerClosed && Math.abs(value - interval.lower) <= EPSILON)) &&
    (value < interval.upper || (interval.upperClosed && Math.abs(value - interval.upper) <= EPSILON));
}

function validInterval(interval: BoundedInterval) {
  return finite(interval.lower, interval.upper) &&
    interval.lower >= -MAX_INTERVAL_ANGLE && interval.upper <= MAX_INTERVAL_ANGLE &&
    interval.lower <= interval.upper;
}

function trigValue(fn: TrigFunction, angle: number): number | null {
  if (!Number.isFinite(angle)) return null;
  if (fn === "sin") return Math.sin(angle);
  if (fn === "cos") return Math.cos(angle);
  const denominator = Math.cos(angle);
  if (Math.abs(denominator) <= EPSILON) return null;
  const value = Math.sin(angle) / denominator;
  return Number.isFinite(value) ? value : null;
}

function normalizeRoots(values: number[], interval: BoundedInterval) {
  const sorted = values
    .filter((value) => Number.isFinite(value) && inInterval(value, interval))
    .map((value) => Math.abs(value - interval.lower) <= EPSILON ? interval.lower :
      Math.abs(value - interval.upper) <= EPSILON ? interval.upper : value)
    .sort((a, b) => a - b);
  return sorted.filter((value, index) => index === 0 || Math.abs(value - sorted[index - 1]!) > EPSILON);
}

function normalizeCuts(values: number[], interval: BoundedInterval) {
  const sorted = values
    .filter((value) => Number.isFinite(value) && value >= interval.lower - EPSILON && value <= interval.upper + EPSILON)
    .map((value) => Math.abs(value - interval.lower) <= EPSILON ? interval.lower :
      Math.abs(value - interval.upper) <= EPSILON ? interval.upper : value)
    .sort((a, b) => a - b);
  return sorted.filter((value, index) => index === 0 || Math.abs(value - sorted[index - 1]!) > EPSILON);
}

function periodicValues(bases: number[], period: number, interval: BoundedInterval) {
  const values: number[] = [];
  for (const base of bases) {
    const first = Math.floor((interval.lower - base) / period) - 1;
    const last = Math.ceil((interval.upper - base) / period) + 1;
    if (last - first > 24) return null;
    for (let k = first; k <= last; k += 1) values.push(base + k * period);
  }
  return normalizeRoots(values, interval);
}

function rootsAtLevel(fn: TrigFunction, level: number, interval: BoundedInterval) {
  if (fn === "tan") {
    return periodicValues([Math.atan(level)], Math.PI, interval);
  }
  if (level < -1 - EPSILON || level > 1 + EPSILON) return [];
  const clamped = Math.max(-1, Math.min(1, level));
  if (fn === "sin") {
    const principal = Math.asin(clamped);
    return periodicValues([principal, Math.PI - principal], Math.PI * 2, interval);
  }
  const principal = Math.acos(clamped);
  return periodicValues([principal, -principal], Math.PI * 2, interval);
}

function undefinedTanPoints(interval: BoundedInterval) {
  return periodicValues([Math.PI / 2], Math.PI, interval);
}

function comparisonHolds(value: number, level: number, comparison: TrigComparison) {
  switch (comparison) {
    case "<": return value < level - EPSILON;
    case "<=": return value <= level + EPSILON;
    case ">": return value > level + EPSILON;
    case ">=": return value >= level - EPSILON;
  }
}

/** Graph profile for y=a·sin(b(x−h))+k or the cosine analogue.
 * Constant cases have no distinguished fundamental period. */
export function trigGraphProfile(
  functionName: "sin" | "cos",
  a: number,
  b: number,
  h: number,
  k: number,
): TrigGraphProfile | null {
  if (!finite(a, b, h, k) || Math.abs(a) > 10 || Math.abs(b) > MAX_GRAPH_COEFFICIENT ||
      Math.abs(h) > MAX_GRAPH_SHIFT || Math.abs(k) > 100) return null;
  const constant = a === 0 || b === 0;
  const period = constant || b === 0 ? null : (2 * Math.PI) / Math.abs(b);
  const minimum = constant ? a * (functionName === "cos" && b === 0 ? 1 : 0) + k : k - Math.abs(a);
  const maximum = constant ? minimum : k + Math.abs(a);
  const start = period === null ? h - Math.PI : h;
  const span = period ?? 2 * Math.PI;
  const points = Array.from({ length: 33 }, (_, index) => {
    const x = start + (span * index) / 32;
    return { x, y: a * (functionName === "sin" ? Math.sin(b * (x - h)) : Math.cos(b * (x - h))) + k };
  });
  return { functionName, amplitude: Math.abs(a), period, phaseShift: h, verticalShift: k, minimum, maximum, constant, points };
}

/** Returns all roots for sin(x)=c, cos(x)=c, or tan(x)=c in a bounded interval. */
export function solveTrigEquation(
  fn: TrigFunction,
  level: number,
  interval: BoundedInterval,
): number[] | null {
  if (!validInterval(interval) || !Number.isFinite(level) || (fn === "tan" && Math.abs(level) > MAX_TAN_LEVEL)) return null;
  return rootsAtLevel(fn, level, interval);
}

function mergeIntervals(intervals: BoundedInterval[]) {
  const sorted = [...intervals].sort((a, b) => a.lower - b.lower || Number(b.lowerClosed) - Number(a.lowerClosed));
  const merged: BoundedInterval[] = [];
  for (const next of sorted) {
    const previous = merged[merged.length - 1];
    if (!previous || next.lower > previous.upper + EPSILON ||
        (Math.abs(next.lower - previous.upper) <= EPSILON && !previous.upperClosed && !next.lowerClosed)) {
      merged.push({ ...next });
      continue;
    }
    if (next.upper > previous.upper + EPSILON) {
      previous.upper = next.upper;
      previous.upperClosed = next.upperClosed;
    } else if (Math.abs(next.upper - previous.upper) <= EPSILON) {
      previous.upperClosed ||= next.upperClosed;
    }
  }
  return merged;
}

/** Solves a trigonometric inequality only on a finite, explicitly supplied interval. */
export function solveTrigInequality(
  fn: TrigFunction,
  level: number,
  comparison: TrigComparison,
  interval: BoundedInterval,
): BoundedInterval[] | null {
  if (!validInterval(interval) || !Number.isFinite(level) || (fn !== "tan" && Math.abs(level) > 1) ||
      (fn === "tan" && Math.abs(level) > MAX_TAN_LEVEL)) return null;
  if (interval.lower === interval.upper) {
    if (!interval.lowerClosed || !interval.upperClosed) return [];
    const value = trigValue(fn, interval.lower);
    return value !== null && comparisonHolds(value, level, comparison)
      ? [{ ...interval }]
      : [];
  }
  const roots = rootsAtLevel(fn, level, interval);
  const poles = fn === "tan" ? undefinedTanPoints(interval) : [];
  if (roots === null || poles === null) return null;
  const cuts = normalizeCuts([interval.lower, interval.upper, ...roots, ...poles], interval);
  const solution: BoundedInterval[] = [];
  for (let index = 0; index < cuts.length - 1; index += 1) {
    const lower = cuts[index]!;
    const upper = cuts[index + 1]!;
    if (upper - lower <= EPSILON) continue;
    const middle = lower + (upper - lower) / 2;
    const value = trigValue(fn, middle);
    if (value !== null && comparisonHolds(value, level, comparison)) {
      const lowerValue = trigValue(fn, lower);
      const upperValue = trigValue(fn, upper);
      const lowerIsPole = poles.some((pole) => Math.abs(pole - lower) <= EPSILON);
      const upperIsPole = poles.some((pole) => Math.abs(pole - upper) <= EPSILON);
      const lowerIsOpenInput = Math.abs(lower - interval.lower) <= EPSILON && !interval.lowerClosed;
      const upperIsOpenInput = Math.abs(upper - interval.upper) <= EPSILON && !interval.upperClosed;
      solution.push({
        lower,
        upper,
        lowerClosed: !lowerIsPole && !lowerIsOpenInput && lowerValue !== null && comparisonHolds(lowerValue, level, comparison),
        upperClosed: !upperIsPole && !upperIsOpenInput && upperValue !== null && comparisonHolds(upperValue, level, comparison),
      });
    }
  }
  for (const point of cuts) {
    if ((Math.abs(point - interval.lower) <= EPSILON && !interval.lowerClosed) ||
        (Math.abs(point - interval.upper) <= EPSILON && !interval.upperClosed)) continue;
    if (poles.some((pole) => Math.abs(pole - point) <= EPSILON)) continue;
    const value = trigValue(fn, point);
    if (value !== null && comparisonHolds(value, level, comparison)) {
      solution.push({ lower: point, upper: point, lowerClosed: true, upperClosed: true });
    }
  }
  return mergeIntervals(solution);
}

/** b = a·sin(B)/sin(A) with explicit triangle-angle constraints. */
export function sineLawSideFromPair(sideA: number, angleADegrees: number, angleBDegrees: number): number | null {
  if (!finite(sideA, angleADegrees, angleBDegrees) || sideA <= 0 || sideA > MAX_SIDE ||
      angleADegrees <= 0 || angleBDegrees <= 0 || angleADegrees + angleBDegrees >= 180) return null;
  const denominator = Math.sin((angleADegrees * Math.PI) / 180);
  const result = sideA * Math.sin((angleBDegrees * Math.PI) / 180) / denominator;
  return Number.isFinite(result) && result > 0 && result <= MAX_SIDE ? result : null;
}

export type SsaCandidate = { angleBDegrees: number; angleCDegrees: number; sideC: number };
export type SsaResult = { status: "none" | "one" | "two"; candidates: SsaCandidate[] };

/** Ambiguous SSA case: returns each triangle satisfying angle sum and side constraints. */
export function solveSsaTriangles(sideA: number, angleADegrees: number, sideB: number): SsaResult | null {
  if (!finite(sideA, angleADegrees, sideB) || sideA <= 0 || sideB <= 0 || sideA > MAX_SIDE || sideB > MAX_SIDE ||
      angleADegrees <= 0 || angleADegrees >= 180) return null;
  const sinA = Math.sin((angleADegrees * Math.PI) / 180);
  const ratio = (sideB * sinA) / sideA;
  if (!Number.isFinite(ratio) || ratio > 1 + EPSILON || ratio < 0) return { status: "none", candidates: [] };
  const angleB1 = (Math.asin(Math.max(-1, Math.min(1, ratio)))*180)/Math.PI;
  const possibleAngles = Math.abs(angleB1 - 90) <= EPSILON ? [90] : [angleB1, 180 - angleB1];
  const candidates: SsaCandidate[] = [];
  for (const angleB of possibleAngles) {
    if (angleADegrees + angleB >= 180 - EPSILON) continue;
    const angleC = 180 - angleADegrees - angleB;
    const sideC = sineLawSideFromPair(sideA, angleADegrees, angleC);
    if (sideC !== null && !candidates.some((candidate) => Math.abs(candidate.angleBDegrees - angleB) <= EPSILON)) {
      candidates.push({ angleBDegrees: angleB, angleCDegrees: angleC, sideC });
    }
  }
  candidates.sort((a, b) => a.angleBDegrees - b.angleBDegrees);
  return { status: candidates.length === 2 ? "two" : candidates.length === 1 ? "one" : "none", candidates };
}

function validSide(value: number) {
  return Number.isFinite(value) && value > 0 && value <= MAX_SIDE;
}

function validTriangle(a: number, b: number, c: number) {
  return validSide(a) && validSide(b) && validSide(c) &&
    a + b > c && a + c > b && b + c > a;
}

/** Cosine rule forward calculation from two sides and the included angle in degrees. */
export function cosineLawThirdSide(sideA: number, sideB: number, includedAngleDegrees: number): number | null {
  if (!validSide(sideA) || !validSide(sideB) || !Number.isFinite(includedAngleDegrees) ||
      includedAngleDegrees <= 0 || includedAngleDegrees >= 180) return null;
  const angle = (includedAngleDegrees * Math.PI) / 180;
  const squared = sideA ** 2 + sideB ** 2 - 2 * sideA * sideB * Math.cos(angle);
  if (!Number.isFinite(squared) || squared <= 0) return null;
  const sideC = Math.sqrt(squared);
  return validTriangle(sideA, sideB, sideC) ? sideC : null;
}

export type TriangleAngleResult = { cosine: number; angleDegrees: number; kind: "acute" | "right" | "obtuse" };

/** Inverse cosine rule; invalid/degenerate side triples are rejected before acos. */
export function cosineLawAngle(sideA: number, sideB: number, sideC: number): TriangleAngleResult | null {
  if (!validTriangle(sideA, sideB, sideC)) return null;
  const denominator = 2 * sideA * sideB;
  const cosine = (sideA ** 2 + sideB ** 2 - sideC ** 2) / denominator;
  if (!Number.isFinite(cosine) || cosine < -1 || cosine > 1) return null;
  const angleDegrees = (Math.acos(cosine) * 180) / Math.PI;
  return {
    cosine,
    angleDegrees,
    kind: Math.abs(cosine) <= EPSILON ? "right" : cosine > 0 ? "acute" : "obtuse",
  };
}

/** K=1/2 ab sin(C), with C explicitly the included angle in degrees. */
export function includedAngleTriangleArea(sideA: number, sideB: number, includedAngleDegrees: number): number | null {
  if (!validSide(sideA) || !validSide(sideB) || !Number.isFinite(includedAngleDegrees) ||
      includedAngleDegrees <= 0 || includedAngleDegrees >= 180) return null;
  const area = 0.5 * sideA * sideB * Math.sin((includedAngleDegrees * Math.PI) / 180);
  return Number.isFinite(area) && area > 0 && area <= MAX_SIDE ** 2 ? area : null;
}
