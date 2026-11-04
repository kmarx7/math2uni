"use client";

import { useState } from "react";
import {
  implicationForms,
  isSubset,
  partitionMembership,
  setComplement,
  setDifference,
  setIntersection,
  setUnion,
  truthSet,
} from "@/modules/math-validation/m4-09-13-preview";

const U = [1, 2, 3, 4, 5, 6, 7, 8];
const formatSet = (items: readonly number[]) => `{${items.join(", ")}}`;

function ToggleSet({ label, values, onChange }: { label: string; values: readonly number[]; onChange: (value: number) => void }) {
  return <fieldset className="lab-controls"><legend>{label}</legend><div className="question-actions">
    {U.map((value) => <button key={value} type="button" aria-pressed={values.includes(value)} className={values.includes(value) ? "selected" : ""} onClick={() => onChange(value)}>{value}</button>)}
  </div></fieldset>;
}

function SetDiagram({ universe, a, b, label }: { universe: readonly number[]; a: readonly number[]; b: readonly number[]; label: string }) {
  const { both, onlyA, onlyB, outside } = partitionMembership(universe, a, b);
  return <div>
    <svg viewBox="0 0 300 190" role="img" aria-label={label} style={{ display: "block", width: "min(100%, 25rem)" }}>
      <rect x="14" y="14" width="272" height="160" rx="8" fill="none" stroke="currentColor" />
      <text x="20" y="34">U</text><ellipse cx="112" cy="101" rx="72" ry="54" fill="#2563eb" fillOpacity="0.12" stroke="#2563eb" strokeWidth="2" />
      <ellipse cx="188" cy="101" rx="72" ry="54" fill="#b45309" fillOpacity="0.12" stroke="#b45309" strokeWidth="2" />
      <text x="72" y="49" fill="#1d4ed8">A</text><text x="220" y="49" fill="#92400e">B</text>
      <text x="100" y="103" textAnchor="middle">A만</text><text x="150" y="103" textAnchor="middle">A∩B</text><text x="200" y="103" textAnchor="middle">B만</text>
    </svg>
    <ul aria-label="벤 다이어그램 영역별 원소">
      <li>A에만 속함: {formatSet(onlyA)}</li><li>A와 B에 모두 속함: {formatSet(both)}</li>
      <li>B에만 속함: {formatSet(onlyB)}</li><li>U에서 A와 B 바깥: {formatSet(outside)}</li>
    </ul>
  </div>;
}

function SetRepresentationLab() {
  const [a, setA] = useState<number[]>([2, 4, 6]);
  const [b, setB] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [mode, setMode] = useState<"member" | "subset">("subset");
  const toggle = (values: number[], setter: (next: number[]) => void, value: number) => setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value].sort((x, y) => x - y));
  return <div className="lab math-lab">
    <div className="lab-result" aria-live="polite"><span>유한 전체집합 U={formatSet(U)}</span><strong>A={formatSet(a)} · B={formatSet(b)}</strong><p>{mode === "member" ? `원소 관계는 예를 들어 ${a.length ? `${a[0]}∈A` : "A는 비어 있어요"}처럼 원소 하나와 집합을 비교해요.` : `A⊆B는 ${isSubset(a, b) ? "참" : "거짓"}입니다. A의 모든 원소가 B에 있는지 확인했어요.`}</p></div>
    <SetDiagram universe={U} a={a} b={b} label={`전체집합 ${formatSet(U)}, A는 ${formatSet(a)}, B는 ${formatSet(b)}`} />
    <ToggleSet label="A의 원소 선택" values={a} onChange={(v) => toggle(a, setA, v)} /><ToggleSet label="B의 원소 선택" values={b} onChange={(v) => toggle(b, setB, v)} />
    <div className="question-actions" role="group" aria-label="관계 표현 선택"><button type="button" aria-pressed={mode === "member"} className={mode === "member" ? "selected" : ""} onClick={() => setMode("member")}>원소 ∈</button><button type="button" aria-pressed={mode === "subset"} className={mode === "subset" ? "selected" : ""} onClick={() => setMode("subset")}>부분집합 ⊆</button></div>
    <p className="helper">원소나열: A={formatSet(a)}. 조건제시: A={"{x∈U | x는 선택된 원소}"}. 순서와 반복은 집합을 바꾸지 않아요.</p>
  </div>;
}

