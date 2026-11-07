"use client";

import { useState } from "react";
import {
  cosineLawAngle,
  cosineLawThirdSide,
  includedAngleTriangleArea,
  sineLawSideFromPair,
  solveSsaTriangles,
  solveTrigEquation,
  solveTrigInequality,
  trigGraphProfile,
  type BoundedInterval,
  type TrigComparison,
  type TrigFunction,
} from "@/modules/math-validation/m5-14-m5-18-preview";

function Slider({ label, value, min, max, step = 1, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void;
}) {
  return <label className="lab-control"><span>{label}<strong>{value}</strong></span><input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function fmt(value: number | null, digits = 3) {
  return value === null || !Number.isFinite(value) ? "계산할 수 없음" : Number(value.toFixed(digits)).toString();
}

function formatIntervals(intervals: BoundedInterval[] | null) {
  if (intervals === null) return "입력 범위를 확인해요.";
  if (!intervals.length) return "해가 없어요.";
  return intervals.map(({ lower, upper, lowerClosed, upperClosed }) =>
    lower === upper ? fmt(lower) : `${lowerClosed ? "[" : "("}${fmt(lower)}, ${fmt(upper)}${upperClosed ? "]" : ")"}`,
  ).join(" ∪ ");
}

function TrigGraphLab() {
  const [fn, setFn] = useState<"sin" | "cos">("sin");
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);
  const [h, setH] = useState(0);
  const [k, setK] = useState(0);
  const profile = trigGraphProfile(fn, a, b, h, k);
  const xs = profile?.points.map((point) => point.x) ?? [];
  const ys = profile?.points.map((point) => point.y) ?? [];
  const xMin = Math.min(...xs); const xMax = Math.max(...xs);
  const rawYMin = Math.min(...ys); const rawYMax = Math.max(...ys);
  const yMin = Math.min(rawYMin, 0); const yMax = Math.max(rawYMax, 0);
  const xSpan = xMax - xMin || 1; const ySpan = yMax - yMin || 1;
  const yCoordinate = (value: number) => 220 - ((value - yMin) / ySpan) * 180;
  const svgPoints = profile?.points.map((point) => `${40 + ((point.x - xMin) / xSpan) * 560},${yCoordinate(point.y)}`).join(" ") ?? "";
  const centerY = profile ? yCoordinate(k) : 130;
  const zeroAxisVisible = profile !== null && xMin <= 0 && xMax >= 0;
  const zeroAxisX = zeroAxisVisible ? 40 + ((0 - xMin) / xSpan) * 560 : null;
  return <div className="lab math-lab">
    <div className="lab-result" aria-live="polite">
      <span>y={a}{fn}( {b}(x−{fmt(h)}) )+{k}</span>
      <strong>{profile?.constant ? `상수함수 · y=${fmt(profile.minimum)} · 기본주기는 정하지 않아요.` : `진폭 ${fmt(profile?.amplitude ?? null)} · 주기 ${fmt(profile?.period ?? null)} rad · 중심선 y=${fmt(k)}`}</strong>
      <p>최솟값 {fmt(profile?.minimum ?? null)}, 최댓값 {fmt(profile?.maximum ?? null)}. 각도 축 단위는 라디안입니다.</p>
    </div>
    <svg className="math-graph" viewBox="0 0 640 260" style={{ width: "100%", height: "auto" }} role="img" aria-labelledby="m514-title m514-desc">
      <title id="m514-title">삼각함수 변환 그래프</title>
      <desc id="m514-desc">가로축 y=0은 라디안 x, 세로축 x=0은 함수값 축이며 x=0이 화면에 포함될 때 세로축을 표시합니다. 점선은 중심선 y={k}입니다.</desc>
      <line x1="40" x2="600" y1={yCoordinate(0)} y2={yCoordinate(0)} stroke="currentColor" strokeWidth="1" />
      {zeroAxisX !== null && <line x1={zeroAxisX} x2={zeroAxisX} y1="40" y2="220" stroke="currentColor" strokeWidth="1" />}
      <line x1="40" x2="600" y1={centerY} y2={centerY} stroke="currentColor" strokeDasharray="5 5" strokeWidth="1" />
      <polyline points={svgPoints} fill="none" stroke="currentColor" strokeWidth="3" />
      <text x="590" y="242">x (rad)</text><text x="44" y="24">y</text>
    </svg>
    <div className="lab-controls">
      <label className="lab-control"><span>함수</span><select aria-label="사인 또는 코사인" value={fn} onChange={(event) => setFn(event.target.value as "sin" | "cos")}><option value="sin">sin</option><option value="cos">cos</option></select></label>
      <Slider label="세로 계수 a" value={a} min={-3} max={3} step={0.5} onChange={setA} />
      <Slider label="가로 계수 b" value={b} min={-2} max={2} step={0.5} onChange={setB} />
      <Slider label="수평 이동 h (π 단위)" value={h / Math.PI} min={-1} max={1} step={1 / 12} onChange={(value) => setH(value * Math.PI)} />
      <Slider label="수직 이동 k" value={k} min={-3} max={3} onChange={setK} />
    </div>
    <p className="helper">b=0 또는 a=0이면 그래프는 상수입니다. 상수함수에는 하나의 기본주기를 정하지 않습니다.</p>
  </div>;
}

