import { CurriculumPlan } from "@/components/curriculum-plan";
import { curriculumProposal } from "@/data/curriculum-proposal";
import { curriculum } from "@/data/curriculum";
import { validateProposal } from "@/modules/curriculum/proposal";
import { draftPreviewUnitIds } from "@/modules/content/preview-server";

export default function Page() {
  const errors = validateProposal(curriculumProposal, curriculum);
  if (errors.length)
    throw new Error(`교육과정 제안 데이터 검사 실패: ${errors.join(", ")}`);
  return (
    <CurriculumPlan
      proposal={curriculumProposal}
      registeredIds={curriculum.registeredManifest}
      previewIds={draftPreviewUnitIds()}
    />
  );
}
