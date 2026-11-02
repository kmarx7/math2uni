import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Block } from "@/contracts";
import { MathLab } from "@/components/math-lab";

type Interaction = Extract<Block, { type: "InteractiveBlock" }>;
function renderLab(interaction: Interaction["interaction"], initialA: number, initialB: number, initialC = 0) {
  const block: Interaction = {
    id: "m3-lab-test",
    type: "InteractiveBlock",
    title: "테스트 실험실",
    interaction,
    settings: { initialA, initialB, initialC },
  };
  return renderToStaticMarkup(createElement(MathLab, { block }));
}
function expectAccessibleSliders(html: string, labels: string[]) {
  expect(html.match(/type="range"/g)).toHaveLength(labels.length);
  expect(html).toContain('aria-live="polite"');
  for (const label of labels) expect(html).toContain(label);
}

describe("M3 MathLab algebra displays", () => {
  it("formats sparse signed polynomial terms and leaves zero-polynomial degree outside this activity", () => {
    const signed = renderLab("polynomial-terms", -1, 0, -3);
    expect(signed).toContain("−x² − 3");
    expect(signed).not.toMatch(/\+\s*−|−\s*−/);
    expectAccessibleSliders(signed, ["x²의 계수", "x의 계수", "상수항"]);
    const zero = renderLab("polynomial-terms", 0, 0, 0);
    expect(zero).toContain("<strong>0</strong>");
    expect(zero).toContain("영다항식은 이 활동의 차수 판별 범위 밖이에요.");
    expect(zero).not.toContain("차수는 정의되지 않아요");
  });

  it("shows multiplication expansion with signed, zero, and unit coefficients", () => {
    const html = renderLab("polynomial-multiplication", 0, -1, 0);
    expect(html).toContain("(x)(x² − x) = x³ − x²");
    expect(html).not.toMatch(/\+\s*−|−\s*−|1x/);
    expect(html).toContain("분배법칙의 여섯 곱");
    expectAccessibleSliders(html, ["첫째 괄호의 상수항", "둘째 괄호의 x 계수", "둘째 괄호의 상수항"]);
  });

  it("renders division quotient, remainder, and reconstructed dividend for negative inputs", () => {
    const html = renderLab("polynomial-division", -2, 0, -2);
    expect(html).toContain("Q=x − 2, R=−x");
    expect(html).toContain("(x²+1)(x − 2) + (−x) = x³ − 2x² − 2");
    expect(html).not.toMatch(/\+\s*−|−\s*−/);
    expectAccessibleSliders(html, ["x²의 계수", "x의 계수", "상수항"]);
  });

  it("compares equal-degree coefficients and preserves the product identity", () => {
    const html = renderLab("identity-coefficients", -2, 2);
    expect(html).toContain("(x − 2)(x + 2) = x² − 4");
    expect(html).toContain("차수별 계수 비교");
    expectAccessibleSliders(html, ["첫째 상수항", "둘째 상수항"]);
  });

  it("shows x−a as x+|a| for negative a and verifies P(a)", () => {
    const html = renderLab("remainder-theorem", -2, -1, 0);
    expect(html).toContain("다항식 P(x)=x² − x를 x + 2로 나눌 때");
    expect(html).toContain("P(-2) = 6");
    expect(html).toContain("P(-2)=(-2)²+(-1)×(-2)+(0)=6");
    expectAccessibleSliders(html, ["나누는 식 x−a의 a", "x의 계수", "상수항"]);
  });
});
