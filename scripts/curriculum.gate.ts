import { it, expect } from "vitest";
import { curriculum } from "../src/data/curriculum";
import { validateCurriculum } from "../src/modules/curriculum";
it("170개 정본 단원 전체 등록 및 순서 확정 게이트", () => {
  expect(validateCurriculum(curriculum, true)).toEqual([]);
});
