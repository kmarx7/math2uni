"use client";

import { useState } from "react";
import {
  arcLengthFromRadians,
  coterminalAngleDegrees,
  degreesToRadians,
  deriveSineFromCosine,
  describeSolutionSet,
  discreteExponentialModel,
  exactRadianMultipleOfPi,
  logarithmicScaleLevel,
  logarithmicScaleRatio,
  pythagoreanIdentityValue,
  radiansToDegrees,
  sectorAreaFromRadians,
  solveSameBaseLogEquation,
  solveSameBaseLogInequality,
  tangentFromSineCosine,
  unitCircleCoordinates,
  type Comparison,
  type DiscreteModelMode,
  type Quadrant,
} from "@/modules/math-validation/m5-09-m5-13-preview";

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

function LogEquationLab() {
  const [base, setBase] = useState(2);
  const [mode, setMode] = useState<"equation" | "inequality">("inequality");
  const [operator, setOperator] = useState<Comparison>("<");
  const solution = mode === "equation"
    ? solveSameBaseLogEquation(base, 1, -1, 0, 3)
    : solveSameBaseLogInequality(base, 1, -1, 0, 3, operator);
  return (
    <div className="lab math-lab">
      <div className="lab-result" aria-live="polite">
        <span>정의역과 해집합을 함께 확인해요.</span>
        <strong>{solution === null ? "로그의 밑은 양수이고 1이 아니어야 해요." : `log_${base}(x−1) ${mode === "equation" ? "=" : operator} log_${base}(3)의 해: ${describeSolutionSet(solution)}`}</strong>
        <p>두 로그의 밑이 같으면 진수를 비교할 수 있지만, x−1&gt;0과 3&gt;0을 먼저 확인하고 후보 해를 원래 식의 정의역에서 검산해요.</p>
      </div>
      <div className="lab-controls">
        <label className="lab-control"><span>문제 종류</span>
          <select aria-label="로그 비교 문제 종류" value={mode} onChange={(event) => setMode(event.target.value as "equation" | "inequality")}>
            <option value="equation">방정식</option>
            <option value="inequality">부등식</option>
          </select>
        </label>
        <label className="lab-control"><span>로그의 밑 a</span>
          <select aria-label="로그의 밑 a" value={base} onChange={(event) => setBase(Number(event.target.value))}>
            <option value={2}>2 (증가)</option>
            <option value={0.5}>1/2 (감소)</option>
          </select>
        </label>
        {mode === "inequality" && <label className="lab-control"><span>비교 부등호</span>
          <select aria-label="로그 비교 부등호" value={operator} onChange={(event) => setOperator(event.target.value as Comparison)}>
            <option value={"<"}>&lt;</option>
            <option value={"<="}>≤</option>
            <option value={">"}>&gt;</option>
            <option value={">="}>≥</option>
          </select>
        </label>}
      </div>
      <p className="helper">a&gt;1이면 방향을 유지하고 0&lt;a&lt;1이면 뒤집어요. 방정식 후보가 진수를 0 이하로 만들면 제외합니다.</p>
    </div>
  );
}

function ExponentialApplicationsLab() {
  const [mode, setMode] = useState<DiscreteModelMode>("growth");
  const [initial, setInitial] = useState(100);
  const [percent, setPercent] = useState(10);
  const [steps, setSteps] = useState(3);
  const [scaleDifference, setScaleDifference] = useState(2);
  const model = discreteExponentialModel(initial, percent, steps, mode);
  const ratio = logarithmicScaleRatio(scaleDifference, 10);
  const scaleLevel = logarithmicScaleLevel(ratio ?? 0, 1, 10);
  return (
    <div className="lab math-lab">
      <div className="lab-result" aria-live="polite">
        <span>N(n)=N₀qⁿ, 시간 n은 같은 길이의 단계 수</span>
        <strong>{model ? `N₀=${model.initialAmount}, q=${Number(model.factor.toFixed(3))}, n=${model.steps} → N(n)≈${Number(model.amount.toFixed(3))} (계산 근삿값)` : "양의 초기량, 0~100% 미만 변화율, 0~120 정수 단계를 확인해요."}</strong>
        <p>로그 척도에서 ΔL={scaleDifference} (밑 10)이면 원래 양의 비는 약 10^{scaleDifference}=${ratio?.toLocaleString("en-US")}예요. 역산한 척도 차는 ${scaleLevel === null ? "계산할 수 없음" : `약 ${Number(scaleLevel.toFixed(4))}`}입니다.</p>
      </div>
      <div className="lab-controls">
        <label className="lab-control"><span>변화 모형</span>
          <select aria-label="변화 모형" value={mode} onChange={(event) => setMode(event.target.value as DiscreteModelMode)}>
            <option value="growth">단계별 증가</option>
            <option value="decay">단계별 감소</option>
          </select>
        </label>
        <Slider label="초기량 N₀" value={initial} min={10} max={500} step={10} set={setInitial} />
        <Slider label="단계별 변화율 (%)" value={percent} min={1} max={50} set={setPercent} />
        <Slider label="단계 수 n" value={steps} min={0} max={12} set={setSteps} />
        <Slider label="로그 눈금 차 ΔL" value={scaleDifference} min={0} max={4} set={setScaleDifference} />
      </div>
      <p className="helper">모델의 시간은 반복 횟수로 셉니다. 증가율은 q=1+r, 감소율은 남은 비율 q=1−r로 바꾸며, 표기된 소수는 계산 근삿값이에요.</p>
    </div>
  );
}

