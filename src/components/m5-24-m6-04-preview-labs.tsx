"use client";

import { useState } from "react";
import {
  checkContinuity,
  continuousCubic,
  getBridgeScenario,
  getLimitCalculation,
  getLimitScenario,
  getSqueezeScenario,
  intermediateValueConclusion,
  twoSidedLimit,
  type BridgeScenarioId,
  type ContinuityDomain,
  type LimitCalculationId,
  type LimitScenarioId,
  type SqueezeScenarioId,
} from "@/modules/math-validation/m5-24-m6-04-preview";

function SelectControl<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void }) {
  return <label className="lab-control"><span>{label}</span><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value as T)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function LimitGraph({ scenarioId }: { scenarioId: LimitScenarioId }) {
  const scenario = getLimitScenario(scenarioId);
  const values = [scenario.leftLimit, scenario.rightLimit, ...(scenario.functionValue === null ? [] : [scenario.functionValue])];
  const minimum = Math.min(...values);
  const span = Math.max(1, Math.max(...values) - minimum);
  const y = (value: number) => 140 - ((value - minimum) / span) * 100;
  return <svg className="math-graph" viewBox="0 0 320 180" role="img" aria-label={`x가 0에 접근할 때 왼쪽 함수값은 ${scenario.leftLimit}, 오른쪽 함수값은 ${scenario.rightLimit}, 점의 함수값은 ${scenario.functionValue ?? "정의되지 않음"}`}>
    <line x1="20" y1="145" x2="300" y2="145" stroke="currentColor" />
    <line x1="160" y1="20" x2="160" y2="160" stroke="currentColor" />
    <line x1="30" y1={y(scenario.leftLimit)} x2="158" y2={y(scenario.leftLimit)} stroke="currentColor" strokeWidth="3" />
    <line x1="162" y1={y(scenario.rightLimit)} x2="290" y2={y(scenario.rightLimit)} stroke="currentColor" strokeWidth="3" />
    <circle cx="160" cy={y(scenario.leftLimit)} r="6" fill="white" stroke="currentColor" strokeWidth="3" />
    {scenario.functionValue !== null && <circle cx="160" cy={y(scenario.functionValue)} r="5" fill="currentColor" />}
    <text x="242" y="170">x</text><text x="167" y="24">f(x)</text><text x="145" y="163">a=0</text>
  </svg>;
}

function M5BridgeLab() {
  const [scenario, setScenario] = useState<BridgeScenarioId>("excluded-point");
  const selected = getBridgeScenario(scenario);
  return <div className="lab math-lab"><SelectControl label="연결 전략" value={scenario} onChange={setScenario} options={[{ value: "excluded-point", label: "식 변환과 정의역" }, { value: "monotonicity", label: "증감과 수열 입력" }, { value: "induction", label: "기초와 귀납 단계" }]} /><svg className="math-graph" viewBox="0 0 320 100" role="img" aria-label={`${selected.concepts[0]}과 ${selected.concepts[1]}을 조건을 통해 연결하는 전략 지도`}><title>두 개념 연결 전략</title><rect x="12" y="25" width="120" height="48" rx="6" fill="none" stroke="currentColor" /><rect x="188" y="25" width="120" height="48" rx="6" fill="none" stroke="currentColor" /><line x1="132" y1="49" x2="188" y2="49" stroke="currentColor" strokeWidth="2" /><text x="20" y="54">{selected.concepts[0]}</text><text x="196" y="54">{selected.concepts[1]}</text></svg><div className="lab-result" aria-live="polite"><span>두 개념 연결</span><strong>{selected.concepts.join(" + ")}</strong><span>조건: {selected.condition}</span><p>{selected.conclusion}</p></div><p className="helper">각 활동은 두 개념만 연결하고, 사용한 조건과 제외값을 텍스트로 확인해요.</p></div>;
}

