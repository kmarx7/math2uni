import "server-only";
import type { ContentDocument } from "@/contracts";
import { contentSchema } from "@/contracts";
import { getLesson } from "@/data/content";
import legacyM001 from "@/data/m001-core-lesson.json";
const coreM001 = contentSchema.parse(legacyM001);

/** Expanded lesson text/activities have no human publication approval yet. */
export function lessonForDelivery(unitId: string): ContentDocument | undefined {
  const preview =
    process.env.NODE_ENV === "development" &&
    process.env.MATH90_CONTENT_PREVIEW === "1";
  if (unitId === "M0-01" && !preview) return coreM001;
  return getLesson(unitId);
}
