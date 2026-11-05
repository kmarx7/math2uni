# M4-20 QA 보고

- lesson schema, 15단계, 6개 소단원 및 개발 preview 등록을 검사했다.
- 연습 6개/원형 3개/평가 0개, draft 상태, 보기 정답 키·정답 규칙을 검사했다.
- 각 선택 문항에서 보기 ID와 보기 문구의 중복이 없고 정답 ID가 존재함을 검사했다.
- 공개 DTO의 정답 비공개, production draft 차단, M4-20 단원 진도 격리를 검사했다.
- M4-20 기술 태그가 정식 기술 ID와 다르고 preview attempt가 mastery 계산에서 제외됨을 검사했다.
- 전체 테스트 22개 파일/166개 통과, lint·typecheck·build·diff-check 통과.
- Playwright E2E는 테스트 서버 bind `127.0.0.1:54329`가 `EPERM`으로 실패해 시작 전 차단됐다.
- 사람 검수·공식 매핑·게시 승인 대기이며 공개하지 않는다.
