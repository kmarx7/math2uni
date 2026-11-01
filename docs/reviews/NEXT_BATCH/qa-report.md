# M1-01~M1-05 QA 보고서

기준 커밋 전 작업 브랜치 `feat/m1-batch-01`. 콘텐츠는 전부 개발 preview/draft이며 승인 0개다.

| 검사 | 결과 | 근거 |
|---|---|---|
| `npm run lint` | PASS | ESLint exit 0 |
| `npm run typecheck` | PASS | Next route type generation + TypeScript exit 0 |
| `npm test` | PASS | 13 test files / 106 tests |
| `npm run content:validate` | PASS | 3 files / 17 tests, handoff + M0 extension + M1 preview/data checks |
| `npm run test:smoke` | PASS | Playwright desktop/mobile 56/56, 2.2m |
| `npm run test:e2e` | BLOCKED before tests | test server socket bind `127.0.0.1:54329` returned EPERM. Script invokes the same `playwright test`; `test:smoke` completed the full suite successfully. |
| `npm run build` | PASS | Next.js production build, 17 routes |
| `git diff --check` | PASS | no whitespace errors |

## Playwright 범위

M1-specific smoke coverage checks all five unit titles/interactions, six concept sections each, answer-free practice DTOs, wrong-answer feedback, account progress persistence, and isolation from the M0-01 root record. Existing account, curriculum, M0-01~12, assessment, mistakes, review and mobile checks also ran in the same 56-test suite.

## Known incomplete / blocked

- `npm run test:e2e` itself did not launch due to environment port-bind permission, so record it as blocked. The same configuration and 56 tests did pass under `npm run test:smoke`.
- No test asserts actual Supabase RLS or production deployment. Authentication and progress HTTP flows use the repository's isolated fixture as documented.
- Human math/teaching/language review and publication approval are pending.
- No M1 assessment item is implemented. D2~D5, formal completion, M1-06+, official standard mapping and independent exam-effect measurement are pending.