function SetOperationsLab() {
  const [a, setA] = useState<number[]>([1, 2, 4]); const [b, setB] = useState<number[]>([2, 3, 5]);
  const [operation, setOperation] = useState<"union" | "intersection" | "complement" | "difference">("union");
  const toggle = (values: number[], setter: (next: number[]) => void, value: number) => setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value].sort((x, y) => x - y));
  const result = operation === "union" ? setUnion(a, b, U) : operation === "intersection" ? setIntersection(a, b, U) : operation === "complement" ? setComplement(a, U) : setDifference(a, b, U);
  const operationLabel = { union: "A∪B", intersection: "A∩B", complement: "Aᶜ (전체집합 U 기준)", difference: "A\\B" }[operation];
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>전체집합 U={formatSet(U)}를 고정해요</span><strong>{operationLabel} = {formatSet(result)}</strong><p>결과는 그림과 원소 목록으로 함께 확인합니다. 여집합은 항상 이 U 안에서 계산해요.</p></div>
    <SetDiagram universe={U} a={a} b={b} label={`${operationLabel} 계산: 결과 ${formatSet(result)}`} />
    <ToggleSet label="A 원소" values={a} onChange={(v) => toggle(a, setA, v)} /><ToggleSet label="B 원소" values={b} onChange={(v) => toggle(b, setB, v)} />
    <div className="question-actions" role="group" aria-label="집합 연산 선택">{(["union", "intersection", "complement", "difference"] as const).map((key) => <button key={key} type="button" aria-pressed={operation === key} className={operation === key ? "selected" : ""} onClick={() => setOperation(key)}>{{ union: "합집합 ∪", intersection: "교집합 ∩", complement: "여집합 ᶜ", difference: "차집합 A\\B" }[key]}</button>)}</div>
    <p className="helper">차집합은 순서가 중요해요. A\B는 A에는 있고 B에는 없는 원소입니다.</p>
  </div>;
}

function TruthSetLab() {
  const [domain, setDomain] = useState(8);
  const [condition, setCondition] = useState<"even" | "greater" | "multiple">("even");
  const values = Array.from({ length: domain }, (_, index) => index + 1);
  const selected = truthSet(values, (value) => condition === "even" ? value % 2 === 0 : condition === "greater" ? value > 4 : value % 3 === 0);
  const label = { even: "짝수", greater: "4보다 큰 수", multiple: "3의 배수" }[condition];
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>정의역 D={formatSet(values)}</span><strong>{label} 조건의 진리집합 T={formatSet(selected)}</strong><p>정의역의 각 수를 조건에 대입하고 참인 값만 모았어요.</p></div>
    <label className="lab-control"><span>정의역 끝값<strong>{domain}</strong></span><input aria-label="정의역 끝값" type="range" min="5" max="8" step="1" value={domain} onChange={(event) => setDomain(Number(event.target.value))} /></label>
    <div className="question-actions" role="group" aria-label="조건 선택">{(["even", "greater", "multiple"] as const).map((key) => <button key={key} type="button" aria-pressed={condition === key} className={condition === key ? "selected" : ""} onClick={() => setCondition(key)}>{{ even: "짝수", greater: "4보다 큼", multiple: "3의 배수" }[key]}</button>)}</div>
    <div className="question-actions" aria-label="각 원소의 조건 판정">{values.map((value) => <span className="soft-tag" key={value}>{value}: {selected.includes(value) ? "참 ✓" : "거짓"}</span>)}</div>
    <p className="helper">변수의 값이 정해지지 않은 식은 열린 조건이에요. 정의역을 먼저 밝혀야 진리집합이 하나로 정해집니다.</p>
  </div>;
}

