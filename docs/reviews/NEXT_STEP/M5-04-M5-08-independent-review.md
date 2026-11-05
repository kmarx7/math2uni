# Independent curriculum review — M5-04–M5-08

Date: 2026-11-06
Scope: five curriculum lesson specifications and the Curriculum Architect review. This review does not approve content or authorize publication.

## Disposition

The five specifications are **suitable for Research & Content drafting and preview implementation planning**, subject to the M5-08 authoring guard below. They preserve proposal metadata and prerequisite unit IDs, use six subunits and fifteen phases each, define three distinct problem-family goals and six unique practice goals, and contain zero assessment instances. All remain draft, `publicationApproved: false`; `officialStandards` is empty.

## Checks completed

- Compared title, concept labels, visualization text, and ordered prerequisite unit IDs against `src/data/proposals/units.json`; all five match exactly. No new graph edges are proposed.
- Parsed all five JSON files and checked six subunits, fifteen phases, two target skills, three family criteria, six unique practice goals, zero assessment instances, empty official standards, and unpublished status.
- M5-04 states the domain/base conditions for the log product, quotient, integer-power, and change-of-base laws. Its worked expansion `log₂(8x/4)=1+log₂x` is correct for `x>0`.
- M5-05 uses the valid decomposition `N=10^k·m` for positive `N`, integer `k`, and `1≤m<10`; it correctly permits negative characteristic for `0<N<1` and marks table-derived values as approximate. The examples for `0.04`, `200`, and `2000` are consistent.
- M5-06 correctly distinguishes `a>1` from `0<a<1`, gives domain `R`, range `(k,∞)` and horizontal asymptote `y=k` for the specified translated form `a^(x−h)+k`.
- M5-07 correctly gives the logarithm domain/range, base-dependent monotonicity, inverse reflection, and shifted boundary `x>h` with vertical asymptote `x=h`. Its worked point and asymptote are correct.
- M5-08 correctly restricts monotonicity arguments to `a>0, a≠1`; it preserves inequality direction for `a>1` and reverses it for `0<a<1`. The worked solutions `x<2` and `x>2` are correct.

## Authoring guard for M5-08

When Research drafts equation items, restrict exponent equality to expressions that have actually been rewritten as the same permitted base. For inequality items, both sides being compared must be in the positive range of the exponential function; do not apply monotonicity to nonpositive targets or to bases `a≤0` or `a=1`. The current spec implies this boundary, but the item prompts and rationales should state the relevant conditions where needed.

## Evidence and publication state

The specs do not claim official standards or unit-level CSAT alignment. Research must retain that limitation unless the relevant official source text is inspected and mapped directly. This review is an independent design check only; it is not human content approval. Problem answers, rights, and pedagogy still require their own review before publication.
