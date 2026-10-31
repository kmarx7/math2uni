"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  BookOpen,
  Check,
} from "lucide-react";
export function AuthForm({
  signup = false,
  configured,
  confirmationFailed = false,
}: {
  signup?: boolean;
  configured: boolean;
  confirmationFailed?: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [visible, setVisible] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(
      confirmationFailed
        ? "인증 링크가 만료되었거나 올바르지 않아요. 다시 가입 또는 로그인을 시도해 주세요."
        : "",
    ),
    [message, setMessage] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setMessage("");
    if (signup && password !== confirm) {
      setError("비밀번호 확인이 일치하지 않아요.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/auth/${signup ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPassword("");
      setConfirm("");
      if (!signup || data.signedIn) {
        router.replace("/");
        router.refresh();
        return;
      }
      setMessage(data.message);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "연결하지 못했어요. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <aside className="auth-story">
        <Link href="/login" className="brand" aria-label="Math 90 로그인">
          <span className="brand-mark">
            m<span>·</span>
          </span>
          <span>
            math<span className="brand-number">90</span>
          </span>
        </Link>
        <div className="auth-story-content">
          <span className="eyebrow">YOUR OWN MATH JOURNEY</span>
          <h1>
            작은 이해를 쌓아,
            <br />
            나만의 가능성까지.
          </h1>
          <p>
            오늘 배운 개념, 풀었던 문제, 다시 만날 복습.
            <br />
            로그인하면 나의 수학 여정이 이어집니다.
          </p>
          <div className="auth-illustration" aria-hidden="true">
            <span>1</span>
            <span>0</span>
            <span>2</span>
            <span>4</span>
          </div>
          <div className="auth-benefits">
            <p>
              <Check size={16} />
              개념부터 차근차근, 나의 속도로
            </p>
            <p>
              <Check size={16} />
              문제풀이와 오답을 계정에 기록
            </p>
            <p>
              <Check size={16} />
              다시 로그인해도 이어지는 학습
            </p>
          </div>
        </div>
        <span className="auth-footnote">
          Math 90 · 실제 성적을 보장하지 않습니다.
        </span>
      </aside>
      <main className="auth-main">
        <div className="auth-form-wrap">
          <span className="auth-lock">
            <LockKeyhole size={24} />
          </span>
          <div className="eyebrow">
            {signup ? "START YOUR JOURNEY" : "WELCOME BACK"}
          </div>
          <h2>
            {signup ? "나의 학습 계정 만들기" : "나의 수학 여정에 로그인"}
          </h2>
          <p className="auth-description">
            {signup
              ? "아이디와 비밀번호를 만들고 첫 학습을 시작하세요."
              : "이전에 배운 곳부터, 오늘도 한 개념 더 단단하게."}
          </p>
          {!configured && (
            <p className="error" role="alert">
              로그인 서비스 연결을 준비하고 있어요. 연결 설정 후 가입과 로그인을
              이용할 수 있습니다.
            </p>
          )}
          <form onSubmit={submit}>
            <label htmlFor="email">아이디 (이메일)</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="이메일 주소를 입력하세요"
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={busy}
            />
            <label htmlFor="password">비밀번호</label>
            <div className="password-input">
              <input
                id="password"
                name="password"
                type={visible ? "text" : "password"}
                autoComplete={signup ? "new-password" : "current-password"}
                placeholder={
                  signup ? "영문·숫자 포함 10자 이상" : "비밀번호를 입력하세요"
                }
                minLength={signup ? 10 : 1}
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={busy}
              />
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {signup && (
              <>
                <p className="helper">
                  영문과 숫자를 포함해 10~128자로 설정해 주세요.
                </p>
                <label htmlFor="password-confirm">비밀번호 확인</label>
                <input
                  id="password-confirm"
                  name="password-confirm"
                  type={visible ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={10}
                  maxLength={128}
                  placeholder="비밀번호를 한 번 더 입력하세요"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  disabled={busy}
                />
              </>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="auth-message" role="status">
                {message}
              </p>
            )}
            <button
              className="button auth-submit"
              type="submit"
              disabled={busy || !configured}
            >
              {busy ? "잠시만 기다려 주세요…" : signup ? "회원가입" : "로그인"}
              <ArrowRight size={18} />
            </button>
          </form>
          <p className="auth-switch">
            {signup ? "이미 계정이 있나요?" : "처음 방문하셨나요?"}{" "}
            <Link href={signup ? "/login" : "/signup"}>
              {signup ? "로그인" : "회원가입"}
            </Link>
          </p>
          <div className="auth-save-note">
            <BookOpen size={17} />
            <p>
              학습 기록은 로그인한 계정에 저장됩니다.
              <br />
              다른 사람과 비밀번호를 공유하지 마세요.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
