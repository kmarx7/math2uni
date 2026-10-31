import { notFound } from "next/navigation";
import { Lesson } from "@/components/lesson";
import { getLesson } from "@/data/content";
import { curriculum } from "@/data/curriculum";
export default async function Page({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const { unitId } = await params;
  const unit = curriculum.units.find(
    (u) => u.id === unitId && u.status === "published",
  );
  const lesson = getLesson(unitId);
  if (!unit || !lesson) notFound();
  return <Lesson key={unit.id} doc={lesson} unit={unit} />;
}
