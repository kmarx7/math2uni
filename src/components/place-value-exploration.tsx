"use client";
import { useState } from "react";

export function PlaceValueExploration() {
  const [hundreds, setHundreds] = useState(3),
    [tens, setTens] = useState(12),
    [example, setExample] = useState("3042"),
    [digit, setDigit] = useState(4);
  const value = hundreds * 100 + tens * 10;
  const removed = Number(example.replace("0", ""));
  return (
    <div className="instruction-sections place-exploration">
      <article>
        <h3>같은 양을 다른 묶음으로 · 10십은 1백</h3>
        <label className="lab-control">
          <span>
            백 묶음 수 <strong>{hundreds}</strong>
          </span>
          <input
            type="range"
            min={0}
            max={9}
            value={hundreds}
            onChange={(event) => setHundreds(Number(event.target.value))}
          />
        </label>
        <label className="lab-control">
          <span>
            십 묶음 수 <strong>{tens}</strong>
          </span>
          <input
            type="range"
            min={0}
            max={25}
            value={tens}
            onChange={(event) => setTens(Number(event.target.value))}
          />
        </label>
        <p role="status">
          {hundreds}백과 {tens}십 = {hundreds + Math.floor(tens / 10)}백과{" "}
          {tens % 10}십 = {value}
        </p>
        <p className="helper">
          십 묶음 열 개를 백 묶음 하나로 바꾸어도 전체 양은 같아요. 백 묶음도 열
          개가 되면 천 묶음 하나가 됩니다.
        </p>
      </article>
      <article>
        <h3>0을 지우면 어떤 자리의 뜻이 바뀔까요?</h3>
        <label className="family-selector">
          비교할 수
          <select
            value={example}
            onChange={(event) => setExample(event.target.value)}
          >
            <option value="3042">3,042</option>
            <option value="4070">4,070</option>
            <option value="6008">6,008</option>
          </select>
        </label>
        <p aria-live="polite">
          0 하나를 지워 쓰면 {Number(example).toLocaleString("ko-KR")} →{" "}
          {removed.toLocaleString("ko-KR")}
        </p>
        <p>
          지운 0보다 왼쪽 숫자는 한 자리 오른쪽으로 옮겨져 나타내는 값이
          달라져요. 지운 0보다 오른쪽 숫자는 자리 단위를 유지해요.
        </p>
        <p className="helper">
          6,008에는 0이 두 개 있어요. 여기서는 왼쪽 0 하나만 지운 608과
          비교합니다.
        </p>
      </article>
      <article>
        <h3>한 자리만 바꾸어 변화량 찾기</h3>
        <label className="lab-control">
          <span>
            3,042의 백의 자리 바꾸기 <strong>{digit}</strong>
          </span>
          <input
            type="range"
            min={0}
            max={9}
            value={digit}
            onChange={(event) => setDigit(Number(event.target.value))}
          />
        </label>
        <p aria-live="polite">
          3,042 → {(3042 + digit * 100).toLocaleString("ko-KR")} · 늘어난 값{" "}
          {digit} × 100 = {digit * 100}
        </p>
        <p className="helper">
          다른 자리는 그대로이고 백 묶음이 {digit}개 늘었어요. 숫자의 변화와
          전체 수의 변화량을 구분해 보세요.
        </p>
      </article>
    </div>
  );
}
