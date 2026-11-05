# Curriculum architecture review — M5-04–M5-08

Date: 2026-11-06
Status: **five draft handoffs; Research & Content and independent review pending**
Scope: proposal metadata alignment and bounded lesson specifications. This is not human content approval or publication approval.

## Proposal alignment

| Unit | Proposal focus | Prerequisite unit IDs | Boundary |
|---|---|---|---|
| M5-04 | Log product/quotient/power rules and change of base | M5-03 | Preserve positive arguments and valid base conditions for every law and change-of-base use. |
| M5-05 | Common logarithm, characteristic/mantissa and use | M5-04, M0-09 | Restrict inputs to positive values; use supplied table values and mark approximations. |
| M5-06 | Exponential-function monotonicity and graph transformations | M5-02, M4-07, M4-15 | Require a>0 and a≠1; distinguish a>1 from 0<a<1; report shifted range/asymptote. |
| M5-07 | Logarithm graph monotonicity and inverse relation | M5-04, M5-06, M4-17 | Maintain x>0 (or shifted x>h), range, asymptote, reflection, and base-specific direction. |
| M5-08 | Common-base equations and inequalities | M5-06, M3-17 | Only use injectivity/monotonicity for a>0, a≠1; reverse inequality for 0<a<1. |

## Shared design checks

- Each specification copies title, concept labels, prerequisite unit IDs, and visualization text exactly from `src/data/proposals/units.json`.
- Each has six sequential subunits, fifteen learning phases, two target skill labels, three reasoning-distinct family criteria, six item-specific practice goals, and zero assessment instances.
- Prerequisite checks are local diagnostics and do not register new prerequisite edges or force entry mastery.
- `officialStandards` is empty. No official code, exact standards alignment, or unit-level CSAT guarantee is claimed.
- All specifications remain `draft`, `publicationApproved: false`; independent review and human approval are pending.

## Critical mathematical controls

1. Log rules require a>0, a≠1 and positive arguments; change of base requires an allowed conversion base and positive target argument.
2. Common-log decomposition uses N=10^k m with N>0, integer k and 1≤m<10. Supplied table values and calculated magnitudes are explicitly approximate.
3. Exponential/log graphs retain their domains, ranges, asymptotes and the split between increasing bases >1 and decreasing bases between 0 and 1.
4. Exponential inequalities use only equivalent common-base transformations or monotonicity with an explicitly identified base range. No negative or unit base is allowed in those rules.

## Readiness disposition

The specifications are structured design drafts for the next handoff, not final implementation approval. Research must record source/rights state and author draft items; an independent reviewer must check item wording and mathematical scope; Developer must independently test every answer and domain condition. Production remains closed until human approval.