function AngleRadianLab() {
  const [rawAngle, setRawAngle] = useState("−90");
  const [radius, setRadius] = useState(2);
  const angle = rawAngle.trim() === "" ? Number.NaN : Number(rawAngle.replace("−", "-"));
  const coterminal = coterminalAngleDegrees(angle);
  const radians = degreesToRadians(angle);
  const principalRadians = coterminal === null ? null : degreesToRadians(coterminal);
  const exactRadians = exactRadianMultipleOfPi(angle);
  const arc = principalRadians === null ? null : arcLengthFromRadians(radius, principalRadians);
  const area = principalRadians === null ? null : sectorAreaFromRadians(radius, principalRadians);
  const roundTrip = radians === null ? null : radiansToDegrees(radians);
  const direction = angle < 0 ? "시계 방향" : angle > 0 ? "반시계 방향" : "회전 없음";
  return (
    <div className="lab math-lab">
      <div className="lab-result" aria-live="polite">
        <span>일반각은 방향과 회전 횟수를 유지해요.</span>
        <strong>{coterminal === null ? "각은 유한하고 ±36,000° 안에서 확인해요." : `${angle}° (${direction}) ≡ ${coterminal}° (한 바퀴 대표각), ${exactRadians ?? `약 ${Number(radians?.toFixed(4))} rad`}`}</strong>
        <p>{arc === null || area === null ? "반지름과 각을 확인해요." : `r=${radius}일 때 대표각의 호 길이 s≈${Number(arc.toFixed(4))}, 넓이 A≈${Number(area.toFixed(4))} (호 길이·넓이는 음수가 아닌 크기)`}</p>
        <p>{roundTrip === null ? "도·라디안 변환 범위를 벗어났어요." : `라디안 변환 후 역변환 확인: 약 ${Number(roundTrip.toFixed(4))}°`}</p>
      </div>
      <div className="lab-controls">
        <label className="lab-control"><span>일반각 θ (도)</span><input aria-label="일반각 도 단위 입력" type="number" min={-36000} max={36000} step="1" value={rawAngle} onChange={(event) => setRawAngle(event.target.value)} /></label>
        <Slider label="반지름 r" value={radius} min={1} max={8} set={setRadius} />
      </div>
      <p className="helper">π rad=180°이고 s=rθ, A=½r²θ의 θ에는 라디안을 넣어요. 회전각은 부호를 가질 수 있지만 기하적 길이·넓이는 대표각으로 구한 비음수 크기입니다.</p>
    </div>
  );
}

const specialAngles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];

