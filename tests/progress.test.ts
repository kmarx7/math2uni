import { describe, it, expect } from "vitest";
import type { Attempt } from "@/contracts";
import {
  mastery,
  dueReviews,
  reviewSchedule,
  isComplete,
  wrongAnswers,
} from "@/modules/progress";
import {
  emptyProgress,
  LocalProgressRepository,
} from "@/modules/progress/repository";
import { curriculum } from "@/data/curriculum";
const profile = "124d3c71-9359-4cf2-b111-9ba5502df231";
const other = "224d3c71-9359-4cf2-b111-9ba5502df231";
function attempt(changes: Partial<Attempt> = {}): Attempt {
  return {
    id: "a1",
    problemId: "p1",
    version: "1",
    skillId: "place",
    purpose: "practice",
    answer: "500",
    correct: true,
    hintUsed: false,
    retry: false,
    at: "2026-10-30T00:00:00.000Z",
    feedback: {
      answerDisplay: "500",
      explanation: "5 × 100 = 500",
      steps: ["500"],
    },
    ...changes,
  };
}
describe("mastery and review", () => {
  it("requires two independent correct examples, discounts hints/retries and deduplicates", () => {
    const a = attempt();
    expect(mastery([], "place")).toBe(0);
    expect(mastery([a], "place")).toBe(50);
    expect(mastery([a, a, a], "place")).toBe(50);
    expect(mastery([a, attempt({ problemId: "p2" })], "place")).toBe(100);
    expect(mastery([attempt({ hintUsed: true })], "place")).toBe(25);
    expect(mastery([attempt({ retry: true })], "place")).toBe(25);
    expect(
      mastery(
        [a, attempt({ correct: false, at: "2026-10-31T00:00:00.000Z" })],
        "place",
      ),
    ).toBe(0);
  });
  it("schedules 1/3/7-day reviews and resets failures", () => {
    const a = attempt();
    expect(dueReviews([a], Date.parse(a.at) + 86_400_000 - 1)).toHaveLength(0);
    expect(dueReviews([a], Date.parse(a.at) + 86_400_000)).toHaveLength(1);
    const b = attempt({
      id: "a2",
      purpose: "review",
      at: "2026-10-31T00:00:00.000Z",
    });
    expect(reviewSchedule([a, b])[0].dueAt).toBe("2026-11-03T00:00:00.000Z");
    const c = attempt({
      id: "a3",
      purpose: "review",
      at: "2026-11-03T00:00:00.000Z",
    });
    expect(reviewSchedule([a, b, c])[0].dueAt).toBe("2026-11-10T00:00:00.000Z");
    expect(reviewSchedule([a, b, { ...c, correct: false }])[0].dueAt).toBe(
      "2026-11-04T00:00:00.000Z",
    );
  });
  it("clears wrong answers after correction", () => {
    const a = attempt({ correct: false });
    expect(wrongAnswers([a])).toHaveLength(1);
    expect(
      wrongAnswers([a, attempt({ at: "2026-10-31T00:00:00.000Z" })]),
    ).toHaveLength(0);
  });
  it("does not complete from score alone", () => {
    const state = { ...emptyProgress(profile), assessmentScore: 100 };
    expect(isComplete(state, curriculum.units[0], ["goals"])).toBe(false);
    state.completedBlocks = ["goals"];
    state.attempts = curriculum.units[0].concepts.flatMap((c) => [
      attempt({ skillId: c.id, problemId: `${c.id}1` }),
      attempt({ skillId: c.id, problemId: `${c.id}2` }),
    ]);
    expect(isComplete(state, curriculum.units[0], ["goals"])).toBe(true);
  });
  it("persists separate profiles and rejects corruption", () => {
    const data = new Map<string, string>();
    const repo = new LocalProgressRepository({
      getItem: (k) => data.get(k) ?? null,
      setItem: (k, v) => {
        data.set(k, v);
      },
    });
    repo.save(profile, { ...emptyProgress(profile), attempts: [attempt()] });
    expect(repo.load(profile).attempts).toHaveLength(1);
    expect(repo.load(other).attempts).toHaveLength(0);
    expect(() => repo.save(other, emptyProgress(profile))).toThrow();
    data.set(`math90:v1:${profile}`, "broken");
    expect(() => repo.load(profile)).toThrow();
  });
});
