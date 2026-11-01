# Math 90 작업 규칙

- 먼저 docs/ARCHITECTURE.md, CURRICULUM.md, CONTENT_SCHEMA.md, QUESTION_BANK.md, ROADMAP.md, DELIVERY_PLAN.md, AUTH.md를 읽는다.
- 한국어 학습 경험, 접근성, 수학적 정확성을 우선한다. 점수 달성을 보장하지 않는다.
- 단원 ID/순서는 변경하지 않는다. 공식 교육과정 코드와 미제공 170개 단원 목록을 추측하지 않는다.
- 170단원 제안안은 docs/CURRICULUM_PROPOSAL.md와 src/data/curriculum-proposal.ts에 별도로 둔다. 구성 확인 전 실서비스 curriculum/채점/진도 경계에 섞거나 정본으로 표시하지 않는다.
- 콘텐츠/문제는 src/data, 계약은 src/contracts, 엔진은 src/modules, 화면은 src/components에 둔다.
- question-bank/server.ts는 server-only이다. 공개 DTO에 정답/해설/채점 규칙을 포함하지 않는다.
- 인증은 서버에서 검증하고 DB RLS에 auth.uid() 소유 조건을 적용한다. mock 인증은 테스트 전용 서버에만 둔다.
- 평가 문항은 연습에서 제공하지 않는다. 평가 전체 제출 이후에만 결과를 반환한다.
- AI 문항은 draft부터 시작한다. 자동 검사 후 reviewed로 전환할 수 있으나 사람 승인으로 기록하지 않는다. 개발 preview만 미승인 샘플을 제공할 수 있고 production은 항상 차단한다. 승인자·버전·권리·수학 검증 이력 없이는 공개하지 않는다.
- eval, Function, 임의 수식 실행 금지. 불확실한 채점은 unsupported/invalid로 반환한다.
- 개인정보/서버 비밀을 localStorage에 저장하지 않는다. 현행 학습 화면은 인증 계정을 요구한다. 이전 로컬 프로필을 특정 계정에 자동 합치지 않는다.
- 기존 계정 데이터의 schemaVersion 1과 M0-01 루트 진도를 보존한다. 새 단원은 unitProgress[unitId]로 격리한다.
- 기능이 달라지는 작업은 feat/* 또는 fix/* 별도 브랜치에서 진행하고 검증 결과와 함께 push한다.
- 변경 후 npm run lint, npm run typecheck, npm test, npm run test:e2e, npm run build를 실행한다.
- 실패/차단된 검증은 통과로 표시하지 않는다. 승인 안 된 콘텐츠는 UI에서 준비 중으로 표시한다.

## 프로젝트 목표와 협업

초등 필수 개념부터 2028학년도 이후 수능 수학의 독립 문제 해결까지 지원한다. 90점은 검증할 목표이며 보장이 아니다. 이 저장소의 Next.js 단일 앱/src 구조와 기존 계정 기능을 유지한다. 요청에 없는 서비스·빈 모노레포 패키지를 만들지 않는다.

| 담당                 | 수정 범위                                                           | 책임                                                         |
| -------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------ |
| Orchestrator         | AGENTS.md, 설정 템플릿, 공유 계약, 통합 파일, 결정·최종 보고        | 파일 소유권 배정, 인계 검증, 충돌 결정, 통합 테스트·push     |
| Curriculum Architect | docs/specifications, docs/curriculum, 배정된 docs/reviews·decisions | 목표·소단원·15단계·선수 관계·설계 검토. 구현 코드 수정 금지  |
| Research & Content   | docs/research, 배정된 src/data 초안·docs/reviews                    | 출처·권리·오개념·원형·문항·검증 입력. 엔진/UI 수정 금지      |
| Developer & QA       | 배정된 src/modules·components·app, tests, scripts, 구현·QA 보고     | 설계 검토된 명세 구현, 독립 정답 검사, 동작·보안·접근성 검증 |

폴더 범위는 역할 지침이다. 실제 파일 소유권은 매 작업에서 명시하고 동일 파일을 병렬 수정하지 않는다. 각 역할은 결과를 파일로 남기며 다른 소유 파일 수정이 필요하면 인계/변경 요청을 한다. 공유 데이터 계약은 src/contracts/handoff.ts와 기존 src/contracts/index.ts를 따른다. 전체 인계는 docs/MULTI_AGENT.md를 기준으로 한다.

- 단원별 lesson-spec, research-report, problem-blueprint, content-draft, validation-report, approved-content, implementation-report, qa-report를 버전과 함께 관리한다. 승인 대기 approved-content에는 승인된 내용 없음(null)을 명시한다.
- draft→researched→reviewed→approved→implemented→tested→published는 운영용 진행 경로다. 개발 preview의 implemented/tested는 콘텐츠 승인과 별도 축으로 관리하여 테스트를 위해 승인 상태를 위조하지 않는다.
- Curriculum의 AI 설계 검토(implementation-ready)는 개발 인계 근거이며 사람의 문항 게시 승인이 아니다. 작성자와 독립 검토자를 구분한다.
- 문항의 고유 ID·기술·원형·난도·목적·버전·출처·권리와 정답/풀이를 검사한다. 숫자만 바꾼 인스턴스는 새 원형으로 세지 않는다. 필수 학습량과 은행 크기를 분리한다.
- 기존 연습·평가 집합은 유지하고 확장 문항은 별도 collection으로 제공한다. 확장 평가 결과가 기존 단원 완료 점수를 덮어쓰지 않게 한다.
- 사용자 최신 LEVEL별 기준은 12/14/18/22/24/20/22/18/20이다. 이전 제안 ID는 참조가 있으므로 재명명하지 않는다. 차이·재배치 안을 결정 문서로 먼저 기록한다.
- 사람 검수 없이 콘텐츠 게시, 운영 배포, 실제 사용자 데이터 삭제/재할당, 기존 참조 ID 변경, 외부 자료의 권리 미확인 재배포는 금지한다. 해당 변경은 구체적 변경안과 근거를 제시한 후 사용자/실제 관리자 승인 없이는 실행하지 않는다. 이미 요청된 브랜치 생성·검증 후 push와 되돌릴 수 있는 개발 작업은 반복 승인 요청하지 않는다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
