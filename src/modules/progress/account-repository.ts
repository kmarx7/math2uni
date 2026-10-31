import type { ProgressState } from "@/contracts";
export type ProgressSnapshot = { progress: ProgressState; revision: number };
export interface AccountProgressRepository {
  load(userId: string): Promise<ProgressSnapshot>;
  compareAndSwap(
    userId: string,
    expectedRevision: number,
    next: ProgressState,
  ): Promise<boolean>;
}
export async function transactProgress(
  repository: AccountProgressRepository,
  userId: string,
  mutate: (state: ProgressState) => ProgressState,
): Promise<ProgressSnapshot> {
  for (let tries = 0; tries < 5; tries++) {
    const current = await repository.load(userId);
    const next = mutate(current.progress);
    if (next === current.progress) return current;
    if (next.profileId !== userId)
      throw new Error("학습 기록의 계정이 일치하지 않습니다.");
    if (await repository.compareAndSwap(userId, current.revision, next))
      return { progress: next, revision: current.revision + 1 };
  }
  throw new Error(
    "다른 학습 창에서 기록이 변경됐어요. 잠시 후 다시 시도해 주세요.",
  );
}
