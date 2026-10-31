"use client";
import Link from "next/link";
import { useState } from "react";
import type { ContentDocument, Block, Unit } from "@/contracts";
import { useProgress } from "./progress-provider";
import { MathLab } from "./math-lab";
import { curriculum } from "@/data/curriculum";
import { getLesson } from "@/data/content";
import { ProblemSession } from "./problem-session";
import { mastery, isComplete, unitProgress } from "@/modules/progress";
import { Check, ArrowLeft, CheckCircle2 } from "lucide-react";
function BlockRenderer({ block, unitId }: { block: Block; unitId: string }) {
  switch (block.type) {
    case "ExplanationBlock":
      return (
        <>
          <p className="block-body">{block.body}</p>
          {block.readinessCheck && <ReadinessCheck />}
        </>
      );
    case "InteractiveBlock":
      return <MathLab block={block} />;
    case "WorkedExampleBlock":
      return (
        <ol className="worked-steps">
          {block.steps.map((s, i) => (
            <li key={i}>
              <span>{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      );
    case "PracticeBlock":
      return <ProblemSession unitId={unitId} hintText={block.hint} />;
    case "AssessmentBlock":
      return <ProblemSession unitId={unitId} mode="assessment" />;
    default:
      return <p className="block-body">{block.body}</p>;
  }
}
export function Lesson({ doc, unit }: { doc: ContentDocument; unit: Unit }) {
  const { state, completeBlock, saving } = useProgress();
  const progress = state
    ? unitProgress(state, unit.id)
    : { completedBlocks: [], assessmentScore: null };
  const next = curriculum.units.find(
    (candidate) =>
      candidate.order === unit.order + 1 &&
      candidate.status === "published" &&
      getLesson(candidate.id),
  );
  const missing = unit.prerequisites
    .filter((skill) => mastery(state?.attempts ?? [], skill) < 80)
    .map((skill) => ({
      skill,
      unit: curriculum.units.find((candidate) =>
        candidate.concepts.some((c) => c.id === skill),
      ),
    }));
  const completed = doc.blocks.filter((b) =>
    progress.completedBlocks.includes(b.id),
  ).length;
  const done = state
    ? isComplete(
        state,
        unit,
        doc.blocks.map((b) => b.id),
      )
    : false;
  return (
    <div className="page lesson-page">
      <Link href="/" className="back-link">
        <ArrowLeft size={15} />
        대시보드로
      </Link>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            LEVEL {unit.level} · {unit.id}
          </div>
          <h1>{unit.title}</h1>
          <p>한 개념씩 이해하고, 움직이고, 스스로 풀어보세요.</p>
        </div>
        <span className="soft-tag">
          {completed} / {doc.blocks.length} 블록 확인
        </span>
      </div>
      {missing.length > 0 && (
        <aside className="notice prerequisite-notice">
          <div>
            <strong>먼저 확인하면 좋은 선수 개념</strong>
            <p>
              아직 익숙하지 않은 개념이 있어요. 해당 단원에서 복습하거나 이번
              단원을 살펴볼 수 있습니다.
            </p>
            <div className="prerequisite-links">
              {missing.map(
                ({ skill, unit: previous }) =>
                  previous && (
                    <Link key={skill} href={`/learn/${previous.id}`}>
                      {previous.id} ·{" "}
                      {previous.concepts.find((c) => c.id === skill)?.label}
                    </Link>
                  ),
              )}
            </div>
          </div>
        </aside>
      )}
      <div className="lesson-layout">
        <nav className="lesson-index" aria-label="학습 단계">
          <span className="eyebrow">LEARNING PATH</span>
          {doc.blocks.map((b, i) => (
            <a href={`#${b.id}`} key={b.id}>
              <span
                className={
                  progress.completedBlocks.includes(b.id)
                    ? "index-number checked"
                    : "index-number"
                }
              >
                {progress.completedBlocks.includes(b.id) ? (
                  <Check size={13} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              {b.title.split(" · ")[0]}
            </a>
          ))}
          <div className="mastery-summary">
            <strong>개념별 숙달도</strong>
            {unit.concepts.map((c) => (
              <div key={c.id}>
                <span>{c.label}</span>
                <b>{mastery(state?.attempts ?? [], c.id)}%</b>
              </div>
            ))}
            <p>
              두 개 이상의 독립 정답이 필요해요. 반복·힌트 정답은 낮은 가중치로
              기록해요.
            </p>
          </div>
        </nav>
        <div className="blocks">
          {doc.blocks.map((block, i) => (
            <section className="card lesson-block" id={block.id} key={block.id}>
              <div className="block-heading">
                <span className="block-step">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2>{block.title}</h2>
              </div>
              <BlockRenderer block={block} unitId={unit.id} />
              <button
                className={`block-check ${progress.completedBlocks.includes(block.id) ? "done" : ""}`}
                disabled={
                  !state ||
                  saving ||
                  progress.completedBlocks.includes(block.id)
                }
                onClick={() => completeBlock(unit.id, block.id)}
              >
                <CheckCircle2 size={17} />
                {progress.completedBlocks.includes(block.id)
                  ? "확인했어요"
                  : "이 단계를 확인했어요"}
              </button>
            </section>
          ))}
          <section className="completion">
            <h2>
              {done
                ? unit.id === "M0-01"
                  ? "첫 단원을 완료했어요!"
                  : `${unit.id} 단원을 완료했어요!`
                : "이해를 쌓아, 단원 완료까지"}
            </h2>
            <p>
              블록 확인 {completed}/{doc.blocks.length} · 형성평가{" "}
              {progress.assessmentScore ?? 0}점 · 개념별 숙달도 80% 이상 필요
            </p>
            {next ? (
              <p>
                다음 단원 · {next.id} {next.title}
              </p>
            ) : (
              <p>
                LEVEL 0의 마지막 단원입니다. LEVEL 1은 정본 목록 검토 후
                이어집니다.
              </p>
            )}
            {done && next && (
              <Link href={`/learn/${next.id}`} className="button">
                다음 단원 학습하기
              </Link>
            )}
            <Link href="/review" className="button">
              복습 일정 확인하기
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

function ReadinessCheck() {
  const [ready, setReady] = useState<boolean | null>(null);
  return (
    <div className="readiness">
      <p className="helper">선수학습 자기 점검 · 정답률과 별도로 확인해요.</p>
      <div className="question-actions">
        <button
          className="button secondary"
          aria-pressed={ready === true}
          onClick={() => setReady(true)}
        >
          선수 개념을 설명할 수 있어요
        </button>
        <button
          className="button secondary"
          aria-pressed={ready === false}
          onClick={() => setReady(false)}
        >
          아직 낯설어요
        </button>
      </div>
      {ready !== null && (
        <p className="hint" role="status">
          {ready ? (
            "좋아요. 이번 단원의 핵심 개념을 살펴보세요."
          ) : (
            <>
              기초 설명과 예제를 먼저 확인하고, 수학 실험실에서 직접 조작해
              보세요. <a href="#lab">수학 실험실로 이동하기</a>
            </>
          )}
        </p>
      )}
    </div>
  );
}
