import { describe, it, expect } from "vitest";
import { curriculum } from "@/data/curriculum";
import { lesson } from "@/data/content";
import { validateCurriculum, recommendUnit } from "@/modules/curriculum";
import { validateContent } from "@/modules/content";
describe("curriculum contracts", () => {
  it("detects missing last unit and a replaced ID using the fixed registration manifest", () => {
    const data = structuredClone(curriculum);
    data.units.pop();
    expect(validateCurriculum(data).join()).toContain(
      "등록 단원 누락/순서 불일치 M0-12",
    );
    const replaced = structuredClone(curriculum);
    replaced.units[1].id = "M0-99";
    expect(validateCurriculum(replaced).join()).toContain(
      "등록 단원 누락/순서 불일치 M0-02",
    );
  });
  it("validates registered LEVEL 0 metadata and every content block", () => {
    expect(validateCurriculum(curriculum)).toEqual([]);
    expect(validateContent(lesson, curriculum.units)).toEqual([]);
    expect(curriculum.units).toHaveLength(12);
    expect(new Set(lesson.blocks.map((b) => b.type)).size).toBe(8);
  });
  it("does not silently claim 170-unit completeness", () => {
    expect(validateCurriculum(curriculum, true)).toContain(
      "170개 정본 manifest 미등록",
    );
    expect(validateCurriculum(curriculum, true)).toContain(
      "170개 단원 중 12개 등록",
    );
    expect(curriculum.units.every((u) => u.standards.length === 0)).toBe(true);
  });
  it("rejects duplicate IDs, missing orders, and missing concepts", () => {
    const data = structuredClone(curriculum);
    data.units[1].id = data.units[0].id;
    data.units[1].order = 22;
    data.units[0].prerequisites = ["missing"];
    expect(validateCurriculum(data).join()).toMatch(/중복 단원/);
    expect(validateCurriculum(data).join()).toMatch(/순서 누락/);
    expect(validateCurriculum(data).join()).toMatch(/선수 개념 누락/);
  });
  it("rejects prerequisite cycles and self dependencies", () => {
    const data = structuredClone(curriculum);
    data.units[0].prerequisites = ["m0-2-core"];
    expect(validateCurriculum(data).join()).toMatch(/순환/);
    data.units[0].prerequisites = ["place"];
    expect(validateCurriculum(data).join()).toMatch(/순환/);
  });
  it("recommends prerequisite unit before later learning", () => {
    expect(recommendUnit(curriculum, "M0-02", {})?.id).toBe("M0-01");
    expect(
      recommendUnit(curriculum, "M0-02", { place: 100, compose: 100 })?.id,
    ).toBe("M0-02");
  });
  it("rejects duplicate blocks and unpublished references", () => {
    const doc = structuredClone(lesson);
    doc.blocks.push(doc.blocks[0]);
    expect(validateContent(doc, curriculum.units)).toContain("블록 ID 중복");
    doc.unitId = "M1-01";
    expect(validateContent(doc, curriculum.units)).toContain(
      "공개 단원 참조 필요",
    );
  });
});
