# Developer 사전 점검 — M5-24, M6-01~04

- Worktree/branch: /private/tmp/math90-m6-batch-01-clean, feat/m6-batch-01
- 점검 시점: 2026-11-07
- 상태: read-only 구조 조사 완료. Curriculum/Research 교차검토와 Orchestrator 구현 승인 전까지 구현 대기.
- 검사 범위: 기존 registry/security/progress 패턴, M6 proposal metadata, Next.js 16.3.6 문서. 기능 코드는 변경하지 않음.

## 현재 입력 상태

- M5-24는 대수 연결 점검: 함수의 증감·식 변환, 수열 조건·논리적 증명, 시각화는 함수와 수열 전략 지도.
- M6-01 함수의 극한의 뜻: 좌극한·우극한 및 극한 존재 조건. 선수 M4-15, M2-13. 시각화는 점에 가까워지는 그래프.
- M6-02 극한의 성질과 계산: 극한의 사칙연산 및 인수분해·약분. 선수 M6-01, M3-07. 시각화는 구멍이 있는 그래프.
- M6-03 극한의 대소 관계: 대소 관계 보존 및 샌드위치 원리. 선수 M6-02, M3-17. 시각화는 두 함수 사이의 그래프.
- M6-04 함수의 연속: 연속의 정의와 구간에서의 연속. 선수 M6-02. 시각화는 그래프 연결과 끊김.
- 위 내용은 제안 metadata다. 현재 M6-01~04 lesson specs, Research report/blueprint, renderer content draft, runtime draft가 없다. 구체 목표·단계·답 키 인계 전에는 문항과 UI 행동을 확정하지 않는다.
- 선수 단원은 안내·진단에만 쓰며 canonical prerequisite graph, 숙달도, 완료 점수에는 연결하지 않는다.

## 재사용 패턴

- Proposal lesson은 src/data/proposal-lessons/index.ts에서 schema 검증하고 proposal-preview-manifest.ts allowlist를 통과한다. src/modules/content/preview-server.ts는 NODE_ENV=development 및 MATH90_CONTENT_PREVIEW=1일 때만 draft lesson을 반환한다.
- Proposal problems는 server-only adapter에서 blueprint로 구성한다. src/modules/question-bank/server.ts의 privateProblems/publicProblems가 collection과 환경을 확인하며 DTO에서 answerRule, 정답 표시, 해설, 풀이 단계를 제외한다.
- 신규 단원은 proposal-preview 연습 집합만 사용하고 평가 문항은 0개다. 기존 인증/API 저장 경로와 unitProgress[unitId]를 사용하며 M0 루트 점수/진도는 건드리지 않는다.
- M5-19~23 pattern: src/modules/math-validation/m5-19-m5-23-preview.ts의 고정 enum·bounded numeric 범위, src/components/m5-19-m5-23-preview-labs.tsx의 labeled controls·aria-live 상태·표/버튼, src/components/math-lab.tsx의 unit dispatch.
- 테스트 기준은 tests/m5-batch-05-preview.test.ts와 tests/e2e/m5-batch-05-preview.spec.ts다: 런타임 JSON/schema, phase/blocks, draft 문항/가족, 정답 비노출, production fail-closed, progress 격리, 좁은 viewport overflow를 확인한다. E2E auth 서버는 127.0.0.1:54329에 bind하며 이 환경에서 EPERM이 발생할 수 있다.
- M6 worktree에는 node_modules가 없다. package-lock에서 Next 16.3.6을 확인하고 동일 설치의 M5 batch-03 node_modules/next/dist/docs를 읽었다.

## Next.js 16.3.6 문서

- 01-app/02-guides/server-and-client-boundary.md: client module graph에 들어온 코드는 browser bundle로 갈 수 있고 Server→Client props는 직렬화되어 전송된다. 정답/채점 정보는 client import와 props에서 제외한다. Client Component도 서버에서 초기 렌더되므로 첫 markup은 deterministic해야 한다.
- 01-app/03-api-reference/01-directives/use-client.md: interactive entry에만 use client를 두고 경계 props는 직렬화 가능해야 한다.
- 01-app/01-getting-started/15-route-handlers.md: Route Handler는 Web Request/Response를 사용한다. GET은 별도 설정 없이는 캐시하지 않는다. 기존 API/auth/data layer를 재사용하고 route나 caching을 임의 추가하지 않는다.
- 01-app/02-guides/data-security.md: server-only DAL은 권한을 확인하고 최소 DTO만 반환한다. server-only 표식과 인증 경계를 보존한다.

