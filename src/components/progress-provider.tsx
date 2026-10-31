"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import type { ProgressState } from "@/contracts";
import {
  emptyProgress,
  LocalProgressRepository,
} from "@/modules/progress/repository";
const Context = createContext<{
  state: ProgressState | null;
  error: string;
  update: (
    fn: (s: ProgressState) => ProgressState,
    expectedProfileId?: string,
  ) => void;
  newProfile: () => void;
  switchProfile: (id: string) => void;
  profiles: string[];
} | null>(null);
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState | null>(null);
  const stateRef = useRef<ProgressState | null>(null);
  const [profiles, setProfiles] = useState<string[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      let active = localStorage.getItem("math90:active");
      if (!active) {
        active = crypto.randomUUID();
        localStorage.setItem("math90:active", active);
      }
      let ids: string[] = [];
      try {
        ids = JSON.parse(localStorage.getItem("math90:profiles") ?? "[]");
      } catch {
        ids = [];
      }
      ids = Array.isArray(ids) ? ids.filter((x) => typeof x === "string") : [];
      if (!ids.includes(active)) {
        ids.push(active);
        localStorage.setItem("math90:profiles", JSON.stringify(ids));
      }
      // Browser storage hydration runs once after SSR; it synchronizes an external system.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfiles(ids);
      const loaded = new LocalProgressRepository(localStorage).load(active);
      stateRef.current = loaded;
      setState(loaded);
    } catch {
      setError(
        "로컬 기록을 읽을 수 없어요. 브라우저 저장소를 확인하거나 새 프로필을 만들어 주세요.",
      );
    }
  }, []);
  function update(
    fn: (s: ProgressState) => ProgressState,
    expectedProfileId?: string,
  ) {
    const current = stateRef.current;
    if (
      !current ||
      (expectedProfileId && current.profileId !== expectedProfileId)
    )
      return;
    const next = fn(current);
    try {
      new LocalProgressRepository(localStorage).save(next.profileId, next);
      stateRef.current = next;
      setState(next);
      setError("");
    } catch {
      setError(
        "저장하지 못했어요. 저장 공간과 브라우저 설정을 확인한 뒤 다시 시도해 주세요.",
      );
    }
  }
  function switchProfile(profileId: string) {
    try {
      const next = new LocalProgressRepository(localStorage).load(profileId);
      localStorage.setItem("math90:active", profileId);
      stateRef.current = next;
      setState(next);
      setError("");
    } catch {
      setError("이 프로필 기록을 읽을 수 없어요. 다른 프로필을 선택해 주세요.");
    }
  }
  function newProfile() {
    try {
      const profileId = crypto.randomUUID(),
        next = emptyProgress(profileId);
      new LocalProgressRepository(localStorage).save(profileId, next);
      const ids = [...profiles, profileId];
      localStorage.setItem("math90:profiles", JSON.stringify(ids));
      localStorage.setItem("math90:active", profileId);
      setProfiles(ids);
      stateRef.current = next;
      setState(next);
      setError("");
    } catch {
      setError("새 프로필을 저장할 수 없어요. 브라우저 저장소를 확인하세요.");
    }
  }
  return (
    <Context.Provider
      value={{ state, error, update, newProfile, switchProfile, profiles }}
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
