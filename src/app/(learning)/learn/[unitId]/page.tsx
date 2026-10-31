import { notFound } from "next/navigation";
import { Lesson } from "@/components/lesson";
import { lesson } from "@/data/content";
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
  if (!unit || lesson.unitId !== unitId) notFound();
  return <Lesson doc={lesson} unit={unit} />;
}
