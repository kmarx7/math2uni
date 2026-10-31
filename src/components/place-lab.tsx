"use client";
import { useState } from "react";
export function PlaceLab() {
  const [digits, setDigits] = useState([3, 0, 4, 2]);
  const places = [1000, 100, 10, 1];
  const value = digits.reduce((sum, d, i) => sum + d * places[i], 0);
  return (
    <div className="lab">
      <div className="lab-result" aria-live="polite">
        <span>지금 만든 수</span>
        <strong>{value.toLocaleString("ko-KR")}</strong>
        <p>
          {digits
            .map((d, i) => `${d} × ${places[i].toLocaleString("ko-KR")}`)
            .join(" + ")}
        </p>
        {value === 0 && (
          <p>
            0은 자리를 채우는 숫자예요. 이 단원에서 자연수는 1부터 시작합니다.
          </p>
        )}
      </div>
      <div className="digit-controls">
        {digits.map((d, i) => (
          <div className="digit-control" key={i}>
            <label htmlFor={`digit-${i}`}>
              {["천", "백", "십", "일"][i]}의 자리
            </label>
            <strong>{d}</strong>
            <input
              id={`digit-${i}`}
              type="range"
              min="0"
              max="9"
              value={d}
              onChange={(e) =>
                setDigits((old) =>
                  old.map((v, j) => (j === i ? Number(e.target.value) : v)),
                )
              }
            />
            <span>자릿값 {(d * places[i]).toLocaleString("ko-KR")}</span>
            <div className="dot-grid" aria-hidden="true">
              {Array.from({ length: d }, (_, j) => (
                <i key={j} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="helper">
        슬라이더를 움직여 보세요. 키보드의 방향키로도 조절할 수 있어요.
      </p>
    </div>
  );
}
