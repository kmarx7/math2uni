# M3-11 구현 보고

- 상태: draft 개발 미리보기, 게시 승인 없음
- 공통 학습 화면에 콘텐츠 데이터로 연결했고, 인터랙션은 재사용 수학 실험실로 구현했다.
- 연습 문항 6개를 별도 proposal-preview 어댑터로 등록했다. 평가 문항은 0개다.
- 학습 시도/완료 기록은 기존 progress mutation을 통해 unitProgress[M3-11] 경계에 저장한다.
- 정답·해설은 server-only 문제 저장소에 유지하며 공개 DTO에서는 숨긴다.
- 자동 검증 보고서: validation-report.json. 승인 데이터는 approved-content.json에 null로 기록했다.
