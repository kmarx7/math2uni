"use client";

import { useState } from "react";
import {
  arithmeticSum,
  arithmeticTerm,
  geometricSum,
  geometricTerms,
  inductionProgress,
  sequenceTerms,
  sigmaSum,
  type InductionStage,
} from "@/modules/math-validation/m5-19-m5-23-preview";

function Range({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return <label className="lab-control"><span>{label}<strong>{value}</strong></span><input type="range" aria-label={label} min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function SequenceLab() {
  const [rule, setRule] = useState<"linear" | "squares">("linear");
  const terms = sequenceTerms(rule, 6, 1) ?? [];
  const other = sequenceTerms(rule === "linear" ? "squares" : "linear", 4, 1) ?? [];
  return <div className="lab math-lab"><div className="lab-controls"><label className="lab-control"><span>비교할 규칙</span><select aria-label="비교할 수열 규칙" value={rule} onChange={(event) => setRule(event.target.value as "linear" | "squares")}><option value="linear">aₙ=n</option><option value="squares">bₙ=n+(n−1)(n−2)(n−3)</option></select></label></div><p className="lab-result" aria-live="polite"><span>처음 세 항은 두 규칙에서 같아요.</span><strong>{terms.slice(0, 3).join(", ")} = {other.slice(0, 3).join(", ")}</strong><span>네 번째 항부터는 {terms[3]}과 {other[3]}으로 달라집니다.</span></p><table><caption>항 번호와 두 규칙의 값</caption><thead><tr><th scope="col">n</th><th scope="col">선택한 규칙</th><th scope="col">다른 규칙</th></tr></thead><tbody>{terms.map((value, index) => <tr key={index}><th scope="row">{index + 1}</th><td>{value}</td><td>{other[index] ?? "—"}</td></tr>)}</tbody></table><p className="helper">유한한 몇 항만으로 다음 항의 규칙이 하나로 정해지지는 않아요. 추가 조건을 확인해요.</p></div>;
}

function ArithmeticLab() {
  const [count, setCount] = useState(5);
  const first = 3; const difference = -2;
  const terms = Array.from({ length: count }, (_, index) => arithmeticTerm(first, difference, index + 1));
  const sum = arithmeticSum(first, difference, count);
  return <div className="lab math-lab"><p className="lab-result" aria-live="polite"><span>a₁={first}, d={difference}</span><strong>항: {terms.join(", ")}</strong><span>a{count}={terms.at(-1)} · S{count}={sum}</span></p><Range label="항 수" value={count} min={1} max={10} onChange={setCount} /><p className="helper">공차가 음수이면 항이 일정한 차이만큼 작아져요. 앞뒤 항을 짝지으면 합을 확인할 수 있어요.</p></div>;
}

function GeometricLab() {
  const [ratio, setRatio] = useState(-2);
  const [count, setCount] = useState(5);
  const terms = geometricTerms(2, ratio, count) ?? [];
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>a₁=2, q={ratio}</span><strong>항: {terms.join(", ")}</strong><span>첫 {count}개 항의 합은 {geometricSum(2, ratio, count)}</span></div><Range label="공비 q" value={ratio} min={-2} max={2} onChange={setRatio} /><Range label="항 수" value={count} min={1} max={8} onChange={setCount} /><p className="helper">q=1이면 각 항이 같고, q=0이면 첫 항 다음부터 0이에요. 음수 q는 부호가 번갈아 바뀝니다.</p></div>;
}

function SigmaLab() {
  const [upper, setUpper] = useState(5);
  const terms = Array.from({ length: upper }, (_, index) => (index + 1) ** 2);
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>Σ(k²), k=1부터 {upper}까지</span><strong>{terms.join(" + ")} = {sigmaSum("square", 1, upper)}</strong><span>포함되는 항은 {upper}개예요.</span></div><Range label="끝 인덱스" value={upper} min={1} max={10} onChange={setUpper} /><p className="helper">아래·위 인덱스는 모두 포함해요. 범위를 바꾸면 항 번호도 함께 바뀝니다.</p></div>;
}

const stages: InductionStage[] = ["base", "hypothesis", "step", "conclusion"];
const stageLabels: Record<InductionStage, string> = { base: "기초 사례 확인", hypothesis: "임의의 k에 대한 귀납 가정", step: "가정에서 P(k+1) 유도", conclusion: "전체 범위 결론" };

function InductionLab() {
  const [count, setCount] = useState(0);
  const selected = stages.slice(0, count);
  const progress = inductionProgress(selected);
  return <div className="lab math-lab"><p className="lab-result" aria-live="polite"><span>귀납 증명의 구조</span><strong>{progress?.next ? `다음 단계: ${stageLabels[progress.next]}` : "구조의 네 단계를 모두 살펴봤어요."}</strong><span>이 도구는 단계 순서만 확인하며, 임의의 수학적 명제를 증명하지는 않아요.</span></p><ol>{stages.map((stage, index) => <li key={stage} aria-current={index === count && count < stages.length ? "step" : undefined}>{stageLabels[stage]}{index < count ? " · 확인" : ""}</li>)}</ol><button type="button" className="button secondary" disabled={count >= stages.length} onClick={() => setCount((value) => Math.min(stages.length, value + 1))}>다음 단계 확인</button><button type="button" className="button secondary" disabled={count === 0} onClick={() => setCount(0)}>처음부터 보기</button></div>;
}

export function M5SequencesPreviewLab({ unitId }: { unitId: string }) {
  switch (unitId) {
    case "M5-19": return <SequenceLab />;
    case "M5-20": return <ArithmeticLab />;
    case "M5-21": return <GeometricLab />;
    case "M5-22": return <SigmaLab />;
    case "M5-23": return <InductionLab />;
    default: return <p className="helper">이 학습 실험은 준비 중입니다.</p>;
  }
}
