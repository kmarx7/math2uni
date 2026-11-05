"use client";

import { useState } from "react";
import {
  arithmeticGeometricMean,
  compositionDomains,
  isFiniteFunction,
  isInjective,
  projectInversePoint,
  rangeOf,
  rationalFunctionValue,
} from "@/modules/math-validation/m4-14-18-preview";

function NumberControl({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (next: number) => void;
}) {
  return <label className="lab-control"><span>{label}<strong>{value}</strong></span><input aria-label={label} type="range" min={min} max={max} step="1" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function MeanLab() {
  const [a, setA] = useState(2); const [b, setB] = useState(8);
  const result = arithmeticGeometricMean(a, b)!;
  return <div className="lab math-lab">
    <div className="lab-result" aria-live="polite"><span>a,b≥0인 두 수의 평균 비교</span><strong>({a}+{b})/2 = {result.arithmeticMean} ≥ √({a}·{b}) = {result.geometricMean.toFixed(2)}</strong><p>{result.equality ? "a=b이므로 등호가 성립해요." : "(√a−√b)²≥0을 이용하면 산술평균이 기하평균보다 크다는 것을 확인할 수 있어요."}</p></div>
    <div className="lab-controls"><NumberControl label="비음수 a" value={a} min={0} max={10} onChange={setA}/><NumberControl label="비음수 b" value={b} min={0} max={10} onChange={setB}/></div>
    <div className="ratio-track" role="img" aria-label={`산술평균 ${result.arithmeticMean}, 기하평균 ${result.geometricMean.toFixed(2)}`}><span style={{ width: `${Math.min(100, result.geometricMean / Math.max(1, result.arithmeticMean) * 100)}%` }} /></div>
    <p className="helper">a,b는 음수가 아닌 실수로 제한해요. 두 평균이 같아지는 조건은 a=b입니다.</p>
  </div>;
}

const domain = [1, 2, 3] as const;
const codomain = [1, 2, 3] as const;

function FunctionMappingLab() {
  const [mapping, setMapping] = useState<Record<number, number[]>>({ 1: [1], 2: [2], 3: [2] });
  const fn = isFiniteFunction(domain, mapping);
  const range = rangeOf(mapping);
  function toggle(input: number, output: number) {
    setMapping((current) => {
      const values = current[input] ?? [];
      return { ...current, [input]: values.includes(output) ? values.filter((item) => item !== output) : [...values, output].sort((x, y) => x - y) };
    });
  }
  return <div className="lab math-lab">
    <div className="lab-result" aria-live="polite"><span>정의역 D={"{"}{domain.join(", ")}{"}"} · 공역 C={"{"}{codomain.join(", ")}{"}"}</span><strong>이 대응은 {fn ? "함수예요" : "함수가 아니에요"}</strong><p>각 입력에 연결된 출력 수가 정확히 하나여야 함수입니다. 현재 치역은 {`{${range.join(", ")}}`}이고 공역 전체와 다를 수 있어요.</p></div>
    <fieldset className="lab-controls"><legend>입력마다 출력 연결을 바꿔 보세요. 여러 개 또는 0개도 선택할 수 있어요.</legend>
      {domain.map((input) => <div key={input} className="question-actions" role="group" aria-label={`입력 ${input}의 출력 선택`}><span>입력 {input} →</span>{codomain.map((output) => <button key={output} type="button" aria-pressed={mapping[input]?.includes(output) ?? false} className={mapping[input]?.includes(output) ? "selected" : ""} onClick={() => toggle(input, output)}>{output}</button>)}</div>)}
    </fieldset>
    <ul aria-label="현재 대응 목록">{domain.map((input) => <li key={input}>{input}의 출력: {mapping[input]?.length ? mapping[input].join(", ") : "없음"}</li>)}</ul>
    <p className="helper">서로 다른 입력이 같은 출력으로 가도 함수가 될 수 있어요. 한 입력에서 출력이 둘 이상이거나 하나도 없으면 함수가 아닙니다.</p>
  </div>;
}

const fDomain = [-1, 0, 1, 2] as const;
const f = { [-1]: 0, 0: 1, 1: 2, 2: 3 };
const gDomain = [0, 1, 2, 3] as const;
const g = { 0: 0, 1: 1, 2: 4, 3: 9 };

function CompositionLab() {
  const [x, setX] = useState(-1);
  const domains = compositionDomains(fDomain, f, gDomain, g);
  const fValue = f[x as keyof typeof f];
  const gfAllowed = domains.gAfterF.includes(x);
  const gValue = gfAllowed ? g[fValue as keyof typeof g] : undefined;
  const fgAllowed = gDomain.includes(x as (typeof gDomain)[number]) && f[g[x as keyof typeof g] as keyof typeof f] !== undefined;
  const fgValue = fgAllowed ? f[g[x as keyof typeof g] as keyof typeof f] : undefined;
  return <div className="lab math-lab">
    <div className="lab-result" aria-live="polite"><span>f(x)=x+1 (D={"{"}{fDomain.join(", ")}{"}"}), g(x)=x² (D={"{"}{gDomain.join(", ")}{"}"})</span><strong>x={x}일 때 g∘f: {gfAllowed ? `g(${fValue})=${gValue}` : "정의되지 않음"} · f∘g: {fgAllowed ? `f(${g[x as keyof typeof g]})=${fgValue}` : "정의되지 않음"}</strong><p>먼저 안쪽 함수를 계산하고 그 출력이 바깥 함수의 정의역에 속하는지 확인해요.</p></div>
    <NumberControl label="합성에 넣을 입력 x" value={x} min={-1} max={3} onChange={setX}/>
    <div className="question-actions" aria-label="합성 정의역"><span>g∘f의 허용 입력: {`{${domains.gAfterF.join(", ")}}`}</span><span>f∘g의 허용 입력: {`{${domains.fAfterG.join(", ")}}`}</span></div>
    <p className="helper">보통 g∘f와 f∘g는 값과 정의역이 다를 수 있어요. 합성식만 정리하지 말고 두 단계의 정의역 조건을 함께 확인합니다.</p>
  </div>;
}

function InverseLab() {
  const [restricted, setRestricted] = useState(false);
  const originalDomain = restricted ? [0, 1, 2] : [-2, -1, 0, 1, 2];
  const mapping = Object.fromEntries(originalDomain.map((x) => [x, x * x]));
  const injective = isInjective(originalDomain, mapping);
  const inversePairs = originalDomain.map((x) => `(${x * x}, ${x})`);
  const points = originalDomain.map((x) => ({ x, y: x * x }));
  const point = projectInversePoint;
  return <div className="lab math-lab">
    <div className="lab-result" aria-live="polite"><span>유한 표본 함수 f(x)=x² · D={restricted ? "{0,1,2}" : "{-2,-1,0,1,2}"}</span><strong>{injective ? "역관계도 함수예요" : "역관계는 함수가 아니에요"}</strong><p>현재 표본의 치역은 {`{${[...new Set(Object.values(mapping))].sort((a,b)=>a-b).join(", ")}}`}. 역관계의 입력과 출력은 원래 함수의 치역과 정의역을 서로 바꿉니다.</p></div>
    <div className="question-actions" role="group" aria-label="원함수 유한 정의역 선택"><button type="button" aria-pressed={!restricted} className={!restricted ? "selected" : ""} onClick={() => setRestricted(false)}>전체 유한 정의역 D={"{"}-2,-1,0,1,2{"}"}</button><button type="button" aria-pressed={restricted} className={restricted ? "selected" : ""} onClick={() => setRestricted(true)}>제한 유한 정의역 D={"{"}0,1,2{"}"}</button></div>
    <svg viewBox="0 0 300 300" role="img" aria-label="함수와 역관계의 점을 y=x 대각선에 대해 비교하는 그래프" style={{ display: "block", width: "min(100%, 25rem)" }}><line x1="20" y1="280" x2="280" y2="20" stroke="#64748b" strokeDasharray="5 4"/><text x="218" y="38">y=x</text><line x1="20" y1="150" x2="280" y2="150" stroke="currentColor"/><line x1="150" y1="20" x2="150" y2="280" stroke="currentColor"/>{points.map(({x,y}) => {const [cx,cy]=point(x,y);const [ix,iy]=point(y,x);return <g key={x}><circle cx={cx} cy={cy} r="4" fill="#2563eb"/><circle cx={ix} cy={iy} r="4" fill="#b45309"/></g>;})}</svg>
    <p>역관계의 순서쌍: {inversePairs.join(", ")}</p>
    <p className="helper">이 실험은 정수 표본만 비교해 연속 구간의 전체 치역을 나타내지 않아요. 유한 정의역 {"{"}-2,-1,0,1,2{"}"}에서는 −x와 x가 같은 제곱값을 가져 역관계가 함수가 아니에요. 표본 정의역을 {"{"}0,1,2{"}"}로 제한하면 일대일이 되어 역관계도 함수가 됩니다. f⁻¹은 1/f를 뜻하지 않아요.</p>
  </div>;
}

function RationalFunctionLab() {
  const [a, setA] = useState(2); const [p, setP] = useState(1); const [q, setQ] = useState(-1);
  const xs = Array.from({ length: 13 }, (_, index) => index - 6).filter((x) => x !== p);
  const values = xs.map((x) => ({ x, y: rationalFunctionValue(a, p, q, x)! }));
  return <div className="lab math-lab">
    <div className="lab-result" aria-live="polite"><span>y=a/(x−p)+q</span><strong>y={a}/(x−({p}))+({q}) · 정의역에서 x≠{p}</strong><p>수직 점근선 x={p}, 수평 점근선 y={q}, 치역에서 y≠{q}입니다. x={p}에서는 함수값이 정의되지 않습니다.</p></div>
    <div className="lab-controls"><NumberControl label="계수 a (0 제외)" value={a} min={-4} max={4} onChange={(next) => setA(next === 0 ? (a > 0 ? -1 : 1) : next)}/><NumberControl label="가로 이동 p" value={p} min={-3} max={3} onChange={setP}/><NumberControl label="세로 이동 q" value={q} min={-3} max={3} onChange={setQ}/></div>
    <svg viewBox="0 0 300 200" role="img" aria-label={`유리함수 그래프의 표본점, 수직 점근선 x=${p}, 수평 점근선 y=${q}; x=${p}는 제외`} style={{ display: "block", width: "min(100%, 25rem)" }}><line x1="12" y1="100" x2="288" y2="100" stroke="currentColor"/><line x1="150" y1="8" x2="150" y2="192" stroke="currentColor"/><line x1={150 + p*18} y1="8" x2={150 + p*18} y2="192" stroke="#b45309" strokeDasharray="5 4"/><line x1="12" y1={100-q*10} x2="288" y2={100-q*10} stroke="#2563eb" strokeDasharray="5 4"/>{values.map(({x,y}) => {const [cx,cy]=[150+x*18,100-y*10]; if(cx<12||cx>288||cy<8||cy>192)return null;return <circle key={x} cx={cx} cy={cy} r="3.5" fill="currentColor"/>;})}</svg>
    <ul aria-label="유리함수의 정의된 표본값">{values.map(({x,y})=><li key={x}>x={x}: y={y.toFixed(2)}</li>)}</ul>
    <p className="helper">그래프는 정의된 정수 입력의 표본점과 점근선을 보여 줍니다. 점근선 x=p는 정의역에서 제외하며, 표본점은 두 가지를 선으로 연결하지 않아요.</p>
  </div>;
}

export function M4FunctionsPreviewLab({ unitId }: { unitId: string }) {
  switch (unitId) {
    case "M4-14": return <MeanLab/>;
    case "M4-15": return <FunctionMappingLab/>;
    case "M4-16": return <CompositionLab/>;
    case "M4-17": return <InverseLab/>;
    case "M4-18": return <RationalFunctionLab/>;
    default: return null;
  }
}
