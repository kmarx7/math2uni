"use client";
import Link from "next/link";
import { useState } from "react";
import type {
  ContentDocument,
  Block,
  Unit,
  ProblemCollection,
} from "@/contracts";
import { useProgress } from "./progress-provider";
import { PlaceValueExploration } from "./place-value-exploration";
import { MathLab } from "./math-lab";
import { curriculum } from "@/data/curriculum";
import { getLessonOutline } from "@/data/content-index";
import { ProblemSession } from "./problem-session";
import { mastery, isComplete, unitProgress } from "@/modules/progress";
import { Check, ArrowLeft, CheckCircle2 } from "lucide-react";
function UnitProblemSession({
  unitId,
  mode = "practice",
  hintText,
  initialCollection = "core",
  allowExtension = false,
}: {
  unitId: string;
  mode?: "practice" | "assessment";
  hintText?: string;
  initialCollection?: ProblemCollection;
  allowExtension?: boolean;
}) {
  const [collection, setCollection] =
    useState<ProblemCollection>(initialCollection);
  return (
    <>
      {unitId === "M0-01" && allowExtension && (
        <label className="collection-selector">
          {mode === "assessment" ? "평가 문항 묶음" : "연습 문항 묶음"}
          <select
            value={collection}
            onChange={(event) =>
              setCollection(event.target.value as ProblemCollection)
            }
          >
            <option value="core">기본 학습 묶음</option>
            <option value="extended">10원형 확장 묶음 · 검토용</option>
          </select>
        </label>
      )}
      <ProblemSession
        key={`${unitId}:${mode}:${collection}`}
        unitId={unitId}
        mode={mode}
        hintText={hintText}
        collection={collection}
      />
    </>
  );
}
function BlockRenderer({
  block,
  unitId,
  initialCollection,
  allowExtension,
}: {
  block: Block;
  unitId: string;
  initialCollection: ProblemCollection;
  allowExtension: boolean;
}) {
  switch (block.type) {
    case "ExplanationBlock":
      return (
        <>
          <p className="block-body">{block.body}</p>
          {block.sections && (
            <div className="instruction-sections">
              {block.sections.map((section) => (
                <article key={section.id}>
                  <h3>{section.title}</h3>
                  <p>{section.body}</p>
                  <p>
                    <strong>탐구 활동 · </strong>
                    {section.activity}
                  </p>
                  <p className="helper">이해 확인 · {section.check}</p>
                </article>
              ))}
            </div>
          )}
          {block.readinessCheck && <ReadinessCheck />}
        </>
      );
    case "InteractiveBlock":
      return (
        <>
          <MathLab block={block} />
          {block.interaction === "place-value" && allowExtension && (
            <PlaceValueExploration />
          )}
        </>
      );
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
      return (
        <UnitProblemSession
          unitId={unitId}
          hintText={block.hint}
          allowExtension={allowExtension}
          initialCollection={initialCollection}
        />
      );
    case "AssessmentBlock":
      return (
        <UnitProblemSession
          unitId={unitId}
          mode="assessment"
          initialCollection={initialCollection}
          allowExtension={allowExtension}
        />
      );
    default:
      return <p className="block-body">{block.body}</p>;
  }
}
export function Lesson({
  doc,
  unit,
  draftPreview = false,
  nextDraftUnit,
  initialCollection = "core",
}: {
  doc: ContentDocument;
  unit: Unit;
  draftPreview?: boolean;
  nextDraftUnit?: Unit;
  initialCollection?: ProblemCollection;
}) {
  const { state, completeBlock, saving } = useProgress();
  const progress = state
    ? unitProgress(state, unit.id)
    : { completedBlocks: [], assessmentScore: null };
  const next = draftPreview ? nextDraftUnit : curriculum.units.find(
    (candidate) =>
      candidate.order === unit.order + 1 &&
      candidate.status === "published" &&
      getLessonOutline(candidate.id),
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
      {draftPreview && (
        <aside className="notice" role="status">
          <div>
            <strong>개발 미리보기 · 제안 교육과정 초안</strong>
            <p>이 단원은 정본 curriculum에 등록되지 않았습니다. 단계 확인과 연습 기록은 로그인한 계정의 {unit.id} 진도 칸에 저장되지만, 정본 진도나 공식 숙달 판정에는 반영되지 않습니다. 본문·문항·평가는 사람 검수 전입니다.</p>
          </div>
        </aside>
      )}
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
      {doc.learningPhases && (
        <nav className="lesson-phases" aria-label="15단계 학습 경로">
          {doc.learningPhases.map((phase) => (
            <a key={phase.id} href={`#${phase.blockId}`}>
              {phase.title}
              {phase.state === "planned" ? " · 준비 중" : ""}
            </a>
          ))}
        </nav>
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
          {draftPreview ? (
            <p className="helper">검토용 초안 문항은 공식 개념 숙달도에 반영하지 않습니다.</p>
          ) : (
            <div className="mastery-summary">
              <strong>기본 학습 개념별 숙달도</strong>
              {unit.concepts.map((c) => (
                <div key={c.id}>
                  <span>{c.label}</span>
                  <b>{mastery(state?.attempts ?? [], c.id)}%</b>
                </div>
              ))}
              <p>두 개 이상의 독립 정답이 필요해요. 반복·힌트 정답은 낮은 가중치로 기록해요.</p>
            </div>
          )}
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
              <BlockRenderer
                block={block}
                unitId={unit.id}
                initialCollection={initialCollection}
                allowExtension={!!doc.learningPhases}
              />
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
              {draftPreview
                ? `미리보기 블록 확인 ${completed}/${doc.blocks.length} · 초안 형성평가 ${progress.assessmentScore === null ? "미응시" : `${progress.assessmentScore}점`} · 공식 완료 판정 제외`
                : `블록 확인 ${completed}/${doc.blocks.length} · 형성평가 ${progress.assessmentScore ?? 0}점 · 개념별 숙달도 80% 이상 필요`}
            </p>
            {next ? (
              <p>
                다음 단원 · {next.id} {next.title}
              </p>
            ) : (
              <p>{draftPreview ? "다음 단원 미리보기는 아직 준비되지 않았습니다." : "LEVEL 0의 마지막 단원입니다. LEVEL 1은 정본 목록 검토 후 이어집니다."}</p>
            )}
            {((done && !draftPreview) || draftPreview) && next && (
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
