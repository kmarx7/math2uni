# M3-20 QA 보고

- lesson JSON 스키마·interaction 등록: 통과
- 문항 ID·기술 연결·정답 규칙 및 해설: 자동 검사 통과; 독립 수학 검토는 인계 보고서 참조
- 연습 문항 6개, 서로 다른 원형 3개, 평가 문항 0개: 확인
- server-only 정답·공개 DTO 비노출·production 미리보기 차단: 통과
- `unitProgress[M3-20]` 기록 경계: 통과
- lint, typecheck, Vitest 133개, content:validate 19개, production build: 통과
- Playwright E2E: 미실행. 인증 테스트 서비스가 `127.0.0.1:54329` bind 시 EPERM으로 시작하지 못함
- 사람의 게시 승인·공식 교육과정 매핑: 없음/미검증
