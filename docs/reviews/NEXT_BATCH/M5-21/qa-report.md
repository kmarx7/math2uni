# QA 보고서 — M5-21

## 검증 범위

- proposal lesson registry와 15개 학습 단계, 인터랙티브 lab 렌더링
- 서버 전용 문항 blueprint adapter, 정답/해설 비노출 및 draft preview 게이트
- bounded sequence/summation helpers와 unitProgress 격리
- assessment instance 0개, 게시 승인 0개

## 검증 결과

- 집중 테스트와 handoff: 2 files / 17 tests 통과
- 전체 단위 테스트: 26 files / 200 tests 통과
- 콘텐츠 검증: 5 files / 38 tests 통과
- lint, typecheck, production Turbopack build 통과
- agent config validation 및 git diff check 통과. 실제 Codex runtime discovery는 검사하지 않음
- E2E: 브라우저 테스트 시작 전 차단. `listen EPERM: operation not permitted 127.0.0.1:54329`

## 콘텐츠 상태

30개 문항은 모두 draft, `humanVerified:false`; assessment 0개다. 독립 재계산은 AI 교차 검토이며 사람 검수나 게시 승인으로 간주하지 않는다. `approved-content.json`은 pending/null이다. 공식 성취기준 및 수능 매핑은 미검증이다.
