"use client";
import { useEffect, useState } from "react";
import type { PublicProblem, Feedback } from "@/contracts";
import { useProgress } from "./progress-provider";
import { Check, ArrowRight, Lightbulb } from "lucide-react";
export function ProblemSession({
  mode = "practice",
  onlyId,
  unitId = "M0-01",
  hintText = "문제의 조건을 정리하고, 개념 설명과 풀이 예제를 한 단계씩 확인해 보세요.",
}: {
  mode?: "practice" | "assessment" | "review";
  onlyId?: string;
  unitId?: string;
  hintText?: string;
}) {
  const assessment = mode === "assessment";
  const endpoint = assessment ? "assessment" : "practice";
  const { state, replaceSnapshot } = useProgress();
  const [problems, setProblems] = useState<PublicProblem[]>([]),
    [answers, setAnswers] = useState<Record<string, string>>({}),
    [results, setResults] = useState<Feedback[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [hint, setHint] = useState(false),
    [index, setIndex] = useState(0),
    [filter, setFilter] = useState("all"),
    [score, setScore] = useState<number | null>(null),
    [loaded, setLoaded] = useState(false),
    [preview, setPreview] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/${endpoint}?unitId=${encodeURIComponent(unitId)}`, {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setProblems(
          data.problems.filter(
            (p: PublicProblem) => !onlyId || p.id === onlyId,
          ),
        );
        setLoaded(true);
        setPreview(data.preview);
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setError("문항을 불러오지 못했어요. 페이지를 새로고침해 주세요.");
      });
    return () => controller.abort();
  }, [endpoint, onlyId, unitId]);
  const filtered = problems.filter(
      (p) => filter === "all" || p.reasoning === filter,
    ),
    problem = filtered[index];
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!state || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          assessment
            ? { unitId, answers, requestId }
            : {
                unitId,
                problemId: problem.id,
                answer: answers[problem.id] ?? "",
                requestId,
                hintUsed: hint,
                mode: mode === "review" ? "review" : "practice",
              },
        ),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const feedback: Feedback[] = assessment ? data.results : [data];
      if (
        feedback.some(
          (r) => r.status === "invalid" || r.status === "unsupported",
        )
      ) {
        setError(feedback[0].message);
        return;
      }
      replaceSnapshot(data);
      setResults(feedback);
      if (assessment) setScore(data.score);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "통신에 실패했어요. 다시 시도해 주세요.",
      );
    } finally {
      setBusy(false);
    }
  }
  function next() {
    setIndex((index + 1) % filtered.length);
    setResults([]);
    setHint(false);
    setRequestId(crypto.randomUUID());
    setError("");
    setAnswers({});
  }
  const fields = (p: PublicProblem) => (
    <fieldset
      key={p.id}
      className="question-fields"
      disabled={busy || results.length > 0}
    >
      <legend>
        <span className="soft-tag">
          {p.difficulty} ·{" "}
          {
            { basic: "기본", variation: "변형", application: "응용" }[
              p.reasoning
            ]
          }
        </span>
        <strong>{p.prompt}</strong>
      </legend>
      {p.input === "choice" ? (
        <div className="choices">
          {p.choices?.map((choice, i) => (
            <label
              key={choice.id}
              className={
                answers[p.id] === choice.id ? "choice selected" : "choice"
              }
            >
              <input
                type="radio"
                name={p.id}
                value={choice.id}
                checked={answers[p.id] === choice.id}
                onChange={() => {
                  setRequestId(crypto.randomUUID());
                  setAnswers((a) => ({ ...a, [p.id]: choice.id }));
                }}
                required
              />
              <span className="choice-index">{i + 1}</span>
              {choice.label}
            </label>
          ))}
        </div>
      ) : (
        <div className="answer-field">
          <label htmlFor={p.id}>
            {p.input === "fraction"
              ? "답안 (분수 · a/b)"
              : p.input === "decimal"
                ? "답안 (소수)"
                : "답안 (정수 · 쉼표 없이)"}
          </label>
          <input
            id={p.id}
            inputMode={
              p.input === "fraction" || unitId === "M0-11"
                ? "text"
                : p.input === "decimal"
                  ? "decimal"
                  : "numeric"
            }
            autoComplete="off"
            maxLength={64}
            placeholder="숫자를 입력하세요"
            value={answers[p.id] ?? ""}
            onChange={(e) => {
              setRequestId(crypto.randomUUID());
              setAnswers((a) => ({ ...a, [p.id]: e.target.value }));
            }}
            required
          />
        </div>
      )}
    </fieldset>
  );
  return (
    <div className="problem-session">
      {!assessment && !onlyId && (
        <div className="segmented" aria-label="풀이 유형">
          {[
            ["all", "전체 유형"],
            ["basic", "기본 개념"],
            ["variation", "변형 유형"],
            ["application", "응용 유형"],
          ].map(([v, label]) => (
            <button
              key={v}
              type="button"
              aria-pressed={filter === v}
              className={filter === v ? "selected" : ""}
              onClick={() => {
                setFilter(v);
                setIndex(0);
                setResults([]);
                setAnswers({});
                setHint(false);
                setRequestId(crypto.randomUUID());
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {assessment && (
        <p className="helper">
          3문항을 모두 풀고 제출해 주세요. 정답과 해설은 전체 제출 후
          표시됩니다. 실전 모의평가는 아직 제공하지 않습니다.
        </p>
      )}
      {preview && (
        <p className="preview-note">
          검토용 미승인 샘플 · 자동 검사 완료, 관리자 승인 대기 · 운영
          서비스에는 공개되지 않습니다.
        </p>
      )}
      {!problem && !error && (
        <p>
          {loaded
            ? "관리자 승인을 받은 공개 문항이 아직 없습니다. 로컬 개발 검토 모드에서는 샘플을 확인할 수 있어요."
            : "문항을 준비하고 있어요…"}
        </p>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {problem && (
        <form onSubmit={submit}>
          {assessment ? (
            filtered.map(fields)
          ) : (
            <>
              <div className="question-count">
                문제 {index + 1} / {filtered.length}{" "}
                <span>풀이 전략별로 차근차근</span>
              </div>
              {fields(problem)}
            </>
          )}
          {!results.length && (
            <div className="question-actions">
              {!assessment && (
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    setRequestId(crypto.randomUUID());
                    setHint(true);
                  }}
                >
                  <Lightbulb size={16} />
                  힌트 보기
                </button>
              )}
              <button
                type="submit"
                className="button"
                disabled={busy || !state}
              >
                {busy
                  ? "채점 중…"
                  : assessment
                    ? "전체 답안 제출"
                    : "답안 확인"}{" "}
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </form>
      )}
      {hint && !assessment && (
        <p className="hint">
          <Lightbulb size={16} />
          {hintText} 힌트 사용은 기록됩니다.
        </p>
      )}
      {score !== null && (
        <p className="assessment-score" role="status">
          형성평가 결과 <strong>{score}점</strong> ·{" "}
          {score >= 80
            ? "잘했어요! 개념 숙달과 복습도 확인해요."
            : "부족한 개념을 연습한 후 다시 도전해요."}
        </p>
      )}
      <div aria-live="polite">
        {results.map((r) => (
          <div
            className={`feedback ${r.status === "correct" ? "correct" : "incorrect"}`}
            key={r.problemId}
          >
            <strong>
              <Check size={17} />
              {r.message}
            </strong>
            <p>정답: {r.answerDisplay}</p>
            <p>{r.explanation}</p>
            <ol>
              {r.steps?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
            {r.misconception && (
              <p className="misconception">기억해요 · {r.misconception}</p>
            )}
          </div>
        ))}
      </div>
      {results.length > 0 && (
        <div className="question-actions">
          <button
            className="button secondary"
            onClick={() => {
              setResults([]);
              setAnswers({});
              setHint(false);
              setRequestId(crypto.randomUUID());
              setScore(null);
            }}
          >
            다시 풀기
          </button>
          {!assessment && !onlyId && (
            <button className="button" onClick={next}>
              다음 문제 <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
