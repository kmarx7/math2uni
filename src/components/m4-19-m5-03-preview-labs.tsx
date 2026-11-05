"use client";

import { useState } from "react";
import {
  commonDomainOnIntegers, linearRadicalDomain, logarithm, logarithmDirection,
  rationalPower, realPower, rootRealDomain,
} from "@/modules/math-validation/m4-19-m5-03-preview";

function Slider({ label, value, min, max, step = 1, set }: {
  label: string; value: number; min: number; max: number; step?: number; set: (value: number) => void;
}) {
  return <label className="lab-control"><span>{label}<strong>{value}</strong></span><input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(event) => set(Number(event.target.value))} /></label>;
}

function RadicalFunctionLab() {
  const [coefficient, setCoefficient] = useState(1); const [constant, setConstant] = useState(-2);
  const domain = linearRadicalDomain(coefficient, constant);
  const domainLabel = !domain ? "실수 범위에서 정의되지 않아요." : domain.lower === null && domain.upper === null ? "모든 실수에서 정의돼요." : domain.lower !== null ? `x ≥ ${domain.lower}` : `x ≤ ${domain?.upper}`;
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>y=√(ax+b), 근호 안은 0 이상</span><strong>현재 정의역: {domainLabel}</strong><p>{coefficient === 0 ? (constant >= 0 ? `함수값이 항상 √${constant}이므로 정의역은 모든 실수지만, 상수 함수라 역함수는 함수가 아니에요.` : "근호 안이 음수라 실수 함수가 정의되지 않아요.") : `치역은 y≥0이고, 역함수는 x=(y²−${constant})/${coefficient} (y≥0)예요. 역함수의 정의역은 원함수의 치역과 같아요.`}</p></div><div className="lab-controls"><Slider label="근호 안의 계수 a" value={coefficient} min={-3} max={3} set={setCoefficient}/><Slider label="상수 b" value={constant} min={-6} max={6} set={setConstant}/></div><p className="helper">근호 안이 0인 경계값을 포함해요. a가 양수이면 경계 오른쪽, 음수이면 경계 왼쪽이 허용됩니다. a=0이면 b의 부호로 정의 여부가 결정됩니다.</p></div>;
}

function SynthesisLab() {
  const [checkRoot, setCheckRoot] = useState(true); const [checkDenominator, setCheckDenominator] = useState(true);
  const points = Array.from({ length: 9 }, (_, i) => i - 2);
  const allowed = commonDomainOnIntegers(points, [
    ...(checkRoot ? [(x: number) => x - 1 >= 0] : []),
    ...(checkDenominator ? [(x: number) => x - 2 !== 0] : []),
  ]);
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>이미 배운 조건을 같은 입력에 적용</span><strong>표본 입력 중 허용되는 값: {`{${allowed.join(", ")}}`}</strong><p>√(x−1)의 조건과 1/(x−2)의 조건을 각각 확인한 뒤 교집합을 봅니다. 표본 목록은 설명용이며 전체 실수 정의역을 대신하지 않아요.</p></div><fieldset className="lab-controls"><legend>함께 확인할 기존 조건</legend><label><input aria-label="근호 조건 적용" type="checkbox" checked={checkRoot} onChange={(event) => setCheckRoot(event.target.checked)}/> 근호 조건 x−1≥0</label><label><input aria-label="분모 조건 적용" type="checkbox" checked={checkDenominator} onChange={(event) => setCheckDenominator(event.target.checked)}/> 분모 조건 x−2≠0</label></fieldset><p className="helper">이 종합 활동은 새 정의를 추가하지 않으며, 선택된 선수 조건의 공통 허용 입력만 보여 줍니다.</p></div>;
}

