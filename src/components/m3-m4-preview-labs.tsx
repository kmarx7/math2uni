"use client";

import { useState } from "react";
import {
  addMatrix2,
  compareLines,
  countConditionIntersection,
  countTwoStepPaths,
  distanceBetween,
  internalSectionPoint,
  multiplyMatrix2,
  partitionIntegers,
  projectCoordinate,
  scaleMatrix2,
  type Matrix2,
} from "@/modules/math-validation/m3-m4-preview";

function Slider({ label, value, min = -5, max = 5, onChange }: { label: string; value: number; min?: number; max?: number; onChange: (n: number) => void }) {
  return <label className="lab-control"><span>{label}<strong>{value}</strong></span><input aria-label={label} type="range" min={min} max={max} step="1" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}
function MatrixView({ label, matrix }: { label: string; matrix: Matrix2 }) {
  return <table><caption>{label}</caption><tbody>{matrix.map((row, i) => <tr key={i}>{row.map((value, j) => <td key={j}>{value}</td>)}</tr>)}</tbody></table>;
}

function MatrixLab() {
  const [values, setValues] = useState([1, 2, 0, -1, 3, 1, 2, 4]);
  const [mode, setMode] = useState<"add" | "scale" | "multiply">("multiply");
  const [scalar, setScalar] = useState(-2);
  const a: Matrix2 = [[values[0], values[1]], [values[2], values[3]]];
  const b: Matrix2 = [[values[4], values[5]], [values[6], values[7]]];
  const result = mode === "add" ? addMatrix2(a, b) : mode === "scale" ? scaleMatrix2(a, scalar) : multiplyMatrix2(a, b);
  const labels = mode === "add" ? "같은 위치끼리 더합니다." : mode === "scale" ? `A의 각 성분에 ${scalar}를 곱합니다.` : "A의 행과 B의 열에서 같은 위치의 수를 곱해 더합니다.";
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>2×2 행렬 연산</span><strong>{labels}</strong><p>곱은 앞 행렬의 열 수와 뒤 행렬의 행 수가 같을 때 정의되고, 결과 크기는 2×2입니다.</p></div>
    <div className="question-actions" role="group" aria-label="행렬 연산 선택">{(["add", "scale", "multiply"] as const).map((item) => <button key={item} type="button" aria-pressed={mode === item} className={mode === item ? "selected" : ""} onClick={() => setMode(item)}>{item === "add" ? "합" : item === "scale" ? "실수배" : "곱"}</button>)}</div>
    <div className="question-actions" role="group" aria-label="행렬 보기"><MatrixView label="A" matrix={a}/>{mode !== "scale" && <MatrixView label="B" matrix={b}/>}<MatrixView label="결과" matrix={result}/></div>
    {values.map((value, index) => <Slider key={index} label={`${index < 4 ? "A" : "B"}의 ${index % 2 === 0 ? "첫째" : "둘째"} 행 ${Math.floor((index % 4) / 2) + 1} 성분`} value={value} min={-4} max={4} onChange={(next) => setValues((current) => current.map((item, i) => i === index ? next : item))}/>)}
    {mode === "scale" && <Slider label="실수배 계수 k" value={scalar} min={-3} max={3} onChange={setScalar}/>}
    {mode === "multiply" && <p className="helper">결과의 첫째 행 첫째 열은 {a[0][0]}×{b[0][0]} + {a[0][1]}×{b[1][0]} = {result[0][0]}입니다. 보통 AB와 BA는 같지 않습니다.</p>}
  </div>;
}