function PropositionLab() {
  const [p, setP] = useState(true); const [q, setQ] = useState(false);
  const forms = implicationForms(p, q);
  const rows = [
    ["원명제 p⇒q", forms.original], ["역 q⇒p", forms.converse],
    ["이 ¬p⇒¬q", forms.inverse], ["대우 ¬q⇒¬p", forms.contrapositive],
  ] as const;
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>화살표의 시작이 전제, 끝이 결론이에요</span><strong>p={p ? "참" : "거짓"} → q={q ? "참" : "거짓"}</strong><p>원명제와 대우는 항상 같은 진리값이며, 역과 이는 서로 같은 진리값입니다.</p></div>
    <div className="question-actions" role="group" aria-label="명제의 진리값 조작"><button type="button" aria-pressed={p} className={p ? "selected" : ""} onClick={() => setP(!p)}>전제 p: {p ? "참" : "거짓"}</button><button type="button" aria-pressed={q} className={q ? "selected" : ""} onClick={() => setQ(!q)}>결론 q: {q ? "참" : "거짓"}</button></div>
    <ol aria-label="원명제와 변형 명제의 진리값">{rows.map(([name, value]) => <li key={name}>{name}: <strong>{value ? "참" : "거짓"}</strong></li>)}</ol>
    <p className="helper">p⇒q가 참이면 p는 q의 충분조건, q는 p의 필요조건이에요. 실제 조건에서는 역의 반례도 확인해요.</p>
  </div>;
}

function ProofFlowLab() {
  const [method, setMethod] = useState<"contrapositive" | "contradiction">("contrapositive");
  const steps = method === "contrapositive"
    ? ["목표: 정수 n이 짝수이면 n²도 짝수다.", "대우를 증명: n²이 홀수이면 n도 홀수다.", "정수 n을 두고 n²이 홀수라고 가정한다.", "만약 n이 짝수라면 n=2k이므로 n²=4k²=2(2k²)는 짝수다.", "이는 n²이 홀수라는 가정과 모순이다. 따라서 n은 짝수가 아니다.", "모든 정수는 짝수 또는 홀수이므로 n은 홀수다. 대우가 참이므로 원래 명제도 참이다."]
    : ["목표: 정수는 짝수이면서 홀수일 수 없다.", "결론의 부정을 가정: 같은 정수 n이 짝수이자 홀수다.", "정의에 따라 n=2a이고 n=2b+1인 정수 a,b가 있다.", "두 식을 같게 놓으면 2(a−b)=1이다.", "좌변은 짝수, 우변은 홀수라 모순이다. 따라서 그런 n은 없다."];
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>가정 → 정의 적용 → 결론/모순</span><strong>{method === "contrapositive" ? "대우 증명" : "귀류법"}</strong><p>각 단계가 앞 단계나 정의에서 왜 따라오는지 순서대로 확인해요.</p></div>
    <div className="question-actions" role="group" aria-label="증명 방법 선택"><button type="button" aria-pressed={method === "contrapositive"} className={method === "contrapositive" ? "selected" : ""} onClick={() => setMethod("contrapositive")}>대우 증명</button><button type="button" aria-pressed={method === "contradiction"} className={method === "contradiction" ? "selected" : ""} onClick={() => setMethod("contradiction")}>귀류법</button></div>
    <ol aria-label="증명 단계">{steps.map((step) => <li key={step}>{step}</li>)}</ol><p className="helper">대우 증명은 동치인 명제를 직접 보이고, 귀류법은 주장과 모순되는 가정을 세워 불가능함을 보여요.</p>
  </div>;
}

export function M4FoundationsPreviewLab({ unitId }: { unitId: string }) {
  switch (unitId) {
    case "M4-09": return <SetRepresentationLab />;
    case "M4-10": return <SetOperationsLab />;
    case "M4-11": return <TruthSetLab />;
    case "M4-12": return <PropositionLab />;
    case "M4-13": return <ProofFlowLab />;
    default: return null;
  }
}
