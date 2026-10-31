import { describe, it, expect } from "vitest";
import { gradeAnswer } from "@/modules/math-validation";
describe("safe grading", () => {
  it("grades choice and signed integers", () => {
    expect(gradeAnswer({ kind: "choice", expected: "c" }, "c").status).toBe(
      "correct",
    );
    expect(
      gradeAnswer({ kind: "integer", expected: "500" }, " +0500 ").status,
    ).toBe("correct");
    expect(gradeAnswer({ kind: "integer", expected: "500" }, "50").status).toBe(
      "incorrect",
    );
  });
  it("compares exact decimals without floating point tolerance", () => {
    expect(
      gradeAnswer({ kind: "decimal", expected: "0.3" }, "0.30").status,
    ).toBe("correct");
    expect(
      gradeAnswer({ kind: "decimal", expected: "0.3" }, "0.300000000001")
        .status,
    ).toBe("incorrect");
    expect(
      gradeAnswer({ kind: "decimal", expected: "-1.25" }, "-1.250").status,
    ).toBe("correct");
  });
  it("accepts equivalent fractions, including negative denominator", () => {
    expect(
      gradeAnswer({ kind: "fraction", expected: "1/2" }, "2/4").status,
    ).toBe("correct");
    expect(
      gradeAnswer({ kind: "fraction", expected: "-1/2" }, "1/-2").status,
    ).toBe("correct");
  });
  it.each([
    "1/0",
    "1/-0",
    "1//2",
    "1+1",
    "process.exit()",
    "<script>",
    "2e5",
    "9".repeat(65),
  ])("rejects unsafe fraction %s", (answer) =>
    expect(
      gradeAnswer({ kind: "fraction", expected: "1/2" }, answer).status,
    ).toBe("invalid"),
  );
  it.each([
    "",
    "500.0",
    "5e2",
    "500,000",
    "9999999999999",
    "1+499",
    "NaN",
    "Infinity",
  ])("rejects invalid integer %s", (answer) =>
    expect(
      gradeAnswer({ kind: "integer", expected: "500" }, answer).status,
    ).toBe("invalid"),
  );
  it("returns unsupported for expressions rather than guessing", () =>
    expect(
      gradeAnswer({ kind: "expression", expected: "x+x" }, "2*x").status,
    ).toBe("unsupported"));
});