const intervals: { name: string; value: BoundedInterval }[] = [
  { name: "[0, 2π)", value: { lower: 0, upper: 2 * Math.PI, lowerClosed: true, upperClosed: false } },
  { name: "[0, 2π]", value: { lower: 0, upper: 2 * Math.PI, lowerClosed: true, upperClosed: true } },
  { name: "[−π, π]", value: { lower: -Math.PI, upper: Math.PI, lowerClosed: true, upperClosed: true } },
];

function TrigEquationLab() {
  const [fn, setFn] = useState<TrigFunction>("sin");
  const [level, setLevel] = useState(0.5);
  const [intervalIndex, setIntervalIndex] = useState(0);
  const [mode, setMode] = useState<"equation" | "inequality">("equation");
  const [comparison, setComparison] = useState<TrigComparison>(">=");
  const interval = intervals[intervalIndex]!.value;
  const equationRoots = solveTrigEquation(fn, level, interval);
  const inequalityRoots = solveTrigInequality(fn, level, comparison, interval);
  const rootsText = equationRoots === null ? "입력 범위를 확인해요." : equationRoots.length ? equationRoots.map((root) => fmt(root)).join(", ") : "해가 없어요.";
  return <div className="lab math-lab">
    <div className="lab-result" aria-live="polite">
      <span>{fn} x {mode === "equation" ? "=" : comparison} {level}, x∈{intervals[intervalIndex]!.name}</span>
      <strong>{mode === "equation" ? `구간 안의 해: ${rootsText}` : `해 구간: ${formatIntervals(inequalityRoots)}`}</strong>
      <p>tan의 주기는 π이고 x=π/2+kπ에서 정의되지 않습니다. 표시는 라디안이며 지정 구간 끝점 조건을 적용합니다.</p>
    </div>
    <div className="lab-controls">
      <label className="lab-control"><span>함수</span><select aria-label="삼각방정식 함수" value={fn} onChange={(event) => {
        const next = event.target.value as TrigFunction;
        setFn(next);
        if (next !== "tan") setLevel(Math.max(-1, Math.min(1, level)));
      }}><option value="sin">sin</option><option value="cos">cos</option><option value="tan">tan</option></select></label>
      <label className="lab-control"><span>풀이</span><select aria-label="방정식 또는 부등식" value={mode} onChange={(event) => setMode(event.target.value as "equation" | "inequality")}><option value="equation">방정식</option><option value="inequality">부등식</option></select></label>
      {mode === "inequality" && <label className="lab-control"><span>부등호</span><select aria-label="부등호" value={comparison} onChange={(event) => setComparison(event.target.value as TrigComparison)}><option value="<">&lt;</option><option value="<=">≤</option><option value=">">&gt;</option><option value=">=">≥</option></select></label>}
      <Slider label="기준값 c" value={level} min={fn === "tan" ? -2 : -1} max={fn === "tan" ? 2 : 1} step={0.1} onChange={setLevel} />
      <label className="lab-control"><span>해를 구할 구간</span><select aria-label="해를 구할 구간" value={intervalIndex} onChange={(event) => setIntervalIndex(Number(event.target.value))}>{intervals.map((item, index) => <option key={item.name} value={index}>{item.name}</option>)}</select></label>
    </div>
    <p className="helper">방정식은 유한 구간의 모든 해를 표시하고, 부등식은 끝점 포함 여부를 괄호로 표시합니다. 일반해는 별도 표현이며 무한히 나열하지 않습니다.</p>
  </div>;
}

