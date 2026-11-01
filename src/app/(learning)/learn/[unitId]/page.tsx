import { notFound } from "next/navigation";
import { Lesson } from "@/components/lesson";
import { lessonForDelivery } from "@/modules/content/server";
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
  const unit = curriculum.units.find(
    (u) => u.id === unitId && u.status === "published",
  );
  const lesson = lessonForDelivery(unitId);
  if (!unit || !lesson) notFound();
  return (
    <Lesson
      key={`${unit.id}:${initialCollection}`}
      doc={lesson}
      unit={unit}
      initialCollection={initialCollection}
    />
  );
}
