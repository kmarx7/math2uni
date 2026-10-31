import { contentSchema, type ContentDocument, type Unit } from "@/contracts";
export function validateContent(doc: ContentDocument, units: Unit[]): string[] {
  const parsed = contentSchema.safeParse(doc);
  if (!parsed.success) return parsed.error.issues.map((x) => x.message);
  const errors: string[] = [];
  if (!units.some((u) => u.id === doc.unitId && u.status === "published"))
    errors.push("공개 단원 참조 필요");
  if (new Set(doc.blocks.map((b) => b.id)).size !== doc.blocks.length)
    errors.push("블록 ID 중복");
  return errors;
}
