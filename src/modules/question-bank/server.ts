import "server-only";
import { z } from "zod";
import { fixedProblems, generatePlace } from "@/data/problems";
import { foundationProblems } from "@/data/level-zero-problems";
import approvalData from "@/data/approvals.json";
import { reviewSchema, type ProblemInstance } from "@/contracts";
import { canPublish } from "@/modules/administration";
import { toPublic } from "./core";
const approvals = z
  .array(reviewSchema.extend({ entityId: z.string().min(1) }))
  .parse(approvalData);
const candidates = [
  ...fixedProblems,
  ...foundationProblems,
  generatePlace(4821, 100),
  generatePlace(5703, 1000),
];
export function isPreview() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.MATH90_CONTENT_PREVIEW === "1"
  );
}
function reviewed(p: ProblemInstance): ProblemInstance {
  const records = approvals.filter(
    (a) => a.entityId === (p.templateId ?? p.id) && a.version === p.version,
  );
  return {
    ...p,
    status: records.length ? "approved" : p.status,
    reviewHistory: [...p.reviewHistory, ...records],
  };
}
export function privateProblems(
  purpose: "practice" | "assessment",
  unitId = "M0-01",
) {
  return candidates
    .map(reviewed)
    .filter(
      (p) =>
        p.purpose === purpose &&
        p.unitId === unitId &&
        (canPublish(p) || isPreview()),
    );
}
export function publicProblems(
  purpose: "practice" | "assessment",
  unitId = "M0-01",
) {
  return privateProblems(purpose, unitId).map(toPublic);
}
