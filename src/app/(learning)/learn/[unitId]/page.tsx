import { notFound } from "next/navigation";
import { Lesson } from "@/components/lesson";
import { lessonForDelivery } from "@/modules/content/server";
import { draftLessonForPreview, draftUnitForPreview, isContentPreviewEnabled, nextDraftUnitForPreview } from "@/modules/content/preview-server";
import { curriculum } from "@/data/curriculum";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ unitId: string }>;
  searchParams: Promise<{ collection?: string }>;
}) {
  const { unitId } = await params;
  const query = await searchParams;
  const initialCollection =
    unitId === "M0-01" &&
    query.collection === "extended" &&
    process.env.NODE_ENV === "development" &&
    process.env.MATH90_CONTENT_PREVIEW === "1"
      ? "extended"
      : "core";
  const activeUnit = curriculum.units.find(
    (u) => u.id === unitId && u.status === "published",
  );
  const proposalUnit = isContentPreviewEnabled() ? draftUnitForPreview(unitId) : undefined;
  const unit = activeUnit ?? proposalUnit;
  const lesson = activeUnit ? lessonForDelivery(unitId) : draftLessonForPreview(unitId);
  if (!unit || !lesson) notFound();
  return (
    <Lesson
      key={`${unit.id}:${initialCollection}`}
      doc={lesson}
      unit={unit}
      draftPreview={!activeUnit && !!proposalUnit}
      nextDraftUnit={proposalUnit ? nextDraftUnitForPreview(unit.id) : undefined}
      initialCollection={initialCollection}
    />
  );
}
