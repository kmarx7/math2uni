# M4-04~M4-08 batch QA

## Implementation

- Five proposal units are registered in the development preview only. Lesson draft JSON and research blueprints were left unchanged.
- Added five bounded, unit-specific labs and pure validation helpers: point-line distance/projection foot, circle standard/general form, circle-line intersection cases, translations, and reflections. World-coordinate SVGs use a square 300×300 viewport with 16px/unit; the M4-04 worst-case projected foot remains inside the ±8 clipping window.
- Thirty practice draft instances from fifteen families are connected (six per unit); no evaluation items were added.
- Answer data remains in a `server-only` adapter. Focused tests verify correct grading, answer-free public DTOs, production preview gates, and progress isolation under `unitProgress[unitId]`.
- Each unit has implementation, QA, validation, and null approval artifacts under `docs/reviews/NEXT_BATCH/{unitId}/`. All approvals remain null/false.

## Review notes and limits

- Curriculum independently recalculated all thirty answer values and choice keys; no unresolved answer/key/skill blocker remains. The detailed review is `docs/reviews/NEXT_STEP/M4-04-M4-08-independent-review.md`.
- Lessons use proposal content; official standards and direct CSAT mapping remain unverified. Human review and publication approval are not complete.
- M4-04 uses finite coefficient/point controls and a square clipped plot; invalid zero normal vectors are avoided by the preview control.
- M4-05 uses bounded integer center/radius values. M4-06 currently visualizes a horizontal line. Translation/reflection labs display point, circle-center and line-equation transformations.
- Curriculum recommends worked-example additions for general distance, completing-square cases, circle-line cases, translations, and reflection composition.
- E2E and actual browser/mobile inspection could not run because Playwright webServer listen was blocked by `EPERM` on `127.0.0.1:54329`. Responsive behavior is therefore not browser-verified.

## Final verification

| Command | Result |
|---|---|
| `npm run lint` | Passed, clean |
| `npm run typecheck` | Passed |
| `npm test` | Passed: 19 files, 148 tests |
| `npm run test:e2e` | Blocked before tests: webServer listen `EPERM` at `127.0.0.1:54329` |
| `npm run build` | Passed (Next.js 16.3.6) |
| `git diff --check` | Passed |
