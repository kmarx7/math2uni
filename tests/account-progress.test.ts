import { describe, it, expect } from "vitest";
import type { Feedback, ProgressState } from "@/contracts";
import { emptyProgress } from "@/modules/progress/repository";
import {
  applySubmission,
  completeLearningBlock,
} from "@/modules/progress/mutations";
import {
  transactProgress,
  type AccountProgressRepository,
  type ProgressSnapshot,
} from "@/modules/progress/account-repository";
const user = "124d3c71-9359-4cf2-b111-9ba5502df231",
  other = "224d3c71-9359-4cf2-b111-9ba5502df231";
const feedback: Feedback = {
  problemId: "p-place-1",
  version: "1",
  skillId: "place",
  purpose: "practice",
  status: "correct",
  message: "정답",
  answerDisplay: "500",
  explanation: "5 × 100 = 500",
  steps: ["500"],
};
const submission = (changes = {}) => ({
  requestId: "a-request",
  feedback: [feedback],
  answers: { "p-place-1": "c" },
  purpose: "practice" as const,
  hintUsed: false,
  at: "2026-10-31T08:00:00.000Z",
  ...changes,
});
class MemoryRepository implements AccountProgressRepository {
  states = new Map<string, ProgressSnapshot>();
  async load(id: string) {
    return structuredClone(
      this.states.get(id) ?? { progress: emptyProgress(id), revision: 0 },
    );
  }
  async compareAndSwap(id: string, revision: number, next: ProgressState) {
    if ((this.states.get(id)?.revision ?? 0) !== revision) return false;
    this.states.set(id, { progress: next, revision: revision + 1 });
    return true;
  }
}
describe("account learning transactions", () => {
  it("persists under each account and never updates a different account", async () => {
    const repository = new MemoryRepository();
    await transactProgress(repository, user, (s) =>
      applySubmission(s, submission()),
    );
    expect((await repository.load(user)).progress.attempts).toHaveLength(1);
    expect((await repository.load(other)).progress.attempts).toHaveLength(0);
    await expect(
      transactProgress(repository, user, () => emptyProgress(other)),
    ).rejects.toThrow("계정");
  });
  it("merges simultaneous updates with compare-and-swap retries", async () => {
    const repository = new MemoryRepository();
    await Promise.all([
      transactProgress(repository, user, (s) =>
        applySubmission(s, submission()),
      ),
      transactProgress(repository, user, (s) =>
        completeLearningBlock(s, "goals"),
      ),
    ]);
    const { progress, revision } = await repository.load(user);
    expect(revision).toBe(2);
    expect(progress.attempts).toHaveLength(1);
    expect(progress.completedBlocks).toEqual(["goals"]);
  });
  it("stores repeat requests once and rejects altered answer for the same request", () => {
    const initial = emptyProgress(user);
    const once = applySubmission(initial, submission());
    expect(applySubmission(once, submission())).toBe(once);
    expect(() =>
      applySubmission(once, submission({ answers: { "p-place-1": "a" } })),
    ).toThrow("제출 ID");
  });
  it("computes retry from server history and accepts delayed independent review", () => {
    const initial = applySubmission(emptyProgress(user), submission());
    const retry = applySubmission(initial, submission({ requestId: "retry" }));
    expect(retry.attempts.at(-1)?.retry).toBe(true);
    const review = applySubmission(
      retry,
      submission({
        requestId: "review",
        purpose: "review",
        at: "2026-11-01T09:00:00.000Z",
      }),
    );
    expect(review.attempts.at(-1)?.retry).toBe(false);
  });
  it("stores an assessment atomically with score and never records invalid grades", () => {
    const result = applySubmission(
      emptyProgress(user),
      submission({ purpose: "assessment", score: 100 }),
    );
    expect(result.assessmentScore).toBe(100);
    expect(() =>
      applySubmission(
        emptyProgress(user),
        submission({ feedback: [{ ...feedback, status: "invalid" }] }),
      ),
    ).toThrow();
  });
  it("does not grow revisions when a block was already complete", async () => {
    const repository = new MemoryRepository();
    const once = await transactProgress(repository, user, (s) =>
      completeLearningBlock(s, "goals"),
    );
    const twice = await transactProgress(repository, user, (s) =>
      completeLearningBlock(s, "goals"),
    );
    expect(twice.revision).toBe(once.revision);
  });
  it("fails explicitly when writes keep conflicting", async () => {
    const repository = new MemoryRepository();
    repository.compareAndSwap = async () => false;
    await expect(
      transactProgress(repository, user, (s) =>
        completeLearningBlock(s, "goals"),
      ),
    ).rejects.toThrow("다른 학습 창");
  });
});
