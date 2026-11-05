/** IDs that have a local, review-only lesson implementation. No content or answer data. */
export const draftPreviewUnitIds = [
  "M1-01", "M1-02", "M1-03", "M1-04", "M1-05",
  "M1-06", "M1-07", "M1-08", "M1-09", "M1-10",
  "M1-11", "M1-12", "M1-13", "M1-14", "M1-15",
  "M1-16", "M1-17", "M1-18", "M1-19", "M1-20",
  "M2-01", "M2-02", "M2-03", "M2-04", "M2-05",
  "M2-06", "M2-07", "M2-08", "M2-09", "M2-10",
  "M2-11", "M2-12", "M2-13", "M2-14", "M2-15",
  "M2-16", "M2-17", "M2-18", "M2-19", "M2-20",
  "M3-01", "M3-02", "M3-03", "M3-04", "M3-05",
  "M3-06", "M3-07", "M3-08", "M3-09", "M3-10",
  "M3-11", "M3-12", "M3-13", "M3-14", "M3-15",
  "M3-16", "M3-17", "M3-18", "M3-19", "M3-20",
  "M3-21", "M3-22", "M4-01", "M4-02", "M4-03",
  "M4-04", "M4-05", "M4-06", "M4-07", "M4-08",
  "M4-09", "M4-10", "M4-11", "M4-12", "M4-13",
  "M4-14", "M4-15", "M4-16", "M4-17", "M4-18",
  "M4-19", "M4-20", "M5-01", "M5-02", "M5-03",
  "M5-04", "M5-05", "M5-06", "M5-07", "M5-08",
] as const;

export function isDraftPreviewUnitId(unitId: string) {
  return (draftPreviewUnitIds as readonly string[]).includes(unitId);
}
