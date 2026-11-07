# M5-18 구현 보고

- 상태: 미승인 제안 콘텐츠의 개발 프리뷰이며 운영 교육과정/게시 문항으로 승격하지 않았다.
- 화면: 공통 lesson renderer 및 단원 전용 접근 가능한 interactive lab에 연결했다.
- 콘텐츠: 승인된 specification/runtime lesson 버전을 사용한다. 15 phase, 8 renderer block, 평가 블록 0개.
- 문제: server-only 어댑터가 검토된 blueprint의 6개 practice draft와 3개 원형을 연결한다. 평가 문항은 0개.
- 수학: bounded 함수만 사용한다. 임의 수식/코드 실행은 없다.
- 진도: practice 시도는 unitProgress 단원 키에 기록되고 M0 루트 완료/점수와 정본 숙달도에 합치지 않는다.
- 공개: 개발 환경과 MATH90_CONTENT_PREVIEW=1에서만 검토할 수 있다. 정답·해설·채점 규칙은 공개 DTO에서 제외하고 production preview는 차단한다.
- 승인: 사람 승인 0건, approvedContent는 null, publicationApproved는 false. 공식 성취기준 연결은 미검증이다.
