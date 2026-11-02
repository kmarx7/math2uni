/** IDs that have a local, review-only lesson implementation. No content or answer data. */
export const draftPreviewUnitIds = [
  "M1-01", "M1-02", "M1-03", "M1-04", "M1-05",
  "M1-06", "M1-07", "M1-08", "M1-09", "M1-10",
  "M1-11", "M1-12", "M1-13", "M1-14", "M1-15",
  "M1-16", "M1-17", "M1-18", "M1-19", "M1-20",
  "M2-01", "M2-02", "M2-03", "M2-04", "M2-05",
] as const;

export function isDraftPreviewUnitId(unitId: string) {
  return (draftPreviewUnitIds as readonly string[]).includes(unitId);
}
