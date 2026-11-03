# M3-06~M3-10 배치 QA 보고서

- 범위: 다섯 단원의 초안 콘텐츠 연결, 개발 전용 미리보기, 연습 채점·오답 피드백, 다섯 상호작용, 단원별 진도 격리.
- 교육 설계 교차 검토: Curriculum Architect 판정은 `implementation-ready`. 이는 설계 인계 판단이며 사람 검수/게시 승인이 아니다.
- 콘텐츠 상태: 수업 초안 5개, 문제 원형 15개, 연습 문항 30개. 평가 문항 0개, 승인/게시 0개. 각 `approved-content.json`의 `approvedContent`는 `null`, 공식 성취기준 매핑은 미검증이다.
- `npm run lint`: 통과.
- `npm run typecheck`: 통과.
- `npm test`: 최종 실행에서 15개 파일, 119개 테스트 통과. 검증에는 Zod 콘텐츠 계약, 문항·정답 연결, answer-free 공개 DTO, 운영 환경 미리보기 차단, 단원별 진도 격리, 수학 함수와 접근성 렌더링이 포함된다. 첫 실행에서 인터랙션 설정의 `initialA/initialB` 누락과 기존 문항 수 기대치(270)가 발견되어 데이터와 회귀 검사를 수정한 뒤 재실행했다.
- `npm run build`: Next.js 16.3.6 production build 통과.
- `npm run test:e2e`: 차단. Playwright 테스트 인증 서버가 `127.0.0.1:54329`에 bind할 때 `EPERM: operation not permitted`로 종료되어 브라우저 end-to-end 흐름은 검증하지 못했다.
- 수학 정답은 작성자 자체 대조와 자동 구조·채점 검사까지 완료했다. 독립 수학 검수와 사람 콘텐츠 승인은 남아 있다. 미리보기 전용이며 production 공개는 차단된다.
