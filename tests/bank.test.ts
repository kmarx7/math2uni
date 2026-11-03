import { describe, it, expect } from "vitest";
import { families, fixedProblems, generatePlace } from "@/data/problems";
import { curriculum } from "@/data/curriculum";
import { toPublic, validateBank } from "@/modules/question-bank/core";
import { canPublish } from "@/modules/administration";
import { gradeAnswer } from "@/modules/math-validation";
import { scoreAssessment } from "@/modules/assessment";
describe("reviewed question bank", () => {
  it("validates bank, answer/explanation agreement and distinct families", () => {
    expect(validateBank(fixedProblems, curriculum.units, families)).toEqual([]);
    expect(families).toHaveLength(3);
    expect(
      new Set(
        fixedProblems
          .filter((p) => p.purpose === "practice")
          .map((p) => p.familyId),
      ).size,
    ).toBe(3);
  });
  it("detects duplicate IDs and normalized prompts", () => {
    expect(
      validateBank(
        [...fixedProblems, fixedProblems[0]],
        curriculum.units,
        families,
      ).join(),
    ).toMatch(/중복/);
  });
  it("checks every finite template combination with independent digit decomposition", () => {
    for (let n = 1000; n <= 9999; n++)
      for (const [i, place] of [1000, 100, 10, 1].entries()) {
        const digit = Number(String(n)[i]);
        if (!digit) {
          expect(() => generatePlace(n, place)).toThrow();
          continue;
        }
        const p = generatePlace(n, place);
        expect(Number(p.answerDisplay)).toBe(digit * place);
        expect(gradeAnswer(p.answerRule, String(digit * place)).status).toBe(
          "correct",
        );
        expect(p.steps.join()).toContain(p.answerDisplay);
        expect(canPublish(p)).toBe(false);
      }
  }, 15_000);
  it.each([
    [999, 10],
    [10000, 100],
    [1234, 3],
    [1234.5, 10],
    [NaN, 100],
  ])("rejects template parameter %s/%s", (n, place) =>
    expect(() => generatePlace(n, place)).toThrow(),
  );
  it("blocks draft, stale approval, unknown rights and unapproved AI output", () => {
    const p = fixedProblems[0];
    expect(canPublish({ ...p, status: "draft" })).toBe(false);
    expect(canPublish({ ...p, version: "2.0.0" })).toBe(false);
    expect(
      canPublish({ ...p, provenance: { ...p.provenance, license: "unknown" } }),
    ).toBe(false);
    expect(
      canPublish({
        ...p,
        reviewHistory: [],
        provenance: { ...p.provenance, aiGenerated: true },
      }),
    ).toBe(false);
  });
  it("only publishes an explicitly human-approved version", () => {
    const p = fixedProblems[0];
    expect(
      canPublish({
        ...p,
        status: "approved",
        reviewHistory: [
          {
            version: p.version,
            reviewer: "Test human reviewer",
            at: "2026-10-31T00:00:00.000Z",
            decision: "approved",
            actorType: "human",
            mathChecked: true,
          },
        ],
      }),
    ).toBe(true);
  });
  it("exposes only public fields, never answers/explanations", () => {
    for (const p of fixedProblems) {
      const dto = toPublic(p);
      expect(dto).not.toHaveProperty("answerRule");
      expect(dto).not.toHaveProperty("explanation");
      expect(dto).not.toHaveProperty("steps");
      expect(dto).not.toHaveProperty("answerDisplay");
    }
  });
  it("requires full assessment submission before scoring", () => {
    const ps = fixedProblems.filter((p) => p.purpose === "assessment");
    expect(() => scoreAssessment(ps, {})).toThrow();
    const answers = Object.fromEntries(
      ps.map((p) => [p.id, p.answerRule.expected]),
    );
    expect(scoreAssessment(ps, answers).score).toBe(100);
    expect(() => scoreAssessment(ps, { ...answers, extra: "1" })).toThrow();
  });
});
