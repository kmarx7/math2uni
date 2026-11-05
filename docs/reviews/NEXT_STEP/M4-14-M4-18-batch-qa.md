# M4-14~M4-18 개발 프리뷰 QA

교육과정 검토와 독립 문항 검산 후 다섯 제안 단원을 개발 미리보기에 연결했다. 각 단원은 공통 lesson renderer, 6개 소단원/15단계, 전용 lab, 3개 서로 다른 문제 원형과 6개 practice draft를 갖는다. 새 연습 초안은 30개이며 평가 인스턴스는 0개다. Curriculum review는 구현 인계 implementation-ready이며 사람 게시 승인은 아니다.

## 검증

- lint: 통과
- typecheck: 통과
- Vitest: 21개 파일, 160개 테스트 통과
- content:validate: 3개 파일, 19개 테스트 통과
- production build: 통과 (Next.js 16.3.6)
- diff-check: 통과
- E2E: Playwright webServer가 127.0.0.1:54329에서 listen할 때 EPERM으로 실행 전 종료. 테스트 코드는 추가했으나 브라우저 흐름은 미검증.

## 한계와 상태 경계

M4-18 M1-03 선수 메타데이터는 보존하고 선택형 readiness check/local remediation으로만 처리한다. 평가 문항, canonical curriculum 등록, 공식 성취기준 매핑, 사람 검수·게시 승인은 추가하지 않았다. 모든 신규 문항은 draft이며 humanVerified:false; approved-content.json은 approvedContent:null, humanApprover:null, publicationApproved:false다. 진도는 unitProgress[unitId]에 분리되며 기존 M0 루트 데이터가 보존된다.

상세 구현·검증 기록은 각 reviews/NEXT_BATCH/M4-14/~M4-18/을 참고한다. 공식 범위 대조와 사람 승인, 실제 브라우저 E2E는 다음 검토가 필요하다.
