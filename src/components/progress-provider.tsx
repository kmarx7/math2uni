"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { progressSchema, type ProgressState } from "@/contracts";
import type { Account } from "@/modules/auth/server";
import type { ProgressSnapshot } from "@/modules/progress/account-repository";
const Context = createContext<{
  state: ProgressState | null;
  account: Account;
  error: string;
  loading: boolean;
  saving: boolean;
  replaceSnapshot: (snapshot: ProgressSnapshot) => void;
  completeBlock: (unitId: string, blockId: string) => Promise<void>;
  reload: () => void;
} | null>(null);
export function ProgressProvider({
  account,
  children,
}: {
  account: Account;
  children: ReactNode;
}) {
  const [state, setState] = useState<ProgressState | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [generation, setGeneration] = useState(0);
  const revision = useRef(-1);
  function replaceSnapshot(snapshot: ProgressSnapshot) {
    const progress = progressSchema.parse(snapshot.progress);
    if (
      progress.profileId !== account.id ||
      !Number.isInteger(snapshot.revision) ||
      snapshot.revision < 0
    )
      throw new Error("학습 기록의 계정이 일치하지 않습니다.");
    if (snapshot.revision < revision.current) return;
    revision.current = snapshot.revision;
    setState(progress);
    setError("");
  }
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/progress", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          window.location.replace("/login");
          return;
        }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        const progress = progressSchema.parse(data.progress);
        if (
          progress.profileId !== account.id ||
          !Number.isInteger(data.revision)
        )
          throw new Error("학습 기록의 계정이 일치하지 않습니다.");
        if (data.revision >= revision.current) {
          revision.current = data.revision;
          setState(progress);
          setError("");
        }
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setError(
            "학습 기록을 불러오지 못했어요. 다시 불러오기를 눌러 주세요.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [account.id, generation]);
  async function completeBlock(unitId: string, blockId: string) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "complete-block", unitId, blockId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      replaceSnapshot(data);
    } catch {
      setError("학습 단계를 저장하지 못했어요. 다시 확인 버튼을 눌러 주세요.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <Context.Provider
      value={{
        state,
        account,
        error,
        loading,
        saving,
        replaceSnapshot,
        completeBlock,
        reload: () => setGeneration((n) => n + 1),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useProgress() {
  const value = useContext(Context);
  if (!value) throw new Error("ProgressProvider 필요");
  return value;
}
