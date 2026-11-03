export function factorTheoremValue(a: number) {
  return a * a - 5 * a + 6;
}

export function factorDifferenceOfSquares(r: number) {
  return { left: `x−${r}`, right: `x+${r}`, expanded: `x²−${r * r}` };
}

export type Complex = { real: number; imaginary: number };
export function complexAdd(z: Complex, w: Complex): Complex {
  return { real: z.real + w.real, imaginary: z.imaginary + w.imaginary };
}
export function complexMultiply(z: Complex, w: Complex): Complex {
  return { real: z.real * w.real - z.imaginary * w.imaginary, imaginary: z.real * w.imaginary + z.imaginary * w.real };
}
export function complexDivide(z: Complex, w: Complex): Complex | null {
  const denominator = w.real * w.real + w.imaginary * w.imaginary;
  if (denominator === 0) return null;
  return { real: (z.real * w.real + z.imaginary * w.imaginary) / denominator, imaginary: (z.imaginary * w.real - z.real * w.imaginary) / denominator };
}

export function quadraticDiscriminant(a: number, b: number, c: number) {
  if (a === 0) return null;
  const value = b * b - 4 * a * c;
  return { value, roots: value > 0 ? "two-real" as const : value === 0 ? "repeated-real" as const : "two-complex" as const };
}