function ConditionMapLab() {
  const [mode, setMode] = useState<"intersection" | "cases" | "paths">("intersection");
  const values = Array.from({ length: 11 }, (_, i) => i - 2);
  const intersection = countConditionIntersection(values, [(n) => n >= 0 && n <= 8, (n) => n % 2 === 0, (n) => n % 3 === 0]);
  const branches = ["짝수", "홀수이면서 3의 배수", "그 밖의 수"];
  const partition = partitionIntegers(values);
  const transition = [[1, 1, 0], [0, 1, 1], [1, 0, 1]];
  const paths = countTwoStepPaths(transition, 0, 2) ?? 0;
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>조건과 표현을 바꾸어 확인해요</span><strong>{mode === "intersection" ? `0 이상 8 이하의 정수 중 짝수이자 3의 배수는 ${intersection}개` : mode === "cases" ? `서로 겹치지 않는 분류: ${branches.join(" · ")}` : `상태 A에서 C까지 두 단계 경로는 ${paths}개`}</strong><p>작은 후보를 직접 확인하거나 중간 상태별 경로 수를 곱해 더한 뒤, 가능한 경로를 나열해 검산합니다.</p></div>
    <div className="question-actions" role="group" aria-label="조건 지도 탐색">{(["intersection", "cases", "paths"] as const).map((item) => <button key={item} type="button" aria-pressed={mode === item} className={mode === item ? "selected" : ""} onClick={() => setMode(item)}>{item === "intersection" ? "조건 교집합" : item === "cases" ? "경우 분류" : "두 단계 경로"}</button>)}</div>
    {mode === "intersection" ? <ul aria-label="조건에 맞는 후보 목록">{values.map((value) => <li key={value}>{value}: {value >= 0 && value <= 8 ? "범위 안" : "범위 밖"}; {value % 2 === 0 ? "짝수" : "홀수"}; {value % 3 === 0 ? "3의 배수" : "3의 배수 아님"}</li>)}</ul> : mode === "cases" ? <ul aria-label="서로 겹치지 않는 정수 분류"><li>짝수 ({partition.even.length}개): {partition.even.join(", ")}</li><li>홀수이면서 3의 배수 ({partition.oddMultiplesOfThree.length}개): {partition.oddMultiplesOfThree.join(", ")}</li><li>그 밖의 수 ({partition.remaining.length}개): {partition.remaining.join(", ")}</li></ul> : <table><caption>상태 전이 수</caption><thead><tr><th scope="col">출발＼도착</th>{["A", "B", "C"].map((x) => <th key={x} scope="col">{x}</th>)}</tr></thead><tbody>{transition.map((row, i) => <tr key={i}><th scope="row">{["A", "B", "C"][i]}</th>{row.map((n, j) => <td key={j}>{n}</td>)}</tr>)}</tbody></table>}
    <p className="helper">이것은 작은 통합 복습 예시이며 시간 제한이나 실전 점수를 부여하지 않습니다.</p>
  </div>;
}

function CoordinateSectionLab() {
  const [ax, setAx] = useState(-2); const [ay, setAy] = useState(1); const [bx, setBx] = useState(4); const [by, setBy] = useState(5);
  const [m, setM] = useState(1); const [n, setN] = useState(2);
  const a: [number, number] = [ax, ay], b: [number, number] = [bx, by];
  const p = internalSectionPoint(a, b, m, n)!; const distance = distanceBetween(a, b);
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>좌표 거리와 내분점</span><strong>AB = {distance.toFixed(2)} · AP:PB={m}:{n}일 때 P=({p[0].toFixed(2)}, {p[1].toFixed(2)})</strong><p>P는 A에서 B 쪽으로 전체 선분의 {m}/{m + n}만큼 이동한 점입니다.</p></div>
    <svg viewBox="0 0 300 200" role="img" aria-label={`좌표 평면에서 A(${ax}, ${ay}), P(${p[0].toFixed(1)}, ${p[1].toFixed(1)}), B(${bx}, ${by})`} style={{ display: "block", width: "min(100%, 25rem)" }}><line x1="20" y1="155" x2="280" y2="155" stroke="currentColor"/><line x1="25" y1="15" x2="25" y2="175" stroke="currentColor"/>{[[a,"A"],[p,"P"],[b,"B"]].map(([point,label]) => { const q = point as [number, number]; const [x, y] = projectCoordinate(q); return <g key={label as string}><circle cx={x} cy={y} r="5" fill="currentColor"/><text x={Math.min(292, x + 5)} y={Math.max(12, y - 5)}>{label as string}</text></g>; })}<line x1={projectCoordinate(a)[0]} y1={projectCoordinate(a)[1]} x2={projectCoordinate(b)[0]} y2={projectCoordinate(b)[1]} stroke="currentColor" strokeWidth="3"/></svg>
    <Slider label="A의 x좌표" value={ax} onChange={setAx}/><Slider label="A의 y좌표" value={ay} onChange={setAy}/><Slider label="B의 x좌표" value={bx} onChange={setBx}/><Slider label="B의 y좌표" value={by} onChange={setBy}/><Slider label="AP 비율 m" value={m} min={1} max={3} onChange={setM}/><Slider label="PB 비율 n" value={n} min={1} max={3} onChange={setN}/><p className="helper">거리에는 좌표 차의 제곱합의 제곱근을, 내분에는 반대편 길이를 가중치로 사용합니다.</p>
  </div>;
}

