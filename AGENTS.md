# Math 90 작업 규칙

- 먼저 docs/ARCHITECTURE.md, CURRICULUM.md, CONTENT_SCHEMA.md, QUESTION_BANK.md, ROADMAP.md를 읽는다.
- 한국어 학습 경험, 접근성, 수학적 정확성을 우선한다. 점수 달성을 보장하지 않는다.
- 단원 ID/순서는 변경하지 않는다. 공식 교육과정 코드와 미제공 170개 단원 목록을 추측하지 않는다.
- 콘텐츠/문제는 src/data, 계약은 src/contracts, 엔진은 src/modules, 화면은 src/components에 둔다.
- question-bank/server.ts는 server-only이다. 공개 DTO에 정답/해설/채점 규칙을 포함하지 않는다.
- 평가 문항은 연습에서 제공하지 않는다. 평가 전체 제출 이후에만 결과를 반환한다.
- AI 문항은 draft부터 시작한다. 승인자·버전·권리·수학 검증 이력 없이는 공개하지 않는다.
- eval, Function, 임의 수식 실행 금지. 불확실한 채점은 unsupported/invalid로 반환한다.
- 개인정보/서버 비밀을 localStorage에 저장하지 않는다. MVP 로컬 프로필은 인증 계정이 아니다.
- 변경 후 npm run lint, npm run typecheck, npm test, npm run test:e2e, npm run build를 실행한다.
- 실패/차단된 검증은 통과로 표시하지 않는다. 승인 안 된 콘텐츠는 UI에서 준비 중으로 표시한다.
