export type Matrix2 = readonly [readonly [number, number], readonly [number, number]];

export function addMatrix2(a: Matrix2, b: Matrix2): Matrix2 {
  return [[a[0][0] + b[0][0], a[0][1] + b[0][1]], [a[1][0] + b[1][0], a[1][1] + b[1][1]]];
}

export function scaleMatrix2(a: Matrix2, k: number): Matrix2 {
  const scaled = a.map((row) => row.map((value) => value * k));
  return scaled.map((row) => row.map((value) => Object.is(value, -0) ? 0 : value)) as unknown as Matrix2;
}

export function multiplyMatrix2(a: Matrix2, b: Matrix2): Matrix2 {
  return [
    [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
    [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]],
  ];
}

export function distanceBetween(a: readonly [number, number], b: readonly [number, number]) {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

/** P divides AB internally in ratio AP:PB = m:n. */
export function internalSectionPoint(a: readonly [number, number], b: readonly [number, number], m: number, n: number): [number, number] | null {
  if (![...a, ...b, m, n].every(Number.isFinite) || m <= 0 || n <= 0) return null;
  const total = m + n;
  return [(n * a[0] + m * b[0]) / total, (n * a[1] + m * b[1]) / total];
}

/** Projection for the coordinate lab's supported integer domain [-5, 5]². */
export function projectCoordinate(point: readonly [number, number]): [number, number] {
  return [25 + (point[0] + 5) * 26, 155 - (point[1] + 5) * 14];
}

export function slopeBetween(a: readonly [number, number], b: readonly [number, number]): number | null {
  if (b[0] === a[0]) return null;
  return (b[1] - a[1]) / (b[0] - a[0]);
}

export type LineRelation = "parallel" | "same" | "intersect" | "perpendicular";

export function compareLines(
  first: { slope: number | null; intercept: number },
  second: { slope: number | null; intercept: number },
): LineRelation {
  if (first.slope === second.slope) return first.intercept === second.intercept ? "same" : "parallel";
  if (first.slope === null || second.slope === null) {
    const other = first.slope ?? second.slope;
    return other === 0 ? "perpendicular" : "intersect";
  }
  return first.slope * second.slope === -1 ? "perpendicular" : "intersect";
}

export function countConditionIntersection(values: readonly number[], conditions: readonly ((value: number) => boolean)[]) {
  return values.filter((value) => conditions.every((condition) => condition(value))).length;
}

export function partitionIntegers(values: readonly number[]) {
  const even = values.filter((value) => value % 2 === 0);
  const oddMultiplesOfThree = values.filter((value) => value % 2 !== 0 && value % 3 === 0);
  const remaining = values.filter((value) => value % 2 !== 0 && value % 3 !== 0);
  return { even, oddMultiplesOfThree, remaining };
}

export function countTwoStepPaths(transition: readonly (readonly number[])[], from: number, to: number): number | null {
  if (transition.length === 0 || transition.some((row) => row.length !== transition.length)
    || !Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0
    || from >= transition.length || to >= transition.length
    || transition.some((row) => row.some((value) => !Number.isSafeInteger(value) || value < 0))) return null;
  return transition[from].reduce((sum, paths, middle) => sum + paths * transition[middle][to], 0);
}
