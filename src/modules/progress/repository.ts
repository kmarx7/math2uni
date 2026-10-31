import {
  progressSchema,
  type ProgressRepository,
  type ProgressState,
} from "@/contracts";
export function emptyProgress(profileId: string): ProgressState {
  return {
    schemaVersion: 1,
    profileId,
    attempts: [],
    completedBlocks: [],
    assessmentScore: null,
  };
}
export class LocalProgressRepository implements ProgressRepository {
  constructor(private storage: Pick<Storage, "getItem" | "setItem">) {}
  load(profileId: string): ProgressState {
    progressSchema.shape.profileId.parse(profileId);
    const raw = this.storage.getItem(`math90:v1:${profileId}`);
    if (!raw) return emptyProgress(profileId);
    const parsed = progressSchema.safeParse(JSON.parse(raw));
    if (!parsed.success || parsed.data.profileId !== profileId)
      throw new Error(
        "학습 기록을 읽을 수 없습니다. 프로필을 전환하거나 저장소를 확인하세요.",
      );
    return parsed.data;
  }
  save(profileId: string, state: ProgressState) {
    const valid = progressSchema.parse(state);
    if (valid.profileId !== profileId) throw new Error("프로필 불일치");
    this.storage.setItem(`math90:v1:${profileId}`, JSON.stringify(valid));
  }
}
