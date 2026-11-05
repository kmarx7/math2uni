"use client";

import { useState } from "react";
import {
  changeLogBase,
  combineLogs,
  commonLogParts,
  decimalDigitCount,
  expandLogPower,
  expandLogProduct,
  expandLogQuotient,
  exponentialGraphShape,
  logarithmGraphShape,
  logarithmGraphValue,
  solveSameBaseExponentialInequality,
  solveSameBaseExponentialEquation,
  type Comparison,
  type IntervalResult,
} from "@/modules/math-validation/m5-04-m5-08-preview";

function Slider({ label, value, min, max, step = 1, set }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  set: (value: number) => void;
}) {
  return (
    <label className="lab-control">
      <span>{label}<strong>{value}</strong></span>
      <input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(event) => set(Number(event.target.value))} />
    </label>
  );
}

type LogOperation = "expand-product" | "expand-quotient" | "combine-sum" | "combine-difference" | "power" | "change-base";

function LogPropertiesLab() {
  const [base, setBase] = useState(2);
  const [left, setLeft] = useState(8);
  const [right, setRight] = useState(4);
  const [power, setPower] = useState(2);
  const [newBase, setNewBase] = useState(5);
  const [operation, setOperation] = useState<LogOperation>("expand-product");

  const result = operation === "expand-product" ? expandLogProduct(base, left, right)
    : operation === "expand-quotient" ? expandLogQuotient(base, left, right)
      : operation === "combine-sum" ? combineLogs(base, left, right, "sum")
        : operation === "combine-difference" ? combineLogs(base, left, right, "difference")
          : operation === "power" ? expandLogPower(base, left, power)
            : changeLogBase(base, left, newBase);
  const description = operation === "expand-product" ? `log_${base}(${left}·${right}) = log_${base}(${left}) + log_${base}(${right})`
    : operation === "expand-quotient" ? `log_${base}(${left}/${right}) = log_${base}(${left}) − log_${base}(${right})`
      : operation === "combine-sum" ? `log_${base}(${left}) + log_${base}(${right}) = log_${base}(${left * right})`
        : operation === "combine-difference" ? `log_${base}(${left}) − log_${base}(${right}) = log_${base}(${left / right})`
          : operation === "power" ? `log_${base}(${left}^${power}) = ${power}·log_${base}(${left})`
            : `log_${base}(${left}) = log_${newBase}(${left}) / log_${newBase}(${base})`;

  return (
    <div className="lab math-lab">
      <div className="lab-result" aria-live="polite">
        <span>로그의 성질은 밑과 진수 조건을 먼저 확인해요.</span>
        <strong>{result === null ? "밑은 양수·1 제외, 진수는 양수여야 해요." : `${description} = ${Number(result.toFixed(4))}`}</strong>
        <p>곱은 합, 몫은 차, 거듭제곱은 계수로 바꿔요. 밑 변환의 분모 로그가 0이 되지 않는지도 확인해요.</p>
      </div>
      <div className="lab-controls">
        <label className="lab-control"><span>탐구할 성질</span>
          <select aria-label="탐구할 로그 성질" value={operation} onChange={(event) => setOperation(event.target.value as LogOperation)}>
            <option value="expand-product">곱을 로그의 합으로 전개</option>
            <option value="expand-quotient">몫을 로그의 차로 전개</option>
            <option value="combine-sum">로그의 합을 하나로 결합</option>
            <option value="combine-difference">로그의 차를 하나로 결합</option>
            <option value="power">거듭제곱 로그 전개</option>
            <option value="change-base">밑 변환</option>
          </select>
        </label>
        <Slider label="로그의 밑 a" value={base} min={0.5} max={5} step={0.1} set={setBase} />
        <Slider label="첫 번째 진수 x" value={left} min={0.2} max={20} step={0.2} set={setLeft} />
        <Slider label="두 번째 진수 y" value={right} min={0.2} max={20} step={0.2} set={setRight} />
        {operation === "power" && <Slider label="거듭제곱 지수 r" value={power} min={-3} max={4} step={0.5} set={setPower} />}
        {operation === "change-base" && <Slider label="새 밑 c" value={newBase} min={0.5} max={5} step={0.1} set={setNewBase} />}
      </div>
      <p className="helper">log_a(xy), log_a(x/y), log_a(x^r), log_c(a)의 조건을 모두 유지합니다. 모든 로그의 밑은 양수이고 1이 아니며 각 진수는 양수여야 해요.</p>
    </div>
  );
}