function UnitCircleLab() {
  const [degrees, setDegrees] = useState(30);
  const point = unitCircleCoordinates(degrees);
  return (
    <div className="lab math-lab">
      <div className="lab-result" aria-live="polite">
        <span>단위원 끝점 P=(cosθ, sinθ)</span>
        <strong>{point ? `θ=${point.normalizedDegrees}° · ${point.quadrant === "axis" ? "축 위" : `${point.quadrant}사분면`} · P=(${point.cosine.exact}, ${point.sine.exact})` : "기본 특수각에서 좌표를 확인해요."}</strong>
        <p>{point ? `cosθ=${point.cosine.exact}, sinθ=${point.sine.exact}, tanθ=${point.tangent === null ? "정의되지 않음 (cosθ=0)" : Number(point.tangent.toFixed(4))}` : "각을 선택해 주세요."}</p>
      </div>
      <label className="lab-control"><span>회전각 θ</span>
        <select aria-label="단위원의 회전각" value={degrees} onChange={(event) => setDegrees(Number(event.target.value))}>
          {specialAngles.map((angle) => <option key={angle} value={angle}>{angle}°</option>)}
        </select>
      </label>
      <p className="helper">끝점 좌표는 (x,y)=(cosθ,sinθ) 순서예요. 축 위에서는 해당 좌표가 0이며, cosθ=0이면 tanθ를 정의하지 않습니다.</p>
    </div>
  );
}

function TrigRelationsLab() {
  const [cosineMagnitude, setCosineMagnitude] = useState(0.6);
  const [quadrant, setQuadrant] = useState<Quadrant>("I");
  const [axisAngle, setAxisAngle] = useState(false);
  const cosineSign = quadrant === "II" || quadrant === "III" ? -1 : 1;
  const cosine = axisAngle ? 0 : cosineSign * cosineMagnitude;
  const sine = axisAngle ? null : deriveSineFromCosine(cosine, quadrant);
  const identityValue = axisAngle ? 1 : sine === null ? null : pythagoreanIdentityValue(sine, cosine);
  const tangent = axisAngle ? null : sine === null ? null : tangentFromSineCosine(sine, cosine);
  return (
    <div className="lab math-lab">
      <div className="lab-result" aria-live="polite">
        <span>단위원에서 sin²θ+cos²θ=1</span>
        <strong>{axisAngle ? "축 위: cosθ=0이므로 단위원 관계에서 sin²θ=1, sinθ=±1" : sine === null ? "cos 값과 사분면 부호 조건이 맞지 않아요." : `cosθ=${Number(cosine.toFixed(4))}, sinθ≈${Number(sine.toFixed(4))} → sin²θ+cos²θ=${Number((identityValue ?? 0).toFixed(4))}`}</strong>
        <p>{axisAngle ? "tanθ는 cosθ=0이어서 정의되지 않아요." : sine === null ? "사분면에 맞는 cos 부호를 고르거나 축 위의 경우를 선택하세요." : `tanθ=${tangent === null ? "정의되지 않음 (cosθ=0)" : `약 ${Number(tangent.toFixed(4))}`}; 탄젠트의 분모가 0이 아닌지 확인해요.`}</p>
      </div>
      <div className="lab-controls">
        <label className="lab-control"><span>cosθ의 크기</span>
          <select aria-label="코사인 값의 크기" value={axisAngle ? "axis" : cosineMagnitude} onChange={(event) => {
            if (event.target.value === "axis") setAxisAngle(true);
            else { setAxisAngle(false); setCosineMagnitude(Number(event.target.value)); }
          }}>
            <option value={0.6}>3/5</option>
            <option value={5 / 13}>5/13</option>
            <option value={0.5}>1/2</option>
            <option value="axis">축 위: cosθ=0</option>
          </select>
        </label>
        <label className="lab-control"><span>위치</span>
          <select aria-label="사분면 선택" value={quadrant} onChange={(event) => setQuadrant(event.target.value as Quadrant)}>
            <option value="I">제1사분면</option><option value="II">제2사분면</option>
            <option value="III">제3사분면</option><option value="IV">제4사분면</option>
          </select>
        </label>
      </div>
      <p className="helper">제곱 관계는 sinθ의 부호를 알려주지 않아요. 사분면으로 부호를 정하며, cosθ=0이면 tanθ=sinθ/cosθ는 정의되지 않습니다.</p>
    </div>
  );
}

export function M5TrigonometryPreviewLab({ unitId }: { unitId: string }) {
  switch (unitId) {
    case "M5-11": return <AngleRadianLab />;
    case "M5-12": return <UnitCircleLab />;
    case "M5-13": return <TrigRelationsLab />;
    default: return null;
  }
}

export function M5AlgebraPreviewLab({ unitId }: { unitId: string }) {
  switch (unitId) {
    case "M5-09": return <LogEquationLab />;
    case "M5-10": return <ExponentialApplicationsLab />;
    default: return null;
  }
}
