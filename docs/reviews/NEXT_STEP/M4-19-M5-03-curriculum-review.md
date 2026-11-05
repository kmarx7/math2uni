# Curriculum architecture review — M4-19–M5-03

Status: **curriculum design draft; pending Research & Content and independent curriculum review**
Date: 2026-11-05
Scope: five lesson specifications only. Proposal metadata was read and copied without edits. No official standard mapping was asserted.

## Unit handoff summary

| Unit | Focus and boundary | Prerequisite readiness | Principal mathematical risks |
|---|---|---|---|
| M4-19 무리함수 | Radicand conditions, real domains, graph shifts, inverse as a function after suitable one-to-one restriction. | Diagnose M4-17 and M2-08 skills locally; do not register new dependency edges. | Include radicand zero; solve quadratic sign intervals correctly; preserve inverse domain/range swap; do not add ± to the principal square-root inverse. |
| M4-20 공통수학2 연결 점검 | Integrate already introduced coordinate, set, function, and domain ideas; no new theorem or unearned technique. Preserve all five proposal prerequisites. | Check existing skills for M4-06, M4-08, M4-14, M4-18, M4-19 and route only the weak skill to a local refresher. | Do not turn a synthesis unit into an implicit new prerequisite or teach novel content; domain restrictions must be intersected, including denominator nonzero. |
| M5-01 지수의 확장 | Zero/negative integer exponents, real n-th roots, and rational powers defined in the introductory scope for positive bases. | Diagnose M1-04 and M2-08 skills locally. | `a^0=1` and `a^(-n)=1/a^n` require `a≠0`; avoid defining `0^0`; even-root radicand must be nonnegative; odd roots permit negative radicands; rational-power definition here explicitly uses `a>0`. |
| M5-02 실수 지수와 지수법칙 | Intuitive continuous extension from rational exponents, with laws restricted to positive bases. Approximate values must be labeled approximate. | Diagnose M5-01 only. | Do not generalize arbitrary real exponents to zero/negative bases; distinguish `(a^x)^y` from `a^(x+y)`; state `a>0` for every real-exponent law. |
| M5-03 로그의 정의 | Logarithm as inverse exponential relation; include both increasing `a>1` and decreasing `0<a<1`. | Diagnose M5-02 and M4-17 locally. | Require `a>0`, `a≠1`, and argument `x>0`; preserve decreasing order for `0<a<1`; avoid treating log as multiplication or omitting inverse domain/range. |

## Shared instructional and assessment boundaries

- Each lesson specification has six subunits, fifteen phases, two target skills, three reasoning-distinct family goals, six practice-draft goals, and zero assessment instances.
- The six item goals are draft targets for later authoring; they are not completed questions or approved content. Numeric variants do not count as new families.
- Readiness checks are diagnostic-only and do not add or alter registered prerequisites.
- `officialStandards` is empty because no verified code-to-unit mapping is supplied here.
- All specifications remain `draft`, `publicationApproved: false`, and implementation readiness `pending-research-review`. No publication or human approval is claimed.

## Readiness checks for the next handoff

1. Research & Content records sources, rights, common misconceptions, and draft problem-blueprint evidence without copying restricted questions.
2. An independent curriculum reviewer checks the five scopes, prerequisite preservation, conditions, and M4-20's no-new-content boundary.
3. Developer QA independently checks example arithmetic and all domain/range claims before implementation.
4. A human content reviewer records an explicit decision before any content can be approved or published.
5. Keep proposal metadata and production curriculum separate until the project owner resolves the proposal's curriculum mapping.

## Decision

These drafts provide a bounded, implementation-oriented curriculum handoff, not validation or publication approval. In particular, the exact mathematical conditions listed above are release-blocking checks for any later problem or renderer content.
