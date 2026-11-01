# Math 90 마스터 아키텍처

## 목적과 범위

기초가 부족한 학습자의 단계별 자율 학습을 지원한다. 2028학년도 이후 수능 수학 90점 이상은 장기 목표이며 성적 보장이 아니다. 효과는 별도 출처의 독립 모의평가와 학습 기록으로 검증한다. 현행 구현은 LEVEL 0 12개 콘텐츠 초안과 인증 계정별 학습 기록이다. 아래 초기 결정은 역사 기록이며 후속 ADR-004/005가 현행 범위를 정의한다.

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

## ADR-004 · 계정 기능 확장 (2026-10-31)

후속 사용자 요청으로 인증과 계정별 서버 기록을 추가했다. 위의 최초 MVP 범위와 로컬 저장 설명은 초기 설계 기록이며 현행 학습 화면은 인증을 필수로 한다. auth 서버 경계, Supabase PostgreSQL CAS 저장소, RLS 마이그레이션과 검증 상태는 [AUTH.md](AUTH.md)를 기준으로 한다. 후속 동의로 서울 리전의 Math 90 전용 Supabase에 연결했으며 실제 RLS 소유권 검사와 advisors를 통과했다. 자세한 상태와 사용자 이메일 확인 범위는 AUTH.md에 기록한다. 비밀번호/토큰은 localStorage에 저장하지 않는다.

## ADR-005 · LEVEL 0 다단원 확장 (2026-11-01)

사용자의 170단원 단계별 완성 요청에 따라 먼저 기존 LEVEL 0 12개 항목에 실제 콘텐츠를 연결한다. 정본 미제공 목록을 추측해 ID를 생성하지 않는다. 이후 묶음의 완료 조건은 [DELIVERY_PLAN.md](DELIVERY_PLAN.md)에 기록한다.

Content는 getLesson(unitId), Bank는 목적+unitId, API는 검증된 unitId를 사용한다. 학습 데이터는 `unitProgress[unitId] = {completedBlocks, assessmentScore}` 및 Attempt.unitId를 추가한다. 기존 schemaVersion 1과 루트 completedBlocks/assessmentScore는 유지하며 M0-01에만 대응한다. 과거 unitId 없는 시도도 M0-01로 읽는다. 다른 단원 점수가 기존 기록을 덮어쓰지 않는다. JSONB 스냅샷의 가산 필드이므로 이번 작업에는 DB DDL 변경이 없다. 소유권 RLS와 CAS 저장은 그대로 적용한다.

공통 화면에서 선수 미숙 개념을 제공하는 단원으로 연결한다. 블록 확인·세 개념 숙달·평가 기준 충족 후 다음 등록 단원을 안내한다. 마지막 단원 이후 미등록 LEVEL은 준비 상태를 표시한다. production의 사람 승인 게이트는 유지한다.

## ADR-006 · 170단원 제안안과 학습 등록 분리 (2026-11-01)

원본 전체 목록은 미제공 상태이므로 다음 단계는 검토 가능한 전체 교육과정 제안안이다. `curriculum-proposal.ts`는 기존 12단원을 복사하고 신규 158개 메타데이터를 합치되 정본으로 등록하지 않는다. 명시된 기준 버전과 기존 단원 전체 필드 보존을 검증한다. `status: proposed`, `coverage: partial`, 빈 canonicalManifest를 계약으로 강제한다. 170개 수량/ID/순서/LEVEL 수량/선수 개념/순환/중복 제목/미승인 공개/공식 코드 미연결을 검사한다.

`/curriculum/plan`은 기존 인증 레이아웃 아래 읽기 전용 계획 화면이다. 서버가 제안 데이터를 검증하고 공개 메타데이터만 클라이언트에 전달한다. 검색·필터·선수 단원 탐색·JSON 내려받기는 브라우저 상태만 바꾸며 DB/진도/승인을 기록하지 않는다. 제안 모듈은 학습·채점·진도·인증 경계에 import하지 않는다. 기존 운영 목록은 12개이고 미구현 학습 경로는 404를 유지한다.

학습 완료·콘텐츠 초안·교육과정 구성 제안·사람의 게시 승인은 각각 다른 상태다. 제안안 확인 후 ID/순서 manifest와 변경 근거를 확정하고 M1-01~M1-05부터 실제 콘텐츠를 추가한다. [CURRICULUM_PROPOSAL.md](CURRICULUM_PROPOSAL.md)에 전체 목록과 근거를 기록했다.

## ADR-008 · 전문 역할과 인계 품질 검사

세 전문 서브에이전트를 실제 실행해 파일 소유권을 분리했다. 설치 CLI 0.166.0은 multi_agent stable/true이다. 사용자가 standalone 역할 TOML 세 개와 공통 설정을 프로젝트 `.codex/`에 설치했으며 `agents:validate`에서 템플릿과의 일치를 확인한다. 실제 CLI 에이전트 호출은 app-server 초기화 권한 오류로 미검증이다. 역할별 책임·실제 산출물·순차 대안은 [MULTI_AGENT.md](MULTI_AGENT.md)에 기록한다.

기존 단일 Next 앱 구조를 유지하며 새 외부 서비스/의존성을 추가하지 않는다. Content Quality Validator를 src/modules/content-quality에 추가하고 기존 Review Engine은 progress의 복습 함수로 유지한다. 공통 인계는 버전/해시·6소단원·15단계·문항 수·원형/기술/난도·검토 상태를 검사한다. 운영 단계 경로와 개발 preview의 구현/테스트 상태를 분리하고 승인 대기 콘텐츠에는 approvedContent=null을 명시한다.

core/extended 은행·API·화면을 분리하고 확장 시도의 collection을 저장한다. 기존 schemaVersion 1에서 필드는 선택적이며 과거 기록은 core로 읽는다. 기본 숙달 함수는 extended를 제외하고 확장 평가는 기본 점수를 갱신하지 않는다. 전체 시도/오답/복습에는 확장을 포함한다. 이 변경은 DB DDL이나 사용자 기록 초기화를 요구하지 않는다.

최신 LEVEL 수량 기준은 master-design.json에 기록했다. 기존 170제안을 재번호화하지 않으며 상세 재배치는 [ADR-007](decisions/007-level-allocation.md)의 검토 대상이다.

M0-01 신규 설명/조작의 공개 경계도 서버의 lessonForDelivery로 분리했다. 개발 검토에서는 확장 문서를 전달하고 production에서는 보존된 v1.0.0 문서를 사용한다. 클라이언트용 content-index에는 단원/블록 ID만 두며 실제 문서와 일치하는지 검사한다. 따라서 신규 초안 설명을 클라이언트 공유 모듈에서 직접 가져오지 않는다.