function LineEquationLab() {
  const [px, setPx] = useState(1); const [py, setPy] = useState(2); const [slope, setSlope] = useState(2); const [vertical, setVertical] = useState(false);
  const intercept = py - slope * px;
  const equation = vertical ? `x = ${px}` : `y = ${slope}x ${intercept < 0 ? "−" : "+"} ${Math.abs(intercept)}`;
  const points: [number, number][] = vertical ? [[px, -4], [px, 4]] : [[-5, -5 * slope + intercept], [5, 5 * slope + intercept]];
  const cx = (x: number) => 150 + x * 18; const cy = (y: number) => 85 - y * 8;
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>점과 기울기로 직선식 만들기</span><strong>{equation}</strong><p>{vertical ? `x는 항상 ${px}이므로 기울기가 정의되지 않습니다.` : `y−${py}=${slope}(x−${px}); 절편 b=y−mx=${intercept}.`}</p></div>
    <svg viewBox="0 0 300 170" role="img" aria-label={`${equation} 그래프와 점 (${px}, ${py})`} style={{ display: "block", width: "min(100%, 25rem)" }}><line x1="20" y1="85" x2="280" y2="85" stroke="currentColor"/><line x1="150" y1="10" x2="150" y2="160" stroke="currentColor"/><line x1={cx(points[0][0])} y1={cy(points[0][1])} x2={cx(points[1][0])} y2={cy(points[1][1])} stroke="#2563eb" strokeWidth="3"/><circle cx={cx(px)} cy={cy(py)} r="5" fill="#c2410c"/></svg>
    <Slider label="지나는 점의 x" value={px} onChange={setPx}/><Slider label="지나는 점의 y" value={py} onChange={setPy}/><Slider label="기울기 m" value={slope} onChange={setSlope}/><button type="button" aria-pressed={vertical} className={vertical ? "selected" : ""} onClick={() => setVertical(!vertical)}>수직선 예외 {vertical ? "켜짐" : "꺼짐"}</button><p className="helper">기울기에서 Δy/Δx를 사용합니다. Δx=0이면 나눗셈이 불가능하므로 별도로 x=상수로 나타냅니다.</p>
  </div>;
}

function LineRelationLab() {
  const [m1, setM1] = useState(2); const [m2, setM2] = useState(-1); const [b1, setB1] = useState(1); const [b2, setB2] = useState(3);
  const relation = compareLines({ slope: m1, intercept: b1 }, { slope: m2, intercept: b2 });
  const label = relation === "same" ? "일치" : relation === "parallel" ? "서로 다른 평행" : relation === "perpendicular" ? "수직으로 교차" : "한 점에서 교차";
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>기울기와 절편 비교</span><strong>{label}</strong><p>기울기 곱은 {m1}×{m2}={m1 * m2}입니다. 곱이 −1이면 두 유한 기울기의 직선은 수직입니다.</p></div><Slider label="첫째 기울기" value={m1} onChange={setM1}/><Slider label="둘째 기울기" value={m2} onChange={setM2}/><Slider label="첫째 y절편" value={b1} onChange={setB1}/><Slider label="둘째 y절편" value={b2} onChange={setB2}/><p className="helper">기울기가 같으면 절편도 비교해 일치와 평행을 구분합니다. 이 활동의 계수 형태는 유한한 기울기를 가진 직선에 한정됩니다.</p></div>;
}

export function M3M4PreviewLab({ unitId }: { unitId: string }) {
  switch (unitId) {
    case "M3-21": return <MatrixLab/>;
    case "M3-22": return <ConditionMapLab/>;
    case "M4-01": return <CoordinateSectionLab/>;
    case "M4-02": return <LineEquationLab/>;
    case "M4-03": return <LineRelationLab/>;
    default: return null;
  }
}
