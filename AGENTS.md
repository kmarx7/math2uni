# Math 90 작업 규칙

- 먼저 docs/ARCHITECTURE.md, CURRICULUM.md, CONTENT_SCHEMA.md, QUESTION_BANK.md, ROADMAP.md, AUTH.md를 읽는다.
- 한국어 학습 경험, 접근성, 수학적 정확성을 우선한다. 점수 달성을 보장하지 않는다.
- 단원 ID/순서는 변경하지 않는다. 공식 교육과정 코드와 미제공 170개 단원 목록을 추측하지 않는다.
- 콘텐츠/문제는 src/data, 계약은 src/contracts, 엔진은 src/modules, 화면은 src/components에 둔다.
- question-bank/server.ts는 server-only이다. 공개 DTO에 정답/해설/채점 규칙을 포함하지 않는다.
- 인증은 서버에서 검증하고 DB RLS에 auth.uid() 소유 조건을 적용한다. mock 인증은 테스트 전용 서버에만 둔다.
- 평가 문항은 연습에서 제공하지 않는다. 평가 전체 제출 이후에만 결과를 반환한다.
- AI 문항은 draft부터 시작한다. 자동 검사 후 reviewed로 전환할 수 있으나 사람 승인으로 기록하지 않는다. 개발 preview만 미승인 샘플을 제공할 수 있고 production은 항상 차단한다. 승인자·버전·권리·수학 검증 이력 없이는 공개하지 않는다.
- eval, Function, 임의 수식 실행 금지. 불확실한 채점은 unsupported/invalid로 반환한다.
- 개인정보/서버 비밀을 localStorage에 저장하지 않는다. 현행 학습 화면은 인증 계정을 요구한다. 이전 로컬 프로필을 특정 계정에 자동 합치지 않는다.
- 기능이 달라지는 작업은 feat/* 또는 fix/* 별도 브랜치에서 진행하고 검증 결과와 함께 push한다.
- 변경 후 npm run lint, npm run typecheck, npm test, npm run test:e2e, npm run build를 실행한다.
- 실패/차단된 검증은 통과로 표시하지 않는다. 승인 안 된 콘텐츠는 UI에서 준비 중으로 표시한다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
