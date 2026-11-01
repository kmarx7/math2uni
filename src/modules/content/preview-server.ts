import "server-only";
import {
  availableDraftPreviewIds,
  getDraftLessonForPreview,
  getDraftUnitForPreview,
  getNextDraftUnitForPreview,
} from "@/data/proposal-lessons";

export function isContentPreviewEnabled() {
  return process.env.NODE_ENV === "development" && process.env.MATH90_CONTENT_PREVIEW === "1";
}

export function draftLessonForPreview(unitId: string) {
  return isContentPreviewEnabled() ? getDraftLessonForPreview(unitId) : undefined;
}

export function draftUnitForPreview(unitId: string) {
  return isContentPreviewEnabled() ? getDraftUnitForPreview(unitId) : undefined;
}

export function nextDraftUnitForPreview(unitId: string) {
  return isContentPreviewEnabled() ? getNextDraftUnitForPreview(unitId) : undefined;
}

export function draftPreviewUnitIds() {
  return isContentPreviewEnabled() ? availableDraftPreviewIds() : [];
}
