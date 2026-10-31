"use client";
import Link from "next/link";
import { useProgress } from "./progress-provider";
import { getLesson } from "@/data/content";
import { isComplete, unitProgress, mastery } from "@/modules/progress";
import { useState } from "react";
import { curriculum } from "@/data/curriculum";
import { ArrowRight, LockKeyhole, BookOpen } from "lucide-react";
export function CurriculumView() {
  const [level, setLevel] = useState(0);
  const { state } = useProgress();
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">THE BIG PICTURE</div>
          <h1>기초에서 시작하는 수학의 지도</h1>
          <p>LEVEL 0~8, 170단원을 목표로 한 단계씩 설계하고 있어요.</p>
        </div>
      </div>
      <div className="notice">
        <BookOpen size={20} />
        <div>
          <strong>LEVEL 0의 12단원을 검토용으로 학습할 수 있어요.</strong>
          <p>
            LEVEL 0의 12단원은 편집 초안입니다. 170단원 정본 목록과 공식
            성취기준 매핑은 미등록 상태예요.
          </p>
        </div>
      </div>
      <div className="level-tabs" aria-label="레벨 선택">
        {Array.from({ length: 9 }, (_, i) => (
          <button
            key={i}
            aria-pressed={level === i}
            className={level === i ? "selected" : ""}
            onClick={() => setLevel(i)}
          >
            LEVEL {i}
            {i > 0 && <LockKeyhole size={12} />}
          </button>
        ))}
      </div>
      {level === 0 ? (
        <>
          <div className="curriculum-title">
            <h2>LEVEL 0 · 수학의 언어 익히기</h2>
            <span>12개 콘텐츠 초안 · 운영 공개는 관리자 검수 후</span>
          </div>
          <div className="unit-list">
            {curriculum.units.map((u) => {
              const doc = getLesson(u.id);
              const complete =
                state && doc
                  ? isComplete(
                      state,
                      u,
                      doc.blocks.map((b) => b.id),
                    )
                  : false;
              const progress = state
                ? unitProgress(state, u.id)
                : { completedBlocks: [], assessmentScore: null };
              const score = Math.round(
                u.concepts.reduce(
                  (sum, c) => sum + mastery(state?.attempts ?? [], c.id),
                  0,
                ) / u.concepts.length,
              );
              return (
                <article
                  className={`card unit-row ${u.status === "published" ? "available" : ""} ${complete ? "completed" : ""}`}
                  key={u.id}
                >
                  <span className="unit-number">{u.id.slice(-2)}</span>
                  <div className="unit-detail">
                    <span className="eyebrow">{u.id}</span>
                    <h3>{u.title}</h3>
                    <p>{u.objectives.join(" · ")}</p>
                    <div className="unit-tags">
                      {u.concepts.map((c) => (
                        <span key={c.id}>{c.label}</span>
                      ))}
                    </div>
                    <div className="unit-progress-line">
                      <span>
                        {complete ? "완료" : "학습 중"} · 확인{" "}
                        {progress.completedBlocks.length}/
                        {doc?.blocks.length ?? 0}
                      </span>
                      <span>숙달 {score}%</span>
                      <span>
                        평가{" "}
                        {progress.assessmentScore === null
                          ? "미응시"
                          : `${progress.assessmentScore}점`}
                      </span>
                    </div>
                  </div>
                  {u.status === "published" ? (
                    <Link className="button" href={`/learn/${u.id}`}>
                      학습하기 <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <span className="draft-label">
                      <LockKeyhole size={14} />
                      초안 · 준비 중
                    </span>
                  )}
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <section className="card empty-state">
          <LockKeyhole size={32} />
          <h2>LEVEL {level} 정본 목록을 기다리고 있어요</h2>
          <p>단원 이름과 순서는 공식 마스터 목록을 검토한 뒤 등록합니다.</p>
        </section>
      )}
    </div>
  );
}
