"use client";
import masterDesign from "@/data/master-design.json";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Search } from "lucide-react";
import type { CurriculumProposal } from "@/contracts/curriculum-proposal";

const placementLabels = {
  "first-instruction-candidate": "첫 개념 학습 후보",
  "transfer-candidate": "전이·응용 후보",
  checkpoint: "연결 점검 후보",
  "strategy-practice": "문제해결 전략 연습 후보",
  assessment: "독립 평가 후보",
  "extension-scope-unverified": "공식 범위 미확인 확장 후보",
};
export function CurriculumPlan({
  proposal,
  registeredIds,
  previewIds = [],
}: {
  proposal: CurriculumProposal;
  registeredIds: string[];
  previewIds?: string[];
}) {
  const resultRef = useRef<HTMLParagraphElement>(null);
  const [level, setLevel] = useState("all");
  const [query, setQuery] = useState("");
  const units = proposal.curriculum.units;
  const pathLevels = proposal.learningPath.levels;
  const pathEntries = new Map(
    proposal.learningPath.entries.map((entry) => [entry.unitId, entry]),
  );
  const normalized = query.trim().toLocaleLowerCase("ko");
  const filtered = units.filter(
    (unit) =>
      (level === "all" ||
        pathEntries.get(unit.id)?.pathLevel === Number(level)) &&
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
    anchor.download = `math90-curriculum-proposal-${proposal.version}-path-${proposal.learningPath.version}.json`;
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
            M1-01~M1-15는 로컬 개발 초안 미리보기만 제공합니다. 나머지 미구현 단원은 열리지 않습니다.
          </p>
        </div>
      </aside>
      <aside className="notice">
        <div>
          <strong>새 학습 경로 배치 초안 · 사용자 검토 대기</strong>
          <p>
            요청 기준은 {masterDesign.levels.map((item) => item.count).join(" / ")}
            입니다. 교육 검토 초안은 {pathLevels
              .map((item) => item.proposedCount)
              .join(" / ")}로 배치하고, 확률·통계 추정의 첫 학습을 LEVEL 7에
            유지하기 위해 LEVEL 7/8을 20/18로 조정했습니다. 이 경로는 정본이나
            실제 학습 순서가 아닙니다. LEVEL 1/2 제목과 LEVEL 7/8 수량 조정은
            검토 중입니다.
          </p>
          <details>
            <summary>요청 기준과 제안 경로 비교</summary>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th scope="col">LEVEL</th>
                    <th scope="col">요청 제목</th>
                    <th scope="col">요청 수</th>
                    <th scope="col">경로 제안 제목</th>
                    <th scope="col">제안 수</th>
                  </tr>
                </thead>
                <tbody>
                  {pathLevels.map((item, index) => (
                    <tr key={item.level}>
                      <th scope="row">{item.level}</th>
                      <td>{masterDesign.levels[index].title}</td>
                      <td>{item.requestedCount}</td>
                      <td>{item.title}</td>
                      <td>{item.proposedCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="helper">
              LEVEL 1/2 제목 확장과 LEVEL 7/8 수량 조정은 제안입니다. 공식 원문
              대조와 사용자 검토 전에는 적용하지 않습니다.
            </p>
          </details>
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
          <dt>운영 학습 등록</dt>
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
        {pathLevels.map((item) => (
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
              LEVEL {item.level} · {item.proposedCount}단원
            </span>
            <strong>{item.title}</strong>
            <span>
              {item.requestedCount === item.proposedCount
                ? "요청 수량과 같음"
                : `요청 ${item.requestedCount} · 조정 제안 ${item.proposedCount}`}
            </span>
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
            {pathLevels.map((item) => (
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
          const previewReady = previewIds.includes(unit.id);
          const pathEntry = pathEntries.get(unit.id);
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
                  LEVEL {pathEntry?.pathLevel} · 경로 {pathEntry?.pathOrder}번째
                  <span aria-hidden="true"> · </span>
                  {unit.id} · 기존 분류 LEVEL {unit.level} / {unit.order}번째
                </span>
                <strong>{unit.title}</strong>
                <span className="plan-unit-state">
                  {ready ? "학습 초안 제공" : previewReady ? "개발 미리보기 가능 · 제안 상태" : "설계 제안 · 준비 중"}
                </span>
              </summary>
              <div className="plan-unit-body">
                <h3>경로 배치 검토</h3>
                <p>
                  {pathEntry
                    ? placementLabels[pathEntry.placementKind]
                    : "경로 배치 없음"}
                  . 제안 경로에만 표시되며 정본 등록이나 학습 완료를 뜻하지 않습니다.
                </p>
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
                ) : previewReady ? (
                  <Link href={`/learn/${unit.id}`} className="button secondary">
                    개발 미리보기 열기
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
        <h2>다음 콘텐츠 묶음 · M1-01~M1-15</h2>
        <p>
          정수와 절댓값 → 정수의 곱셈과 나눗셈 → 유리수의 사칙연산 → 거듭제곱과 지수법칙 → 문자식 → 단항식·다항식 → 분배법칙 → 등식 → 일차방정식
        </p>
        <p className="helper">
          M1-01~M1-15는 개발 미리보기 초안입니다. M1-01~M1-10만 별도 형성평가 초안을 포함합니다. 경로·수량 및 콘텐츠 검수 전에는 정본이나 공개 콘텐츠가 아닙니다.
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
