import { curriculumSchema, type Curriculum } from "@/contracts";
export function validateCurriculum(
  data: Curriculum,
  canonical = false,
): string[] {
  const parsed = curriculumSchema.safeParse(data);
  if (!parsed.success) return parsed.error.issues.map((x) => x.message);
  const errors: string[] = [];
  const units = new Set<string>();
  const orders = new Set<number>();
  const concepts = new Map<string, string>();
  for (const u of data.units) {
    if (units.has(u.id)) errors.push(`중복 단원 ${u.id}`);
    units.add(u.id);
    if (orders.has(u.order)) errors.push(`중복 순서 ${u.order}`);
    orders.add(u.order);
    if (!u.id.startsWith(`M${u.level}-`)) errors.push(`레벨 불일치 ${u.id}`);
    for (const c of u.concepts) {
      if (concepts.has(c.id)) errors.push(`중복 개념 ${c.id}`);
      concepts.set(c.id, u.id);
    }
  }
  for (let n = 1; n <= data.units.length; n++)
    if (!orders.has(n)) errors.push(`단원 순서 누락 ${n}`);
  if (new Set(data.registeredManifest).size !== data.registeredManifest.length)
    errors.push("등록 manifest 중복");
  for (const [index, expected] of data.registeredManifest.entries()) {
    if (!data.units.some((u) => u.id === expected && u.order === index + 1))
      errors.push(`등록 단원 누락/순서 불일치 ${expected}`);
  }
  for (const u of data.units)
    if (!data.registeredManifest.includes(u.id))
      errors.push(`등록 manifest 밖 단원 ${u.id}`);
  const graph = new Map(
    data.units.map((u) => [
      u.id,
      u.prerequisites.map((c) => {
        if (!concepts.has(c)) errors.push(`선수 개념 누락 ${c}`);
        return concepts.get(c) ?? "";
      }),
    ]),
  );
  const visiting = new Set<string>(),
    visited = new Set<string>();
  function visit(k: string) {
    if (visiting.has(k)) {
      errors.push(`선수 그래프 순환 ${k}`);
      return;
    }
    if (visited.has(k)) return;
    visiting.add(k);
    for (const p of graph.get(k) ?? []) visit(p);
    visiting.delete(k);
    visited.add(k);
  }
  for (const u of data.units) visit(u.id);
  if (canonical || data.coverage === "canonical") {
    if (
      data.canonicalManifest.length !== 170 ||
      new Set(data.canonicalManifest).size !== 170
    )
      errors.push("170개 정본 manifest 미등록");
    if (data.units.length !== 170)
      errors.push(`170개 단원 중 ${data.units.length}개 등록`);
    data.canonicalManifest.forEach((key, i) => {
      if (!data.units.some((u) => u.id === key && u.order === i + 1))
        errors.push(`정본 누락/순서 불일치 ${key}`);
    });
  }
  return errors;
}
export function recommendUnit(
  curriculum: Curriculum,
  unitId: string,
  mastery: Record<string, number>,
) {
  const unit = curriculum.units.find((u) => u.id === unitId);
  if (!unit) return null;
  const missing = unit.prerequisites.find((c) => (mastery[c] ?? 0) < 80);
  return missing
    ? (curriculum.units.find((u) => u.concepts.some((c) => c.id === missing)) ??
        unit)
    : unit;
}
