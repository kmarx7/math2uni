"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  NotebookPen,
  RotateCcw,
  ArrowUpRight,
  Sprout,
  ChevronRight,
} from "lucide-react";
import { useProgress } from "./progress-provider";
const links = [
  { href: "/", title: "학습 대시보드", icon: LayoutDashboard },
  { href: "/curriculum", title: "전체 커리큘럼", icon: BookOpen },
  { href: "/mistakes", title: "오답노트", icon: NotebookPen },
  { href: "/review", title: "복습하기", icon: RotateCcw },
];
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname(),
    { state, account, error, loading, saving, reload } = useProgress();
  const [logoutError, setLogoutError] = useState(""),
    [loggingOut, setLoggingOut] = useState(false);
  async function logout() {
    setLoggingOut(true);
    setLogoutError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      window.location.replace("/login");
    } catch {
      setLogoutError("로그아웃하지 못했어요. 다시 시도해 주세요.");
      setLoggingOut(false);
    }
  }
  return (
    <div className="app-shell">
      <a className="skip" href="#main">
        본문으로 건너뛰기
      </a>
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="Math 90 홈">
          <span className="brand-mark">
            m<span>·</span>
          </span>
          <span>
            math<span className="brand-number">90</span>
          </span>
        </Link>
        <div className="workspace-label">나의 수학 여정</div>
        <nav aria-label="주 메뉴">
          {links.map(({ href, title, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={path === href ? "nav-link active" : "nav-link"}
            >
              <Icon size={19} />
              {title}
              {path === href && <span className="nav-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-guide">
          <span className="tiny-icon">
            <Sprout size={21} />
          </span>
          <strong>
            기초가 단단하면,
            <br />
            수학은 달라집니다.
          </strong>
          <p>
            한 번에 한 개념씩.
            <br />
            나의 속도로 쌓아가세요.
          </p>
          <Link href="/learn/M0-01">
            첫 단원 만나보기 <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="profile">
          <span className="avatar">나</span>
          <div>
            <span className="account-caption">나의 학습 계정</span>
            <span className="account-email" title={account.email}>
              {account.email}
            </span>
          </div>
          <button
            className="logout-button"
            onClick={logout}
            disabled={loggingOut}
            aria-label="로그아웃"
          >
            {loggingOut ? "처리 중…" : "로그아웃"}
          </button>
        </div>
        <span className="local-note">
          {saving
            ? "저장 중…"
            : loading
              ? "기록 불러오는 중…"
              : "학습 기록이 계정에 저장돼요"}
        </span>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            나의 학습 공간 <ChevronRight size={14} />{" "}
            <span>
              {path.startsWith("/learn")
                ? "개념 학습"
                : (links.find((l) => l.href === path)?.title ?? "Math 90")}
            </span>
          </div>
          <div className="topbar-right">
            <span className="version-pill">MVP · LEVEL 0</span>
            <span className="avatar small">나</span>
          </div>
        </header>
        {(error || logoutError) && (
          <p role="alert" className="storage-error">
            {error || logoutError}{" "}
            {error && (
              <button className="button secondary" onClick={reload}>
                다시 불러오기
              </button>
            )}
          </p>
        )}
        <main id="main" key={state?.profileId ?? "loading"}>
          {state ? (
            children
          ) : loading ? (
            <p className="page" role="status">
              학습 기록을 불러오고 있어요…
            </p>
          ) : null}
        </main>
        <footer>
          Math 90 · 수학의 기초부터, 나의 가능성까지.
          <span>학습을 돕는 도구이며 실제 성적을 보장하지 않습니다.</span>
        </footer>
      </div>
    </div>
  );
}
