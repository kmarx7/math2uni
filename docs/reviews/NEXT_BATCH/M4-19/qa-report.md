# M4-19 QA 보고

- lesson schema, 15단계, 6개 소단원 및 개발 preview 등록을 검사했다.
- 연습 6개/원형 3개/평가 0개, draft 상태, 선택지 키·정답 규칙 연결을 검사했다.
- 공개 DTO의 정답 비공개, production draft 차단, 단원 진도 격리를 검사했다.
- 실수 근호의 경계 포함, 계수 부호별 정의역, `a=0` 상수 함수와 역함수 예외를 helper/SSR 테스트로 검사했다.
- 전체 테스트 22개 파일/166개 통과, lint·typecheck·build·diff-check 통과.
- Playwright E2E는 테스트 서버 bind `127.0.0.1:54329`가 `EPERM`으로 실패해 시작 전 차단됐다.
- 사람 검수·공식 매핑·게시 승인 대기이며 공개하지 않는다.