function CommonLogLab() {
  const [rawValue, setRawValue] = useState("0.04");
  const value = Number(rawValue);
  const parts = commonLogParts(value);
  const digits = decimalDigitCount(value);
  return (
    <div className="lab math-lab">
      <div className="lab-result" aria-live="polite">
        <span>양수 N을 N=10ᵏ·m, 1≤m&lt;10으로 정리</span>
        <strong>{parts ? `k=${parts.characteristic}, m≈${Number(parts.mantissa.toFixed(4))}, log N≈${parts.approximateLog.toFixed(4)}` : "N은 0보다 큰 유한한 수여야 해요."}</strong>
        <p>{parts ? `log N = k + log m = ${parts.characteristic} + log(${Number(parts.mantissa.toFixed(4))}); log m≈${parts.approximateMantissaLog.toFixed(4)}로 둔 근삿값이에요.` : "로그의 진수는 양수여야 해요."}</p>
      </div>
      <label className="lab-control"><span>양수 N</span><input aria-label="상용로그를 구할 양수 N" type="number" min="0.0000001" step="any" value={rawValue} onChange={(event) => setRawValue(event.target.value)} /></label>
      <div className="lab-result" aria-live="polite"><span>자릿수 점검 (양의 정수만)</span><strong>{digits === null ? "양의 정수를 입력하면 자릿수를 확인할 수 있어요." : `${digits}자리 정수`}</strong></div>
      <p className="helper">0&lt;N&lt;1이면 log N은 음수일 수 있어요. 소수 부분 log m은 근삿값으로 표시하며, 반올림 결과를 정확한 값으로 취급하지 않아요.</p>
    </div>
  );
}

function ExponentialGraphLab() {
  const [base, setBase] = useState(2);
  const [scale, setScale] = useState(1);
  const [horizontalShift, setHorizontalShift] = useState(0);
  const [verticalShift, setVerticalShift] = useState(0);
  const shape = exponentialGraphShape(base, scale, horizontalShift, verticalShift);
  const direction = shape?.direction === "increasing" ? "증가" : shape?.direction === "decreasing" ? "감소" : shape?.direction === "constant" ? "상수" : null;
  const range = shape?.range.lowerClosed && shape.range.upperClosed ? `{${shape.range.lower}}`
    : shape?.range.lower !== null && shape?.range.lower !== undefined ? `y>${shape.range.lower}`
      : shape?.range.upper !== null && shape?.range.upper !== undefined ? `y<${shape.range.upper}` : "ℝ";
  return (
    <div className="lab math-lab">
      <div className="lab-result" aria-live="polite">
        <span>y=c·a^(x−h)+k, 기본 조건 a&gt;0, a≠1</span>
        <strong>{shape ? `정의역 ℝ, 치역 ${range}, 수평점근선 y=${shape.horizontalAsymptote}${shape.direction === "constant" ? " (그래프와 일치하는 상수함수)" : ""}` : "밑은 양수이고 1이 아니어야 해요."}</strong>
        <p>{shape ? `기준점은 (${shape.anchor.x}, ${shape.anchor.y}), 그래프는 ${direction}해요.` : "유효한 밑 조건에서만 지수함수 그래프를 만들 수 있어요."}</p>
      </div>
      <div className="lab-controls">
        <Slider label="밑 a" value={base} min={0.2} max={3} step={0.1} set={setBase} />
        <Slider label="세로 배율 c" value={scale} min={-2} max={2} step={0.5} set={setScale} />
        <Slider label="가로 이동 h" value={horizontalShift} min={-4} max={4} set={setHorizontalShift} />
        <Slider label="세로 이동 k" value={verticalShift} min={-4} max={4} set={setVerticalShift} />
      </div>
      <p className="helper">c&gt;0이면 치역은 k보다 크고, c&lt;0이면 k보다 작아요. c=0일 때는 상수함수예요. 밑이 1이면 지수함수가 아니라 상수이므로 이 활동에서는 제외해요.</p>
    </div>
  );
}

