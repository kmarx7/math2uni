# M5-14~M5-18 Developer 사전 구현 계획

- 상태: 읽기 전용 준비 검토. 구현 인계 승인 아님.
- 작업 기준: `feat/m5-batch-08`, 기준 커밋 `3b83bb1`.
- 검토일: 2026-11-07.

## 현재 인계 상태

Curriculum 명세와 renderer 구조 초안은 `docs/specifications/NEXT_BATCH/M5-14..18/`에 있다. 각 단원은 6개 소단원, 15개 학습 단계, 3개 원형 계획, 연습 초안 목표 6개, 평가 인스턴스 0개, 공식 기준 미연결로 작성되어 있다. `implementationReadiness.status`는 모두 `pending-research-review`, `publicationReady`는 false다.

Research 보고서와 출처 목록은 `docs/research/NEXT_BATCH/M5-14..18/`에 있으나 보고서 상태는 draft다. 문제 청사진과 자체 제작 문항, 검증 입력 및 독립 Curriculum 교차 검토는 아직 확인되지 않았다. renderer JSON은 specification 경로의 `content-draft.json`이며 `src/data/proposal-lessons/drafts/M5-14..18.json`의 런타임 lesson 파일은 아직 없다.

## 계약 차단 사항

각 `content-draft.json`의 InteractiveBlock은 `m5-14-visual` ... `m5-18-visual`을 사용한다. 현행 `src/contracts/index.ts`의 `blockSchema` interaction enum에는 이 값이 없으므로 현재 파일을 곧바로 `contentSchema`로 파싱하면 거부된다. Curriculum/Research 소유 파일을 개발자가 조용히 수정하지 않는다. Orchestrator가 계약 소유자 및 콘텐츠 작성자와 협의해 다음 중 하나를 확정해야 한다.

1. shared block contract의 허용 목록에 다섯 고유 interaction ID를 정식 추가하고 계약 테스트를 보강한다.
2. 콘텐츠 작성자가 현재 의미와 호환되는 기존 interaction 값 사용을 확인하고 renderer JSON을 갱신한다.

단원 ID 기준으로 lab dispatch가 되더라도 데이터 계약은 별도로 유효해야 한다. 이 이슈를 해결하고 다섯 renderer 파일과 런타임 파일 간 object equality를 검증하기 전에는 registry 연결을 완료할 수 없다.

## 검토된 교육 명세의 구현 윤곽

- **M5-14 삼각함수의 그래프:** 단위원의 기본 좌표와 기준점 표, `a,b,h,k` 조작, 진폭·중심선·극값·주기·이동 표시. `b=0`이면 주기 공식을 적용하지 않고, `a=0` 상수 함수의 주기 설명을 명세에서 결정해야 한다. 그래프는 설치된 Next/React/CSS로 제한된 표본점과 SVG/HTML로 표현 가능하며 새 chart 의존성을 전제하지 않는다.
- **M5-15 삼각방정식과 부등식:** 정해진 구간의 sin/cos/tan 해, 일반해의 주기 표기, 부등식 해 구간을 분리한다. 모든 입력을 유한한 허용 함수/특수값으로 제한하고, 열린·닫힌 끝점, `[0,2π)` 대 `[0,2π]`, tan의 `π/2+kπ` 제외, 일반해와 구간 해의 차이를 명시한다.
- **M5-16 사인법칙:** 대응하는 맞은편 변·각, `a=2R sin A`, 비례식 계산을 구현한다. SSA 입력에서는 역사인 주값만 반환하지 말고 해가 0/1/2개인 모호한 경우를 분기한다. 각의 합·각 범위·대변 대응으로 후보를 검산한다.
- **M5-17 코사인법칙:** 두 변과 끼인각으로 양의 대변 길이를 계산하고, 세 변에서 각을 복원한다. 계산 전 양의 변과 엄격한 삼각형 부등식을 검사한다. `acos` 입력의 수치 허용 오차 정책을 정하고 불가능 값은 임의 clamp하지 않는다. 도/라디안 표시를 고정한다.
- **M5-18 삼각형 넓이와 활용:** `K=½ab sin C` 및 자료 구조에 따른 법칙 선택을 다룬다. `C`가 실제 끼인각이며 `0<C<π`인지, 넓이 단위가 길이 단위 제곱인지, 반올림 표기를 어떻게 처리할지 명시한다.

