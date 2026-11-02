# M3-01 QA 보고서

- Vitest 콘텐츠 계약: 통과 (전체 테스트 108개 중 M3 데이터/경계 포함).
- Zod 콘텐츠/인터랙션 계약: 통과. Production preview gate와 answer-free 공개 DTO 경계: 통과.
- 독립 브라우저 조작/E2E: 미검증. Playwright 인증 테스트 서버가 `127.0.0.1:54329`에서 `EPERM`으로 bind를 거부했다.
- 문항 초안 6개, 원형 2개, 평가 문항 0개. 정답은 자동 채점과 콘텐츠 데이터 기반 확인이며 사람 검수는 아니다.
- 사람 승인 0건, 공식 성취기준 매핑 미검증, production 게시 불가.

전체 명령별 결과: [M3 배치 QA](../M3-batch-01-qa.md).

UI 회귀 보완에서는 0항·계수 ±1·음수 부호 렌더링을 검증하는 SSR focused assertion을 추가했다. 실제 브라우저 키 입력 조작은 E2E 미검증이다. 전체 Vitest 113 tests, lint, typecheck, content validation, production build는 통과했다. E2E 브라우저 조작은 인증 테스트 서버 bind EPERM으로 미검증 상태다.

최종 재실행: 2026-11-02 UI 보완 반영 후 Orchestrator가 `npm run test:e2e`를 다시 실행했으나, auth test server `127.0.0.1:54329` listen에서 동일 `EPERM`으로 차단되었다. 브라우저 동작은 미검증이다.
