# M3-22 QA report

- Tested a two-condition intersection and a disjoint partition (even / odd multiple of 3 / remaining); tested two-step path count and invalid matrix rejection.
- Lesson schema, six draft practice items, three family IDs, answer grading, public DTO secrecy, production gate, and unit progress isolation are covered by the batch test.
- Static markup includes labeled controls, a live result, and a semantic transition table. Keyboard operation follows native buttons; mobile widths use wrapping controls and bounded SVG sizing.
- Full unit suite: 18 files / 140 tests passed. Lint, typecheck, and production build passed.
- E2E was blocked at web-server startup by `listen EPERM 127.0.0.1:54329`; browser/mobile interaction was not verified end to end.
- Worked-example gap: existing example shows candidate intersection only, not case partition and matrix path cross-check. Human review/publication approval remain pending.
