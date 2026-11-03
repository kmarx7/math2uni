export type Interval = {
  lower: number | null;
  lowerInclusive: boolean;
  upper: number | null;
  upperInclusive: boolean;
};

function validInterval(interval: Interval) {
  return (
    (interval.lower === null || Number.isFinite(interval.lower)) &&
    (interval.upper === null || Number.isFinite(interval.upper)) &&
    (interval.lower === null || interval.upper === null || interval.lower <= interval.upper)
  );
}

export function intersectIntervals(first: Interval, second: Interval): Interval | null {
  if (!validInterval(first) || !validInterval(second)) return null;
  let lower: number | null;
  let lowerInclusive: boolean;
  if (first.lower === null) {
    lower = second.lower;
    lowerInclusive = second.lowerInclusive;
  } else if (second.lower === null) {
    lower = first.lower;
    lowerInclusive = first.lowerInclusive;
  } else if (first.lower > second.lower) {
    lower = first.lower;
    lowerInclusive = first.lowerInclusive;
  } else if (second.lower > first.lower) {
    lower = second.lower;
    lowerInclusive = second.lowerInclusive;
  } else {
    lower = first.lower;
    lowerInclusive = first.lowerInclusive && second.lowerInclusive;
  }

  let upper: number | null;
  let upperInclusive: boolean;
  if (first.upper === null) {
    upper = second.upper;
    upperInclusive = second.upperInclusive;
  } else if (second.upper === null) {
    upper = first.upper;
    upperInclusive = first.upperInclusive;
  } else if (first.upper < second.upper) {
    upper = first.upper;
    upperInclusive = first.upperInclusive;
  } else if (second.upper < first.upper) {
    upper = second.upper;
    upperInclusive = second.upperInclusive;
  } else {
    upper = first.upper;
    upperInclusive = first.upperInclusive && second.upperInclusive;
  }

  if (lower !== null && upper !== null) {
    if (lower > upper || (lower === upper && !(lowerInclusive && upperInclusive))) return null;
  }
  return { lower, lowerInclusive, upper, upperInclusive };
}

export type InequalityRelation = "<" | "<=" | ">" | ">=";

export function quadraticInequalitySolution(
  a: number,
  roots: readonly [number, number] | null,
  relation: InequalityRelation,
): Interval[] | null {
  if (!Number.isFinite(a) || a === 0) return null;
  const wantsPositive = relation === ">" || relation === ">=";
  const inclusive = relation === "<=" || relation === ">=";
  if (roots === null) {
    const alwaysTrue = (a > 0) === wantsPositive;
    return alwaysTrue ? [{ lower: null, lowerInclusive: false, upper: null, upperInclusive: false }] : [];
  }
  if (!Number.isFinite(roots[0]) || !Number.isFinite(roots[1])) return null;
  const [left, right] = roots[0] <= roots[1] ? roots : [roots[1], roots[0]];
  const opensUp = a > 0;
  if (left === right) {
    if (wantsPositive === opensUp) {
      if (!inclusive) {
        return [
          { lower: null, lowerInclusive: false, upper: left, upperInclusive: false },
          { lower: left, lowerInclusive: false, upper: null, upperInclusive: false },
        ];
      }
      return [{ lower: null, lowerInclusive: false, upper: null, upperInclusive: false }];
    }
    return inclusive ? [{ lower: left, lowerInclusive: true, upper: left, upperInclusive: true }] : [];
  }
  if (wantsPositive === opensUp) {
    return [
      { lower: null, lowerInclusive: false, upper: left, upperInclusive: inclusive },
      { lower: right, lowerInclusive: inclusive, upper: null, upperInclusive: false },
    ];
  }
  return [{ lower: left, lowerInclusive: inclusive, upper: right, upperInclusive: inclusive }];
}

export function countPairsAtParameter(
  pairs: readonly { x: number; y: number }[],
  parameter: number,
  inclusive: boolean,
): number {
  if (!Number.isFinite(parameter) || pairs.some(({ x, y }) => !Number.isFinite(x) || !Number.isFinite(y))) return 0;
  return pairs.filter(({ x }) => inclusive ? x <= parameter : x < parameter).length;
}

export function sumRuleCounts(counts: readonly number[]): number | null {
  if (counts.some((count) => !Number.isSafeInteger(count) || count < 0)) return null;
  const result = counts.reduce((sum, count) => sum + count, 0);
  return Number.isSafeInteger(result) ? result : null;
}

export function productRuleCounts(counts: readonly number[]): number | null {
  if (counts.some((count) => !Number.isSafeInteger(count) || count < 0)) return null;
  const result = counts.reduce((product, count) => product * count, 1);
  return Number.isSafeInteger(result) ? result : null;
}

function validSelection(n: number, r: number) {
  return Number.isSafeInteger(n) && Number.isSafeInteger(r) && n >= 0 && n <= 12 && r >= 0 && r <= n;
}

export function permutations(n: number, r: number): number | null {
  if (!validSelection(n, r)) return null;
  let result = 1;
  for (let factor = n - r + 1; factor <= n; factor += 1) result *= factor;
  return Number.isSafeInteger(result) ? result : null;
}

export function combinations(n: number, r: number): number | null {
  if (!validSelection(n, r)) return null;
  const k = Math.min(r, n - r);
  let result = 1;
  for (let i = 1; i <= k; i += 1) result = (result * (n - k + i)) / i;
  return Number.isSafeInteger(result) ? result : null;
}

export function formatInterval(interval: Interval): string {
  const left = interval.lower === null ? "−∞" : String(interval.lower);
  const right = interval.upper === null ? "∞" : String(interval.upper);
  const leftBracket = interval.lower !== null && interval.lowerInclusive ? "[" : "(";
  const rightBracket = interval.upper !== null && interval.upperInclusive ? "]" : ")";
  return `${leftBracket}${left}, ${right}${rightBracket}`;
}
