/** Fixed, bounded demonstrations for M5-24 and M6-01~M6-04. No formula parser. */

export type LimitScenarioId = "same-sided" | "jump" | "hole";
export type LimitScenario = {
  id: LimitScenarioId;
  leftSamples: number[];
  rightSamples: number[];
  leftLimit: number;
  rightLimit: number;
  functionValue: number | null;
};

const limitScenarios: Record<LimitScenarioId, LimitScenario> = {
  "same-sided": { id: "same-sided", leftSamples: [2.9, 2.99, 2.999], rightSamples: [3.1, 3.01, 3.001], leftLimit: 3, rightLimit: 3, functionValue: 3 },
  jump: { id: "jump", leftSamples: [1, 1, 1], rightSamples: [2, 2, 2], leftLimit: 1, rightLimit: 2, functionValue: 2 },
  hole: { id: "hole", leftSamples: [2, 2, 2], rightSamples: [2, 2, 2], leftLimit: 2, rightLimit: 2, functionValue: 7 },
};

export function getLimitScenario(id: LimitScenarioId): LimitScenario {
  return limitScenarios[id];
}

export function twoSidedLimit(left: number | null, right: number | null): number | null {
  if (left === null || right === null || !Number.isFinite(left) || !Number.isFinite(right) || Math.abs(left) > 1e6 || Math.abs(right) > 1e6) return null;
  return Math.abs(left - right) <= 1e-9 ? (left + right) / 2 : null;
}

export type LimitCalculationId = "sum" | "zero-denominator" | "cancel-hole";
export type LimitCalculation = {
  id: LimitCalculationId;
  expression: string;
  leftLimit: number;
  rightLimit: number;
  result: number | null;
  originalDefinedAtPoint: boolean | null;
  explanation: string;
};

const limitCalculations: Record<LimitCalculationId, LimitCalculation> = {
  sum: { id: "sum", expression: "lim f + 2 lim g;  lim f=2, lim g=3", leftLimit: 2, rightLimit: 3, result: 8, originalDefinedAtPoint: true, explanation: "합의 극한은 각 극한의 합과 같아요: 2+2·3=8." },
  "zero-denominator": { id: "zero-denominator", expression: "lim f / lim g;  lim f=1, lim g=0", leftLimit: 1, rightLimit: 0, result: null, originalDefinedAtPoint: null, explanation: "분모의 극한이 0이므로 몫의 극한 법칙을 바로 적용할 수 없어요. 이 정보만으로 기준점의 함수 정의 여부도 알 수 없어요." },
  "cancel-hole": { id: "cancel-hole", expression: "(x²−1)/(x−1),  x→1", leftLimit: 1, rightLimit: 1, result: 2, originalDefinedAtPoint: false, explanation: "x≠1인 근방에서 x+1로 약분해 극한은 2예요. 원래 식은 x=1에서 정의되지 않아요." },
};

export function getLimitCalculation(id: LimitCalculationId): LimitCalculation {
  return limitCalculations[id];
}

export type SqueezeScenarioId = "squared-sine" | "absolute-value" | "point-only";
export type SqueezeScenario = { id: SqueezeScenarioId; lower: string; target: string; upper: string; lowerLimit: number | null; upperLimit: number | null; conclusion: number | null; validNearPoint: boolean };

const squeezeScenarios: Record<SqueezeScenarioId, SqueezeScenario> = {
  "squared-sine": { id: "squared-sine", lower: "−x²", target: "x² sin(1/x)", upper: "x²", lowerLimit: 0, upperLimit: 0, conclusion: 0, validNearPoint: true },
  "absolute-value": { id: "absolute-value", lower: "−|x|", target: "sin x", upper: "|x|", lowerLimit: 0, upperLimit: 0, conclusion: 0, validNearPoint: true },
  "point-only": { id: "point-only", lower: "(a에서만) −1", target: "h(x)", upper: "(a에서만) 1", lowerLimit: null, upperLimit: null, conclusion: null, validNearPoint: false },
};

