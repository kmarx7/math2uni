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
import draftM116 from "../../../docs/specifications/NEXT_BATCH/M1-16/content-draft.json";
import draftM117 from "../../../docs/specifications/NEXT_BATCH/M1-17/content-draft.json";
import draftM118 from "../../../docs/specifications/NEXT_BATCH/M1-18/content-draft.json";
import draftM119 from "../../../docs/specifications/NEXT_BATCH/M1-19/content-draft.json";
import draftM120 from "../../../docs/specifications/NEXT_BATCH/M1-20/content-draft.json";
import draftM201 from "../../../docs/specifications/NEXT_BATCH/M2-01/content-draft.json";
import draftM202 from "../../../docs/specifications/NEXT_BATCH/M2-02/content-draft.json";
import draftM203 from "../../../docs/specifications/NEXT_BATCH/M2-03/content-draft.json";
import draftM204 from "../../../docs/specifications/NEXT_BATCH/M2-04/content-draft.json";
import draftM205 from "../../../docs/specifications/NEXT_BATCH/M2-05/content-draft.json";
import draftM206 from "../../../docs/specifications/NEXT_BATCH/M2-06/content-draft.json";
import draftM207 from "../../../docs/specifications/NEXT_BATCH/M2-07/content-draft.json";
import draftM208 from "../../../docs/specifications/NEXT_BATCH/M2-08/content-draft.json";
import draftM209 from "../../../docs/specifications/NEXT_BATCH/M2-09/content-draft.json";
import draftM210 from "../../../docs/specifications/NEXT_BATCH/M2-10/content-draft.json";
import draftM211 from "../../../docs/specifications/NEXT_BATCH/M2-11/content-draft.json";
import draftM212 from "../../../docs/specifications/NEXT_BATCH/M2-12/content-draft.json";
import draftM213 from "../../../docs/specifications/NEXT_BATCH/M2-13/content-draft.json";
import draftM214 from "../../../docs/specifications/NEXT_BATCH/M2-14/content-draft.json";
import draftM215 from "../../../docs/specifications/NEXT_BATCH/M2-15/content-draft.json";
import draftM216 from "../../../docs/specifications/NEXT_BATCH/M2-16/content-draft.json";
import draftM217 from "../../../docs/specifications/NEXT_BATCH/M2-17/content-draft.json";
import draftM218 from "../../../docs/specifications/NEXT_BATCH/M2-18/content-draft.json";
import draftM219 from "../../../docs/specifications/NEXT_BATCH/M2-19/content-draft.json";
import draftM220 from "../../../docs/specifications/NEXT_BATCH/M2-20/content-draft.json";
import draftM301 from "@/data/proposal-lessons/drafts/M3-01.json";
import draftM302 from "@/data/proposal-lessons/drafts/M3-02.json";
import draftM303 from "@/data/proposal-lessons/drafts/M3-03.json";
import draftM304 from "@/data/proposal-lessons/drafts/M3-04.json";
import draftM305 from "@/data/proposal-lessons/drafts/M3-05.json";
import draftM306 from "@/data/proposal-lessons/drafts/M3-06.json";
import draftM307 from "@/data/proposal-lessons/drafts/M3-07.json";
import draftM308 from "@/data/proposal-lessons/drafts/M3-08.json";
import draftM309 from "@/data/proposal-lessons/drafts/M3-09.json";
import draftM310 from "@/data/proposal-lessons/drafts/M3-10.json";
import draftM311 from "@/data/proposal-lessons/drafts/M3-11.json";
import draftM312 from "@/data/proposal-lessons/drafts/M3-12.json";
import draftM313 from "@/data/proposal-lessons/drafts/M3-13.json";
import draftM314 from "@/data/proposal-lessons/drafts/M3-14.json";
import draftM315 from "@/data/proposal-lessons/drafts/M3-15.json";
import draftM316 from "@/data/proposal-lessons/drafts/M3-16.json";
import draftM317 from "@/data/proposal-lessons/drafts/M3-17.json";
import draftM318 from "@/data/proposal-lessons/drafts/M3-18.json";
import draftM319 from "@/data/proposal-lessons/drafts/M3-19.json";
import draftM320 from "@/data/proposal-lessons/drafts/M3-20.json";
import { draftPreviewUnitIds } from "@/data/proposal-preview-manifest";

const draftLessons = new Map<string, ContentDocument>(
  [draftM101, draftM102, draftM103, draftM104, draftM105, draftM106, draftM107, draftM108, draftM109, draftM110, draftM111, draftM112, draftM113, draftM114, draftM115, draftM116, draftM117, draftM118, draftM119, draftM120, draftM201, draftM202, draftM203, draftM204, draftM205, draftM206, draftM207, draftM208, draftM209, draftM210, draftM211, draftM212, draftM213, draftM214, draftM215, draftM216, draftM217, draftM218, draftM219, draftM220, draftM301, draftM302, draftM303, draftM304, draftM305, draftM306, draftM307, draftM308, draftM309, draftM310, draftM311, draftM312, draftM313, draftM314, draftM315, draftM316, draftM317, draftM318, draftM319, draftM320].map((draft) => [
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
