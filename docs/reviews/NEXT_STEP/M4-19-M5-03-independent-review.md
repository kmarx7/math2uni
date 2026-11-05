# Independent curriculum review — M4-19–M5-03

Date: 2026-11-05
Reviewer: independent curriculum review
Scope: five lesson-spec drafts and the Curriculum Architect review. This review is not human content approval and does not authorize publication.

## Result

**Conditionally acceptable for content drafting and preview implementation after the listed clarifications. Not approved for publication.** The five specs preserve proposal titles, concepts, prerequisite unit IDs, and visualization labels. All five remain `draft`, have empty official-standard mappings, and keep publication approval false. The recurring 6-subunit and 15-phase structures are present.

## Checks passed

- M4-19 includes the boundary value where the radicand is zero. Its quadratic sign example gives `x ≤ −2` or `x ≥ 1`; the inverse example correctly restricts the inverse domain to the original range `x ≥ 1`, with no spurious `±` branch.
- M4-20’s worked domain example is correct when read as `sqrt(x−1)/(x−2)`: `[1,2) ∪ (2,∞)`. It is framed as synthesis and explicitly warns against adding new theorems.
- M5-01 correctly distinguishes even-root and odd-root real domains, excludes `0^0`, and uses positive bases for its introductory rational-exponent definition. The worked negative rational exponent is correct.
- M5-02 restricts real-exponent laws to positive bases and labels decimal values as approximations. The listed sample calculations are correct.
- M5-03 states `a>0`, `a≠1`, and `x>0`; the inverse relation and the decreasing behavior for `0<a<1` are correctly stated.
- The recorded official-standard fields are empty, and the review does not claim that the proposal’s unit mapping is official.

## Required clarifications before calling implementation handoff stable

1. **Make the six draft practice goals meaningfully distinct.** In each spec, the two goals assigned to each of the three families are currently exact duplicates except for repeated text. They do not yet establish six different conditions or cognitive tasks. Replace each pair with two concrete, distinct draft-item targets; numeric-only variants must remain one family. Keep assessment instance count at zero.
2. **Resolve the M4-20 synthesis skill boundary.** Its two target skill IDs look like newly registered skills even though this unit is defined as a synthesis check. Either document them explicitly as local diagnostic/performance tags that do not enter the mastery registry, or map them to already registered skills. Do not add prerequisite graph edges or automatic mastery from this unit without a separate decision.
3. **Make M4-20 prerequisite coverage explicit.** The proposal names five prerequisite units, while its readiness list only describes M4-06 and M4-08. State that the remaining M4-14, M4-18, and M4-19 readiness checks are handled locally, or add concise diagnostic descriptors for them. This must not create new prerequisite IDs.
4. **Disambiguate radical notation in M4-20 examples.** Render `√(x−1)/(x−2)` with explicit grouping (prefer `\frac{\sqrt{x-1}}{x-2}`) so it cannot be read as `√((x−1)/(x−2))`. The claimed domain is correct for the former expression, not the latter.
5. **Keep M5-03 inequality direction scoped.** The third family includes inequality direction. Ensure it is limited to comparing monotonicity for the two base intervals, and does not silently expand into logarithmic-equation/inequality techniques beyond this definition unit.
6. **Clarify the positive-base convention for M5-01.** Keep the chosen introductory definition `a>0`; explicitly note that this is a deliberate scope restriction and that other real-valued rational powers of negative bases require a separate parity/reduced-fraction treatment. Do not imply no such cases exist.

## Readiness and remaining evidence

- These are curriculum drafts, not researched or validated lesson content. Research reports state that the official curriculum attachment and the 2028 sample-question PDF were not inspected at the item/standard level; therefore direct standard mapping and unit-level CSAT claims remain unsupported.
- Before marking the implementation handoff ready, verify all future item answers/rationales independently, especially transformed radical domains, rational-exponent denominator reduction, and base/argument conditions for logarithms.
- Keep all content in preview/draft status until a real human reviewer records approval, rights checks are complete, and the production guard confirms the approved state.

## Disposition

No unit ID, order, proposal metadata, or official standard was changed. The listed clarifications are authoring requirements for the next draft; this review itself grants no approval or publication status.