export function getSqueezeScenario(id: SqueezeScenarioId): SqueezeScenario {
  return squeezeScenarios[id];
}

export type ContinuityDomain = "interior" | "left-endpoint" | "right-endpoint";
export type ContinuityCheck = { continuous: boolean; functionDefined: boolean; requiredLimitsExist: boolean; limitsMatchValue: boolean };

/** Checks one-/two-sided continuity from already bounded numeric inputs. */
export function checkContinuity(
  domain: ContinuityDomain,
  leftLimit: number | null,
  rightLimit: number | null,
  functionValue: number | null,
): ContinuityCheck {
  const values = [leftLimit, rightLimit, functionValue].filter((value): value is number => value !== null);
  if (values.some((value) => !Number.isFinite(value) || Math.abs(value) > 1e6)) return { continuous: false, functionDefined: false, requiredLimitsExist: false, limitsMatchValue: false };
  const functionDefined = functionValue !== null;
  const requiredLimitsExist = domain === "interior"
    ? leftLimit !== null && rightLimit !== null && Math.abs(leftLimit - rightLimit) <= 1e-9
    : domain === "left-endpoint" ? rightLimit !== null : leftLimit !== null;
  const requiredLimit = domain === "left-endpoint" ? rightLimit : domain === "right-endpoint" ? leftLimit : leftLimit;
  const limitsMatchValue = functionDefined && requiredLimitsExist && requiredLimit !== null && Math.abs(requiredLimit - functionValue) <= 1e-9;
  return { continuous: functionDefined && requiredLimitsExist && limitsMatchValue, functionDefined, requiredLimitsExist, limitsMatchValue };
}

export type IntermediateValueResult = { guaranteedAtLeastOne: boolean; reason: string };

/** The IVT conclusion is existence only; it does not claim uniqueness. */
export function intermediateValueConclusion(
  leftValue: number,
  rightValue: number,
  target: number,
  continuousOnClosedInterval: boolean,
): IntermediateValueResult | null {
  if (![leftValue, rightValue, target].every(Number.isFinite) || [leftValue, rightValue, target].some((value) => Math.abs(value) > 1e6)) return null;
  const between = target >= Math.min(leftValue, rightValue) && target <= Math.max(leftValue, rightValue);
  const guaranteedAtLeastOne = continuousOnClosedInterval && between;
  return { guaranteedAtLeastOne, reason: guaranteedAtLeastOne ? "연속성과 끝값 조건으로 f(c)=N인 c가 적어도 하나 존재해요. 유일성은 결론하지 않아요." : "닫힌구간의 연속성과 목표값이 끝값 사이에 있는지 확인해요." };
}

export type BridgeScenarioId = "excluded-point" | "monotonicity" | "induction";
export type BridgeScenario = { id: BridgeScenarioId; concepts: [string, string]; condition: string; conclusion: string };

const bridgeScenarios: Record<BridgeScenarioId, BridgeScenario> = {
  "excluded-point": { id: "excluded-point", concepts: ["식 변환", "정의역"], condition: "x≠1이고 x>1", conclusion: "(x²−1)/(x−1)=x+1>2. x=1은 원래 식의 정의역에서 제외돼요." },
  monotonicity: { id: "monotonicity", concepts: ["함수의 증감", "수열 입력"], condition: "0<a₁<a₂<a₃, f(x)=x² (x>0)", conclusion: "양수 범위에서 증가하므로 f(a₁)<f(a₂)<f(a₃)예요." },
  induction: { id: "induction", concepts: ["기초 사례", "귀납 단계"], condition: "P(n)은 n≥1에서 증명", conclusion: "P(1) 확인과 임의의 k≥1에서 P(k)⇒P(k+1) 유도가 모두 필요해요." },
};

export function getBridgeScenario(id: BridgeScenarioId): BridgeScenario {
  return bridgeScenarios[id];
}

/** Fixed smooth curve used only for a finite illustrative plot. */
export function continuousCubic(x: number): number | null {
  if (!Number.isFinite(x) || x < -2 || x > 2) return null;
  return x * x * x - x;
}
