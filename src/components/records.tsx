"use client";
import Link from "next/link";
import type { Attempt } from "@/contracts";
import { curriculum } from "@/data/curriculum";
import { useState } from "react";
import { useProgress } from "./progress-provider";
import {
  wrongAnswers,
  dueReviews,
  reviewSchedule,
  attemptUnitId,
} from "@/modules/progress";
import { ProblemSession } from "./problem-session";
import { NotebookPen, CalendarDays } from "lucide-react";
export function Records({ review = false }: { review?: boolean }) {
  const { state } = useProgress();
  const [selected, setSelected] = useState<Attempt | null>(null);
  const attempts = state?.attempts ?? [];
  const records = review
    ? dueReviews(attempts).map((r) => r.last)
    : wrongAnswers(attempts);
  const scheduled = reviewSchedule(attempts);
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            {review ? "SPACED REPETITION" : "LEARN FROM MISTAKES"}
          </div>
          <h1>
            {review
              ? "기억을 단단하게, 복습하기"
              : "실수가 이해로 바뀌는 오답노트"}
          </h1>
          <p>
            {review
              ? "1일, 3일, 7일 간격으로 다시 만나며 기억해요."
              : "오답을 살펴보고, 해설을 덮은 뒤 다시 풀어보세요."}
          </p>
        </div>
      </div>
      {records.length === 0 ? (
        <section className="card empty-state">
          {review ? <CalendarDays size={36} /> : <NotebookPen size={36} />}
          <h2>
            {review
              ? "오늘 예정된 복습이 없어요"
              : "아직 남아 있는 오답이 없어요"}
          </h2>
          <p>
            {review
              ? "학습한 문제는 다음 날부터 복습에 나타납니다."
              : "연습에서 틀린 문항이 생기면 여기에 모아드려요."}
          </p>
          <Link href="/learn/M0-01" className="button">
            M0-01 학습하기
          </Link>
        </section>
      ) : (
        <div className="records-list">
          {records.map((a) => (
            <article className="card record-card" key={a.problemId}>
              <span className="eyebrow">
                {attemptUnitId(a)} · {a.problemId} · v{a.version} ·{" "}
                {a.purpose === "assessment" ? "형성평가" : "연습"}
              </span>
              <h2>제출 답안: {a.answer}</h2>
              <p>{a.feedback.misconception ?? "개념을 다시 떠올려 보세요."}</p>
              <details>
                <summary>저장된 정답과 해설 보기</summary>
                <p>정답: {a.feedback.answerDisplay}</p>
                <p>{a.feedback.explanation}</p>
              </details>
              {a.purpose === "assessment" ? (
                <Link
                  href={`/learn/${attemptUnitId(a)}#assessment`}
                  className="button secondary"
                >
                  전체 평가 다시 도전
                </Link>
              ) : (
                <button className="button" onClick={() => setSelected(a)}>
                  이 문제 복습하기
                </button>
              )}
            </article>
          ))}
        </div>
      )}
      {selected && (
        <section className="card lesson-block">
          <h2>해설 없이 다시 도전</h2>
          <ProblemSession
            key={selected.problemId}
            unitId={attemptUnitId(selected)}
            mode="review"
            onlyId={selected.problemId}
          />
        </section>
      )}
      {review && scheduled.length > 0 && (
        <section className="card schedule">
          <h2>다가오는 복습</h2>
          {scheduled.map((r) => (
            <div key={r.problemId}>
              <span>
                {
                  curriculum.units.find((u) => u.id === attemptUnitId(r.last))
                    ?.title
                }{" "}
                · {r.problemId}
              </span>
              <time dateTime={r.dueAt}>
                {new Date(r.dueAt).toLocaleDateString("ko-KR")}
              </time>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
