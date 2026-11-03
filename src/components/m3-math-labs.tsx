"use client";

import { useState } from "react";
import type { Block } from "@/contracts";
import { complexAdd, complexDivide, complexMultiply, factorTheoremValue, quadraticDiscriminant } from "@/modules/math-validation/m3-preview";

type Interaction = Extract<Block, { type: "InteractiveBlock" }>;

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return <label className="lab-control"><span>{label}<strong>{value}</strong></span><input aria-label={label} type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function FactorTheoremLab() {
  const [candidate, setCandidate] = useState(2);
  const value = factorTheoremValue(candidate);
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>P(x)=x²−5x+6에 후보 수를 대입해요</span><strong>P({candidate}) = {candidate}²−5×{candidate}+6 = {value}</strong><p>{value === 0 ? `P(${candidate})=0이므로 x−${candidate}는 인수입니다.` : `P(${candidate})가 0이 아니므로 x−${candidate}는 인수가 아닙니다.`}</p></div><Slider label="후보 수 a" value={candidate} min={-2} max={5} onChange={setCandidate} /><div className="factor-theorem-pair" role="img" aria-label={`후보 ${candidate}를 다항식에 대입한 값은 ${value}`}><span>x−a</span><span aria-hidden="true">↔</span><strong>P(a)={value}</strong></div><p className="helper">인수정리는 x−a가 인수인지 P(a)=0인지로 확인합니다. 이 활동은 정수 후보만 살펴봅니다.</p></div>;
}

function FactorizationLab() {
  const [root, setRoot] = useState(2);
  const [mode, setMode] = useState<"difference" | "substitution">("difference");
  const constant = root * root;
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>{mode === "difference" ? "제곱의 차를 두 인수로 나눠요" : "A=x²로 두어 식을 짧게 읽어요"}</span><strong>{mode === "difference" ? `x²−${constant} = (x−${root})(x+${root})` : `x⁴−${constant}x² = A²−${constant}A = A(A−${constant})`}</strong><p>{mode === "difference" ? "두 제곱의 차는 (앞−뒤)(앞+뒤)로 인수분해됩니다." : `A=x²를 다시 대입하면 x²(x²−${constant})가 됩니다.`}</p></div><div className="question-actions" role="group" aria-label="인수분해 방식 선택"><button type="button" aria-pressed={mode === "difference"} className={mode === "difference" ? "selected" : ""} onClick={() => setMode("difference")}>제곱의 차</button><button type="button" aria-pressed={mode === "substitution"} className={mode === "substitution" ? "selected" : ""} onClick={() => setMode("substitution")}>A=x² 치환</button></div><Slider label="기준 수 r" value={root} min={1} max={5} onChange={setRoot} /><p className="helper">치환한 뒤에는 A=x²를 원래 식에 되돌려 넣고, 각 인수에 빠짐없이 대입했는지 확인하세요.</p></div>;
}

function ComplexPlaneLab() {
  const [real, setReal] = useState(-2);
  const [imaginary, setImaginary] = useState(3);
  const x = 130 + real * 18;
  const y = 100 - imaginary * 15;
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>복소수 z=a+bi를 좌표로 읽어요</span><strong>z = {real}{imaginary < 0 ? " − " : " + "}{Math.abs(imaginary)}i</strong><p>실수부 Re(z)={real}, 허수부 Im(z)={imaginary}. Im(z)는 i의 계수입니다.</p></div><Slider label="실수부 a · 가로" value={real} min={-6} max={6} onChange={setReal} /><Slider label="허수부 b · 세로" value={imaginary} min={-6} max={6} onChange={setImaginary} /><svg viewBox="0 0 260 200" role="img" aria-label={`복소평면에서 z는 (${real}, ${imaginary}) 위치`} style={{ display: "block", width: "min(100%, 22rem)", margin: "1rem auto" }}><line x1="20" y1="100" x2="240" y2="100" stroke="currentColor"/><line x1="130" y1="15" x2="130" y2="185" stroke="currentColor"/><text x="225" y="94">실수부</text><text x="136" y="24">허수부</text><circle cx={x} cy={y} r="6" fill="currentColor"/><text x={Math.max(25, Math.min(200, x + 8))} y={Math.max(25, Math.min(180, y - 8))}>{real}+{imaginary}i</text></svg><p className="helper">실수축과 허수축은 위치를 나타내는 좌표축입니다. 복소수는 크기를 비교하는 수직선 순서로 배열하지 않습니다.</p></div>;
}

