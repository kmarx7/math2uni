/** Small finite-set/logic helpers used by the M4-09~13 development labs. */
export type FiniteSet = readonly number[];

export function normalizeFiniteSet(values: readonly number[], universe: FiniteSet): number[] {
  const allowed = new Set(universe);
  return [...new Set(values.filter((value) => Number.isInteger(value) && allowed.has(value)))].sort((a, b) => a - b);
}

export function setUnion(a: FiniteSet, b: FiniteSet, universe: FiniteSet): number[] {
  return normalizeFiniteSet([...a, ...b], universe);
}

export function setIntersection(a: FiniteSet, b: FiniteSet, universe: FiniteSet): number[] {
  const right = new Set(b);
  return normalizeFiniteSet(a.filter((value) => right.has(value)), universe);
}

export function setDifference(a: FiniteSet, b: FiniteSet, universe: FiniteSet): number[] {
  const excluded = new Set(b);
  return normalizeFiniteSet(a.filter((value) => !excluded.has(value)), universe);
}

export function setComplement(a: FiniteSet, universe: FiniteSet): number[] {
  const included = new Set(a);
  return normalizeFiniteSet(universe.filter((value) => !included.has(value)), universe);
}

export function isSubset(a: FiniteSet, b: FiniteSet): boolean {
  const right = new Set(b);
  return a.every((value) => right.has(value));
}

export function partitionMembership(universe: FiniteSet, a: FiniteSet, b: FiniteSet) {
  return {
    onlyA: normalizeFiniteSet(universe.filter((value) => a.includes(value) && !b.includes(value)), universe),
    both: normalizeFiniteSet(universe.filter((value) => a.includes(value) && b.includes(value)), universe),
    onlyB: normalizeFiniteSet(universe.filter((value) => !a.includes(value) && b.includes(value)), universe),
    outside: normalizeFiniteSet(universe.filter((value) => !a.includes(value) && !b.includes(value)), universe),
  };
}

export function truthSet<T>(universe: readonly T[], predicate: (value: T) => boolean): T[] {
  return universe.filter(predicate);
}

export function implication(p: boolean, q: boolean): boolean {
  return !p || q;
}

export function implicationForms(p: boolean, q: boolean) {
  return {
    original: implication(p, q),
    converse: implication(q, p),
    inverse: implication(!p, !q),
    contrapositive: implication(!q, !p),
  };
}
