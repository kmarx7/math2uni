import type { ProblemInstance } from "@/contracts";
export function canPublish(p: ProblemInstance): boolean {
  return (
    p.status === "approved" &&
    p.provenance.license === "project-original" &&
    !!p.provenance.source &&
    p.reviewHistory.some(
      (r) =>
        r.version === p.version &&
        r.decision === "approved" &&
        r.actorType === "human" &&
        r.mathChecked &&
        !!r.reviewer,
    )
  );
}
