# M4-20 revised content second review

Date: 2026-11-05. Independent re-audit only; no approval or publication granted.

## Findings

The six item-specific goals align to the questions. Coordinate representation, intersections of existing domain constraints, and error diagnosis are distinct reasoning families. The radical numerator is explicitly grouped.

All six keys and rationales were independently checked:

| Item | Key | Independent check |
|---|---|---|
| m420-draft-01 | C | On the x-axis, `y=0`. |
| m420-draft-02 | A | Radius 3 gives `x²+y²=9`. |
| m420-draft-03 | B | `x≥1` and `x≠3`; equality at 1 is allowed. |
| m420-draft-04 | A | For `√(4−x)/(x+2)`, require `x≤4`, `x≠−2`. |
| m420-draft-05 | C | The initial error excludes the zero radicand. |
| m420-draft-06 | B | `x=1` is outside `x≥2`. |

Each has three unique options and a key mapping to one option. Key positions are balanced 2 A/2 B/2 C. Six practice drafts, zero assessments, zero human-approved items, and publication false are confirmed.

## Synthesis boundary

The implementation now uses `m4-20-local-review-*` tags, keeps them out of the registered curriculum concepts, records preview attempts without updating mastery, and returns mastery contribution 0. The dedicated preview test verifies these boundaries. No new prerequisite graph edges are added.

## Runtime and disposition

Runtime JSON has 15 phases, eight blocks, and no assessment block; registry import parses it with `contentSchema`. That schema strips draft publication metadata, so preview/production gates must enforce it separately. No remaining mathematical answer issue found. Draft remains unpublished pending human review and QA.
