# Math 90 마스터 아키텍처

## 목적과 범위

기초가 부족한 학습자의 단계별 자율 학습을 지원한다. 2028학년도 이후 수능 수학 90점 이상은 장기 목표이며 성적 보장이 아니다. 효과는 별도 출처의 독립 모의평가와 학습 기록으로 검증한다. 본 MVP는 LEVEL 0 초안 메타데이터, M0-01 한 단원과 로컬 프로필만 구현한다.

## 초기 프로젝트 검사 / 결정 기록

2026-10-31 작업 디렉터리는 비어 있었다. Node 22, npm을 사용한다. Next.js App Router + TypeScript strict + React, Zod 런타임 스키마, Vitest 단위/계약 검사, Playwright E2E를 사용한다. 설치된 버전은 package-lock.json으로 고정한다. 별도 인증·DB·AI·Python·배포는 이번 범위 밖이다.

원본 170단원 목록이 없으므로 완성 목록을 생성하지 않는다(ADR-001). LEVEL 0의 M0-01 외 항목은 편집 초안이다. 공식 성취기준 연결은 빈 배열이고 검증되지 않은 코드를 넣지 않는다. 미구현 메뉴는 숨기고 향후 수준은 준비 중으로 표시한다.

## 디렉터리

- src/contracts: Zod 스키마, 공유 DTO와 타입 (하위 엔진에 의존하지 않음)
- src/data: 교육과정·블록·서버 전용 문항 원본
- src/modules: 아래 7개 순수 엔진 및 저장소 어댑터
- src/app: 서버 라우팅 및 API 경계
- src/components: 공통 블록 렌더러·학습 화면·대시보드
- tests: 엔진/콘텐츠/API/보안 검사, e2e: 실제 브라우저 흐름

## 모듈 입력·출력·책임 계약

| 모듈              | 입력 → 출력                                                    | 책임 / 허용 의존성                                                                                          |
| ----------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Curriculum        | Curriculum → ValidationReport, unitId → Unit                   | ID/순서/선수 그래프/등록 단원 검사. contracts만                                                             |
| Content           | ContentDocument → 검증 결과, Block[] → 렌더 데이터             | 8종 판별 유니언 블록과 참조 검증. contracts만                                                               |
| Question Bank     | 목적/단원 → PublicProblem[], template+params → ProblemInstance | 원형·템플릿·인스턴스, 사람 승인 필터, 개발 검토 모드와 공개 DTO. contracts, administration, math-validation |
| Math Validation   | AnswerRule+string → Grade                                      | 객관식/정수/유리수의 유계 파싱, 수식은 unsupported. contracts만                                             |
| Assessment        | 문항+응답 → Result[]/점수                                      | 평가 전체 응답 확인, 서버 채점, 피드백. question-bank, math-validation                                      |
| Learning Progress | Attempt[]+개념 → Mastery/Review/Recommendation                 | 힌트/재시도/복습 기록, 규칙 추천. curriculum, contracts                                                     |
| Administration    | 문항+검수기록 → publication eligibility                        | 버전별 승인·권리·검수 이력. contracts만                                                                     |

상위 app이 모듈을 조립한다. 어떤 엔진도 React/라우트에 의존하지 않는다. 의존 그래프를 자동 검사하고 순환을 금지한다.

## 요청과 보안 경계

로컬 `npm run dev`는 MATH90_CONTENT_PREVIEW=1을 설정해 미승인 샘플을 검토용으로 제공한다. NODE_ENV=production에서는 이 플래그를 강제로 무시한다. 검토 배너와 API preview 필드로 상태를 표시한다. 초기 문항은 AI 보조 작성/자동 정합성 검사 상태이며 사람 승인을 만들거나 대행하지 않았다. `src/data/approvals.json`은 비어 있다. 사람 관리자가 버전별 검수 후 저장소 변경으로 승인 이력을 추가해야 운영에 공개된다(ADR-003).

연습: GET /api/practice → 공개 DTO → POST /api/practice {problemId, answer} → 채점 결과와 해설. 오답은 다시 풀기에서 새 attempt로 남긴다.
평가: GET /api/assessment → 평가 전용 공개 DTO → POST /api/assessment {answers} → 모든 문항을 제출한 경우에만 점수/정답/해설 반환. GET/SSR/클라이언트 번들에 평가 정답을 넣지 않는다. 문항 원본은 server-only 진입점에서만 import하고 API DTO는 명시적 allowlist로 만든다. 요청 크기와 답안 길이를 제한하며 비정상 입력에는 400/413을 반환한다. 시험 인증이 없는 MVP이므로 새 세션 재응시/조작 방지와 고부담 시험 보안은 제공하지 않는다. 실전 모의평가 메뉴도 제공하지 않는다.

## 저장소와 마이그레이션 (ADR-002)

ProgressRepository: load(profileId) → ProgressState, save(profileId,state) → void. LocalProgressRepository가 `math90:v1:<profileId>` 키에 JSON을 저장하며 재로드 시 스키마 검증한다. 프로필 UUID로 분리하고 저장 실패/손상은 명시적으로 알린다. 로컬 기록은 본인이 변경 가능하며 서버 검증된 성적이 아니다.

향후 Postgres: learners, units, concepts, prerequisites, content_versions, problem_families, problem_templates, problem_instances, review_events, attempts, assessments, assessment_responses, mastery_snapshots. UUID/고정 단원 ID/버전/created_at을 사용한다. attempts에는 learner_id+id 유일키를 둬 재전송을 멱등 처리한다. 인증 주체 learner_id에 대한 RLS 후 Supabase 어댑터를 교체한다. 검수 이력은 append-only, 게시 버전은 immutable. 현재 Supabase 연결이나 RLS가 구현되었다고 주장하지 않는다.

## 채점과 교육적 한계

유한 길이 숫자를 BigInt 유리수로 비교한다. 임의 수식·eval은 실행하지 않는다. 제한으로 안전성을 확보하되 Python/SymPy 확장은 샌드박스·연산 allowlist·AST 노드/깊이·시간 제한과 불확실 결과 계약을 선행한다. 숙달도는 연습 지표이지 수능 성적 예측이 아니다.

## 검증 및 운영

lint, typecheck, test, test:e2e, build를 독립 실행한다. 모바일·키보드·오답→복습→재시도·새로고침·프로필 분리·평가 사전 정답 비노출을 검사한다. 현재 구현/미구현과 실제 실행 결과는 ROADMAP 및 VERIFICATION에 기록한다.
