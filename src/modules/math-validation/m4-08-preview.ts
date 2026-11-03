export type Point2 = readonly [number, number];

export type CircleData = {
  center: [number, number];
  radiusSquared: number;
  radius: number;
  realCircle: boolean;
};

export type CircleLineRelation = "secant" | "tangent" | "disjoint" | "invalid";

export function pointLineProjection(point: Point2, a: number, b: number, c: number) {
  if (![...point, a, b, c].every(Number.isFinite) || (a === 0 && b === 0)) return null;
  const residual = a * point[0] + b * point[1] + c;
  const normSquared = a * a + b * b;
  const foot: [number, number] = [
    point[0] - (a * residual) / normSquared,
    point[1] - (b * residual) / normSquared,
  ];
  return { foot, distance: Math.abs(residual) / Math.sqrt(normSquared), residual, normSquared };
}

export function circleFromCenterRadius(center: Point2, radius: number): CircleData | null {
  if (![...center, radius].every(Number.isFinite) || radius < 0) return null;
  return {
    center: [center[0], center[1]],
    radiusSquared: radius * radius,
    radius,
    realCircle: radius > 0,
  };
}

/** Converts x²+y²+Dx+Ey+F=0 to center/radius data. */
export function circleFromGeneralForm(d: number, e: number, f: number): CircleData | null {
  if (![d, e, f].every(Number.isFinite)) return null;
  const h = -d / 2;
  const k = -e / 2;
  const radiusSquared = h * h + k * k - f;
  return {
    center: [h, k],
    radiusSquared,
    radius: Math.sqrt(Math.max(0, radiusSquared)),
    realCircle: radiusSquared > 0,
  };
}

export function circleLineRelation(radius: number, perpendicularDistance: number): CircleLineRelation {
  if (![radius, perpendicularDistance].every(Number.isFinite) || radius <= 0 || perpendicularDistance < 0) return "invalid";
  if (perpendicularDistance < radius) return "secant";
  if (perpendicularDistance === radius) return "tangent";
  return "disjoint";
}

export function translatePoint(point: Point2, dx: number, dy: number): [number, number] | null {
  if (![...point, dx, dy].every(Number.isFinite)) return null;
  return [point[0] + dx, point[1] + dy];
}

/** Translates y=mx+b by (dx,dy), returning y=m'x+b'. */
export function translateLine(m: number, b: number, dx: number, dy: number) {
  if (![m, b, dx, dy].every(Number.isFinite)) return null;
  return { slope: m, intercept: b + dy - m * dx };
}

export type Reflection = "x-axis" | "y-axis" | "origin";

export function reflectPoint(point: Point2, across: Reflection): [number, number] | null {
  if (!point.every(Number.isFinite)) return null;
  if (across === "x-axis") return [point[0], -point[1]];
  if (across === "y-axis") return [-point[0], point[1]];
  return [-point[0], -point[1]];
}

/** Reflects y=mx+b across the selected axis/origin, preserving slope-intercept form. */
export function reflectLine(m: number, b: number, across: Reflection) {
  if (![m, b].every(Number.isFinite)) return null;
  if (across === "x-axis") return { slope: -m, intercept: -b };
  if (across === "y-axis") return { slope: -m, intercept: b };
  return { slope: m, intercept: -b };
}

export function translateCircle(center: Point2, dx: number, dy: number) {
  return translatePoint(center, dx, dy);
}

export function reflectCircle(center: Point2, across: Reflection) {
  return reflectPoint(center, across);
}

/** Square SVG projection for bounded coordinates [-8, 8]². */
export function projectM4Point(point: Point2): [number, number] {
  return [150 + point[0] * 16, 150 - point[1] * 16];
}
