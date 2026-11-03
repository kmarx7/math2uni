"use client";

import { useState } from "react";
import type { Block } from "@/contracts";
import {
  combinations,
  countPairsAtParameter,
  formatInterval,
  intersectIntervals,
  permutations,
  productRuleCounts,
  quadraticInequalitySolution,
  sumRuleCounts,
  type InequalityRelation,
  type Interval,
} from "@/modules/math-validation/m3-inequalities-preview";

type Interactive = Extract<Block, { type: "InteractiveBlock" }>;
type Interaction = Interactive["interaction"];

function Range({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return <label className="lab-control"><span>{label}<strong>{value}</strong></span><input aria-label={label} type="range" min={min} max={max} step="1" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function IntervalLine({ first, second, result }: { first: Interval; second: Interval; result: Interval | null }) {
  const x = (value: number) => 20 + (value + 6) * 20;
  const start = (value: number | null) => x(Math.max(-6, value ?? -6));
  const end = (value: number | null) => x(Math.min(6, value ?? 6));
  const marker = (value: number | null, included: boolean, y: number, key: string) => value === null || value < -6 || value > 6
    ? null
    : <circle key={key} cx={x(value)} cy={y} r="5" fill={included ? "currentColor" : "white"} stroke="currentColor" />;
  const segment = (interval: Interval, y: number, color: string, key: string) => <g key={key} stroke={color} strokeWidth="4">
    <line x1={start(interval.lower)} y1={y} x2={end(interval.upper)} y2={y} />
    {marker(interval.lower, interval.lowerInclusive, y, `${key}-l`)}{marker(interval.upper, interval.upperInclusive, y, `${key}-r`)}
  </g>;
  return <svg viewBox="0 0 280 118" role="img" aria-label={`수직선에서 첫째 구간 ${formatInterval(first)}, 둘째 구간 ${formatInterval(second)}, 공통 구간 ${result ? formatInterval(result) : "공집합"}`} style={{ display: "block", width: "min(100%, 24rem)", margin: "1rem auto" }}>
    <line x1="20" y1="101" x2="260" y2="101" stroke="currentColor" />
    {[-6, -3, 0, 3, 6].map((tick) => <g key={tick}><line x1={x(tick)} y1="97" x2={x(tick)} y2="105" stroke="currentColor"/><text x={x(tick)} y="116" textAnchor="middle">{tick}</text></g>)}
    {segment(first, 24, "#2563eb", "first")}{segment(second, 56, "#c2410c", "second")}
    {result ? segment(result, 84, "#15803d", "intersection") : <text x="140" y="88" textAnchor="middle">공통 구간 없음</text>}
    <text x="4" y="28">1</text><text x="4" y="60">2</text><text x="4" y="88">∩</text>
  </svg>;
}

function InequalityIntersectionLab() {
  const [left1, setLeft1] = useState(-2); const [right1, setRight1] = useState(3);
  const [left2, setLeft2] = useState(0); const [right2, setRight2] = useState(5);
  const [left1Included, setLeft1Included] = useState(false); const [right1Included, setRight1Included] = useState(true);
  const [left2Included, setLeft2Included] = useState(true); const [right2Included, setRight2Included] = useState(false);
  const first = { lower: left1, lowerInclusive: left1Included, upper: right1, upperInclusive: right1Included };
  const second = { lower: left2, lowerInclusive: left2Included, upper: right2, upperInclusive: right2Included };
  const result = intersectIntervals(first, second);
  const label = (interval: Interval) => `${interval.lowerInclusive ? "[" : "("}${interval.lower}, ${interval.upper}${interval.upperInclusive ? "]" : ")"}`;
  return <div className="lab math-lab">
    <div className="lab-result" aria-live="polite"><span>두 해집합의 공통 부분</span><strong>{result ? label(result) : "공집합 ∅"}</strong><p>첫째 구간과 둘째 구간에 모두 속하는 수만 남깁니다. 같은 경계에 두 끝점이 닿더라도 두 조건이 모두 허용할 때만 그 점을 포함합니다.</p></div>
    <IntervalLine first={first} second={second} result={result}/>
    <Range label="첫째 구간 왼쪽 끝" value={left1} min={-5} max={right1} onChange={setLeft1}/><Range label="첫째 구간 오른쪽 끝" value={right1} min={left1} max={5} onChange={setRight1}/>
    <Range label="둘째 구간 왼쪽 끝" value={left2} min={-5} max={right2} onChange={setLeft2}/><Range label="둘째 구간 오른쪽 끝" value={right2} min={left2} max={5} onChange={setRight2}/>
    <div className="question-actions" role="group" aria-label="구간 경계 포함 여부">
      {([[left1Included, setLeft1Included, "첫째 왼쪽 경계 포함"], [right1Included, setRight1Included, "첫째 오른쪽 경계 포함"], [left2Included, setLeft2Included, "둘째 왼쪽 경계 포함"], [right2Included, setRight2Included, "둘째 오른쪽 경계 포함"]] as const).map(([included, setIncluded, text]) => <button key={text} type="button" aria-pressed={included} className={included ? "selected" : ""} onClick={() => setIncluded(!included)}>{text}: {included ? "포함" : "제외"}</button>)}
    </div>
  </div>;
}

function QuadraticSignLab() {
  const [left, setLeft] = useState(-2); const [right, setRight] = useState(2); const [a, setA] = useState(1);
  const [relation, setRelation] = useState<InequalityRelation>("<=");
  const solution = quadraticInequalitySolution(a, [left, right], relation);
  const relationText: Record<InequalityRelation, string> = { "<": "< 0", "<=": "≤ 0", ">": "> 0", ">=": "≥ 0" };
  const answer = solution?.length ? solution.map(formatInterval).join(" ∪ ") : "공집합 ∅";
  const coefficient = a === 1 ? "" : a === -1 ? "−" : String(a);
  const factor = (root: number) => root < 0 ? `(x + ${Math.abs(root)})` : root === 0 ? "x" : `(x − ${root})`;
  const testSign = (sign: number) => relation === "<" ? sign < 0 : relation === "<=" ? sign <= 0 : relation === ">" ? sign > 0 : sign >= 0;
  const chart = left === right
    ? [{ interval: `x < ${left}`, sign: Math.sign(a), included: testSign(Math.sign(a)) }, { interval: `x = ${left}`, sign: 0, included: testSign(0) }, { interval: `x > ${right}`, sign: Math.sign(a), included: testSign(Math.sign(a)) }]
    : [
      { interval: `x < ${left}`, sign: Math.sign(a), included: testSign(Math.sign(a)) },
      { interval: `x = ${left}`, sign: 0, included: testSign(0) },
      { interval: `${left} < x < ${right}`, sign: -Math.sign(a), included: testSign(-Math.sign(a)) },
      { interval: `x = ${right}`, sign: 0, included: testSign(0) },
      { interval: `x > ${right}`, sign: Math.sign(a), included: testSign(Math.sign(a)) },
    ];
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>근을 기준으로 이차식의 부호를 나눠요</span><strong>{coefficient}{factor(left)}{factor(right)} {relationText[relation]}: {answer}</strong><p>{left}와 {right}에서 부호가 바뀌며, 최고차항 계수의 부호가 바깥 구간의 부호를 정합니다. 등호가 있으면 근을 포함합니다.</p></div>
    <Range label="첫 번째 근" value={left} min={-5} max={right} onChange={setLeft}/><Range label="두 번째 근" value={right} min={left} max={5} onChange={setRight}/>
    <button type="button" aria-pressed={a < 0} className={a < 0 ? "selected" : ""} onClick={() => setA(a > 0 ? -1 : 1)}>포물선 방향: {a > 0 ? "위로" : "아래로"}</button>
    <div className="question-actions" role="group" aria-label="부등호 선택">{(["<", "<=", ">", ">="] as const).map((item) => <button key={item} type="button" aria-pressed={relation === item} className={relation === item ? "selected" : ""} onClick={() => setRelation(item)}>{item === "<" ? "0보다 작음" : item === "<=" ? "0 이하" : item === ">" ? "0보다 큼" : "0 이상"}</button>)}</div>
    <table><caption>이차식 부호표</caption><thead><tr><th scope="col">x의 범위</th><th scope="col">부호</th><th scope="col">부등식 해에 포함</th></tr></thead><tbody>{chart.map((row, index) => <tr key={`${row.interval}-${index}`}><th scope="row">{row.interval}</th><td>{row.sign < 0 ? "음수" : row.sign > 0 ? "양수" : "0"}</td><td>{row.included ? "예" : "아니요"}</td></tr>)}</tbody></table>
    <p className="helper">현재 활동은 정수 근을 가진 인수분해된 이차식으로 부호 구간을 탐색합니다.</p>
  </div>;
}

function ParameterCasesLab() {
  const [a, setA] = useState(1); const [inclusive, setInclusive] = useState(true);
  const pairs = [{ x: 1, y: 2 }, { x: 2, y: 1 }];
  const count = countPairsAtParameter(pairs, a, inclusive);
  const relation = inclusive ? "≤" : "<";
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>x+y=3, xy=2에서 가능한 순서쌍</span><strong>x {relation} a를 만족하는 순서쌍은 {count}개</strong><p>후보는 (1, 2), (2, 1)입니다. 첫 좌표를 조건에 대입해 남는 순서쌍만 셉니다.</p></div>
    <Range label="매개변수 a" value={a} min={0} max={4} onChange={setA}/><button type="button" aria-pressed={inclusive} className={inclusive ? "selected" : ""} onClick={() => setInclusive(!inclusive)}>경계 x=a: {inclusive ? "포함 (≤)" : "제외 (<)"}</button>
    <table><caption>매개변수 경계별 순서쌍 수</caption><thead><tr><th scope="col">a의 범위</th><th scope="col">순서쌍 수</th></tr></thead><tbody>{(inclusive
      ? [["a < 1", "0"], ["1 ≤ a < 2", "1"], ["a ≥ 2", "2"]]
      : [["a ≤ 1", "0"], ["1 < a ≤ 2", "1"], ["a > 2", "2"]]
    ).map(([range, value]) => <tr key={range}><td>{range}</td><td>{value}</td></tr>)}</tbody></table>
    <p className="helper">정수 후보의 첫 좌표가 바뀌는 값 1과 2에서 구간을 나누고, 등호 포함 여부를 따로 확인합니다.</p>
  </div>;
}

function CountingTreeLab({ block }: { block: Interactive }) {
  const [first, setFirst] = useState(block.settings?.initialA ?? 3);
  const [second, setSecond] = useState(block.settings?.initialB ?? 4);
  const [third, setThird] = useState(block.settings?.initialC ?? 2);
  const sum = sumRuleCounts([first, second]);
  const product = productRuleCounts([first, third]);
  const mixed = sumRuleCounts([productRuleCounts([first, third]) ?? 0, productRuleCounts([second, third]) ?? 0]);
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>갈래와 단계 수를 세어 봐요</span><strong>택1 방법 {sum}가지 · 연속 선택 방법 {product}가지 · 갈래별 단계 선택 합계 {mixed}가지</strong><p>서로 다른 갈래 중 하나를 고르면 합하고, 모든 단계를 차례로 선택하면 곱합니다.</p></div>
    <Range label="첫째 갈래 선택 수" value={first} min={1} max={8} onChange={setFirst}/><Range label="둘째 갈래 선택 수" value={second} min={1} max={8} onChange={setSecond}/><Range label="각 단계의 선택 수" value={third} min={1} max={8} onChange={setThird}/>
    <ul aria-label="곱의 법칙 수형도"><li>첫째 단계<ul><li>첫째 선택 {first}가지<ul><li>다음 단계 {third}가지씩</li></ul></li><li>둘째 선택 {second}가지<ul><li>다음 단계 {third}가지씩</li></ul></li></ul></li></ul>
  </div>;
}

function PermutationCombinationLab({ block }: { block: Interactive }) {
  const [n, setN] = useState(block.settings?.initialA ?? 4);
  const [r, setR] = useState(Math.min(block.settings?.initialB ?? 2, n));
  const [ordered, setOrdered] = useState(true);
  const answer = ordered ? permutations(n, r) : combinations(n, r);
  const cards = Array.from({ length: n }, (_, index) => String.fromCharCode(65 + index));
  return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>{ordered ? "순서를 구별하는 배치" : "순서를 구별하지 않는 모둠"}</span><strong>{n}장 중 {r}장 선택: {answer ?? "계산 범위를 벗어났습니다."}가지</strong><p>{ordered ? `첫 자리에 ${n}가지, 다음 자리에 ${n - Math.min(r, 1)}가지처럼 자리마다 선택 수가 줄어듭니다.` : `같은 ${r}장 모둠을 뽑는 순서는 서로 다른 결과로 세지 않습니다.`}</p></div>
    <Range label="전체 카드 수 n" value={n} min={1} max={8} onChange={(value) => { setN(value); setR(Math.min(r, value)); }}/><Range label="고르는 카드 수 r" value={r} min={0} max={n} onChange={setR}/>
    <div className="question-actions" role="group" aria-label="선택에서 순서 구별 여부"><button type="button" aria-pressed={ordered} className={ordered ? "selected" : ""} onClick={() => setOrdered(true)}>순서 있게 배치 nPr</button><button type="button" aria-pressed={!ordered} className={!ordered ? "selected" : ""} onClick={() => setOrdered(false)}>순서 없이 선택 nCr</button></div>
    <div className="question-actions" role="list" aria-label="선택 가능한 카드 예시">{cards.map((card) => <span role="listitem" className="choice" key={card}>{card}</span>)}</div>
    <p className="helper">순서 있는 역할 배정은 배열 순서가 결과를 바꾸고, 팀 선택은 같은 사람들로 된 모둠을 한 번만 셉니다.</p>
  </div>;
}

export function M3InequalitiesLab({ block }: { block: Interactive }) {
  const interaction: Interaction = block.interaction;
  switch (interaction) {
    case "linear-inequality-intersection": return <InequalityIntersectionLab/>;
    case "quadratic-inequality-sign": return <QuadraticSignLab/>;
    case "parameter-case-table": return <ParameterCasesLab/>;
    case "counting-tree": return <CountingTreeLab block={block}/>;
    case "permutation-combination-cards": return <PermutationCombinationLab block={block}/>;
    default: return null;
  }
}
