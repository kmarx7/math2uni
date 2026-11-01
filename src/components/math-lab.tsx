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
    [subtract, setSubtract] = useState(false);
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
