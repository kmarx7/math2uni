import "server-only";
import { z } from "zod";
import { fixedProblems, generatePlace } from "@/data/problems";
import approvalData from "@/data/approvals.json";
import { reviewSchema, type ProblemInstance } from "@/contracts";
import { canPublish } from "@/modules/administration";
import { toPublic } from "./core";
const approvals = z
  .array(reviewSchema.extend({ entityId: z.string().min(1) }))
  .parse(approvalData);
const candidates = [
  ...fixedProblems,
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
export function privateProblems(purpose: "practice" | "assessment") {
  return candidates
    .map(reviewed)
    .filter((p) => p.purpose === purpose && (canPublish(p) || isPreview()));
}
export function publicProblems(purpose: "practice" | "assessment") {
  return privateProblems(purpose).map(toPublic);
}
