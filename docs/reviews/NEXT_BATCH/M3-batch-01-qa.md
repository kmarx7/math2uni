# M3-01~M3-05 배치 QA

2026-11-02 실제 실행 결과.

| 명령 | 결과 | 세부 사항 |
|---|---|---|
| `npm run lint` | 통과 | ESLint 종료 코드 0 |
| `npm run typecheck` | 통과 | Next route typegen 및 `tsc --noEmit`, 종료 코드 0 |
| `npm test` | 통과 | 14개 파일, 113 tests passed (UI formatter focused assertions 5개 포함) |
| `npm run content:validate` | 통과 | 3개 파일, 19 tests passed |
| `npm run test:e2e` | 차단 | Playwright `config.webServer`가 인증 테스트 서버 `127.0.0.1:54329` bind 시 `EPERM`; 브라우저 루프 미검증 |
| `npm run build` | 통과 | Next.js 16.3.6 production build, 정적 페이지 17개 생성 |

## 콘텐츠 결과

- 제안 preview 연습 270문항, 별도 기존 평가 30문항, 전체 고유 ID 300개, 연습 고유 프롬프트 270개.
- M3 신규 연습 초안 30개(단원당 6개/2개 원형), 신규 평가 문항 0개. 자동 채점·해설 표시 기대값 확인을 통과했다.
- M3-03 `m303-p03` 기대 선택지는 B (`Q=x+2, R=2x+3`). 검산식 `(x²+1)(x+2)+(2x+3)=x³+2x²+3x+5`; 정답/오답 채점 테스트 통과.
- 공개 DTO에서 답·해설이 빠지는지와 production preview 차단을 테스트했다. 개발 미리보기 진도는 단원 단위 구조를 유지한다.
- M3 데이터는 전부 draft; 승인 콘텐츠 null, humanApprover null, 사람 검수·승인·게시 0건. 공식 교육과정 매핑 미검증.

## 남은 확인

E2E 실행 환경이 허용되어야 다섯 단원의 실제 UI 렌더·상호작용 및 M3 preview 진도 흐름을 브라우저에서 확인할 수 있다. 사람의 수학·교육 검수와 게시 승인도 별도다.

## 최종 E2E 재실행

2026-11-02, UI 보완 반영 후 Orchestrator가 `npm run test:e2e`를 재실행했다. 결과는 다시 차단됨: auth test server가 `127.0.0.1:54329`에서 `listen EPERM`으로 종료되어 Playwright `webServer`가 시작되지 못했다. 브라우저 UI·키보드 상호작용과 진도 흐름은 계속 미검증이다.

## UI 포맷 회귀검사 보완

다항식 표시에서 0항과 계수 ±1을 정리하고 음수 부호가 `+-`/`--`로 겹치지 않도록 공통 포맷터를 적용했다. M3-01 영다항식은 차수 관례를 가르치지 않고 활동 범위 밖이라고 안내한다. 나머지정리 활동은 음수 a일 때 제수를 `x+|a|`로, 음수 제곱 대입을 괄호로 표시한다. SSR 기반 focused assertions 5개가 각 실험실의 식 항등식, 음수/0 입력, 결과 live region, label이 연결된 native range control과 live region 마크업을 확인한다. 실제 브라우저 키 입력 조작은 E2E 차단으로 미검증이다.

재검증: lint/typecheck 통과, focused 10 tests 통과, 전체 Vitest 14개 파일/113 tests 통과, content:validate 19 tests 통과, build 통과. Playwright E2E는 초기 실행과 2026-11-02 UI 보완 후 Orchestrator의 최종 재실행 모두 auth 서버 bind EPERM으로 차단됐다.
