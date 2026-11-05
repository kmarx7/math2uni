# M5-04 QA 보고

- lesson schema 등록, 15단계, 6개 소단원, interactive lab, assessment block 0개를 확인했다.
- 연습 6개/원형 3개, 고유 ID·선택지·정답 키, 채점 규칙 및 콘텐츠/문제 연결을 단위 테스트했다.
- 로그 밑 a>0, a≠1 및 모든 진수 양수 조건; 밑 변환 새 밑 조건을 테스트했다.
- 공개 DTO 정답 비공개, production draft 차단, 단원별 진도 격리 테스트를 실행했다.
- 전체 Vitest 23개 파일/175개 테스트, 전용 테스트 9개, content:validate 19개, lint, typecheck, production build, diff-check 통과.
- Playwright E2E는 로컬 테스트 서비스가 `127.0.0.1:54329`에 바인딩될 때 `EPERM`으로 실패해 테스트 시작 전 차단됐다.
- 콘텐츠 검토·공식 매핑·사람 게시 승인 대기. 운영 공개하지 않는다.
