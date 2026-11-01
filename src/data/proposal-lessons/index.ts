import type { ContentDocument, Unit } from "@/contracts";
import { contentSchema } from "@/contracts";
import { curriculumProposal } from "@/data/curriculum-proposal";
import draftM101 from "../../../docs/specifications/NEXT_BATCH/M1-01/content-draft.json";
import draftM102 from "../../../docs/specifications/NEXT_BATCH/M1-02/content-draft.json";
import draftM103 from "../../../docs/specifications/NEXT_BATCH/M1-03/content-draft.json";
import draftM104 from "../../../docs/specifications/NEXT_BATCH/M1-04/content-draft.json";
import draftM105 from "../../../docs/specifications/NEXT_BATCH/M1-05/content-draft.json";
import draftM106 from "../../../docs/specifications/NEXT_BATCH/M1-06/content-draft.json";
import draftM107 from "../../../docs/specifications/NEXT_BATCH/M1-07/content-draft.json";
import draftM108 from "../../../docs/specifications/NEXT_BATCH/M1-08/content-draft.json";
import draftM109 from "../../../docs/specifications/NEXT_BATCH/M1-09/content-draft.json";
import draftM110 from "../../../docs/specifications/NEXT_BATCH/M1-10/content-draft.json";
import draftM111 from "../../../docs/specifications/NEXT_BATCH/M1-11/content-draft.json";
import draftM112 from "../../../docs/specifications/NEXT_BATCH/M1-12/content-draft.json";
import draftM113 from "../../../docs/specifications/NEXT_BATCH/M1-13/content-draft.json";
import draftM114 from "../../../docs/specifications/NEXT_BATCH/M1-14/content-draft.json";
import draftM115 from "../../../docs/specifications/NEXT_BATCH/M1-15/content-draft.json";
import { draftPreviewUnitIds } from "@/data/proposal-preview-manifest";

const draftLessons = new Map<string, ContentDocument>(
  [draftM101, draftM102, draftM103, draftM104, draftM105, draftM106, draftM107, draftM108, draftM109, draftM110, draftM111, draftM112, draftM113, draftM114, draftM115].map((draft) => [
    draft.unitId,
    contentSchema.parse(draft),
  ]),
);

export function getDraftLessonForPreview(unitId: string): ContentDocument | undefined {
  return draftLessons.get(unitId);
}

export function getDraftUnitForPreview(unitId: string): Unit | undefined {
  if (!previewUnitIds.has(unitId)) return undefined;
  return curriculumProposal.curriculum.units.find(
    (unit) => unit.id === unitId && unit.status === "draft",
  );
}

const previewUnitIds = new Set<string>(draftPreviewUnitIds);
export function availableDraftPreviewIds(): string[] {
  return [...previewUnitIds];
}

export function getNextDraftUnitForPreview(unitId: string): Unit | undefined {
  const current = getDraftUnitForPreview(unitId);
  if (!current) return undefined;
  return curriculumProposal.curriculum.units.find(
    (unit) => unit.order === current.order + 1 && previewUnitIds.has(unit.id),
  );
}