## 개발 전 수학·UX 위험

### 극한 표기와 자동 채점

- 좌극한·우극한·양쪽 극한을 구분하고, 양쪽 극한 존재 조건을 명세에서 고정한다. 그래프의 점 함수값과 주변 접근값은 다른 표식·텍스트로 표현한다.
- 수치 sample이 특정 점에 가까워지는 사실만으로 극한 값/존재를 자동판정하지 않는다. 미리 정의하고 검증한 함수 family와 정확한 답 키만 자동 채점한다. 임의 수식, 문자열 수식 실행, eval/Function, 일반 수식 parser는 금지한다.
- 좌우 불일치, 진동, 수직 점근, hole, 극한과 함수값 불일치 등 사례별 답과 풀이를 연구·교차검토에서 확인한다. 지원 불가 형식은 unsupported/invalid; 불확실한 답을 정답 처리하지 않는다.
- M6-02 약분은 원래 함수의 정의역 제외값을 보존한다. 0/0 제거, hole의 함수값, 극한값을 혼합하지 않는다. 나눗셈 분모 비영 조건도 검증한다.

### 그래프·표와 연속

- bounded finite 구간·계수·sample 수를 고정한다. 무제한 확대/반복과 사용자 expression을 받지 않는다. 표에서 접근값과 점 함수값을 분리하고, 반올림은 근삿값/시각화임을 표시한다. 부동소수 비교는 화면 시각화에만 쓰고 answer key 판정에 쓰지 않는다.
- 색 외에 텍스트/표로 hole, filled point, 좌우 추세와 축을 구분한다. 키보드 조작, label/버튼 이름, 좁은 화면 overflow를 검사한다.
- 점에서의 연속은 함수값 정의, 양쪽 극한 존재, 극한과 함수값 일치의 세 조건을 별도로 다룬다. 구간 내부와 끝점의 one-sided continuity 규약을 명세에서 고정한다.
- piecewise 경계에서 좌극한·우극한·실제 함수값을 구분한다. removable hole, jump, 점 값만 다른 사례, 발산·진동 사례를 나눈다. 정리의 가정을 생략하지 않는다.

## 예상 Developer 파일과 권한

Orchestrator가 착수 때 소유 경로를 확정해야 한다. 예상 범위:

- src/modules/math-validation/m6-01-m6-04-preview.ts
- src/components/m6-01-m6-04-preview-labs.tsx, src/components/math-lab.tsx
- src/data/proposal-m6-01-m6-04-problems.ts
- src/data/proposal-lessons/index.ts, src/data/proposal-preview-manifest.ts, src/data/proposal-problems.ts
- tests/m6-batch-01-preview.test.ts, tests/e2e/m6-batch-01-preview.spec.ts
- 단원별 docs/reviews/NEXT_BATCH/M6-01~M6-04/{implementation-report.md,qa-report.md,approved-content.json}

InteractiveBlock interaction enum은 Orchestrator 소유이므로 신규 값이 필요하면 먼저 계약 변경·parse 검증을 요청한다. Curriculum/Research 문서나 draft를 직접 수정하지 않는다. 문항 수학 오류는 단원/문항/재현 계산과 함께 수정 요청으로 전달한다.

## 구현 착수 조건

1. 6 subunits/15 phases 등 검토 완료 lesson spec과 schema-valid renderer draft.
2. Research source/rights report와 3 families × 6 practice draft, semantic answers 및 채점 지원 범위.
3. Curriculum 독립 검토의 정답·풀이·원형 cross-review와 implementation-ready 기록.
4. Orchestrator가 구현 범위·파일 소유권·interaction enum 의존성을 승인.

현재는 이 gate 전이므로 코드/registry/contract 변경과 문항 공개를 하지 않는다. 사람 승인 전 approved-content는 null/pending, 승인자 null이어야 한다. 자동/AI 교차검토는 사람 게시 승인이 아니다.