function RationalExponentLab() {
  const [base, setBase] = useState(8); const [numerator, setNumerator] = useState(2); const [denominator, setDenominator] = useState(3); const [negativeBaseExtension, setNegativeBaseExtension] = useState(false);
  const result = rationalPower(base, numerator, denominator);
  const rootAllowed = rootRealDomain(base, denominator);
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>유리수 지수와 거듭제곱근</span><strong>{base}^({numerator}/{denominator}) = {result === null ? "실수 범위에서 정의되지 않아요" : Number(result.toFixed(4))}</strong><p>{denominator}제곱근에서 radicand {base}는 {rootAllowed ? "실수 범위에 허용돼요." : "짝수 차수 근호 조건을 만족하지 않아요."}</p></div><div className="lab-controls"><Slider label={negativeBaseExtension ? "확장 확인용 밑" : "양수 밑"} value={base} min={negativeBaseExtension ? -8 : 1} max={16} set={setBase}/><Slider label="분자" value={numerator} min={-3} max={5} set={setNumerator}/><Slider label="분모·근호 차수" value={denominator} min={2} max={5} set={setDenominator}/></div><label className="helper"><input type="checkbox" aria-label="음수 밑 확장 조건 확인" checked={negativeBaseExtension} onChange={(event) => { const enabled = event.target.checked; setNegativeBaseExtension(enabled); setBase((current) => enabled ? -Math.max(1, Math.abs(current)) : Math.max(1, Math.abs(current))); }}/> 선택 활동: 음수 밑과 기약분수 분모의 홀짝 조건을 확인해요. 교과 핵심 조작은 양수 밑입니다.</label><p className="helper">0의 음수 지수는 정의되지 않습니다.</p></div>;
}

function RealExponentLab() {
  const [base, setBase] = useState(2); const [exponent, setExponent] = useState(1.5);
  const value = realPower(base, exponent); const direction = base === 1 ? "상수 1" : base > 1 ? "증가" : "감소";
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>실수 지수는 양수 밑에서 다뤄요</span><strong>{base}^{exponent} = {value === null ? "정의되지 않음" : Number(value.toFixed(4))}</strong><p>밑이 {base}일 때 지수 x가 커지면 값은 {direction}합니다.{base === 1 ? " 어떤 지수에서도 값은 1이에요." : ""}</p></div><div className="lab-controls"><Slider label="양수 밑 a" value={base} min={0.2} max={3} step={0.1} set={setBase}/><Slider label="실수 지수 x" value={exponent} min={-2} max={3} step={0.1} set={setExponent}/></div><p className="helper">임의의 실수 지수 aˣ는 여기서 a&gt;0으로 제한합니다. 음수 밑에 실수 지수 법칙을 확장하지 않아요.</p></div>;
}

function LogarithmLab() {
  const [base, setBase] = useState(2); const [argument, setArgument] = useState(8);
  const value = logarithm(base, argument); const direction = logarithmDirection(base);
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>logₐ x = y ↔ aʸ = x</span><strong>{value === null ? "밑은 양수·1 제외, 진수는 양수여야 해요." : `log_${base}(${argument}) = ${Number(value.toFixed(4))}`}</strong><p>{direction === "increasing" ? "a>1이므로 로그 함수는 증가해요." : direction === "decreasing" ? "0<a<1이므로 로그 함수는 감소해요." : "현재 밑은 로그의 정의 조건을 만족하지 않아요."}</p></div><div className="lab-controls"><Slider label="로그의 밑 a" value={base} min={0.5} max={3} step={0.1} set={setBase}/><Slider label="로그의 진수 x" value={argument} min={-2} max={12} set={setArgument}/></div><p className="helper">로그의 조건은 a&gt;0, a≠1, x&gt;0입니다. 이 활동은 단조 방향만 살펴보고 로그 부등식은 풀지 않아요.</p></div>;
}

export function M4M5PreviewLab({ unitId }: { unitId: string }) {
  switch (unitId) {
    case "M4-19": return <RadicalFunctionLab/>;
    case "M4-20": return <SynthesisLab/>;
    case "M5-01": return <RationalExponentLab/>;
    case "M5-02": return <RealExponentLab/>;
    case "M5-03": return <LogarithmLab/>;
    default: return null;
  }
}
