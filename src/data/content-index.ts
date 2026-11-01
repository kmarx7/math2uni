import index from "./content-index.json";
// Public completion metadata only. Lesson text is delivered through a server gate.
export function getLessonOutline(unitId: string) {
  const entry = index.find((item) => item.unitId === unitId);
  return entry
    ? { unitId: entry.unitId, blocks: entry.blockIds.map((id) => ({ id })) }
    : undefined;
}