function LogarithmGraphLab() {
  const [base, setBase] = useState(2);
  const [scale, setScale] = useState(1);
  const [horizontalShift, setHorizontalShift] = useState(0);
  const [verticalShift, setVerticalShift] = useState(0);
  const [sampleX, setSampleX] = useState(2);
  const shape = logarithmGraphShape(base, scale, horizontalShift, verticalShift);
  const value = logarithmGraphValue(base, sampleX, scale, horizontalShift, verticalShift);
  const direction = shape?.direction === "increasing" ? "증가" : shape?.direction === "decreasing" ? "감소" : shape?.direction === "constant" ? "상수" : null;
  const range = shape?.range.lowerClosed && shape.range.upperClosed ? `{${shape.range.lower}}` : "ℝ";
  return (
    <div className="lab math-lab">
      <div className="lab-result" aria-live="polite">
        <span>y=c·log_a(x−h)+k, a&gt;0, a≠1</span>
        <strong>{shape ? `정의역 x>${shape.domain.lower}, 치역 ${range}, ${shape.verticalAsymptote === null ? `수직점근선 없음 (상수함수 y=${verticalShift})` : `수직점근선 x=${shape.verticalAsymptote}`}` : "밑은 양수이고 1이 아니어야 해요."}</strong>
        <p>{shape ? `기준점 (${shape.anchor.x}, ${shape.anchor.y}), 그래프는 ${direction}해요.` : "로그 함수는 밑 조건을 만족해야 해요."}</p>
        <p>{value === null ? `x=${sampleX}는 로그 입력 조건 x>${horizontalShift}를 만족하지 않아요.` : `x=${sampleX}일 때 y≈${Number(value.toFixed(4))}`}</p>
      </div>
      <div className="lab-controls">
        <Slider label="밑 a" value={base} min={0.2} max={3} step={0.1} set={setBase} />
        <Slider label="세로 배율 c" value={scale} min={-2} max={2} step={0.5} set={setScale} />
        <Slider label="가로 이동 h" value={horizontalShift} min={-4} max={4} set={setHorizontalShift} />
        <Slider label="세로 이동 k" value={verticalShift} min={-4} max={4} set={setVerticalShift} />
        <Slider label="확인할 입력 x" value={sampleX} min={-4} max={8} step={0.5} set={setSampleX} />
      </div>
      <p className="helper">진수 x−h는 0보다 커야 해요. c=0이면 정의역은 유지되지만 치역은 {`{${verticalShift}}`}이고 상수함수입니다.</p>
    </div>
  );
}

function intervalDescription(result: IntervalResult): string {
  if (result === null) return "밑 조건과 입력값을 확인해요.";
  if (result.kind === "all") return "모든 실수 x";
  if (result.kind === "empty") return "해가 없어요.";
  if (result.lower === null) return `x${result.upperClosed ? "≤" : "<"}${result.upper}`;
  if (result.upper === null) return `x${result.lowerClosed ? "≥" : ">"}${result.lower}`;
  return `${result.lower}${result.lowerClosed ? "≤" : "<"}x${result.upperClosed ? "≤" : "<"}${result.upper}`;
}

function ExponentialEquationLab() {
  const [base, setBase] = useState(2);
  const [coefficient, setCoefficient] = useState(2);
  const [constant, setConstant] = useState(-1);
  const [targetExponent, setTargetExponent] = useState(3);
  const [operator, setOperator] = useState<Comparison>(">=");
  const answer = solveSameBaseExponentialEquation(base, coefficient, constant, targetExponent);
  const solution = solveSameBaseExponentialInequality(base, coefficient, constant, targetExponent, operator);
  const inequalityExpression = `(${base})^(${coefficient}x${constant < 0 ? "" : "+"}${constant}) ${operator} (${base})^(${targetExponent})`;
  return (
    <div className="lab math-lab">
      <div className="lab-result" aria-live="polite">
        <span>같은 밑의 지수 비교: 밑 a&gt;0, a≠1</span>
        <strong>{answer === null ? "방정식에 대해 밑과 계수를 확인해요." : `방정식 a^(${coefficient}x${constant < 0 ? "" : "+"}${constant})=a^(${targetExponent})의 해: x=${Number(answer.toFixed(4))}`}</strong>
        <p>{inequalityExpression}의 해는 {intervalDescription(solution)}입니다.</p>
        <p>밑 a&gt;1이면 증가하여 부등호를 유지하고, 0&lt;a&lt;1이면 감소하여 지수 비교 때 부등호를 뒤집어요.</p>
      </div>
      <div className="lab-controls">
        <Slider label="밑 a" value={base} min={0.2} max={3} step={0.1} set={setBase} />
        <Slider label="x의 계수 m" value={coefficient} min={-3} max={3} step={1} set={setCoefficient} />
        <Slider label="지수의 상수 b" value={constant} min={-4} max={4} set={setConstant} />
        <Slider label="비교할 지수 r" value={targetExponent} min={-4} max={4} set={setTargetExponent} />
        <label className="lab-control"><span>부등호</span>
          <select aria-label="지수 부등식 부등호" value={operator} onChange={(event) => setOperator(event.target.value as Comparison)}>
            <option value={'<'}>&lt;</option>
            <option value={'<='}>≤</option>
            <option value={'>'}>&gt;</option>
            <option value={'>='}>≥</option>
          </select>
        </label>
      </div>
      <p className="helper">a=1이면 지수와 무관하게 값이 1이라 지수를 비교할 수 없어요. 실수 지수 비교는 0&lt;a, a≠1인 밑에서만 진행합니다.</p>
    </div>
  );
}

export function M5PreviewLab({ unitId }: { unitId: string }) {
  switch (unitId) {
    case "M5-04": return <LogPropertiesLab />;
    case "M5-05": return <CommonLogLab />;
    case "M5-06": return <ExponentialGraphLab />;
    case "M5-07": return <LogarithmGraphLab />;
    case "M5-08": return <ExponentialEquationLab />;
    default: return null;
  }
}
