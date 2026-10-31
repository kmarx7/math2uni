"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Search } from "lucide-react";
import type { CurriculumProposal } from "@/contracts/curriculum-proposal";

const roles = {
  foundation: "선수 기반",
  target: "수능 과목 대비",
  integration: "통합·평가",
};
export function CurriculumPlan({
  proposal,
  registeredIds,
}: {
  proposal: CurriculumProposal;
  registeredIds: string[];
}) {
  const resultRef = useRef<HTMLParagraphElement>(null);
  const [level, setLevel] = useState("all");
  const [query, setQuery] = useState("");
  const units = proposal.curriculum.units;
  const normalized = query.trim().toLocaleLowerCase("ko");
  const filtered = units.filter(
    (unit) =>
      (level === "all" || unit.level === Number(level)) &&
      [
        unit.id,
        unit.title,
        ...unit.objectives,
        ...unit.concepts.map((concept) => concept.label),
      ]
        .join(" ")
        .toLocaleLowerCase("ko")
        .includes(normalized),
  );
  const implemented = units.filter((unit) =>
    registeredIds.includes(unit.id),
  ).length;
  const conceptOwners = new Map(
    units.flatMap((unit) =>
      unit.concepts.map((concept) => [concept.id, unit] as const),
    ),
  );
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(proposal, null, 2)], {
        type: "application/json;charset=utf-8",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `math90-curriculum-proposal-${proposal.version}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="page course-plan">
      <Link href="/curriculum" className="back-link">
        <ArrowLeft size={15} />
        학습 커리큘럼으로
      </Link>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            CURRICULUM PROPOSAL · v{proposal.version}
          </div>
          <h1>170단원 전체 학습 계획</h1>
          <p>
            기초 연산에서 대수·미적분Ⅰ·확률과 통계, 독립 평가까지 이어지는 구성
            제안입니다.
          </p>
        </div>
        <button type="button" className="button secondary" onClick={download}>
          <Download size={16} />
          제안안 JSON 내려받기
        </button>
      </div>
      <aside className="notice">
        <div>
          <strong>정본 확정 전 제안안 · 콘텐츠 완성과 다릅니다</strong>
          <p>
            기존 12단원을 유지하고 나머지 158단원의 구성을 제안합니다. 공식
            성취기준 코드는 미연결이며, 사람 검수와 구성 확인을 거쳐 확정합니다.
            미구현 단원은 학습할 수 없습니다.
          </p>
        </div>
      </aside>
      <dl className="plan-stats">
        <div>
          <dt>구성 제안</dt>
          <dd>
            {units.length}
            <small>단원</small>
          </dd>
        </div>
        <div>
          <dt>학습 콘텐츠 초안</dt>
          <dd>
            {implemented}
            <small>단원</small>
          </dd>
        </div>
        <div>
          <dt>콘텐츠 준비 중</dt>
          <dd>
            {units.length - implemented}
            <small>단원</small>
          </dd>
        </div>
      </dl>
      <section className="plan-levels" aria-label="LEVEL별 구성">
        {proposal.levels.map((item) => (
          <button
            type="button"
            key={item.level}
            aria-pressed={level === String(item.level)}
            onClick={() => {
              setLevel(String(item.level));
              setQuery("");
            }}
          >
            <span className="eyebrow">
              LEVEL {item.level} · {item.count}단원
            </span>
            <strong>{item.title}</strong>
            <span>{roles[item.role]}</span>
          </button>
        ))}
      </section>
      <div className="plan-toolbar">
        <label className="plan-search">
          <span>
            <Search size={16} />
            단원 검색
          </span>
          <input
            type="search"
            value={query}
            placeholder="단원명, 개념, ID 검색"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          LEVEL 필터
          <select
            value={level}
            onChange={(event) => setLevel(event.target.value)}
          >
            <option value="all">전체 LEVEL</option>
            {proposal.levels.map((item) => (
              <option key={item.level} value={item.level}>
                LEVEL {item.level}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="button secondary"
          onClick={() => {
            setLevel("all");
            setQuery("");
          }}
        >
          전체 목록 보기
        </button>
      </div>
      <p className="plan-result" role="status" tabIndex={-1} ref={resultRef}>
        {filtered.length}개 단원 표시 / 전체 {units.length}개 제안
      </p>
      {filtered.length === 0 && (
        <div className="card empty-state">
          <h2>검색 결과가 없어요</h2>
          <p>검색어 또는 LEVEL 필터를 바꾸어 주세요.</p>
        </div>
      )}
      <div className="plan-units">
        {filtered.map((unit) => {
          const ready = registeredIds.includes(unit.id);
          const prerequisites = [
            ...new Map(
              unit.prerequisites.flatMap((id) => {
                const owner = conceptOwners.get(id);
                return owner ? [[owner.id, owner] as const] : [];
              }),
            ).values(),
          ];
          return (
            <details
              className="card plan-unit"
              key={unit.id}
              id={`plan-${unit.id}`}
            >
              <summary>
                <span className="eyebrow">
                  {unit.order} · {unit.id}
                </span>
                <strong>{unit.title}</strong>
                <span className="plan-unit-state">
                  {ready ? "학습 초안 제공" : "설계 제안 · 준비 중"}
                </span>
              </summary>
              <div className="plan-unit-body">
                <h3>학습 목표</h3>
                <ul>
                  {unit.objectives.map((goal) => (
                    <li key={goal}>{goal}</li>
                  ))}
                </ul>
                <h3>핵심 개념 · 문제 유형</h3>
                <p>
                  {unit.concepts.map((concept) => concept.label).join(" · ")}
                </p>
                <h3>선수 단원</h3>
                {prerequisites.length ? (
                  <div className="prerequisite-links">
                    {prerequisites.map((previous) => (
                      <button
                        type="button"
                        className="button secondary"
                        key={previous.id}
                        onClick={() => {
                          setLevel("all");
                          setQuery(previous.id);
                          resultRef.current?.focus();
                        }}
                      >
                        {previous.id} · {previous.title} 보기
                      </button>
                    ))}
                  </div>
                ) : (
                  <p>별도 선수 단원 없음</p>
                )}
                <p className="helper">
                  필요한 선수 개념:{" "}
                  {unit.prerequisites
                    .map(
                      (id) =>
                        conceptOwners
                          .get(id)
                          ?.concepts.find((concept) => concept.id === id)
                          ?.label ?? id,
                    )
                    .join(" · ") || "없음"}
                </p>
                <h3>추천 시각화</h3>
                <p>{unit.visualization.join(" · ")}</p>
                <h3>평가 계획</h3>
                <p>{unit.assessmentPlan}</p>
                <p className="helper">공식 성취기준 매핑: 미검증 · 미연결</p>
                {ready ? (
                  <Link href={`/learn/${unit.id}`} className="button">
                    콘텐츠 초안 살펴보기
                  </Link>
                ) : (
                  <p className="helper">
                    본문·실험·연습·평가는 다음 콘텐츠 구현 단계에서 작성합니다.
                  </p>
                )}
              </div>
            </details>
          );
        })}
      </div>
      <section className="card plan-next">
        <h2>다음 콘텐츠 묶음 · LEVEL 1 첫 5단원</h2>
        <p>
          정수와 절댓값 → 정수의 곱셈과 나눗셈 → 유리수의 사칙연산 → 거듭제곱과
          지수법칙 기초 → 문자와 식의 값
        </p>
        <p className="helper">
          제안안의 구성 확인 후 M1-01~M1-05부터 학습 흐름을 구현합니다. 제안
          ID는 확정 전이며 기존 학습 ID는 유지합니다.
        </p>
      </section>
      <section className="card plan-sources">
        <h2>설계 참고 자료</h2>
        <p>
          자료는 과목 범위와 용어를 확인하는 근거입니다. 170단원
          구성·수량·순서는 Math 90의 교육 설계 제안입니다.
        </p>
        <ul>
          {proposal.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.title} ↗
              </a>
              <p className="helper">{source.purpose}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
