/** Bounded calculations for the M4-14~18 development preview labs. */

export function arithmeticGeometricMean(a: number, b: number) {
  if (!Number.isFinite(a) || !Number.isFinite(b) || a < 0 || b < 0) return null;
  const arithmeticMean = (a + b) / 2;
  const geometricMean = Math.sqrt(a * b);
  return {
    arithmeticMean,
    geometricMean,
    difference: arithmeticMean - geometricMean,
    equality: a === b,
  };
}

export type FiniteMapping = Readonly<Record<number, readonly number[]>>;

export function isFiniteFunction(domain: readonly number[], mapping: FiniteMapping): boolean {
  return domain.every((input) => (mapping[input]?.length ?? 0) === 1);
}

export function rangeOf(mapping: FiniteMapping): number[] {
  return [...new Set(Object.values(mapping).flat())].sort((a, b) => a - b);
}

export function isInjective(domain: readonly number[], mapping: Readonly<Record<number, number>>): boolean {
  const outputs = domain.map((input) => mapping[input]);
  return outputs.every((value) => value !== undefined) && new Set(outputs).size === outputs.length;
}

export function projectInversePoint(x: number, y: number): readonly [number, number] {
  return [150 + x * 24, 150 - y * 24];
}

export function compositionDomains(
  fDomain: readonly number[],
  f: Readonly<Record<number, number>>,
  gDomain: readonly number[],
  g: Readonly<Record<number, number>>,
) {
  const gDomainSet = new Set(gDomain);
  const fDomainSet = new Set(fDomain);
  return {
    gAfterF: fDomain.filter((x) => gDomainSet.has(f[x]) && g[f[x]] !== undefined),
    fAfterG: gDomain.filter((x) => fDomainSet.has(g[x]) && f[g[x]] !== undefined),
  };
}

export function rationalFunctionValue(a: number, p: number, q: number, x: number): number | null {
  if (![a, p, q, x].every(Number.isFinite) || a === 0 || x === p) return null;
  const value = a / (x - p) + q;
  return Number.isFinite(value) ? value : null;
}
