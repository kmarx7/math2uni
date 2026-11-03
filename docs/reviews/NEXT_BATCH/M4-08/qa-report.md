# M4-08 QA 보고

- 콘텐츠 schema, unit registry, development preview: 통과.
- 연습 문항 6개, 서로 다른 원형 3개, 평가 문항 0개: 확인. 정답 형식은 choice/integer/fraction만 사용한다.
- Curriculum 독립 재계산 및 choice key/skill 연결: 통과; 세부 근거는 [독립 검토](../../NEXT_STEP/M4-04-M4-08-independent-review.md).
- 정답은 server-only 문제 어댑터에 유지되고 public DTO에는 답·해설·채점 규칙이 없다. Production은 draft preview를 차단한다.
- 진도는 `unitProgress[M4-08]`에 격리되며 기존 루트 완료/점수 보존 테스트 통과.
- Lint: 통과. Typecheck: 통과. Vitest: 19개 파일, 148개 테스트 통과.
- E2E: 미실행. Playwright webServer가 `127.0.0.1:54329` bind 시 EPERM을 반환해 브라우저를 시작하지 못했다.
- Production build: 통과 (Next.js 16.3.6). 모바일 실브라우저 확인은 E2E 차단으로 미검증.
- 사람 승인/공식 성취기준 매핑: 없음/미검증.
