/** IDs that have a local, review-only lesson implementation. No content or answer data. */
export const draftPreviewUnitIds = ["M1-01", "M1-02", "M1-03", "M1-04", "M1-05"] as const;

export function isDraftPreviewUnitId(unitId: string) {
  return (draftPreviewUnitIds as readonly string[]).includes(unitId);
}
