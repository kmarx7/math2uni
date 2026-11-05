# Independent content second review — M4-19–M5-03

Date: 2026-11-05
Scope: revised five lesson content drafts, five problem blueprints (30 items), and five runtime ContentDocument drafts. This is a review only; no authored content was changed and no human approval/publication is granted.

## Result

The earlier key-mapping issue is resolved in the current snapshot. Independently recalculated answers agree with the stored key for all 30 items. Each problem has three unique option IDs, and the key points to an option. Each unit has six practice items, three families, zero assessment items, zero human-approved items, and remains unpublished. Correct-key positions are balanced exactly 2 A / 2 B / 2 C in each unit. Current key sequences are M4-19 `BCABCA`, M4-20 `CABACB`, M5-01 `ABBCAC`, M5-02 `CBACAB`, and M5-03 `BACBCA`.

Practice goals are now item-specific and broadly align with the questions. M4-19 inverse items give domain/range and its graph family title covers evaluation. M4-20 radical grouping is explicit. M5-01 scopes `0^0` to this unit’s rule and distinguishes negative-base rational-power treatment. M5-02 correctly uses `a>0` for standard real exponentiation over all real exponents. M5-03 removed logarithmic inequality solving.

## Remaining unit-level alignment

- **M4-19:** No mathematical or answer-key blocker found.
- **M4-20:** Implemented/tested with `m4-20-local-review-*` tags excluded from registered concepts. Preview attempts are recorded in the proposal collection, do not update mastery, and have mastery contribution 0. No prerequisite graph edges are added.
- **M5-01:** No mathematical or answer-key blocker found.
- **M5-02:** No mathematical or answer-key blocker found.
- **M5-03:** The prior family/title and evidence mismatch is resolved. Family 3 is monotonicity-only; draft-06 states the rule and asks learners to apply it to bases 2 and 1/2. The runtime practice hint has the same boundary and excludes inequality solving.

## Runtime schema compatibility

All five runtime drafts are registered through `src/data/proposal-lessons/index.ts`, whose module initialization runs `contentSchema.parse` on each draft. Ran the dedicated `npm test -- --run tests/m4-m5-batch-01-preview.test.ts`: **1 test file and 6 tests passed**. It asserts schema-valid drafts, 15 phases, no assessments, choice/key consistency and uniqueness, answer privacy and production blocking, math-domain boundaries, labs, per-unit progress isolation, and M4-20’s zero mastery contribution. Structural inspection confirms 15 phases, eight blocks, and no `AssessmentBlock` per unit.

`contentSchema` does not define `reviewStatus` or `publicationApproved`; the parsed `ContentDocument` does not preserve those fields. Schema success is not approval. Keep publication blocked through the separate preview/production gate. Playwright E2E remains blocked at test-server startup because binding `127.0.0.1:54329` returns `EPERM`, as recorded in the QA report.

## Disposition

Current answer keys and option distributions pass independent review, and the M4-20 mastery exclusion boundary is implemented and tested. Keep all content as draft and unpublished until the E2E environment blocker is resolved, source/rights review is complete, and a human reviewer explicitly approves the final content.
