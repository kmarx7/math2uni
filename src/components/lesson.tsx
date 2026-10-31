"use client";
import Link from "next/link";
import { useState } from "react";
import type { ContentDocument, Block, Unit } from "@/contracts";
import { useProgress } from "./progress-provider";
import { PlaceLab } from "./place-lab";
import { ProblemSession } from "./problem-session";
import { mastery, isComplete } from "@/modules/progress";
import { Check, ArrowLeft, CheckCircle2 } from "lucide-react";
function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "ExplanationBlock":
      return (
        <>
          <p className="block-body">{block.body}</p>
          {block.readinessCheck && <ReadinessCheck />}
        </>
      );
    case "InteractiveBlock":
      return <PlaceLab />;
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
      return <ProblemSession />;
    case "AssessmentBlock":
      return <ProblemSession mode="assessment" />;
    default:
      return <p className="block-body">{block.body}</p>;
  }
}
export function Lesson({ doc, unit }: { doc: ContentDocument; unit: Unit }) {
  const { state, completeBlock, saving } = useProgress();
  const completed = doc.blocks.filter((b) =>
    state?.completedBlocks.includes(b.id),
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
      <div className="lesson-layout">
        <nav className="lesson-index" aria-label="학습 단계">
          <span className="eyebrow">LEARNING PATH</span>
          {doc.blocks.map((b, i) => (
            <a href={`#${b.id}`} key={b.id}>
              <span
                className={
                  state?.completedBlocks.includes(b.id)
                    ? "index-number checked"
                    : "index-number"
                }
              >
                {state?.completedBlocks.includes(b.id) ? (
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
              <BlockRenderer block={block} />
              <button
                className={`block-check ${state?.completedBlocks.includes(block.id) ? "done" : ""}`}
                disabled={
                  !state || saving || state.completedBlocks.includes(block.id)
                }
                onClick={() => completeBlock(unit.id, block.id)}
              >
                <CheckCircle2 size={17} />
                {state?.completedBlocks.includes(block.id)
                  ? "확인했어요"
                  : "이 단계를 확인했어요"}
              </button>
            </section>
          ))}
          <section className="completion">
            <h2>
              {done ? "첫 단원을 완료했어요!" : "이해를 쌓아, 첫 단원 완료까지"}
            </h2>
            <p>
              블록 확인 {completed}/{doc.blocks.length} · 형성평가{" "}
              {state?.assessmentScore ?? 0}점 · 개념별 숙달도 80% 이상 필요
            </p>
            <p>다음 단원 M0-02는 아직 준비 중이에요.</p>
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
          십 묶음을 설명할 수 있어요
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
            "좋아요. 숫자와 자릿값의 차이를 살펴보세요."
          ) : (
            <>
              먼저 낱개 10개가 십 묶음 1개가 되는 관계를 연습해요.{" "}
              <a href="#lab">자리표 실험실로 이동하기</a>
            </>
          )}
        </p>
      )}
    </div>
  );
}