function SineLawLab() {
  const [sideA, setSideA] = useState(10);
  const [angleA, setAngleA] = useState(30);
  const [sideB, setSideB] = useState(12);
  const [angleB, setAngleB] = useState(45);
  const sideBResult = sineLawSideFromPair(sideA, angleA, angleB);
  const ssa = solveSsaTriangles(sideA, angleA, sideB);
  return <div className="lab math-lab">
    <div className="lab-result" aria-live="polite">
      <span>대응쌍 비례식 · a/sin A = b/sin B = 2R</span>
      <strong>A={angleA}°, a={sideA}, B={angleB}°이면 b≈{fmt(sideBResult)}</strong>
      <p>이 계산은 서로 대응하는 두 변·각 쌍을 사용합니다.</p>
      <span>SSA 모호한 경우 · a={sideA}, A={angleA}°, b={sideB}</span>
      <strong>{ssa?.status === "two" ? "가능한 삼각형 2개" : ssa?.status === "one" ? "가능한 삼각형 1개" : ssa ? "삼각형 없음" : "조건을 확인해요"}</strong>
      <p>{ssa?.candidates.map((candidate, index) => `${index + 1}) B=${fmt(candidate.angleBDegrees)}°, C=${fmt(candidate.angleCDegrees)}°, c≈${fmt(candidate.sideC)}`).join(" · ") || "후보 해는 각의 합과 변-각 대응을 통과해야 합니다."}</p>
    </div>
    <div className="lab-controls">
      <fieldset className="lab-controls"><legend>대응쌍 비례식: a, A, B에서 b 구하기</legend>
        <Slider label="대응 변 a" value={sideA} min={2} max={30} onChange={setSideA} />
        <Slider label="대응각 A (도)" value={angleA} min={10} max={170} onChange={setAngleA} />
        <Slider label="다른 대응각 B (도)" value={angleB} min={10} max={170} onChange={setAngleB} />
      </fieldset>
      <fieldset className="lab-controls"><legend>SSA: a, A, b로 삼각형 해의 개수 확인</legend>
        <Slider label="각 A의 맞은편 변 a" value={sideA} min={2} max={30} onChange={setSideA} />
        <Slider label="각 A (도)" value={angleA} min={10} max={170} onChange={setAngleA} />
        <Slider label="주어진 다른 변 b" value={sideB} min={2} max={30} onChange={setSideB} />
      </fieldset>
    </div>
    <p className="helper">SSA는 사인 역산에서 보각 후보가 생길 수 있어요. 각의 합이 180° 미만인 후보만 삼각형으로 인정합니다.</p>
  </div>;
}

function CosineLawLab() {
  const [sideA, setSideA] = useState(3);
  const [sideB, setSideB] = useState(4);
  const [includedAngle, setIncludedAngle] = useState(90);
  const [sideC, setSideC] = useState(5);
  const third = cosineLawThirdSide(sideA, sideB, includedAngle);
  const angle = cosineLawAngle(sideA, sideB, sideC);
  const vertexA = 150;
  const vertexB = vertexA + sideA * 6;
  const radians = (includedAngle * Math.PI) / 180;
  const vertexC = vertexA + sideB * 6 * Math.cos(radians);
  const vertexY = 180 - sideB * 6 * Math.sin(radians);
  return <div className="lab math-lab">
    <div className="lab-result" aria-live="polite">
      <span>c²=a²+b²−2ab cos C</span>
      <strong>두 변과 끼인각: c={fmt(third)} · 세 변에서 C: {angle ? `${fmt(angle.angleDegrees)}° (${angle.kind === "right" ? "직각" : angle.kind === "acute" ? "예각" : "둔각"})` : "삼각형 조건을 만족하지 않아요."}</strong>
      <p>세 변은 모두 양수이며, 임의의 두 변의 합은 나머지 변보다 커야 합니다.</p>
    </div>
    <svg className="math-graph" viewBox="0 0 360 220" style={{ width: "100%", height: "auto" }} role="img" aria-labelledby="m517-title m517-desc">
      <title id="m517-title">끼인각과 코사인법칙의 삼각형</title>
      <desc id="m517-desc">변 a={sideA}, 변 b={sideB}, 끼인각 C={includedAngle}도, 맞은편 변 c는 {fmt(third)}입니다.</desc>
      <path d={`M ${vertexA} 180 L ${vertexB} 180 L ${vertexC} ${vertexY} Z`} fill="none" stroke="currentColor" strokeWidth="3" />
      <text x={(vertexA + vertexB) / 2} y="205">a={sideA}</text><text x={(vertexA + vertexC) / 2 - 15} y={(vertexY + 180) / 2}>b={sideB}</text><text x={(vertexB + vertexC) / 2 + 5} y={(vertexY + 180) / 2}>c</text>
    </svg>
    <div className="lab-controls">
      <Slider label="변 a" value={sideA} min={1} max={20} onChange={setSideA} />
      <Slider label="변 b" value={sideB} min={1} max={20} onChange={setSideB} />
      <Slider label="끼인각 C (도)" value={includedAngle} min={10} max={170} onChange={setIncludedAngle} />
      <Slider label="맞은편 변 c" value={sideC} min={1} max={20} onChange={setSideC} />
    </div>
    <p className="helper">제곱식으로 구한 값은 양의 제곱근을 취합니다. 세 변이 삼각형을 만들지 못하면 역추론하지 않습니다.</p>
  </div>;
}

