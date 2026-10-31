import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { curriculumProposal } from "@/data/curriculum-proposal";
import { curriculum } from "@/data/curriculum";
import { lessons } from "@/data/content";
import { validateProposal } from "@/modules/curriculum/proposal";
import { validateCurriculum } from "@/modules/curriculum";

const clone = () => structuredClone(curriculumProposal);
describe("170-unit proposal review boundary", () => {
  it("covers nine levels and 170 ordered units while keeping the live registry at 12", () => {
    expect(validateProposal(curriculumProposal, curriculum)).toEqual([]);
    expect(curriculumProposal.levels.map((item) => item.count)).toEqual([
      12, 20, 20, 22, 20, 24, 24, 20, 8,
    ]);
    expect(
      curriculumProposal.curriculum.units.map((unit) => unit.order),
    ).toEqual(Array.from({ length: 170 }, (_, i) => i + 1));
    expect(curriculum.units).toHaveLength(12);
    expect(lessons).toHaveLength(12);
    expect(validateCurriculum(curriculum, true)).toContain(
      "170개 정본 manifest 미등록",
    );
  });
  it("preserves existing units exactly and keeps proposed units unregistered drafts", () => {
    expect(curriculumProposal.curriculum.units.slice(0, 12)).toEqual(
      curriculum.units,
    );
    expect(
      curriculumProposal.curriculum.units
        .slice(12)
        .every(
          (unit) =>
            unit.status === "draft" &&
            !curriculum.registeredManifest.includes(unit.id),
        ),
    ).toBe(true);
    const data = clone();
    data.curriculum.units[0].title = "changed";
    expect(validateProposal(data, curriculum).join()).toContain(
      "기존 단원 보존 위반",
    );
    data.curriculum.units[12].status = "published";
    expect(validateProposal(data, curriculum).join()).toContain(
      "미승인 제안 단원 공개 금지",
    );
  });
  it("cannot represent a human approval or canonical release", () => {
    expect(
      validateProposal({ ...clone(), status: "approved" }, curriculum).length,
    ).toBeGreaterThan(0);
    const data = clone();
    const canonical = {
      ...data,
      curriculum: {
        ...data.curriculum,
        coverage: "canonical",
        canonicalManifest: data.curriculum.registeredManifest,
      },
    };
    expect(validateProposal(canonical, curriculum).length).toBeGreaterThan(0);
    expect(validateCurriculum(curriculumProposal.curriculum, true)).toContain(
      "170개 정본 manifest 미등록",
    );
  });
  it("rejects missing last unit, duplicate unit or concept IDs, and broken prerequisites", () => {
    let data = clone();
    data.curriculum.units.pop();
    expect(validateProposal(data, curriculum).join()).toContain(
      "등록 단원 누락",
    );
    data = clone();
    data.curriculum.units[13].id = data.curriculum.units[12].id;
    expect(validateProposal(data, curriculum).join()).toContain("중복 단원");
    data = clone();
    data.curriculum.units[13].concepts[0].id =
      data.curriculum.units[12].concepts[0].id;
    expect(validateProposal(data, curriculum).join()).toContain("중복 개념");
    data = clone();
    data.curriculum.units[12].prerequisites = ["unknown"];
    expect(validateProposal(data, curriculum).join()).toContain(
      "선수 개념 누락",
    );
  });
  it("rejects cycles, forward prerequisites, wrong local IDs and duplicate titles", () => {
    let data = clone();
    data.curriculum.units[12].prerequisites = [
      data.curriculum.units[13].concepts[0].id,
    ];
    expect(validateProposal(data, curriculum).join()).toContain("순환");
    expect(validateProposal(data, curriculum).join()).toContain("먼저 학습");
    data = clone();
    data.curriculum.units[12].id = "M1-99";
    expect(validateProposal(data, curriculum).join()).toContain(
      "ID 순번 불일치",
    );
    data = clone();
    data.curriculum.units[13].title = data.curriculum.units[12].title;
    expect(validateProposal(data, curriculum).join()).toContain("중복 제목");
  });
  it("rejects stale base versions, missing levels and incorrect allocations", () => {
    let data = clone();
    data.baseVersion = "old";
    expect(validateProposal(data, curriculum).join()).toContain("버전 불일치");
    data = clone();
    data.levels[1].level = 0;
    expect(validateProposal(data, curriculum).join()).toContain(
      "LEVEL 0~8 중복 또는 누락",
    );
    data = clone();
    data.levels[1].count++;
    expect(validateProposal(data, curriculum).join()).toContain("수량 불일치");
    expect(validateProposal(data, curriculum).join()).toContain("합계는 170");
  });
  it("does not insert unverified official codes or omit population proportion inference", () => {
    expect(
      curriculumProposal.curriculum.units.every(
        (unit) => unit.standards.length === 0,
      ),
    ).toBe(true);
    const proportion = curriculumProposal.curriculum.units.find(
      (unit) => unit.id === "M7-20",
    );
    expect(proportion?.title).toContain("모비율");
    expect(proportion?.prerequisites).toContain("m7-14-c1");
    expect(
      curriculumProposal.curriculum.units
        .filter((unit) => unit.level === 7)
        .map((unit) => unit.title + unit.concepts.map((c) => c.label))
        .join(),
    ).not.toContain("원순열");
    const data = clone();
    data.curriculum.units[12].standards.push({
      authority: "unverified",
      code: "fake",
      sourceUrl: "https://example.com",
      verifiedAt: "2026-11-01T00:00:00.000Z",
    });
    expect(validateProposal(data, curriculum).join()).toContain(
      "공식 코드 매핑 미검증",
    );
  });
  it("keeps the review document in sync with all proposed IDs and titles", () => {
    const document = readFileSync("docs/CURRICULUM_PROPOSAL.md", "utf8");
    const rows = [...document.matchAll(/\| (M[0-8]-\d{2}) \| ([^|]+) \|/g)];
    expect(rows.map((row) => [row[1], row[2].trim()])).toEqual(
      curriculumProposal.curriculum.units.map((unit) => [unit.id, unit.title]),
    );
  });
  it("is never imported into active grading, learning, progress or authentication boundaries", () => {
    for (const file of [
      "src/data/curriculum.ts",
      "src/data/content.ts",
      "src/modules/question-bank/server.ts",
      "src/components/dashboard.tsx",
      "src/components/lesson.tsx",
      "src/proxy.ts",
    ]) {
      expect(readFileSync(file, "utf8")).not.toMatch(
        /(?:curriculum-proposal|proposals\/units)/,
      );
    }
  });
});
