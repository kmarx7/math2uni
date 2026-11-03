import { lessonForDelivery } from "@/modules/content/server";
import { getLessonOutline } from "@/data/content-index";
import { lessons } from "@/data/content";
import masterDesign from "@/data/master-design.json";
import { curriculumProposal } from "@/data/curriculum-proposal";
import { curriculum } from "@/data/curriculum";
import { describe, it, expect, vi, afterEach } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import spec from "../docs/specifications/M0-01/lesson-spec.json";
import blueprint from "../docs/specifications/M0-01/problem-blueprint.json";
import draft from "../docs/specifications/M0-01/content-draft.json";
import approval from "../docs/reviews/M0-01/approved-content.json";
import instruction from "@/data/m001-instruction.json";
import { lesson } from "@/data/content";
import { m001ExpansionProblems } from "@/data/m001-expansion";
import {
  validateLessonHandoff,
  canTransitionWorkflow,
} from "@/modules/content-quality";
import {
  approvalArtifactSchema,
  learningPhases,
  type ReviewEvidence,
} from "@/contracts/handoff";

afterEach(() => vi.unstubAllEnvs());
describe("cross-agent handoff contracts", () => {
  it("serves unapproved expanded lesson text and activities only in development preview", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MATH90_CONTENT_PREVIEW", "1");
    const delivered = lessonForDelivery("M0-01")!;
    expect(delivered.version).toBe("1.0.0");
    expect(delivered.learningPhases).toBeUndefined();
    expect(
      delivered.blocks.some(
        (block) => block.type === "ExplanationBlock" && block.sections,
      ),
    ).toBe(false);
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("MATH90_CONTENT_PREVIEW", "1");
    expect(lessonForDelivery("M0-01")).toBe(lesson);
    for (const doc of lessons)
      expect(
        getLessonOutline(doc.unitId)?.blocks.map((block) => block.id),
      ).toEqual(doc.blocks.map((block) => block.id));
  });

  it("records the aligned 170 development allocation without relabelling existing proposal identities", () => {
    expect(masterDesign.status).toBe("path-aligned-canonical-pending");
    expect(masterDesign.levels.map((item) => item.count)).toEqual([
      12, 14, 18, 22, 24, 20, 22, 18, 20,
    ]);
    expect(masterDesign.levels.reduce((sum, item) => sum + item.count, 0)).toBe(
      170,
    );
    expect(curriculumProposal.levels.map((item) => item.count)).toEqual([
      12, 20, 20, 22, 20, 24, 24, 20, 8,
    ]);
    expect(curriculumProposal.learningPath.version).toBe("0.3.0-proposed");
    expect(curriculumProposal.learningPath.levels.map((item) => item.proposedCount)).toEqual([
      12, 14, 18, 22, 24, 20, 22, 18, 20,
    ]);
    expect(curriculumProposal.curriculum.canonicalManifest).toEqual([]);
    expect(curriculumProposal.curriculum.units.slice(0, curriculum.units.length).map((unit) => unit.id)).toEqual(
      curriculum.units.map((unit) => unit.id),
    );
  });

  it("matches the reviewed design to six subunits, fifteen phases and thirty drafts", () => {
    expect(
      validateLessonHandoff(spec, blueprint, lesson, m001ExpansionProblems),
    ).toEqual([]);
    expect(spec.designReview.decision).toBe("implementation-ready");
    expect(spec.designReview.humanPublicationApproval).toBe(false);
    expect(lesson.blocks.map((block) => block.id)).toEqual(
      spec.assessmentCriteria.legacy.blockIds,
    );
    expect(lesson.learningPhases?.map((phase) => phase.id)).toEqual([
      ...learningPhases,
    ]);
    expect(
      lesson.learningPhases?.filter((phase) => phase.state === "available"),
    ).toHaveLength(14);
    expect(
      lesson.learningPhases?.filter((phase) => phase.state === "planned"),
    ).toHaveLength(1);
    const concept = lesson.blocks.find((block) => block.id === "concept");
    expect(
      concept?.type === "ExplanationBlock" ? concept.sections : undefined,
    ).toEqual(instruction.sections);
  });
  it("rejects missing phases, duplicate subunits, stale versions and incompatible question counts", () => {
    const pending = structuredClone(spec);
    pending.designReview.decision = "pending";
    expect(
      validateLessonHandoff(
        pending,
        blueprint,
        lesson,
        m001ExpansionProblems,
      ).join(),
    ).toContain("설계 검토 대기");
    let bad = structuredClone(spec);
    bad.lessonBlocks[1] = bad.lessonBlocks[0];
    expect(
      validateLessonHandoff(
        bad,
        blueprint,
        lesson,
        m001ExpansionProblems,
      ).join(),
    ).toContain("15단계");
    bad = structuredClone(spec);
    bad.subunits[1].id = bad.subunits[0].id;
    expect(
      validateLessonHandoff(
        bad,
        blueprint,
        lesson,
        m001ExpansionProblems,
      ).join(),
    ).toContain("소단원 ID 중복");
    bad = structuredClone(spec);
    bad.contentVersion = "old";
    expect(
      validateLessonHandoff(
        bad,
        blueprint,
        lesson,
        m001ExpansionProblems,
      ).join(),
    ).toContain("버전 불일치");
    expect(
      validateLessonHandoff(
        spec,
        blueprint,
        lesson,
        m001ExpansionProblems.slice(1),
      ).join(),
    ).toContain("문항 수 불일치");
  });
  it("keeps hashes and actual public explanations aligned with the reviewed artifact", () => {
    expect(draft.instruction).toEqual(instruction);
    expect(instruction.sections.map((section) => section.body)).toEqual(
      spec.subunits.map((subunit) => subunit.explanation),
    );
    for (const [path, digest] of Object.entries(draft.hashes))
      expect(
        createHash("sha256").update(readFileSync(path)).digest("hex"),
        path,
      ).toBe(digest);
    expect(approvalArtifactSchema.safeParse(approval).success).toBe(true);
    expect(approval.approvedContent).toBeNull();
    expect(
      m001ExpansionProblems.every(
        (problem) =>
          problem.status === "draft" && problem.reviewHistory.length === 0,
      ),
    ).toBe(true);
  });
  it("never promotes AI review or stale approval evidence into publication", () => {
    const digest = "a".repeat(64);
    const event = (
      stage: ReviewEvidence["stage"],
      actorType: ReviewEvidence["actorType"] = "agent",
      actorId = "reviewer",
    ): ReviewEvidence => ({
      artifactVersion: "v1",
      contentDigest: digest,
      actorId,
      actorType,
      stage,
      at: "2026-11-01T00:00:00.000Z",
      mathChecked: true,
      rightsChecked: true,
      notes: "test-only fabricated evidence; never stored as a real approval",
    });
    expect(
      canTransitionWorkflow(
        "researched",
        "reviewed",
        [event("reviewed", "agent", "author")],
        "v1",
        digest,
        "author",
      ),
    ).toBe(false);
    expect(
      canTransitionWorkflow(
        "researched",
        "reviewed",
        [event("reviewed")],
        "v1",
        digest,
        "author",
      ),
    ).toBe(true);
    expect(
      canTransitionWorkflow(
        "reviewed",
        "approved",
        [event("approved")],
        "v1",
        digest,
        "author",
      ),
    ).toBe(false);
    const approved = event("approved", "human");
    expect(
      canTransitionWorkflow(
        "reviewed",
        "approved",
        [approved],
        "v2",
        digest,
        "author",
      ),
    ).toBe(false);
    expect(
      canTransitionWorkflow(
        "reviewed",
        "approved",
        [approved],
        "v1",
        "b".repeat(64),
        "author",
      ),
    ).toBe(false);
    expect(
      canTransitionWorkflow(
        "reviewed",
        "approved",
        [approved],
        "v1",
        digest,
        "author",
      ),
    ).toBe(true);
    expect(
      canTransitionWorkflow(
        "tested",
        "published",
        [approved, event("published")],
        "v1",
        digest,
        "author",
      ),
    ).toBe(false);
    expect(
      canTransitionWorkflow(
        "tested",
        "published",
        [approved, event("tested", "automated"), event("published")],
        "v1",
        digest,
        "author",
      ),
    ).toBe(true);
    expect(
      canTransitionWorkflow(
        "draft",
        "published",
        [approved, event("tested"), event("published")],
        "v1",
        digest,
        "author",
      ),
    ).toBe(false);
  });
});