function formatComplex(real: number, imag: number) { return `${real}${imag < 0 ? " − " : " + "}${Math.abs(imag)}i`; }

function ComplexOperationsLab() {
  const [a, setA] = useState(2); const [b, setB] = useState(1); const [c, setC] = useState(1); const [d, setD] = useState(-1);
  const [operation, setOperation] = useState<"add" | "multiply" | "divide">("multiply");
  const z = { real: a, imaginary: b }; const w = { real: c, imaginary: d };
  const computed = operation === "add" ? complexAdd(z, w) : operation === "multiply" ? complexMultiply(z, w) : complexDivide(z, w);
  const valid = computed !== null;
  const result = computed ? formatComplex(computed.real, computed.imaginary) : "정의되지 않음";
  const denominator = c * c + d * d;
  const explanation = operation === "add" ? "실수부와 허수부끼리 더합니다." : operation === "multiply" ? "분배법칙을 쓰고 i²=−1을 적용합니다." : valid ? `분모의 켤레를 곱해 분모를 ${denominator}으로 만들어요.` : "분모 0은 나눗셈할 수 없어요. 두 번째 복소수를 바꾸세요.";
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>복소수 두 개의 연산</span><strong>({formatComplex(a,b)}) {operation === "add" ? "+" : operation === "multiply" ? "×" : "÷"} ({formatComplex(c,d)}) = {result}</strong><p>{explanation}</p></div><div className="question-actions" role="group" aria-label="복소수 연산 선택">{(["add", "multiply", "divide"] as const).map((op) => <button key={op} type="button" aria-pressed={operation === op} className={operation === op ? "selected" : ""} onClick={() => setOperation(op)}>{op === "add" ? "덧셈" : op === "multiply" ? "곱셈" : "나눗셈"}</button>)}</div><Slider label="첫째 실수부" value={a} min={-4} max={4} onChange={setA}/><Slider label="첫째 허수부" value={b} min={-4} max={4} onChange={setB}/><Slider label="둘째 실수부" value={c} min={-4} max={4} onChange={setC}/><Slider label="둘째 허수부" value={d} min={-4} max={4} onChange={setD}/><p className="helper">연산식을 선택하고 성분을 조절해 보세요. 나눗셈은 분모가 0인 경우 정의되지 않습니다.</p></div>;
}

function DiscriminantLab() {
  const [a, setA] = useState(1); const [b, setB] = useState(2); const [c, setC] = useState(1);
  const result = quadraticDiscriminant(a,b,c)!;
  const D = result.value;
  const label = result.roots === "two-real" ? "서로 다른 두 실근" : result.roots === "repeated-real" ? "중근" : "서로 다른 두 복소수 근";
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>ax²+bx+c=0의 판별식</span><strong>D={b}²−4×{a}×{c}={D}</strong><p>D {D > 0 ? ">" : D < 0 ? "<" : "="} 0 이므로 {label}입니다.</p></div><Slider label="계수 a (0 제외)" value={a} min={-5} max={5} onChange={(n) => setA(n || 1)}/><Slider label="계수 b" value={b} min={-8} max={8} onChange={setB}/><Slider label="계수 c" value={c} min={-8} max={8} onChange={setC}/><p className="helper">이차방정식이므로 a≠0이어야 합니다. D의 부호로 실근의 개수를 분류하며, D&lt;0이면 실수 범위의 근이 없습니다.</p></div>;
}

export function M3MathLab({ block }: { block: Interaction }) {
  switch (block.interaction) {
    case "factor-theorem": return <FactorTheoremLab />;
    case "polynomial-factorization": return <FactorizationLab />;
    case "complex-plane": return <ComplexPlaneLab />;
    case "complex-operations": return <ComplexOperationsLab />;
    case "quadratic-discriminant": return <DiscriminantLab />;
    default: return null;
  }
}
