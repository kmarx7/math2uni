"use client";
import { useState } from "react";
import type { Block } from "@/contracts";
import { biquadraticRoots, factorRoots, intervalExtrema, solveQuadratic, symmetricIntersections, vietaCoefficients } from "@/modules/math-validation/m3-roots-preview";

type Interactive = Extract<Block, { type: "InteractiveBlock" }>;
function Range({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return <label className="lab-control"><span>{label}<strong>{value}</strong></span><input aria-label={label} type="range" min={min} max={max} step="1" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}
export function M3RootsLab({ block }: { block: Interactive }) {
  const [a, setA] = useState(1), [p, setP] = useState(-2), [q, setQ] = useState(3), [h, setH] = useState(1), [v, setV] = useState(0), [left, setLeft] = useState(-2), [right, setRight] = useState(3), [up, setUp] = useState(false), [mode, setMode] = useState(false), [sum, setSum] = useState(5), [product, setProduct] = useState(6), [substitution, setSubstitution] = useState(false);
  const interaction = block.interaction;
  let title = "근과 계수 탐구", result = "", controls: React.ReactNode = null;
  if (interaction === "root-coefficient") {
    const resultData = vietaCoefficients(a, p, q);
    title = "근을 움직여 계수 관계 확인";
    result = resultData ? `두 근의 합은 ${resultData.sum}, 곱은 ${resultData.product}입니다. ax²+bx+c에서 b=${resultData.b}, c=${resultData.c}입니다.` : "허용 범위의 정수를 선택하세요.";
    controls = <><Range label="최고차항 계수 a" value={a} min={1} max={5} onChange={setA}/><Range label="첫째 근 α" value={p} min={-5} max={5} onChange={setP}/><Range label="둘째 근 β" value={q} min={-5} max={5} onChange={setQ}/></>;
  } else if (interaction === "quadratic-intersection") {
    const roots = solveQuadratic(1, -2 * h, h * h + v - q);
    title = "포물선과 수평선의 교점";
    result = roots?.kind === "none" ? "실수 교점이 없습니다." : roots?.kind === "one" ? `접점 x=${roots.values[0]}, y=${q}` : roots ? `교점 x≈${roots.values[0].toFixed(3)}, ${roots.values[1].toFixed(3)} (각각 y=${q}; 소수 셋째 자리 근삿값)` : "계산할 수 없는 값입니다.";
    controls = <><Range label="꼭짓점 x좌표 h" value={h} min={-4} max={4} onChange={setH}/><Range label="꼭짓점 y좌표 v" value={v} min={-5} max={5} onChange={setV}/><Range label="수평선 y값 k" value={q} min={-5} max={8} onChange={setQ}/><p className="helper">포물선 y=(x−h)²+v 와 직선 y=k의 교점을 비교해요.</p></>;
  } else if (interaction === "quadratic-interval-optimization") {
    const extrema = intervalExtrema(up ? -1 : 1, h, v, left, right);
    title = "닫힌 구간에서 최댓값과 최솟값";
    result = extrema ? `[${left}, ${right}]에서 최솟값 ${extrema.min.y} (x=${extrema.min.x}), 최댓값 ${extrema.max.y} (x=${extrema.max.x})입니다. 후보: ${extrema.candidates.map((c) => `(${c.x}, ${c.y})`).join(", ")}` : "구간 끝점을 확인하세요.";
    controls = <><button type="button" aria-pressed={up} onClick={() => setUp(!up)}>아래로 열린 포물선: {up ? "켜짐" : "꺼짐"}</button><Range label="꼭짓점 x좌표" value={h} min={-5} max={5} onChange={setH}/><Range label="꼭짓점 y좌표" value={v} min={-5} max={5} onChange={setV}/><Range label="구간 왼쪽 끝" value={left} min={-5} max={right} onChange={setLeft}/><Range label="구간 오른쪽 끝" value={right} min={left} max={5} onChange={setRight}/></>;
  } else if (interaction === "polynomial-root-factory") {
    const roots = substitution ? biquadraticRoots([p, q]) : factorRoots([p, q, h]);
    title = "인수분해와 치환으로 방정식 풀기";
    result = roots ? (substitution ? "t=x² 치환" : "인수분해") + " 실근: " + (roots.join(", ") || "없음") + (substitution ? ". t<0은 실수 x를 만들지 않습니다." : ". 중복 근은 한 번만 표시합니다.") : "허용 범위의 정수를 선택하세요.";
    controls = <><button type="button" aria-pressed={substitution} onClick={() => setSubstitution(!substitution)}>풀이 방식: {substitution ? "t=x² 치환" : "인수분해"}</button><Range label={substitution ? "첫 t 값" : "첫 인수의 근"} value={p} min={-5} max={5} onChange={setP}/><Range label={substitution ? "둘째 t 값" : "둘째 인수의 근"} value={q} min={-5} max={5} onChange={setQ}/>{!substitution && <Range label="셋째 인수의 근" value={h} min={-5} max={5} onChange={setH}/>}<p className="helper">{substitution ? "x⁴−(" + (p + q) + ")x²+(" + (p * q) + ")=0에서 t=x²로 두고 t≥0인 해만 사용합니다." : "(x−r₁)(x−r₂)(x−r₃)=0이면 적어도 한 인수가 0인 경우를 모아요."}</p></>;
  } else if (interaction === "system-intersections") {
    const roots = mode ? symmetricIntersections(sum, product) : solveQuadratic(1, -2 * h - p, h * h + v - q);
    title = "두 조건이 만드는 교점";
    const solutionXs = roots?.kind === "one" ? roots.values : roots?.kind === "two" ? roots.values : [];
    const solutionPoints = solutionXs.map((x) => ({ x, y: mode ? sum - x : p * x + q }));
    result = roots?.kind === "none" ? "실수 해가 없습니다." : roots ? "교점/해: " + solutionPoints.map(({ x, y }) => "(" + Number(x.toFixed(3)) + ", " + Number(y.toFixed(3)) + ")").join(", ") + (roots.kind === "two" && roots.values.some((x) => !Number.isInteger(x)) ? " (근삿값)" : "") : "허용된 값 범위를 확인하세요.";
    controls = <><button type="button" aria-pressed={mode} onClick={() => setMode(!mode)}>대칭식 모드: {mode ? "켜짐" : "꺼짐"}</button>{mode ? <><Range label="두 수의 합" value={sum} min={-10} max={10} onChange={setSum}/><Range label="두 수의 곱" value={product} min={-10} max={10} onChange={setProduct}/></> : <><Range label="포물선 꼭짓점 x" value={h} min={-4} max={4} onChange={setH}/><Range label="직선 기울기" value={p} min={-5} max={5} onChange={setP}/><Range label="포물선 꼭짓점 y" value={v} min={-5} max={5} onChange={setV}/><Range label="직선 y절편" value={q} min={-5} max={8} onChange={setQ}/></>}</>;
  }
  const graphRoots = interaction === "quadratic-intersection" ? solveQuadratic(1, -2 * h, h * h + v - q) : null;
  const intersections = graphRoots?.kind === "one" ? graphRoots.values : graphRoots?.kind === "two" ? graphRoots.values : [];
  const parabolaPath = Array.from({ length: 53 }, (_, i) => {
    const x = -6 + i / 4;
    const y = (x - h) ** 2 + v;
    return (i ? "L" : "M") + (150 + 20 * x) + "," + (115 - 8 * y);
  }).join(" ");
  return <section className="lab math-lab" aria-labelledby={`${block.id}-title`}><div className="lab-result" aria-live="polite"><span id={`${block.id}-title`}>{title}</span><p>{result}</p></div>{interaction === "quadratic-intersection" && <svg viewBox="0 0 300 180" role="img" aria-label="포물선과 수평선, 교점 표시 그래프"><title>포물선과 수평선의 교점</title><text x="22" y="18" fill="#2563eb">파란색: 포물선</text><text x="135" y="18" fill="#b45309">주황색: 수평선 y={q}</text><line x1="20" y1="115" x2="280" y2="115" stroke="currentColor"/><line x1="150" y1="10" x2="150" y2="170" stroke="currentColor"/><line x1="20" y1={115 - 8 * q} x2="280" y2={115 - 8 * q} stroke="#b45309" strokeDasharray="5 4"/><path d={parabolaPath} fill="none" stroke="#2563eb" strokeWidth="2"/>{intersections.map((x, i) => <circle key={String(x) + i} cx={150 + 20 * x} cy={115 - 8 * q} r="5" fill="#b91c1c"/>)}</svg>}<div className="lab-controls">{controls}</div><p className="helper">슬라이더는 키보드 화살표 키로 조작할 수 있습니다. 결과는 탐구용이며 독립된 문제 풀이로 확인하세요.</p></section>;
}
