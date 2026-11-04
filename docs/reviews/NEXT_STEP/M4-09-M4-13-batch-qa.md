# M4-09~M4-13 개발 프리뷰 배치 QA

- 브랜치: `feat/m4-batch-03`
- 교육과정 인계: `docs/reviews/NEXT_STEP/M4-09-M4-13-curriculum-review.md`의 `implementation-ready`
- 콘텐츠 상태: 모든 문항/수업 초안은 `draft`; 사람 승인 0, 게시 승인 0
- 범위: M4-09~13 전용 수학 실험실, server-only 연습 데이터 30개, 공통 renderer/프리뷰 등록과 진도 격리

## 단원 구현

| ID | 전용 실험실 | 문제 원형 | 연습 초안 | 평가 |
|---|---|---:|---:|---:|
| M4-09 | 유한집합 벤 다이어그램, 원소/부분집합, 영역별 원소 텍스트 | 3 | 6 | 0 |
| M4-10 | 고정 전체집합의 합·교·여집합·차집합 | 3 | 6 | 0 |
| M4-11 | 유한 정의역에서 진리집합 조작 | 3 | 6 | 0 |
| M4-12 | 원명제·역·이·대우의 진리값과 조건 방향 | 3 | 6 | 0 |
| M4-13 | 정수 사례의 대우 증명과 귀류 흐름 | 3 | 6 | 0 |

집합 diagram은 원소의 실제 membership 조합을 목록으로 분류하여 시각적 배치가 A/B 상태와 어긋나지 않게 한다. 대우 증명은 `n²`이 홀수라고 가정하고 `n`이 짝수라면 `n²`도 짝수라는 모순을 도출한 다음 정수의 홀짝 분류로 결론낸다.

## 검증

| 명령 | 결과 |
|---|---|
| `npm run lint` | 통과 |
| `npm run typecheck` | 통과 |
| `npm test` | 통과 — 20개 파일, 154개 테스트 |
| `npm run content:validate` | 통과 — 3개 파일, 19개 테스트 |
| `npm run test:e2e` | 차단 — Playwright webServer가 `127.0.0.1:54329` listen에서 `EPERM` 반환; 브라우저 테스트는 시작 전 미실행 |
| `npm run build` | 통과 — Next.js 16.3.6 production build |
| `git diff --check` | 통과 |

`tests/e2e/m4-batch-02-preview.spec.ts`는 Desktop Chrome과 iPhone viewport에서 다섯 단원의 학습 화면, 문제 API 공개 DTO, M4-09 연습 저장을 검사하도록 추가했지만 실행환경의 bind 거부로 결과는 미검증이다. 반응형 브라우저 동작을 통과했다고 보고하지 않는다.

기존 전역 bank-count 테스트 두 곳은 새로 등록된 연습 30문항에 맞춰 기대치 420→450, 전체 고유 ID 수 450→480으로만 갱신했다. 단원 동작/기존 의미 assertion을 제거하거나 느슨하게 바꾸지 않았고, 신규 배치 전용 테스트가 5개 단원의 각각 6문항, 3개 원형, 채점 규칙, production 차단, 답안 비노출, lab 렌더 및 진도 격리를 확인한다.

## 보안 및 콘텐츠 한계

- M4-09~13은 `proposal-preview` allowlist에만 추가되며 제안 curriculum/정본 curriculum에는 넣지 않았다.
- 정답, 해설, 채점 규칙은 server-only 데이터에만 남고 assessment 데이터는 추가하지 않았다.
- 연습 기록은 `unitProgress[unitId]`로 격리하며 기존 schemaVersion 1 루트 기록을 보존한다.
- 문항은 자체 제작 초안이며 사람의 교육·수학 검토와 권리 승인, 공식 성취기준 매핑은 대기/미검증 상태다. `approved-content.json`은 모두 `null`이다.
- 지역 도구 기반 정적 렌더/계산 검증은 실제 브라우저·키보드·스크린리더 검수를 대신하지 않는다.
