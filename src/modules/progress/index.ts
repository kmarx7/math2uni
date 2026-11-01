import type { Attempt, ProgressState, Unit } from "@/contracts";
export function mastery(attempts: Attempt[], skillId: string): number {
  // Extended exploration is recorded and reviewed separately from core mastery.
  const latest = new Map<string, Attempt>();
  for (const a of attempts.filter(
    (a) => a.skillId === skillId && a.collection !== "extended",
  )) {
    const key = `${a.problemId}@${a.version}`;
    const previous = latest.get(key);
    if (!previous || a.at >= previous.at) latest.set(key, a);
  }
  if (!latest.size) return 0;
  const total = [...latest.values()].reduce(
    (n, a) => n + (a.correct ? (a.hintUsed || a.retry ? 0.5 : 1) : 0),
    0,
  );
  // Two independent correct problems are needed for full mastery.
  return Math.round((100 * total) / Math.max(2, latest.size));
}
const DAY = 86_400_000;
export function reviewSchedule(attempts: Attempt[]) {
  const groups = new Map<string, Attempt[]>();
  for (const a of attempts) {
    const key = `${a.problemId}@${a.version}`;
    groups.set(key, [...(groups.get(key) ?? []), a]);
  }
  return [...groups.values()].map((list) => {
    list.sort((a, b) => a.at.localeCompare(b.at));
    const last = list.at(-1)!;
    let streak = 0;
    for (const a of list)
      if (a.purpose === "review") {
        streak = a.correct && !a.hintUsed ? streak + 1 : 0;
      }
    const days = last.correct ? [1, 3, 7][Math.min(streak, 2)] : 1;
    return {
      problemId: last.problemId,
      dueAt: new Date(Date.parse(last.at) + days * DAY).toISOString(),
      last,
    };
  });
}
export function dueReviews(attempts: Attempt[], now = Date.now()) {
  return reviewSchedule(attempts).filter((r) => Date.parse(r.dueAt) <= now);
}
export function wrongAnswers(attempts: Attempt[]) {
  return reviewSchedule(attempts)
    .filter((r) => !r.last.correct)
    .map((r) => r.last);
}
export function unitProgress(state: ProgressState, unitId: string) {
  return (
    state.unitProgress?.[unitId] ??
    (unitId === "M0-01"
      ? {
          completedBlocks: state.completedBlocks,
          assessmentScore: state.assessmentScore,
        }
      : { completedBlocks: [], assessmentScore: null })
  );
}
export function attemptUnitId(attempt: Attempt) {
  return attempt.unitId ?? "M0-01";
}
export function isComplete(
  state: ProgressState,
  unit: Unit,
  blockIds: string[],
) {
  return (
    blockIds.every((id) =>
      unitProgress(state, unit.id).completedBlocks.includes(id),
    ) &&
    unit.concepts.every((c) => mastery(state.attempts, c.id) >= 80) &&
    (unitProgress(state, unit.id).assessmentScore ?? 0) >= 80
  );
}
export function recommendPractice(attempts: Attempt[], skills: string[]) {
  const lowest = [...skills].sort(
    (a, b) => mastery(attempts, a) - mastery(attempts, b),
  )[0];
  const score = mastery(attempts, lowest);
  return {
    skillId: lowest,
    reasoning: score < 40 ? "basic" : score < 80 ? "variation" : "application",
  };
}
