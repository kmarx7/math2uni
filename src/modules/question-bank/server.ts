import "server-only";
import { z } from "zod";
import { families, fixedProblems, generatePlace } from "@/data/problems";
import {
  foundationFamilies,
  foundationProblems,
} from "@/data/level-zero-problems";
import {
  m001ExpansionProblems,
  m001ExpansionFamilies,
  validateM001Expansion,
} from "@/data/m001-expansion";
import approvalData from "@/data/approvals.json";
import {
  reviewSchema,
  type ProblemInstance,
  type ProblemCollection,
} from "@/contracts";
import { canPublish } from "@/modules/administration";
import { toPublic } from "./core";
const approvals = z
  .array(reviewSchema.extend({ entityId: z.string().min(1) }))
  .parse(approvalData);
export type { ProblemCollection } from "@/contracts";
const expansionIssues = validateM001Expansion();
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
  collection: ProblemCollection = "core",
) {
  if (collection === "extended" && expansionIssues.length)
    throw new Error("확장 문항의 수학·스키마 검증에 실패했습니다.");
  const selected =
    collection === "extended" ? m001ExpansionProblems : candidates;
  return selected
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
  collection: ProblemCollection = "core",
) {
  return privateProblems(purpose, unitId, collection).map(toPublic);
}

export function publicFamilies(
  purpose: "practice" | "assessment",
  unitId = "M0-01",
  collection: ProblemCollection = "core",
) {
  const served = new Set(
    privateProblems(purpose, unitId, collection).map(
      (problem) => problem.familyId,
    ),
  );
  const all = new Map(
    [...families, ...foundationFamilies, ...m001ExpansionFamilies].map(
      (family) => [family.id, family],
    ),
  );
  return [...all.values()].filter((family) => served.has(family.id));
}
