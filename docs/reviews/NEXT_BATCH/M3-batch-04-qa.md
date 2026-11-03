# M3-16~M3-20 개발 미리보기 QA

## 구현 범위

- M3-16~20 lesson draft 5개를 공통 renderer와 개발 preview manifest에 연결했다.
- 5개 interaction을 순수 TypeScript helper와 전용 client lab으로 구현했다.
- server-only 어댑터에 draft 연습 30개와 서로 다른 15개 문제 원형을 등록했다. 평가 문항은 추가하지 않았다.
- 전체 연습 문항은 360개, 별도 평가 문항은 30개이며 합계 390개 ID다. 이 배치의 추가분은 연습 30개/15개 원형이다.
- 기존 root progress, M0-01, 평가 점수 및 운영 curriculum 경계는 유지했다. 새 기록은 unitProgress[unitId]로 격리된다.
- 모든 신규 콘텐츠와 문제는 draft, humanVerified=false, publicationApproved=false다. 승인 파일의 approvedContent는 null이다.

## 검증

| 검사 | 결과 |
|---|---|
| npm run lint | 통과 |
| npm run typecheck | 통과 |
| npm test | 통과: 17개 파일, 133개 테스트 |
| npm run content:validate | 통과: 3개 파일, 19개 테스트 |
| npm run test:e2e | 차단: Playwright 인증 테스트 서버가 127.0.0.1:54329 bind에서 EPERM으로 시작하지 못함. 브라우저 E2E 미검증 |
| npm run build | 통과: Next.js 16.3.6 production build |

추가 helper 테스트는 열린/닫힌 끝점, 한 점·공집합 교집합, 서로 다른 근·중근·무근 이차식 부호, M3-18 매개변수 경계(등호 포함/제외), 합·곱의 법칙, 순열·조합과 안전 범위를 확인한다. 렌더 테스트는 결과 live region·레이블·수직선/부호표/표/수형도를 확인한다. M3-16 keyboard lab 흐름용 Playwright 테스트는 추가했지만 실행 환경 제한으로 검증하지 못했다.

## 남은 검토

콘텐츠는 개발 preview용 초안이다. 사람의 교육·수학 검수와 게시 승인은 0건이며 공식 성취기준 매핑도 미검증이다. production 공개는 허용되지 않는다. 단원별 상태는 각 단원의 `qa-report.md`, `validation-report.json`, `approved-content.json`을 참조한다.
