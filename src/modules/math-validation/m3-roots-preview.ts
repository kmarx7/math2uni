export function vietaCoefficients(a: number, alpha: number, beta: number) {
  if (![a, alpha, beta].every(Number.isInteger) || a === 0 || Math.abs(a) > 10 || Math.abs(alpha) > 10 || Math.abs(beta) > 10) return null;
  return { a, b: -a * (alpha + beta), c: a * alpha * beta, sum: alpha + beta, product: alpha * beta };
}

export type RealRoots = { kind: "none" } | { kind: "one"; values: [number] } | { kind: "two"; values: [number, number] };
export function solveQuadratic(a: number, b: number, c: number): RealRoots | null {
  if (![a, b, c].every(Number.isFinite) || a === 0 || [a, b, c].some((v) => Math.abs(v) > 1000)) return null;
  const d = b * b - 4 * a * c;
  if (d < 0) return { kind: "none" };
  if (d === 0) return { kind: "one", values: [-b / (2 * a)] };
  const root = Math.sqrt(d);
  return { kind: "two", values: [(-b - root) / (2 * a), (-b + root) / (2 * a)] };
}

export function intervalExtrema(sign: 1 | -1, h: number, v: number, left: number, right: number) {
  if (![h, v, left, right].every(Number.isFinite) || left > right || [h, v, left, right].some((x) => Math.abs(x) > 50)) return null;
  const f = (x: number) => sign * (x - h) ** 2 + v;
  const candidates = [...new Set([left, right, ...(h >= left && h <= right ? [h] : [])])].map((x) => ({ x, y: f(x) }));
  return { candidates, min: candidates.reduce((p, q) => q.y < p.y ? q : p), max: candidates.reduce((p, q) => q.y > p.y ? q : p) };
}

export function factorRoots(roots: number[]) {
  if (roots.length < 1 || roots.length > 4 || roots.some((x) => !Number.isInteger(x) || Math.abs(x) > 10)) return null;
  return [...new Set(roots)].sort((a, b) => a - b);
}

export function biquadraticRoots(tValues: number[]) {
  if (tValues.length < 1 || tValues.length > 2 || tValues.some((t) => !Number.isInteger(t) || Math.abs(t) > 25)) return null;
  return [...new Set(tValues.filter((t) => t >= 0).flatMap((t) => t === 0 ? [0] : [-Math.sqrt(t), Math.sqrt(t)]))].sort((a, b) => a - b);
}

export function symmetricIntersections(sum: number, product: number): RealRoots | null {
  if (![sum, product].every(Number.isFinite) || Math.abs(sum) > 50 || Math.abs(product) > 50) return null;
  return solveQuadratic(1, -sum, product);
}