function M601Lab() {
  const [scenarioId, setScenarioId] = useState<LimitScenarioId>("same-sided");
  const scenario = getLimitScenario(scenarioId);
  const limit = twoSidedLimit(scenario.leftLimit, scenario.rightLimit);
  const xs = ["a−0.1", "a−0.01", "a−0.001", "a+0.001", "a+0.01", "a+0.1"];
  const values = [...scenario.leftSamples, ...scenario.rightSamples];
  return <div className="lab math-lab"><SelectControl label="접근 상황" value={scenarioId} onChange={setScenarioId} options={[{ value: "same-sided", label: "좌우에서 같은 값" }, { value: "jump", label: "좌우에서 다른 값" }, { value: "hole", label: "극한과 점값이 다름" }]} /><LimitGraph scenarioId={scenarioId} /><table><caption>a에 가까워질 때의 주변 함수값과 점의 함수값</caption><thead><tr><th scope="col">x</th><th scope="col">f(x)</th></tr></thead><tbody>{xs.map((x, index) => <tr key={x}><th scope="row">{x}</th><td>{values[index]}</td></tr>)}<tr><th scope="row">a</th><td>{scenario.functionValue ?? "정의되지 않음"}</td></tr></tbody></table><p className="lab-result" aria-live="polite"><span>좌극한 {scenario.leftLimit} · 우극한 {scenario.rightLimit}</span><strong>{limit === null ? "양쪽 극한은 존재하지 않아요." : `양쪽 극한은 ${limit}이에요.`}</strong><span>점에서의 함수값은 {scenario.functionValue ?? "정의되지 않음"}입니다.</span></p></div>;
}

function M602Lab() {
  const [caseId, setCaseId] = useState<LimitCalculationId>("cancel-hole");
  const example = getLimitCalculation(caseId);
  const definedText = example.originalDefinedAtPoint === null ? "정보만으로 판정할 수 없음" : example.originalDefinedAtPoint ? "정의됨" : "정의되지 않음";
  return <div className="lab math-lab"><SelectControl label="극한 계산 상황" value={caseId} onChange={setCaseId} options={[{ value: "sum", label: "합의 극한" }, { value: "zero-denominator", label: "분모 극한이 0" }, { value: "cancel-hole", label: "인수분해와 약분" }]} /><div className="lab-result" aria-live="polite"><span>{example.expression}</span><strong>{example.result === null ? "이 법칙만으로는 판정할 수 없어요." : `극한값 ${example.result}`}</strong><p>{example.explanation}</p><span>원래 식의 기준점 정의: {definedText}</span></div>{caseId === "cancel-hole" && <svg className="math-graph" viewBox="0 0 320 160" role="img" aria-label="약분된 직선 y=x+1에서 x=1일 때 열린 점으로 표시한 그래프"><line x1="24" y1="130" x2="296" y2="20" stroke="currentColor" strokeWidth="3" /><circle cx="160" cy="75" r="7" fill="white" stroke="currentColor" strokeWidth="3" /><text x="164" y="70">(1,2) 제외</text></svg>}</div>;
}

function M603Lab() {
  const [scenarioId, setScenarioId] = useState<SqueezeScenarioId>("squared-sine");
  const scenario = getSqueezeScenario(scenarioId);
  const samples = Array.from({ length: 41 }, (_, index) => -1 + (2 * index) / 40).filter((x) => Math.abs(x) >= 0.04);
  const lower = samples.map((x) => -x * x);
  const upper = samples.map((x) => x * x);
  const target = samples.map((x) => scenarioId === "squared-sine" ? x * x * Math.sin(1 / x) : Math.sin(x));
  const pointString = (values: number[]) => values.map((value, index) => `${20 + ((samples[index]! + 1) / 2) * 280},${80 - value * 54}`).join(" ");
  return <div className="lab math-lab"><SelectControl label="샌드위치 상황" value={scenarioId} onChange={setScenarioId} options={[{ value: "squared-sine", label: "x² sin(1/x)" }, { value: "absolute-value", label: "−|x| ≤ g(x) ≤ |x|" }, { value: "point-only", label: "한 점에서만 경계가 주어짐" }]} />{scenario.validNearPoint && <svg className="math-graph" viewBox="0 0 320 160" role="img" aria-label={`${scenario.lower}와 ${scenario.upper} 사이에 놓인 대상 함수의 유한 표본 그래프`}><line x1="20" y1="80" x2="300" y2="80" stroke="currentColor" /><polyline points={pointString(lower)} fill="none" stroke="currentColor" strokeDasharray="5 4" /><polyline points={pointString(upper)} fill="none" stroke="currentColor" strokeDasharray="5 4" /><polyline points={pointString(target)} fill="none" stroke="currentColor" strokeWidth="3" /></svg>}<div className="lab-result" aria-live="polite"><span>{scenario.lower} ≤ {scenario.target} ≤ {scenario.upper}</span><strong>{scenario.conclusion === null ? "한 점에서의 부등식만으로 극한을 결론낼 수 없어요." : `양쪽 경계의 극한이 ${scenario.lowerLimit}이므로 대상의 극한도 ${scenario.conclusion}이에요.`}</strong><p>{scenario.validNearPoint ? "부등식은 기준점 자체가 아닌 그 주변에서 성립해요." : "샌드위치 정리에는 기준점의 근방 전체에서 성립하는 경계가 필요해요."}</p></div></div>;
}

