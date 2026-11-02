"use client";
import { useState } from "react";
import type { Block } from "@/contracts";
import { PlaceLab } from "./place-lab";
type Interactive = Extract<Block, { type: "InteractiveBlock" }>;
function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : Math.abs(a);
}
function fraction(n: number, d: number) {
  const common = gcd(n, d) || 1;
  return d / common === 1 ? String(n / common) : `${n / common}/${d / common}`;
}
function FractionBar({ n, d }: { n: number; d: number }) {
  return (
    <div
      className="fraction-bars"
      role="img"
      aria-label={`전체를 ${d}등분한 조각 ${n}개`}
    >
      {Array.from({ length: Math.max(1, Math.ceil(n / d)) }, (_, whole) => (
        <div
          className="fraction-whole"
          style={{ gridTemplateColumns: `repeat(${d}, minmax(0,1fr))` }}
          key={whole}
        >
          {Array.from({ length: d }, (_, i) => (
            <i key={i} className={whole * d + i < n ? "filled" : ""} />
          ))}
        </div>
      ))}
    </div>
  );
}
function Control({
  label,
  value,
  min = 0,
  max = 12,
  change,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  change: (value: number) => void;
}) {
  return (
    <label className="lab-control">
      <span>
        {label}
        <strong>{value}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => change(Number(e.target.value))}
      />
    </label>
  );
}
export function MathLab({ block }: { block: Interactive }) {
  const [a, setA] = useState(block.settings?.initialA ?? 3),
    [b, setB] = useState(block.settings?.initialB ?? 4),
    [c, setC] = useState(block.settings?.initialC ?? 2),
    [subtract, setSubtract] = useState(false),
    [inverse, setInverse] = useState(false);
  const [triangleCondition, setTriangleCondition] = useState("SSS");
  if (block.interaction === "place-value") return <PlaceLab />;
  const op = block.settings?.operation ?? "add";
  if (
    block.interaction === "fraction" ||
    block.interaction === "fraction-sum"
  ) {
    const sum = block.interaction === "fraction-sum";
    return (
      <div className="lab math-lab">
        <div className="lab-result" aria-live="polite">
          <span>
            {sum
              ? "같은 크기의 분수 조각 더하기"
              : "같은 크기로 나눈 전체와 부분"}
          </span>
          <strong>{sum ? `${a}/${b} + ${c}/${b}` : `${a}/${b}`}</strong>
          <p>
            {sum
              ? `합은 ${a + c}/${b} = ${fraction(a + c, b)}`
              : `선택한 부분은 전체의 ${a}/${b}, 약분하면 ${fraction(a, b)}`}
          </p>
        </div>
        <div className="lab-controls">
          <Control
            label="분모 · 전체 등분 수"
            value={b}
            min={2}
            max={12}
            change={(v) => {
              setB(v);
              setA(Math.min(a, v));
              setC(Math.min(c, v));
            }}
          />
          <Control
            label={sum ? "첫째 분자" : "분자 · 선택한 조각"}
            value={a}
            max={b}
            change={setA}
          />
          {sum && <Control label="둘째 분자" value={c} max={b} change={setC} />}
        </div>
        <FractionBar n={a} d={b} />
        {sum && (
          <>
            <p className="helper">여기에 같은 크기의 조각 {c}개를 더해요.</p>
            <FractionBar n={a + c} d={b} />
          </>
        )}
        <p className="helper">
          분모를 바꾸면 한 조각의 크기가 바뀝니다. 같은 분모의 덧셈에서는 분모를
          그대로 두어요.
        </p>
      </div>
    );
  }
  if (block.interaction === "ratio")
    return (
      <div className="lab math-lab">
        <div className="lab-result" aria-live="polite">
          <span>비교하는 양 ÷ 기준량</span>
          <strong>
            {a} / {b}
          </strong>
          <p>
            백분율 {(a * 100) % b === 0 ? "" : "약 "}
            {Number(((a * 100) / b).toFixed(2))}%
          </p>
        </div>
        <Control
          label="기준량 · 전체"
          value={b}
          min={1}
          max={20}
          change={(v) => {
            setB(v);
            setA(Math.min(a, v));
          }}
        />
        <Control label="비교하는 양 · 부분" value={a} max={b} change={setA} />
        <div
          className="ratio-track"
          role="img"
          aria-label={`${b}개 중 ${a}개 선택`}
        >
          <span style={{ width: `${(a / b) * 100}%` }} />
        </div>
        <p className="helper">
          전체를 100%로 보았을 때 선택한 부분이 차지하는 비율이에요.
          나누어떨어지지 않으면 소수 둘째 자리까지 반올림합니다.
        </p>
      </div>
    );
  if (block.interaction === "decimal")
    return (
      <div className="lab math-lab">
        <div className="lab-result" aria-live="polite">
          <span>0.1 조각으로 소수 더하기</span>
          <strong>
            {(a / 10).toFixed(1)} + {(b / 10).toFixed(1)}
          </strong>
          <p>
            {a}개의 0.1 + {b}개의 0.1 = {(a + b) / 10}
          </p>
        </div>
        <Control
          label="첫째 수의 0.1 조각 개수"
          value={a}
          max={30}
          change={setA}
        />
        <Control
          label="둘째 수의 0.1 조각 개수"
          value={b}
          max={30}
          change={setB}
        />
        <FractionBar n={a + b} d={10} />
        <p className="helper">
          열 조각이 모이면 1이 됩니다. 정수인 조각 개수로 계산해 소수 자릿값을
          확인해요.
        </p>
      </div>
    );
  if (block.interaction === "number-line")
    return (
      <div className="lab math-lab">
        <div className="lab-result" aria-live="polite">
          <span>출발점과 이동</span>
          <strong>
            {a} + ({b}) = {a + b}
          </strong>
          <p>
            {a}에서 {b >= 0 ? "오른쪽" : "왼쪽"}으로 {Math.abs(b)}만큼 이동해{" "}
            {a + b}에 도착해요.
          </p>
        </div>
        <Control label="출발점" value={a} min={-10} max={10} change={setA} />
        <Control
          label="이동량 · 양수는 오른쪽"
          value={b}
          min={-10}
          max={10}
          change={setB}
        />
        <div
          className="signed-line"
          role="img"
          aria-label={`수직선 출발 ${a}, 도착 ${a + b}`}
        >
          <span
            className="line-start"
            style={{ left: `${((a + 20) / 40) * 100}%` }}
          >
            출발 {a}
          </span>
          <span
            className="line-end"
            style={{ left: `${((a + b + 20) / 40) * 100}%` }}
          >
            도착 {a + b}
          </span>
        </div>
        <div className="line-ticks" aria-hidden="true">
          {[-20, -15, -10, -5, 0, 5, 10, 15, 20].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <p className="helper">
          수직선의 오른쪽에 있는 수가 더 커요. 출발점과 도착점을 따로
          확인하세요.
        </p>
      </div>
    );
  if (block.interaction === "integer-number-line") {
    const relation = a < b ? "<" : a > b ? ">" : "=";
    return (
      <div className="lab math-lab">
        <div className="lab-result" aria-live="polite">
          <span>정수의 위치·원점 거리·두 점 사이 거리</span>
          <strong>{a} {relation} {b}</strong>
          <p>|{a}| = {Math.abs(a)} · |{b}| = {Math.abs(b)} · 두 수 사이 거리 {Math.abs(a - b)}</p>
        </div>
        <Control label="첫 번째 정수" value={a} min={-10} max={10} change={setA} />
        <Control label="두 번째 정수" value={b} min={-10} max={10} change={setB} />
        <div className="signed-line" role="img" aria-label={`수직선에서 ${a}와 ${b}의 위치를 비교합니다`}>
          <span className="line-start" style={{ left: `${((a + 10) / 20) * 100}%` }}>A = {a}</span>
          <span className="line-end" style={{ left: `${((b + 10) / 20) * 100}%` }}>B = {b}</span>
        </div>
        <div className="line-ticks" aria-hidden="true">{[-10, -5, 0, 5, 10].map((tick) => <span key={tick}>{tick}</span>)}</div>
        <p className="helper">수직선에서 오른쪽에 있는 수가 더 큽니다. 절댓값은 원점까지의 거리이고, 두 수 사이 거리는 두 위치의 차이의 절댓값입니다.</p>
      </div>
    );
  }
  if (block.interaction === "signed-multiplication") {
    return (
      <div className="lab math-lab">
        <div className="lab-result" aria-live="polite">
          <span>부호와 크기를 나누어 곱하기</span>
          <strong>({a}) × ({b}) = {a * b}</strong>
          <p>{a === 0 || b === 0 ? "한 수가 0이면 곱은 0입니다." : a * b < 0 ? "부호가 서로 다르므로 곱은 음수입니다." : "부호가 같으므로 곱은 양수입니다."}</p>
        </div>
        <Control label="첫 번째 정수" value={a} min={-12} max={12} change={setA} />
        <Control label="두 번째 정수" value={b} min={-12} max={12} change={setB} />
        <p className="helper">먼저 부호를 판단하고, 절댓값끼리 곱한 뒤 원래 식에 대입해 확인해요.</p>
      </div>
    );
  }
  if (block.interaction === "powers") {
    const exponent = Math.max(2, Math.min(5, c));
    const factors = Array.from({ length: exponent }, () => `(${a})`).join(" × ");
    return (
      <div className="lab math-lab">
        <div className="lab-result" aria-live="polite">
          <span>거듭제곱은 같은 인수의 반복 곱</span>
          <strong>({a})^{exponent} = {a ** exponent}</strong>
          <p>{factors} = {a ** exponent}</p>
        </div>
        <Control label="밑" value={a} min={-5} max={5} change={setA} />
        <Control label="지수 · 같은 인수의 개수" value={exponent} min={2} max={5} change={setC} />
        <p className="helper">지수는 밑과 곱하는 수가 아니라, 밑이 인수로 반복되는 횟수예요. 괄호 안의 음수도 한 인수로 묶어 살펴보세요.</p>
      </div>
    );
  }
  if (block.interaction === "expression-value") {
    return (
      <div className="lab math-lab">
        <div className="lab-result" aria-live="polite">
          <span>값을 넣고 식의 결과 확인</span>
          <strong>x = {a}일 때 2x + 5 = 2 × ({a}) + 5 = {2 * a + 5}</strong>
          <p>문자를 괄호로 감싸 대입한 뒤 곱셈과 덧셈을 계산합니다.</p>
        </div>
        <Control label="문자 x에 넣을 수" value={a} min={-10} max={10} change={setA} />
        <p className="helper">x가 음수이면 2x를 2 × (x)로 써서 부호와 곱셈을 확인해요. 문자의 값이 바뀌면 식의 값도 어떻게 달라지는지 관찰하세요.</p>
      </div>
    );
  }
  if (block.interaction === "monomial-product") {
    const coefficient = a * c;
    const exponent = b + 1;
    return (
      <div className="lab math-lab">
        <div className="lab-result" aria-live="polite">
          <span>계수끼리 곱하고 같은 문자 인수를 모아요</span>
          <strong>({a}x<sup>{b}</sup>)({c}x) = {coefficient}x<sup>{exponent}</sup></strong>
          <p>{a}×{c}={coefficient}, 지수는 {b}+1={exponent}입니다.</p>
        </div>
        <Control label="첫째 계수" value={a} min={-6} max={6} change={setA} />
        <Control label="첫째 x의 지수" value={b} min={1} max={5} change={setB} />
        <Control label="둘째 계수" value={c} min={-6} max={6} change={setC} />
        <p className="helper">곱셈을 인수의 반복으로 펼쳐 보면 같은 문자의 지수는 인수 개수를 합한 값입니다.</p>
      </div>
    );
  }
  if (block.interaction === "like-terms") {
    return (
      <div className="lab math-lab">
        <div className="lab-result" aria-live="polite">
          <span>문자와 지수가 같은 항만 모아요</span>
          <strong>{a}x + ({b}x) = {a + b}x</strong>
          <p>같은 x 타일 {a}개와 {b}개를 모으면 모두 {a + b}개입니다.</p>
        </div>
        <Control label="첫째 항의 계수" value={a} min={-10} max={10} change={setA} />
        <Control label="둘째 항의 계수" value={b} min={-10} max={10} change={setB} />
        <p className="helper">계수만 계산하고 문자와 지수는 그대로 둡니다. x와 x²처럼 문자가 달라도 지수가 다른 항은 합칠 수 없어요.</p>
      </div>
    );
  }
  if (block.interaction === "distributive-area") {
    return (
      <div className="lab math-lab">
        <div className="lab-result" aria-live="polite">
          <span>큰 직사각형을 두 부분으로 나누어 넓이를 더해요</span>
          <strong>{a}({b}+{c}) = {a}×{b} + {a}×{c} = {a * b + a * c}</strong>
          <p>왼쪽 조각의 넓이 {a * b}와 오른쪽 조각의 넓이 {a * c}를 더하면 전체 넓이 {a * (b + c)}입니다.</p>
        </div>
        <div className="lab-controls">
          <Control label="공통 높이" value={a} min={1} max={10} change={setA} />
          <Control label="첫째 너비" value={b} min={1} max={10} change={setB} />
          <Control label="둘째 너비" value={c} min={1} max={10} change={setC} />
        </div>
        <div role="img" aria-label={`높이 ${a}, 너비 ${b}와 ${c}인 두 직사각형의 넓이를 합합니다.`} className="ratio-track">
          <span style={{ width: `${(b / (b + c)) * 100}%` }} />
        </div>
        <p className="helper">분배법칙은 괄호 안의 각 항에 괄호 밖의 수를 곱하는 넓이의 합으로 확인할 수 있어요.</p>
      </div>
    );
  }
  if (block.interaction === "equation-balance") {
    return (
      <div className="lab math-lab">
        <div className="lab-result" aria-live="polite">
          <span>저울의 균형을 유지하며 양변에 같은 수를 더해요</span>
          <strong>x + ({a}) = {b} → x = {b} - ({a}) = {b - a}</strong>
          <p>양변에 {-a}를 더했으므로 등식의 균형은 유지됩니다.</p>
        </div>
        <Control label="x에 더한 수" value={a} min={-10} max={10} change={setA} />
        <Control label="오른쪽 값" value={b} min={-10} max={10} change={setB} />
        <p className="helper">한쪽만 바꾸면 등식이 깨져요. 양변에 같은 수를 더하거나 빼서 미지수를 한쪽에 남깁니다.</p>
      </div>
    );
  }
  if (block.interaction === "linear-equation") {
    const numerator = c - b;
    const solution = a === 0 ? null : fraction(a < 0 ? -numerator : numerator, Math.abs(a));
    const equationState = a === 0 ? (b === c ? "모든 수가 해가 되는 등식입니다." : "해가 없는 등식입니다.") : `x = (${c} - (${b})) ÷ ${a} = ${solution}`;
    return (
      <div className="lab math-lab">
        <div className="lab-result" aria-live="polite">
          <span>양변에 같은 연산을 적용해 x를 구해요</span>
          <strong>{a}x + ({b}) = {c}</strong>
          <p>{equationState}</p>
          {a !== 0 && <p>검산: {a}×({solution})+({b}) = {c}</p>}
        </div>
        <Control label="x의 계수" value={a} min={-6} max={6} change={setA} />
        <Control label="상수항" value={b} min={-12} max={12} change={setB} />
        <Control label="오른쪽 값" value={c} min={-12} max={12} change={setC} />
        <p className="helper">먼저 양변에서 상수항을 빼고, x의 계수가 0이 아닐 때 양변을 그 계수로 나눕니다. 마지막에 원래 식에 대입해 확인해요.</p>
      </div>
    );
  }
  if (block.interaction === "linear-word-problem") {
    const total = a * b + c;
    return (
      <div className="lab math-lab">
        <div className="lab-result" aria-live="polite">
          <span>상황의 양을 문자와 단위로 정리해요</span>
          <strong>총액 = 한 개 가격 × 개수 + 고정 비용 = {a}×{b}+{c} = {total}원</strong>
          <p>한 개 {a}원인 물건 {b}개와 고정 비용 {c}원을 더한 상황입니다.</p>
        </div>
        <Control label="한 개 가격 (원)" value={a} min={1} max={60} change={setA} />
        <Control label="물건 개수" value={b} min={1} max={12} change={setB} />
        <Control label="고정 비용 (원)" value={c} min={0} max={12} change={setC} />
        <div className="table-scroll">
          <table>
            <tbody>
              <tr><th scope="row">한 개 가격</th><td>{a}원</td></tr>
              <tr><th scope="row">개수</th><td>{b}개</td></tr>
              <tr><th scope="row">고정 비용</th><td>{c}원</td></tr>
              <tr><th scope="row">관계식</th><td>총액 = {a}×{b}+{c} = {total}원</td></tr>
            </tbody>
          </table>
        </div>
        <p className="helper">문제에서 구하는 양을 x라 놓을 때도 단위를 함께 적고, 식의 각 항이 어떤 비용인지 대응시켜요.</p>
      </div>
    );
  }
  if (block.interaction === "inequality") {
    const boundary = a === 0 ? null : fraction(a < 0 ? -b : b, Math.abs(a));
    const boundaryNumber = a === 0 ? 0 : b / a;
    const boundaryX = 20 + ((Math.max(-12, Math.min(12, boundaryNumber)) + 12) / 24) * 200;
    const relation = a < 0 ? ">" : "<";
    const solution = a === 0
      ? b > 0 ? "모든 실수가 해입니다." : "해가 없습니다."
      : `x ${relation} ${boundary}`;
    return (
      <div className="lab math-lab">
        <div className="lab-result" aria-live="polite">
          <span>양변을 계수로 나누고 해의 방향을 확인해요</span>
          <strong>{a}x &lt; {b}</strong>
          <p>{solution}</p>
          <p>{a < 0 ? "음수로 나누어 순서가 뒤집혀 부등호 방향도 바뀝니다." : a > 0 ? "양수로 나누므로 부등호 방향은 유지됩니다." : "계수가 0이면 x에 따라 관계가 달라지지 않습니다."}</p>
        </div>
        <Control label="x의 계수" value={a} min={-6} max={6} change={setA} />
        <Control label="오른쪽 값" value={b} min={-12} max={12} change={setB} />
        {a !== 0 && (
          <svg viewBox="0 0 240 52" role="img" aria-label={`수직선에서 ${solution}인 범위를 표시합니다.`} style={{ display: "block", width: "min(100%, 20rem)", margin: "1rem auto" }}>
            <line x1="20" y1="24" x2="220" y2="24" stroke="currentColor" strokeWidth="2" />
            <line x1={a > 0 ? 20 : boundaryX} y1="24" x2={a > 0 ? boundaryX : 220} y2="24" stroke="currentColor" strokeWidth="5" />
            <circle cx={boundaryX} cy="24" r="7" fill="var(--surface, white)" stroke="currentColor" strokeWidth="2" />
            <text x="20" y="48" textAnchor="middle">-12</text><text x="220" y="48" textAnchor="middle">12</text>
            <text x={boundaryX} y="12" textAnchor="middle">{boundary}</text>
            <text x={a > 0 ? 22 : 218} y="16" textAnchor={a > 0 ? "start" : "end"}>{a > 0 ? "←" : "→"}</text>
          </svg>
        )}
        <p className="helper">같은 수를 더하거나 빼도 방향은 유지되지만, 음수를 곱하거나 나누면 수직선의 순서가 뒤집혀요.</p>
      </div>
    );
  }
  if (block.interaction === "coordinate-plane") {
    const quadrant = a === 0 || b === 0
      ? "축 위의 점"
      : a > 0 ? (b > 0 ? "제1사분면" : "제4사분면") : (b > 0 ? "제2사분면" : "제3사분면");
    return (
      <div className="lab math-lab">
        <div className="lab-result" aria-live="polite">
          <span>첫째 좌표는 가로, 둘째 좌표는 세로 위치예요</span>
          <strong>({a}, {b}) · {quadrant}</strong>
          <p>x = {a}, y = {b}</p>
        </div>
        <Control label="x좌표 · 가로" value={a} min={-5} max={5} change={setA} />
        <Control label="y좌표 · 세로" value={b} min={-5} max={5} change={setB} />
        <div role="img" aria-label={`좌표평면에서 점 (${a}, ${b})는 ${quadrant}에 있습니다.`} style={{ position: "relative", width: "min(100%, 16rem)", aspectRatio: "1 / 1", border: "1px solid var(--line, #cbd5e1)", margin: "1rem auto", backgroundImage: "linear-gradient(to right, transparent 49.7%, #64748b 49.7%, #64748b 50.3%, transparent 50.3%), linear-gradient(to bottom, transparent 49.7%, #64748b 49.7%, #64748b 50.3%, transparent 50.3%)", backgroundSize: "100% 100%" }}>
          <span style={{ position: "absolute", left: `${50 + a * 9}%`, top: `${50 - b * 9}%`, transform: "translate(-50%, -50%)", fontWeight: 700 }}>● ({a}, {b})</span>
          <span style={{ position: "absolute", left: "52%", top: "48%" }}>O</span>
        </div>
        <p className="helper">x좌표가 0이면 y축 위, y좌표가 0이면 x축 위에 놓여 사분면에 속하지 않아요.</p>
      </div>
    );
  }
  if (block.interaction === "proportion") {
    const directValue = a * b;
    const inverseValue = a / b;
    const graphXs = [1, 2, 3, 4, 5, 6];
    const graphMaxY = inverse ? a : a * graphXs.length;
    const graphPoints = graphXs.map((x, index) => {
      const y = inverse ? a / x : a * x;
      return `${35 + index * 34},${130 - (y / graphMaxY) * 100}`;
    }).join(" ");
    return (
      <div className="lab math-lab">
        <div className="lab-result" aria-live="polite">
          <span>{inverse ? "반비례 · x와 y의 곱이 일정해요" : "정비례 · y/x가 일정해요"}</span>
          <strong>{inverse ? `y = ${a}/${b} = ${Number(inverseValue.toFixed(2))}` : `y = ${a}×${b} = ${directValue}`}</strong>
          <p>{inverse ? `xy = ${a}이므로 비례상수는 ${a}입니다.` : `y/x = ${a}이므로 비례상수는 ${a}입니다.`}</p>
        </div>
        <div className="question-actions">
          <button type="button" className={!inverse ? "selected" : ""} aria-pressed={!inverse} onClick={() => setInverse(false)}>정비례 y=kx</button>
          <button type="button" className={inverse ? "selected" : ""} aria-pressed={inverse} onClick={() => setInverse(true)}>반비례 y=k/x</button>
        </div>
        <Control label="비례상수 k" value={a} min={1} max={12} change={setA} />
        <Control label="x값 (0 제외)" value={b} min={1} max={12} change={setB} />
        <svg viewBox="0 0 250 155" role="img" aria-label={`${inverse ? "반비례" : "정비례"} 관계 ${inverse ? "y=k/x" : "y=kx"}의 표본 그래프입니다.`} style={{ display: "block", width: "min(100%, 20rem)", margin: "1rem auto" }}>
          <line x1="28" y1="130" x2="240" y2="130" stroke="currentColor" strokeWidth="2" />
          <line x1="28" y1="12" x2="28" y2="130" stroke="currentColor" strokeWidth="2" />
          <polyline points={graphPoints} fill="none" stroke="currentColor" strokeWidth="3" />
          {graphXs.map((x, index) => {
            const y = inverse ? a / x : a * x;
            return <circle key={x} cx={35 + index * 34} cy={130 - (y / graphMaxY) * 100} r="3.5" fill="currentColor" />;
          })}
          <text x="235" y="148" textAnchor="end">x</text><text x="14" y="16">y</text>
        </svg>
        <p className="helper">정비례는 y/x, 반비례는 xy가 일정합니다. 반비례식은 x=0에서 정의되지 않아요.</p>
      </div>
    );
  }
  if (block.interaction === "parallel-angles") {
    const supplement = 180 - a;
    return (
      <div className="lab math-lab">
        <div className="lab-result" aria-live="polite">
          <span>평행선에서 같은 각은 같고 같은 쪽 내각은 180°예요</span>
          <strong>기준각 {a}° · 동위각/엇각 {a}° · 같은 쪽 내각 {supplement}°</strong>
          <p>{a}° + {supplement}° = 180°</p>
        </div>
        <Control label="기준각" value={a} min={0} max={180} change={setA} />
        <svg viewBox="0 0 240 130" role="img" aria-label={`평행선 두 개를 가로지르는 선에서 기준각은 ${a}도이고 같은 쪽 내각은 ${supplement}도입니다.`} style={{ display: "block", width: "min(100%, 18rem)", margin: "1rem auto" }}>
          <line x1="15" y1="35" x2="225" y2="35" stroke="currentColor" strokeWidth="2" />
          <line x1="15" y1="95" x2="225" y2="95" stroke="currentColor" strokeWidth="2" />
          <line x1="65" y1="10" x2="185" y2="120" stroke="currentColor" strokeWidth="2" />
          <text x="22" y="28">평행선</text><text x="100" y="32">{a}°</text><text x="155" y="91">{supplement}°</text>
        </svg>
        <p className="helper">그림의 위치를 먼저 확인하고 동위각·엇각은 같음, 같은 쪽 내각은 합이 180°임을 적용해요.</p>
      </div>
    );
  }
  if (block.interaction === "triangle-congruence") {
    const labels: Record<string, string> = { SSS: "세 변의 길이가 각각 같으면 합동입니다.", SAS: "두 변과 그 사이각이 각각 같으면 합동입니다.", ASA: "한 변과 그 양 끝각이 각각 같으면 합동입니다." };
    return <div className="lab math-lab">
      <div className="lab-result" aria-live="polite"><span>대응하는 조건으로 삼각형을 비교해요</span><strong>{triangleCondition} 합동 조건</strong><p>{labels[triangleCondition]}</p></div>
      <div className="question-actions" role="group" aria-label="합동 조건 선택">{Object.keys(labels).map((condition) => <button key={condition} type="button" className={triangleCondition === condition ? "selected" : ""} aria-pressed={triangleCondition === condition} onClick={() => setTriangleCondition(condition)}>{condition}</button>)}</div>
      <Control label="첫째 대응변" value={a} min={3} max={10} change={setA} /><Control label="둘째 대응변" value={b} min={3} max={10} change={setB} /><Control label="셋째 대응변" value={c} min={3} max={10} change={setC} />
      <svg viewBox="0 0 260 130" role="img" aria-label={`대응하는 변 길이 ${a}, ${b}, ${c}인 두 삼각형`} style={{ display: "block", width: "min(100%, 22rem)", margin: "1rem auto" }}><path d="M20 110 L75 18 L130 110 Z M145 110 L200 18 L255 110 Z" fill="none" stroke="currentColor" strokeWidth="2"/><text x="70" y="126" textAnchor="middle">{a}</text><text x="105" y="64">{b}</text><text x="35" y="64">{c}</text><text x="195" y="126" textAnchor="middle">{a}</text><text x="230" y="64">{b}</text><text x="160" y="64">{c}</text></svg>
      <p className="helper">모양만 보지 말고 대응하는 변과 각을 확인하세요. SSA는 일반적인 합동 조건이 아닙니다.</p>
    </div>;
  }
  if (block.interaction === "area-model") {
    const area = a * b / 2;
    return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>직사각형을 대각선으로 나눠 삼각형 넓이를 찾아요</span><strong>{a} × {b} ÷ 2 = {area}</strong><p>직사각형 넓이 {a * b}의 절반이므로 삼각형 넓이는 {area}입니다.</p></div><Control label="밑변" value={a} min={1} max={20} change={setA}/><Control label="수직 높이" value={b} min={1} max={20} change={setB}/><svg viewBox="0 0 220 140" role="img" aria-label={`밑변 ${a}, 수직 높이 ${b}인 삼각형과 이를 포함하는 직사각형`} style={{ display: "block", width: "min(100%, 20rem)", margin: "1rem auto" }}><rect x="25" y="20" width="170" height="100" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M25 120 L195 20 L195 120 Z" fill="currentColor" opacity=".2" stroke="currentColor" strokeWidth="2"/><text x="110" y="137" textAnchor="middle">밑변 {a}</text><text x="202" y="75">높이 {b}</text></svg><p className="helper">삼각형의 높이는 빗변이 아니라 밑변에 수직인 거리입니다.</p></div>;
  }
  if (block.interaction === "volume-model") {
    const volume = a * b * c;
    return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>같은 밑면을 층층이 쌓아 부피를 구해요</span><strong>{a} × {b} × {c} = {volume} 세제곱 단위</strong><p>한 층에 {a * b}개씩 {c}개 층이므로 모두 {volume}개입니다.</p></div><Control label="가로 단위 수" value={a} min={1} max={10} change={setA}/><Control label="세로 단위 수" value={b} min={1} max={10} change={setB}/><Control label="층 수" value={c} min={1} max={10} change={setC}/><div className="lab-result" role="img" aria-label={`${c}개 층에 각각 ${a * b}개의 단위 정육면체, 총 ${volume}개`}>{Array.from({length: Math.min(c, 5)}, (_, i) => <p key={i}>층 {i + 1}: {a} × {b} = {a * b}개</p>)}{c > 5 && <p>… 전체 {c}개 층</p>}</div><p className="helper">부피는 세 방향 길이의 곱이며 단위는 cm³처럼 세제곱 단위로 씁니다.</p></div>;
  }
  if (block.interaction === "data-summary") {
    const values = [a, b, c].sort((x, y) => x - y);
    const mean = (a + b + c) / 3;
    return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>자료를 크기순으로 정리하고 대표값을 비교해요</span><strong>평균 {Number(mean.toFixed(2))} · 중앙값 {values[1]}</strong><p>정렬한 자료 {values.join(", ")} · 범위 {values[2] - values[0]}</p></div><Control label="자료 A" value={a} min={0} max={30} change={setA}/><Control label="자료 B" value={b} min={0} max={30} change={setB}/><Control label="자료 C" value={c} min={0} max={30} change={setC}/><p className="helper">평균은 합을 자료 수로 나눈 값, 중앙값은 크기순 가운데 값입니다. 극단값이 있으면 두 대표값은 다르게 움직일 수 있어요.</p></div>;
  }
  if (block.interaction === "expression-table") {
    const rows = [0, 1, 2, 3, 4].map((x) => ({ x, y: a * x + b }));
    return <div className="lab math-lab"><div className="lab-result" aria-live="polite"><span>문자식과 표에서 같은 관계를 확인해요</span><strong>y = {a}x + {b}</strong><p>x가 1 늘면 y는 {a}만큼 변하고, x=0이면 y={b}입니다.</p></div><Control label="x의 계수" value={a} min={-5} max={5} change={setA}/><Control label="처음 값" value={b} min={-10} max={10} change={setB}/><div className="table-scroll"><table><caption>y={a}x+({b})의 값 표</caption><thead><tr><th scope="col">x</th><th scope="col">y</th></tr></thead><tbody>{rows.map(({x,y}) => <tr key={x}><td>{x}</td><td>{y}</td></tr>)}</tbody></table></div><p className="helper">각 x를 식에 대입해 y를 구하고, 표의 순서쌍 (x,y)와 연결합니다. 일차 관계의 기초 표현 연습입니다.</p></div>;
  }
  if (op === "factors") {
    const factors = Array.from({ length: a }, (_, i) => i + 1).filter(
      (n) => a % n === 0,
    );
    return (
      <div className="lab math-lab">
        <div className="lab-result" aria-live="polite">
          <span>나누어떨어지는 수 찾기</span>
          <strong>
            {a} ÷ {b}
          </strong>
          <p>
            몫 {Math.floor(a / b)}, 나머지 {a % b} ·{" "}
            {a % b === 0
              ? `${b}는 ${a}의 약수예요`
              : `${b}는 ${a}의 약수가 아니에요`}
          </p>
        </div>
        <Control
          label="약수를 찾을 수"
          value={a}
          min={2}
          max={60}
          change={setA}
        />
        <Control
          label="나누어 볼 수"
          value={b}
          min={1}
          max={12}
          change={setB}
        />
        <p className="factor-list">
          {a}의 약수: {factors.join(", ")}
        </p>
        <p className="helper">
          {b}의 양의 배수:{" "}
          {Array.from({ length: 6 }, (_, i) => b * (i + 1)).join(", ")}, …
        </p>
      </div>
    );
  }
  if (op === "mixed")
    return (
      <div className="lab math-lab">
        <div className="lab-result" aria-live="polite">
          <span>괄호가 바꾸는 계산 순서</span>
          <strong>
            {a} + {b} × {c} = {a + b * c}
          </strong>
          <p>
            ({a} + {b}) × {c} = {(a + b) * c}
          </p>
        </div>
        <Control label="첫째 수" value={a} max={10} change={setA} />
        <Control label="둘째 수" value={b} max={10} change={setB} />
        <Control label="셋째 수" value={c} min={1} max={10} change={setC} />
        <p className="helper">
          위 식은 곱셈을 먼저, 아래 식은 괄호 안의 덧셈을 먼저 계산해요.
        </p>
      </div>
    );
  const divide = op === "divide",
    multiply = op === "multiply",
    result = divide
      ? Math.floor(a / b)
      : multiply
        ? a * b
        : subtract
          ? a - b
          : a + b;
  return (
    <div className="lab math-lab">
      <div className="lab-result" aria-live="polite">
        <span>
          {divide
            ? "같은 크기로 묶고 나머지 찾기"
            : multiply
              ? "같은 크기의 묶음 모으기"
              : "같은 자릿값끼리 더하고 빼기"}
        </span>
        <strong>
          {a} {divide ? "÷" : multiply ? "×" : subtract ? "−" : "+"} {b} ={" "}
          {result}
        </strong>
        {divide && (
          <p>
            나머지 {a % b} · 검산: {b} × {result} + {a % b} = {a}
          </p>
        )}
      </div>
      {op === "add" && (
        <label className="lab-operation">
          연산 선택
          <select
            value={subtract ? "subtract" : "add"}
            onChange={(e) => {
              const next = e.target.value === "subtract";
              setSubtract(next);
              if (next) setB(Math.min(a, b));
            }}
          >
            <option value="add">덧셈</option>
            <option value="subtract">뺄셈</option>
          </select>
        </label>
      )}
      <Control
        label={multiply ? "한 묶음의 수" : divide ? "전체 수" : "첫째 수"}
        value={a}
        max={multiply ? 12 : 48}
        change={(v) => {
          setA(v);
          if (subtract) setB(Math.min(b, v));
        }}
      />
      <Control
        label={multiply ? "묶음의 개수" : divide ? "한 묶음의 수" : "둘째 수"}
        value={b}
        min={divide ? 1 : 0}
        max={subtract ? a : multiply || divide ? 12 : 48}
        change={setB}
      />
      {multiply && (
        <div
          className="multiplication-groups"
          role="img"
          aria-label={`${a}개씩 ${b}묶음`}
        >
          {Array.from({ length: b }, (_, group) => (
            <div key={group}>
              {Array.from({ length: a }, (_, dot) => (
                <i key={dot} />
              ))}
            </div>
          ))}
        </div>
      )}
      <p className="helper">
        {divide
          ? "나머지가 나누는 수보다 작은지 확인해요. 나누는 수는 0이 될 수 없어요."
          : multiply
            ? "각 테두리가 한 묶음입니다. 묶음 수나 묶음 안의 수를 바꾸어 전체가 어떻게 달라지는지 확인해요."
            : "수를 바꾸며 결과를 확인하고 반대 연산으로 검산해 보세요."}
      </p>
    </div>
  );
}
