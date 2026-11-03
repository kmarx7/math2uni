# M3-21, M3-22, M4-01~03 batch QA

## Implementation

- Five proposal units are registered as development previews only. The content drafts and official-standard mappings were not modified.
- Added five focused interactive labs, bounded arithmetic/geometry helpers, a server-only question adapter, and lesson/preview manifest registrations.
- Thirty practice draft instances from fifteen problem families are connected (six per unit). No evaluation instances were added.
- Server boundary tests confirm answer keys and explanations are absent from public problem DTOs; production blocks all five draft previews.
- Progress mutation test confirms extension attempts and completion remain under `unitProgress[unitId]`, preserving legacy root completion and assessment score.
- All questions remain draft; each unit's `approved-content.json` has `approvedContent: null`, `humanApprover: null`, and publication disabled.

## Review guidance retained

- M3-21 needs a worked example covering size compatibility, scalar multiplication, and row-by-column multiplication; current example only reads entries.
- M3-22 needs a worked example connecting disjoint case analysis with direct enumeration of two-step paths and a matrix-product entry.
- M4-01 needs an internal division worked example; M4-02 needs line-equation construction and substitution verification; M4-03 needs a perpendicular example and horizontal/vertical exception.
- The M3-22 partition is disjoint (even / odd multiple of 3 / remaining). Coordinate SVG bounds cover the full selectable integer domain [-5,5]².
- Controls use native buttons/ranges, labels and live results; SVGs have text alternatives and control layouts wrap. Browser/mobile E2E could not run in this environment, so responsive behavior was not verified in a real browser.
- Handoff schema remains unchanged. Curriculum review noted the proposal lesson-spec shape differs from `src/contracts/handoff.ts`; this batch consumes `contentSchema` drafts and does not modify handoff schema.

## Final verification

| Command | Result |
|---|---|
| `npm run lint` | Passed clean, no warnings |
| `npm run typecheck` | Passed; Next route type generation succeeded |
| `npm test` | Passed: 18 files, 140 tests |
| `npm run test:e2e` | Blocked before test execution: Playwright webServer could not listen on `127.0.0.1:54329` (`EPERM`) |
| `npm run build` | Passed; Next.js 16.3.6 production build completed |
| `git diff --check` | Passed |

The E2E blocker is environmental and must not be reported as a passing E2E check. Human math-education review, content publication approval, official standard mapping, and real-browser mobile validation remain incomplete.
