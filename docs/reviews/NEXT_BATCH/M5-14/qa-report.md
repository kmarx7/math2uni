# QA 보고서 — M5-14

## 검증 범위

- lesson registry, 런타임 콘텐츠 계약, 15개 학습 단계와 인터랙티브 lab
- 단원별 연습 문항·원형 연결, 채점 및 정답 비공개
- 삼각함수 그래프, 유한 구간 해, SSA 분기, 코사인법칙과 넓이의 수학 경계
- 개발 preview 제한, 단원별 진도 격리, 평가 문항 없음

## 최종 검증 결과

- 집중 테스트와 handoff: 2 files, 17 tests 통과
- 전체 단위 테스트: 25 files, 192 tests 통과
- 콘텐츠 검증: 4 files, 30 tests 통과
- lint, typecheck, python3.11 agent config validation, git diff check 통과. Agent runtime discovery는 테스트하지 않음
- npm run build Turbopack 빌드 통과
- E2E: 브라우저 테스트 시작 전 차단. test auth 서버 bind가 실패했고 오류는 listen EPERM: operation not permitted 127.0.0.1:54329 입니다.

## 콘텐츠 상태

문항은 모두 draft이며 사람 승인·게시 승인은 없습니다. 평가 문항은 0개입니다. 독립 검토의 문항 재계산은 AI 검토 결과이며 사람의 콘텐츠 승인으로 간주하지 않습니다.