type ContinuityCase = "hole" | "jump" | "continuous" | "left-endpoint" | "right-endpoint";
const continuityCases: Record<ContinuityCase, { domain: ContinuityDomain; left: number | null; right: number | null; value: number | null; label: string }> = {
  hole: { domain: "interior", left: 2, right: 2, value: 7, label: "구멍과 점값 불일치" },
  jump: { domain: "interior", left: 1, right: 2, value: 2, label: "점프 불연속" },
  continuous: { domain: "interior", left: 1, right: 1, value: 1, label: "점에서 연속" },
  "left-endpoint": { domain: "left-endpoint", left: null, right: 2, value: 2, label: "닫힌구간 왼쪽 끝점" },
  "right-endpoint": { domain: "right-endpoint", left: 2, right: null, value: 2, label: "닫힌구간 오른쪽 끝점" },
};

function M604Lab() {
  const [caseId, setCaseId] = useState<ContinuityCase>("hole");
  const [target, setTarget] = useState(0);
  const selected = continuityCases[caseId];
  const continuity = checkContinuity(selected.domain, selected.left, selected.right, selected.value);
  const ivt = intermediateValueConclusion(-6, 6, target, true);
  const points = Array.from({ length: 41 }, (_, index) => {
    const x = -2 + index / 10;
    return `${20 + index * 7},${50 - (continuousCubic(x) ?? 0) * 6}`;
  }).join(" ");
  const targetY = 50 - target * 6;
  return <div className="lab math-lab"><SelectControl label="연속 상황" value={caseId} onChange={setCaseId} options={(Object.keys(continuityCases) as ContinuityCase[]).map((key) => ({ value: key, label: continuityCases[key].label }))} /><div className="lab-result" aria-live="polite"><span>함수값 정의: {continuity.functionDefined ? "예" : "아니오"} · 필요한 극한 존재: {continuity.requiredLimitsExist ? "예" : "아니오"}</span><strong>{continuity.continuous ? "이 범위에서 연속 조건을 만족해요." : "연속이 아니에요."}</strong><span>극한과 함수값 일치: {continuity.limitsMatchValue ? "예" : "아니오"}</span></div><label className="lab-control"><span>수평선 높이 N<strong>{target}</strong></span><input aria-label="수평선 높이 N" type="range" min={-5} max={5} value={target} onChange={(event) => setTarget(Number(event.target.value))} /></label><svg className="math-graph" viewBox="0 0 320 100" role="img" aria-label={`연속함수 x³−x의 유한 구간 그래프와 y=${target} 수평선. 정리는 교점이 적어도 하나 있음을 보장하며 유일성은 보장하지 않음.`}><line x1="20" y1="50" x2="300" y2="50" stroke="currentColor" /><line x1="20" x2="300" y1={targetY} y2={targetY} stroke="currentColor" strokeDasharray="5 4" /><polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" /></svg><p className="helper">닫힌구간에서 연속이고 N이 양 끝 함수값 사이이면 f(c)=N인 점이 적어도 하나 있어요. 유일하다고 결론내릴 수는 없어요. {ivt?.guaranteedAtLeastOne ? "현재 조건은 정리의 전제를 만족합니다." : "현재 조건을 다시 확인해요."}</p></div>;
}

export function M524M604PreviewLab({ unitId }: { unitId: string }) {
  switch (unitId) {
    case "M5-24": return <M5BridgeLab />;
    case "M6-01": return <M601Lab />;
    case "M6-02": return <M602Lab />;
    case "M6-03": return <M603Lab />;
    case "M6-04": return <M604Lab />;
    default: return <p className="helper">이 학습 실험은 준비 중입니다.</p>;
  }
}
