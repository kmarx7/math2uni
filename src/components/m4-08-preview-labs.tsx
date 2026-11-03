"use client";

import { useState } from "react";
import {
  circleFromCenterRadius,
  circleFromGeneralForm,
  circleLineRelation,
  pointLineProjection,
  projectM4Point,
  reflectCircle,
  reflectLine,
  reflectPoint,
  translateCircle,
  translateLine,
  translatePoint,
  type Reflection,
} from "@/modules/math-validation/m4-08-preview";

function Slider({ label, value, min = -5, max = 5, onChange }: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return <label className="lab-control"><span>{label}<strong>{value}</strong></span><input aria-label={label} type="range" min={min} max={max} step="1" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function PointSvg({ points, label }: { points: Array<{ point: [number, number]; name: string; color?: string }>; label: string }) {
  return <svg viewBox="0 0 300 300" role="img" aria-label={label} style={{ display: "block", width: "min(100%, 25rem)" }}>
    <line x1="22" y1="150" x2="278" y2="150" stroke="currentColor" />
    <line x1="150" y1="22" x2="150" y2="278" stroke="currentColor" />
    {points.map(({ point, name, color }) => {
      const [cx, cy] = projectM4Point(point);
      return <g key={name}><circle cx={cx} cy={cy} r="5" fill={color ?? "currentColor"} /><text x={cx + 6} y={cy - 6}>{name}</text></g>;
    })}
  </svg>;
}

function lineSegment(a: number, b: number, c: number): [[number, number], [number, number]] {
  const points: Array<[number, number]> = [];
  const bound = 8;
  if (b !== 0) {
    for (const x of [-bound, bound]) { const y = (-a * x - c) / b; if (y >= -bound && y <= bound) points.push([x, y]); }
  }
  if (a !== 0) {
    for (const y of [-bound, bound]) { const x = (-b * y - c) / a; if (x >= -bound && x <= bound) points.push([x, y]); }
  }
  const unique = points.filter((point, index) => points.findIndex((other) => other[0] === point[0] && other[1] === point[1]) === index);
  if (unique.length < 2) return [[-bound, 0], [bound, 0]];
  return [unique[0], unique[1]];
}

function circleCoordinate(axis: "x" | "y", center: number) {
  if (center === 0) return `${axis}²`;
  return `(${axis}${center < 0 ? `+${-center}` : `−${center}`})²`;
}

function signedTerm(coefficient: number, variable: "x" | "y" | "") {
  if (coefficient === 0) return "";
  const body = variable ? `${Math.abs(coefficient) === 1 ? "" : Math.abs(coefficient)}${variable}` : String(Math.abs(coefficient));
  return `${coefficient < 0 ? " − " : " + "}${body}`;
}

function equationTerms(terms: Array<[number, "x" | "y" | ""]>) {
  return terms.map(([coefficient, variable]) => signedTerm(coefficient, variable)).join("");
}

function DistanceLab() {
  const [px, setPx] = useState(2); const [py, setPy] = useState(3);
  const [a, setA] = useState(2); const [b, setB] = useState(1); const [c, setC] = useState(-2);
  const aa = a === 0 && b === 0 ? 1 : a; const bb = a === 0 && b === 0 ? 0 : b;
  const projection = pointLineProjection([px, py], aa, bb, c)!;
  const [p0, p1] = lineSegment(aa, bb, c);
  const [x0, y0] = projectM4Point(p0); const [x1, y1] = projectM4Point(p1);
  const [fx, fy] = projectM4Point(projection.foot);
  const [qx, qy] = projectM4Point([px, py]);
  return <div className="lab math-lab">
    <div className="lab-result" aria-live="polite"><span>점에서 직선까지의 최단 거리</span><strong>d = |{aa}·{px} + {bb}·{py} + ({c})| / √({aa}²+{bb}²) = {projection.distance.toFixed(2)}</strong><p>수선의 발은 ({projection.foot[0].toFixed(2)}, {projection.foot[1].toFixed(2)})입니다. 법선 계수 a, b가 둘 다 0인 식은 직선을 나타내지 않으므로 조작에서 자동으로 유효한 법선을 사용합니다.</p></div>
    <svg viewBox="0 0 300 300" role="img" aria-label={`직선 ${aa}x+${bb}y+${c}=0, 점 P(${px},${py}), 수선의 발 H(${projection.foot[0].toFixed(1)},${projection.foot[1].toFixed(1)})`} style={{ display: "block", width: "min(100%, 25rem)" }}>
      <line x1="22" y1="150" x2="278" y2="150" stroke="currentColor" /><line x1="150" y1="22" x2="150" y2="278" stroke="currentColor" />
      <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="currentColor" strokeWidth="3" />
      <line x1={qx} y1={qy} x2={fx} y2={fy} stroke="#b45309" strokeDasharray="5 4" strokeWidth="2" />
      <circle cx={qx} cy={qy} r="5" fill="#b45309" /><circle cx={fx} cy={fy} r="5" fill="#2563eb" /><text x={qx + 6} y={qy - 5}>P</text><text x={fx + 6} y={fy - 5}>H</text>
    </svg>
    <Slider label="점 P의 x좌표" value={px} onChange={setPx}/><Slider label="점 P의 y좌표" value={py} onChange={setPy}/>
    <Slider label="직선의 x계수 a" value={a} onChange={setA}/><Slider label="직선의 y계수 b" value={b} onChange={setB}/><Slider label="직선의 상수항 c" value={c} onChange={setC}/>
    <p className="helper">점 P를 직선식에 대입한 값은 법선 방향으로의 변화량에 비례합니다. 이를 √(a²+b²)로 나누면 수선 길이가 됩니다.</p>
  </div>;
}

function CircleEquationLab() {
  const [h, setH] = useState(1); const [k, setK] = useState(-1); const [r, setR] = useState(3);
  const circle = circleFromCenterRadius([h, k], r)!;
  const general = circleFromGeneralForm(-2 * h, -2 * k, h * h + k * k - circle.radiusSquared)!;
  const [cx, cy] = projectM4Point([h, k]);
  const pixelRadius = r * 16;
  return <div className="lab math-lab">
    <div className="lab-result" aria-live="polite"><span>중심과 반지름으로 원 표현하기</span><strong>{circleCoordinate("x", h)} + {circleCoordinate("y", k)} = {circle.radiusSquared}</strong><p>일반형은 x²+y²{equationTerms([[-2 * h, "x"], [-2 * k, "y"], [h * h + k * k - circle.radiusSquared, ""]])}=0입니다. 완전제곱으로 되돌린 반지름은 {general.radius}입니다.</p></div>
    <svg viewBox="0 0 300 300" role="img" aria-label={`중심 (${h}, ${k}), 반지름 ${r}인 원`} style={{ display: "block", width: "min(100%, 25rem)" }}><line x1="22" y1="150" x2="278" y2="150" stroke="currentColor"/><line x1="150" y1="22" x2="150" y2="278" stroke="currentColor"/><circle cx={cx} cy={cy} r={pixelRadius} fill="none" stroke="currentColor" strokeWidth="2"/><circle cx={cx} cy={cy} r="4" fill="#b45309"/><line x1={cx} y1={cy} x2={cx + pixelRadius} y2={cy} stroke="#2563eb" strokeWidth="2"/><text x={cx + 5} y={cy - 6}>중심</text><text x={cx + pixelRadius / 2} y={cy - 6}>r</text></svg>
    <Slider label="중심 x좌표 h" value={h} min={-3} max={3} onChange={setH}/><Slider label="중심 y좌표 k" value={k} min={-3} max={3} onChange={setK}/><Slider label="반지름 r" value={r} min={1} max={4} onChange={setR}/>
    <p className="helper">일반형 x²+y²+Dx+Ey+F=0에서는 중심이 (−D/2, −E/2), r²=(D/2)²+(E/2)²−F입니다. 우변이 음수이면 실수 좌표의 원이 없습니다.</p>
  </div>;
}

function CircleLineLab() {
  const [h, setH] = useState(0); const [k, setK] = useState(0); const [r, setR] = useState(4); const [y, setY] = useState(3);
  const distance = Math.abs(y - k); const relation = circleLineRelation(r, distance)!;
  const relationLabel = relation === "secant" ? "두 점에서 만나요" : relation === "tangent" ? "한 점에서 접해요" : "만나지 않아요";
  const [cx, cy] = projectM4Point([h, k]); const [rx, ry] = projectM4Point([h + r, k]);
  const [, ly] = projectM4Point([0, y]); const pixelRadius = r * 16;
  const halfSpan = Math.sqrt(Math.max(0, r * r - distance * distance));
  const intersectionXs = relation === "secant" ? [h - halfSpan, h + halfSpan] : relation === "tangent" ? [h] : [];
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>중심에서 직선까지의 거리 비교</span><strong>{relationLabel}</strong><p>중심 ({h},{k})에서 수평선 y={y}까지 거리는 |{y}−({k})|={distance}. 반지름은 {r}이므로 {distance < r ? "d&lt;r" : distance === r ? "d=r" : "d&gt;r"}입니다.</p></div>
    <svg viewBox="0 0 300 300" role="img" aria-label={`중심 (${h},${k})인 반지름 ${r}의 원과 수평선 y=${y}는 ${relationLabel}`} style={{ display: "block", width: "min(100%, 25rem)" }}><line x1="22" y1="150" x2="278" y2="150" stroke="currentColor"/><line x1="150" y1="22" x2="150" y2="278" stroke="currentColor"/><circle cx={cx} cy={cy} r={pixelRadius} fill="none" stroke="currentColor" strokeWidth="2"/><line x1="22" y1={ly} x2="278" y2={ly} stroke="#b45309" strokeWidth="2"/><line x1={cx} y1={cy} x2={cx} y2={ly} stroke="#2563eb" strokeDasharray="4 3"/><circle cx={cx} cy={cy} r="4" fill="#2563eb"/><text x={cx + 5} y={cy - 5}>중심</text><text x={rx - 4} y={ry - 5}>r</text>{intersectionXs.map((x) => { const [ix, iy] = projectM4Point([x, y]); return <circle key={x} cx={ix} cy={iy} r="5" fill="#b45309"/>; })}</svg>
    <Slider label="원의 중심 x좌표" value={h} min={-2} max={2} onChange={setH}/><Slider label="원의 중심 y좌표" value={k} min={-2} max={2} onChange={setK}/><Slider label="원의 반지름" value={r} min={1} max={5} onChange={setR}/><Slider label="수평선 y좌표" value={y} onChange={setY}/>
    <p className="helper">수직 거리가 반지름보다 작으면 두 교점, 같으면 접점 한 개, 크면 교점이 없습니다. 기울기·계수 일반형은 이번 실험실의 조작 범위 밖입니다.</p>
  </div>;
}

function TranslationLab() {
  const [dx, setDx] = useState(2); const [dy, setDy] = useState(-1);
  const point: [number, number] = [1, 2]; const moved = translatePoint(point, dx, dy)!;
  const center: [number, number] = [1, -2]; const movedCenter = translateCircle(center, dx, dy)!;
  const line = translateLine(2, 1, dx, dy)!;
  const [px, py] = projectM4Point(point); const [qx, qy] = projectM4Point(moved);
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>같은 이동벡터를 도형에 적용해요</span><strong>점 ({point[0]},{point[1]}) → ({moved[0]},{moved[1]}), 이동벡터 ({dx},{dy})</strong><p>원 중심은 ({movedCenter[0]},{movedCenter[1]})로 옮겨지고 반지름은 그대로입니다. 직선 y=2x+1은 y=2x+({line.intercept})가 됩니다.</p></div>
    <PointSvg points={[{ point, name: "P" }, { point: moved, name: "P′", color: "#b45309" }]} label={`점 P(${point}), 이동 후 P′(${moved})`} />
    <svg viewBox="0 0 300 300" role="img" aria-label={`점 P에서 P′로 이동하는 벡터 (${dx},${dy})`} style={{ display: "block", width: "min(100%, 25rem)" }}><line x1="22" y1="150" x2="278" y2="150" stroke="currentColor"/><line x1="150" y1="22" x2="150" y2="278" stroke="currentColor"/><line x1={px} y1={py} x2={qx} y2={qy} stroke="#b45309" strokeWidth="2" markerEnd="url(#arrow)"/><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#b45309"/></marker></defs></svg>
    <Slider label="이동벡터의 x성분 Δx" value={dx} min={-3} max={3} onChange={setDx}/><Slider label="이동벡터의 y성분 Δy" value={dy} min={-3} max={3} onChange={setDy}/>
    <p className="helper">그래프의 새 점 좌표를 (X,Y)라 하면 옛 식의 x에 X−Δx, y에 Y−Δy를 대입해 이동한 방정식을 얻습니다. 두 점을 옮겨 이동벡터를 비교할 수 있어요.</p>
  </div>;
}

function ReflectionLab() {
  const [across, setAcross] = useState<Reflection>("x-axis");
  const point: [number, number] = [2, 3]; const reflected = reflectPoint(point, across)!;
  const line = reflectLine(2, 1, across)!; const center: [number, number] = [2, -1]; const reflectedCenter = reflectCircle(center, across)!;
  const label = across === "x-axis" ? "x축" : across === "y-axis" ? "y축" : "원점";
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>{label} 대칭</span><strong>P(2,3) → P′({reflected[0]},{reflected[1]})</strong><p>직선 y=2x+1은 대칭 후 y={line.slope}x{line.intercept < 0 ? `−${Math.abs(line.intercept)}` : `+${line.intercept}`}이고, 원의 중심 (2,−1)은 ({reflectedCenter[0]},{reflectedCenter[1]})가 됩니다. 반지름은 보존됩니다.</p></div>
    <PointSvg points={[{ point, name: "P" }, { point: reflected, name: "P′", color: "#b45309" }, { point: center, name: "C" }, { point: reflectedCenter, name: "C′", color: "#2563eb" }]} label={`${label} 대칭 전후 점과 원 중심`} />
    <div className="question-actions" role="group" aria-label="대칭 기준 선택">{(["x-axis", "y-axis", "origin"] as const).map((item) => <button type="button" key={item} className={across === item ? "selected" : ""} aria-pressed={across === item} onClick={() => setAcross(item)}>{item === "x-axis" ? "x축 대칭" : item === "y-axis" ? "y축 대칭" : "원점 대칭"}</button>)}</div>
    <p className="helper">점은 대칭축 반대편의 같은 거리로 이동합니다. 방정식은 x축 대칭이면 y를 −y로, y축 대칭이면 x를 −x로 바꾸어 확인할 수 있습니다.</p>
  </div>;
}

export function M4PreviewLab({ unitId }: { unitId: string }) {
  switch (unitId) {
    case "M4-04": return <DistanceLab />;
    case "M4-05": return <CircleEquationLab />;
    case "M4-06": return <CircleLineLab />;
    case "M4-07": return <TranslationLab />;
    case "M4-08": return <ReflectionLab />;
    default: return null;
  }
}

