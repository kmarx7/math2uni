# QA 보고서 — M6-04

## 검증 범위

- 런타임 lesson schema/parity, 15 phases, accessible lab
- 연습 answer redaction, development-only preview, no assessment, progress isolation
- 내부/끝점 연속 세 조건과 IVT 존재 결론·유일성 구분

## 검증 결과

- 집중 테스트와 handoff: 2 files / 17 tests 통과
- 전체 단위 테스트: 27 files / 208 tests 통과
- 콘텐츠 검증: 6 files / 46 tests 통과
- lint, typecheck, production Turbopack build 통과
- E2E: 브라우저 테스트 시작 전 차단. `listen EPERM: operation not permitted 127.0.0.1:54329`
- static render 테스트에서 aria-live, aria-label, role=img 확인. 실제 브라우저/스크린리더/실물 모바일 QA는 E2E 환경 차단으로 미검증

## 콘텐츠 상태

6개 문제는 draft, humanVerified=false이며 assessment 0개다. AI 독립 검토는 사람 검수/승인이 아니다. 공식 성취기준/수능 매핑은 미검증이다. approved-content는 pending/null이다.
