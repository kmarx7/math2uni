import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { progressSchema, type ProgressState } from "@/contracts";
import { emptyProgress } from "./repository";
import type { AccountProgressRepository } from "./account-repository";
export class SupabaseProgressRepository implements AccountProgressRepository {
  constructor(private client: SupabaseClient) {}
  async load(userId: string) {
    const { data, error } = await this.client
      .from("learning_progress")
      .select("state,revision")
      .eq("user_id", userId)
      .maybeSingle();
    if (error)
      throw new Error(
        "학습 기록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
      );
    if (!data) return { progress: emptyProgress(userId), revision: 0 };
    const progress = progressSchema.parse(data.state);
    if (progress.profileId !== userId)
      throw new Error("학습 기록의 계정이 일치하지 않습니다.");
    return { progress, revision: data.revision as number };
  }
  async compareAndSwap(
    userId: string,
    expectedRevision: number,
    next: ProgressState,
  ) {
    const state = progressSchema.parse(next);
    if (state.profileId !== userId)
      throw new Error("학습 기록의 계정이 일치하지 않습니다.");
    const row = {
      user_id: userId,
      state,
      revision: expectedRevision + 1,
      updated_at: new Date().toISOString(),
    };
    const result =
      expectedRevision === 0
        ? await this.client
            .from("learning_progress")
            .insert(row)
            .select("revision")
            .maybeSingle()
        : await this.client
            .from("learning_progress")
            .update(row)
            .eq("user_id", userId)
            .eq("revision", expectedRevision)
            .select("revision")
            .maybeSingle();
    if (result.error?.code === "23505") return false;
    if (result.error)
      throw new Error("학습 기록을 저장하지 못했어요. 다시 시도해 주세요.");
    return !!result.data;
  }
}
