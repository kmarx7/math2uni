/** Bounded, deterministic calculations used only by the M4-19~M5-03 preview labs. */

export type Interval = { lower: number | null; upper: number | null; lowerClosed: boolean; upperClosed: boolean };

export function linearRadicalDomain(coefficient: number, constant: number): Interval | null {
  if (!Number.isFinite(coefficient) || !Number.isFinite(constant)) return null;
  if (coefficient === 0) return constant >= 0
    ? { lower: null, upper: null, lowerClosed: false, upperClosed: false }
    : null;
  const boundary = -constant / coefficient;
  return coefficient > 0
    ? { lower: boundary, upper: null, lowerClosed: true, upperClosed: false }
    : { lower: null, upper: boundary, lowerClosed: false, upperClosed: true };
}

export function rootRealDomain(radicand: number, degree: number): boolean | null {
  if (!Number.isFinite(radicand) || !Number.isInteger(degree) || degree < 2) return null;
  return degree % 2 === 1 || radicand >= 0;
}

export function rationalPower(base: number, numerator: number, denominator: number): number | null {
  if (![base, numerator, denominator].every(Number.isFinite) || !Number.isInteger(numerator) || !Number.isInteger(denominator) || denominator === 0) return null;
  let p = Math.abs(numerator), q = Math.abs(denominator);
  while (q) [p, q] = [q, p % q];
  const gcd = p || 1;
  let n = numerator / gcd, d = denominator / gcd;
  if (d < 0) { n *= -1; d *= -1; }
  if (base < 0 && d % 2 === 0) return null;
  if (base === 0 && n <= 0) return null;
  const root = Math.sign(base) < 0 ? -Math.pow(-base, 1 / d) : Math.pow(base, 1 / d);
  const value = Math.pow(root, n);
  return Number.isFinite(value) ? value : null;
}

export function realPower(base: number, exponent: number): number | null {
  if (!Number.isFinite(base) || !Number.isFinite(exponent) || base <= 0) return null;
  const value = Math.pow(base, exponent);
  return Number.isFinite(value) ? value : null;
}

export function logarithm(base: number, argument: number): number | null {
  if (![base, argument].every(Number.isFinite) || base <= 0 || base === 1 || argument <= 0) return null;
  const value = Math.log(argument) / Math.log(base);
  return Number.isFinite(value) ? value : null;
}

export function logarithmDirection(base: number): "increasing" | "decreasing" | null {
  if (!Number.isFinite(base) || base <= 0 || base === 1) return null;
  return base > 1 ? "increasing" : "decreasing";
}

export function commonDomainOnIntegers(
  inputs: readonly number[],
  conditions: readonly ((input: number) => boolean)[],
): number[] {
  return inputs.filter((input) => Number.isFinite(input) && conditions.every((condition) => condition(input)));
}