모든 helper는 유한 숫자·범위가 제한된 입력·고정된 선택지에만 동작하는 순수 함수로 둔다. `eval`, 임의 수식 파싱, 무제한 주기해 열거는 금지한다. 수치 오차나 조건 모호성으로 판정이 불확실하면 자동 정답 대신 unsupported/invalid 경로를 사용한다.

## 구현 게이트 이후 Developer 소유 파일 제안

- helper: `src/modules/math-validation/m5-14-m5-18-preview.ts`
- labs: `src/components/m5-14-m5-18-preview-labs.tsx`
- server-only 문제 adapter: `src/data/proposal-m5-14-m5-18-problems.ts`
- registry 통합: `src/components/math-lab.tsx`, `src/data/proposal-lessons/index.ts`, `src/data/proposal-preview-manifest.ts`, `src/data/proposal-problems.ts`
- QA: `tests/m5-batch-04-preview.test.ts`, `tests/e2e/m5-batch-04-preview.spec.ts`
- 단원 보고서: `docs/reviews/NEXT_BATCH/M5-14..18/{implementation-report.md,qa-report.md,approved-content.json}`. 승인 대기 상태는 `approvedContent: null`, 사람 승인 0, 게시 false로 유지한다.

검증은 각 단원 lesson/schema/phase/블록 연결, blueprint↔lesson 기술·버전 연결, 30개 practice ID/정답·해설, assessment 0, 공개 DTO 정답 redaction, development+preview flag gate 및 production 차단, 모바일 화면·접근성·unitProgress 격리를 포함한다. 기존 aggregate 문항 수 assertion 변경은 Orchestrator 소유 통합 작업으로 분리한다.

Next.js 관련 코드 작성 전 설치 문서 `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`, `01-app/02-guides/server-and-client-boundary.md`, `01-app/03-api-reference/01-directives/use-client.md`를 확인한다. 새 `use client` 컴포넌트에는 직렬화 가능한 props만 전달하고 server-only 문항 원본을 import하지 않는다.

## 구현 전 필수 인계

1. Research가 단원별 `problem-blueprint.json`, 6개 draft item, provenance/rights, 검증 근거를 작성한다.
2. Curriculum이 Research 문항과 콘텐츠를 교차 검토하고 설계 충돌·수학 수정 사항을 반영한다.
3. 독립 검토 후 `implementationReadiness.status=implementation-ready`와 검토 근거가 기록된다. 이는 사람 게시 승인이 아니다.
4. 공유 interaction schema blocker를 담당 소유자가 해결하고, renderer draft와 runtime JSON 간 동등성을 확인한다.
5. Parent가 Developer 소유 파일을 확정한 뒤 구현을 시작한다. 현재 초안의 수학 설명만을 근거로 답/문항을 생성하거나 게시 상태를 올리지 않는다.

## 사전 계획 후속 상태 — 구현 완료

이 섹션은 위의 사전 검토 시점 상태를 갱신하며, 당시 기록은 역사적 검토로 보존한다.

- Orchestrator가 `m5-14-visual`~`m5-18-visual` interaction ID를 공유 block contract에 추가했다. 해당 runtime lesson JSON은 specification의 renderer draft와 일치하고 contract parse를 통과했다.
- Curriculum/Research 교차 검토에서 구현 인계를 승인했다. 문항 30/30 재계산과 family 구분을 확인했으나 이는 AI 검토이며 사람 게시 승인이 아니다.
- Developer 구현을 완료했다. 각 단원 구현·QA·승인 대기 자료는 `docs/reviews/NEXT_BATCH/M5-14/`부터 `M5-18/`에 있다.
- 최종 검증: focused+handoff 17 tests, 전체 192 tests, content validation 30 tests, lint, typecheck, python3.11 agent config validation, diff check, Turbopack build 통과. Agent runtime discovery는 테스트하지 않음.
- E2E는 browser test 시작 전에 `listen EPERM: operation not permitted 127.0.0.1:54329`로 차단됐다.
- 문항은 draft, 승인 대기 `approvedContent: null`, 사람 승인 0, 평가 문항 0, 게시 승인 false 상태다.