function TriangleAreaLab() {
  const [sideA, setSideA] = useState(8);
  const [sideB, setSideB] = useState(5);
  const [angle, setAngle] = useState(30);
  const [dataKind, setDataKind] = useState("included");
  const area = includedAngleTriangleArea(sideA, sideB, angle);
  const recommendation = dataKind === "opposite-pair" ? "맞은편 변·각 쌍 → 사인법칙" : dataKind === "sss" ? "세 변 → 코사인법칙으로 각을 찾은 뒤 넓이" : "두 변과 끼인각 → 코사인법칙으로 변 또는 넓이 공식";
  const scale = 6;
  const vertexA = 175;
  const vertexB = vertexA + sideA * scale;
  const radians = (angle * Math.PI) / 180;
  const vertexC = vertexA + sideB * scale * Math.cos(radians);
  const vertexY = 180 - sideB * scale * Math.sin(radians);
  return <div className="lab math-lab">
    <div className="lab-result" aria-live="polite">
      <span>K=½ab sin C · C는 두 변의 끼인각</span>
      <strong>높이 h=b sin C≈{fmt(sideB * Math.sin((angle * Math.PI) / 180))} · 넓이 K≈{fmt(area)} (길이 단위²)</strong>
      <p>{recommendation}</p>
    </div>
    <svg className="math-graph" viewBox="0 0 360 220" style={{ width: "100%", height: "auto" }} role="img" aria-labelledby="m518-title m518-desc">
      <title id="m518-title">삼각형 밑변, 높이와 끼인각</title>
      <desc id="m518-desc">밑변 a={sideA}, 인접 변 b={sideB}, 끼인각 C={angle}도일 때 높이는 b sin C입니다.</desc>
      <path d={`M ${vertexA} 180 L ${vertexB} 180 L ${vertexC} ${vertexY} Z`} fill="none" stroke="currentColor" strokeWidth="3" />
      <line x1={vertexC} y1={vertexY} x2={vertexC} y2="180" stroke="currentColor" strokeDasharray="5 4" />
      <text x={(vertexA + vertexB) / 2} y="205">밑변 a</text><text x={vertexC + 5} y={(vertexY + 180) / 2}>h</text><text x={(vertexB + vertexC) / 2} y={(vertexY + 180) / 2 - 5}>b</text>
    </svg>
    <div className="lab-controls">
      <Slider label="밑변 a" value={sideA} min={2} max={20} onChange={setSideA} />
      <Slider label="인접 변 b" value={sideB} min={2} max={20} onChange={setSideB} />
      <Slider label="끼인각 C (도)" value={angle} min={10} max={170} onChange={setAngle} />
      <label className="lab-control"><span>주어진 자료</span><select aria-label="주어진 변과 각 자료" value={dataKind} onChange={(event) => setDataKind(event.target.value)}><option value="included">두 변과 끼인각</option><option value="opposite-pair">맞은편 변·각 쌍</option><option value="sss">세 변</option></select></label>
    </div>
    <p className="helper">각은 도 단위로 표시합니다. 넓이는 양수이고 단위는 cm²처럼 길이 단위의 제곱입니다.</p>
  </div>;
}

export function M5TrigonometryApplicationsPreviewLab({ unitId }: { unitId: string }) {
  switch (unitId) {
    case "M5-14": return <TrigGraphLab />;
    case "M5-15": return <TrigEquationLab />;
    case "M5-16": return <SineLawLab />;
    case "M5-17": return <CosineLawLab />;
    case "M5-18": return <TriangleAreaLab />;
    default: return null;
  }
}
