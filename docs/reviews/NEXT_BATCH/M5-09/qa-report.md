# M5-09 QA 보고

- 구현 검사: 단원별 콘텐츠 schema·15단계·인터랙티브 블록·평가 블록 부재를 테스트한다.
- 문항 검사: 6개 draft practice, 세 원형, 서버 정답 정합성과 공개 DTO redaction을 테스트한다.
- 수학 검사: 로그 정의역/감소 로그 부등호, 지수 모형 경계, 라디안 기하, 사분면 부호 및 삼각 항등식 경계를 검사한다.
- 접근성/진도: lab accessible labels, 반응형 E2E 및 단원별 진도 격리를 점검한다.
- E2E: 테스트 서버 bind 권한에 따라 결과를 기록한다. 승인/게시 검증으로 해석하지 않는다.
- 수학 문항 독립 검토: docs/reviews/NEXT_STEP/M5-09-M5-13-independent-review.md를 참조한다. 사람 게시 승인은 별도 대기다.

## 실행 결과 (2026-11-07)

- `npx vitest run tests/m5-batch-03-preview.test.ts tests/handoff.test.ts`: 통과, 2 files / 14 tests.
- `npm run lint`: 통과.
- `npm run typecheck`: 통과.
- `npm run build`: 통과.
- `git diff --check`: 통과.
- `npm test`: 24 files / 183 tests 통과. 기존 M1/M3 집계 assertion은 새 M5 연습 30개를 포함해 570개로 갱신했다.
- `npm run content:validate`: 3 files / 21 tests 통과.
- `npm run test:e2e`: 실행 차단. Next 테스트 서버가 `127.0.0.1:54329` listen에서 `EPERM: operation not permitted`로 종료됐다.
- `python3.11 scripts/validate-agent-config.py`: 통과. TOML 구문·역할 설정·템플릿 일치 확인, runtime role discovery는 미검증. 기본 `python3`는 3.9라 `tomllib`이 없어 npm wrapper 실행은 불가했다.
