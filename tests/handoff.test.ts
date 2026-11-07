import { lessonForDelivery } from "@/modules/content/server";
import { contentSchema } from "@/contracts";
import { getLessonOutline } from "@/data/content-index";
import { lessons } from "@/data/content";
import masterDesign from "@/data/master-design.json";
import { curriculumProposal } from "@/data/curriculum-proposal";
import proposalUnits from "@/data/proposals/units.json";
import { curriculum } from "@/data/curriculum";
import { describe, it, expect, vi, afterEach } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import spec from "../docs/specifications/M0-01/lesson-spec.json";
import m504Spec from "../docs/specifications/NEXT_BATCH/M5-04/lesson-spec.json";
import m505Spec from "../docs/specifications/NEXT_BATCH/M5-05/lesson-spec.json";
import m506Spec from "../docs/specifications/NEXT_BATCH/M5-06/lesson-spec.json";
import m507Spec from "../docs/specifications/NEXT_BATCH/M5-07/lesson-spec.json";
import m508Spec from "../docs/specifications/NEXT_BATCH/M5-08/lesson-spec.json";
import m509Spec from "../docs/specifications/NEXT_BATCH/M5-09/lesson-spec.json";
import m510Spec from "../docs/specifications/NEXT_BATCH/M5-10/lesson-spec.json";
import m511Spec from "../docs/specifications/NEXT_BATCH/M5-11/lesson-spec.json";
import m512Spec from "../docs/specifications/NEXT_BATCH/M5-12/lesson-spec.json";
import m513Spec from "../docs/specifications/NEXT_BATCH/M5-13/lesson-spec.json";
import m514Spec from "../docs/specifications/NEXT_BATCH/M5-14/lesson-spec.json";
import m515Spec from "../docs/specifications/NEXT_BATCH/M5-15/lesson-spec.json";
import m516Spec from "../docs/specifications/NEXT_BATCH/M5-16/lesson-spec.json";
import m517Spec from "../docs/specifications/NEXT_BATCH/M5-17/lesson-spec.json";
import m518Spec from "../docs/specifications/NEXT_BATCH/M5-18/lesson-spec.json";
import m519Spec from "../docs/specifications/NEXT_BATCH/M5-19/lesson-spec.json";
import m520Spec from "../docs/specifications/NEXT_BATCH/M5-20/lesson-spec.json";
import m521Spec from "../docs/specifications/NEXT_BATCH/M5-21/lesson-spec.json";
import m522Spec from "../docs/specifications/NEXT_BATCH/M5-22/lesson-spec.json";
import m523Spec from "../docs/specifications/NEXT_BATCH/M5-23/lesson-spec.json";
import m524Spec from "../docs/specifications/NEXT_BATCH/M5-24/lesson-spec.json";
import m601Spec from "../docs/specifications/NEXT_BATCH/M6-01/lesson-spec.json";
import m602Spec from "../docs/specifications/NEXT_BATCH/M6-02/lesson-spec.json";
import m603Spec from "../docs/specifications/NEXT_BATCH/M6-03/lesson-spec.json";
import m604Spec from "../docs/specifications/NEXT_BATCH/M6-04/lesson-spec.json";
import blueprint from "../docs/specifications/M0-01/problem-blueprint.json";
import m509Blueprint from "../docs/research/NEXT_BATCH/M5-09/problem-blueprint.json";
import m510Blueprint from "../docs/research/NEXT_BATCH/M5-10/problem-blueprint.json";
import m511Blueprint from "../docs/research/NEXT_BATCH/M5-11/problem-blueprint.json";
import m512Blueprint from "../docs/research/NEXT_BATCH/M5-12/problem-blueprint.json";
import m513Blueprint from "../docs/research/NEXT_BATCH/M5-13/problem-blueprint.json";
import m514Blueprint from "../docs/research/NEXT_BATCH/M5-14/problem-blueprint.json";
import m515Blueprint from "../docs/research/NEXT_BATCH/M5-15/problem-blueprint.json";
import m516Blueprint from "../docs/research/NEXT_BATCH/M5-16/problem-blueprint.json";
import m517Blueprint from "../docs/research/NEXT_BATCH/M5-17/problem-blueprint.json";
import m518Blueprint from "../docs/research/NEXT_BATCH/M5-18/problem-blueprint.json";
import m519Blueprint from "../docs/research/NEXT_BATCH/M5-19/problem-blueprint.json";
import m520Blueprint from "../docs/research/NEXT_BATCH/M5-20/problem-blueprint.json";
import m521Blueprint from "../docs/research/NEXT_BATCH/M5-21/problem-blueprint.json";
import m522Blueprint from "../docs/research/NEXT_BATCH/M5-22/problem-blueprint.json";
import m523Blueprint from "../docs/research/NEXT_BATCH/M5-23/problem-blueprint.json";
import m524Blueprint from "../docs/research/NEXT_BATCH/M5-24/problem-blueprint.json";
import m601Blueprint from "../docs/research/NEXT_BATCH/M6-01/problem-blueprint.json";
import m602Blueprint from "../docs/research/NEXT_BATCH/M6-02/problem-blueprint.json";
import m603Blueprint from "../docs/research/NEXT_BATCH/M6-03/problem-blueprint.json";
import m604Blueprint from "../docs/research/NEXT_BATCH/M6-04/problem-blueprint.json";
import m514Content from "../docs/specifications/NEXT_BATCH/M5-14/content-draft.json";
import m515Content from "../docs/specifications/NEXT_BATCH/M5-15/content-draft.json";
import m516Content from "../docs/specifications/NEXT_BATCH/M5-16/content-draft.json";
import m517Content from "../docs/specifications/NEXT_BATCH/M5-17/content-draft.json";
import m518Content from "../docs/specifications/NEXT_BATCH/M5-18/content-draft.json";
import m519Content from "../docs/specifications/NEXT_BATCH/M5-19/content-draft.json";
import m520Content from "../docs/specifications/NEXT_BATCH/M5-20/content-draft.json";
import m521Content from "../docs/specifications/NEXT_BATCH/M5-21/content-draft.json";
import m522Content from "../docs/specifications/NEXT_BATCH/M5-22/content-draft.json";
import m523Content from "../docs/specifications/NEXT_BATCH/M5-23/content-draft.json";
import m524Content from "../docs/specifications/NEXT_BATCH/M5-24/content-draft.json";
import m601Content from "../docs/specifications/NEXT_BATCH/M6-01/content-draft.json";
import m602Content from "../docs/specifications/NEXT_BATCH/M6-02/content-draft.json";
import m603Content from "../docs/specifications/NEXT_BATCH/M6-03/content-draft.json";
import m604Content from "../docs/specifications/NEXT_BATCH/M6-04/content-draft.json";
import m514Runtime from "@/data/proposal-lessons/drafts/M5-14.json";
import m515Runtime from "@/data/proposal-lessons/drafts/M5-15.json";
import m516Runtime from "@/data/proposal-lessons/drafts/M5-16.json";
import m517Runtime from "@/data/proposal-lessons/drafts/M5-17.json";
import m518Runtime from "@/data/proposal-lessons/drafts/M5-18.json";
import m519Runtime from "@/data/proposal-lessons/drafts/M5-19.json";
import m520Runtime from "@/data/proposal-lessons/drafts/M5-20.json";
import m521Runtime from "@/data/proposal-lessons/drafts/M5-21.json";
import m522Runtime from "@/data/proposal-lessons/drafts/M5-22.json";
import m523Runtime from "@/data/proposal-lessons/drafts/M5-23.json";
import m524Runtime from "@/data/proposal-lessons/drafts/M5-24.json";
import m601Runtime from "@/data/proposal-lessons/drafts/M6-01.json";
import m602Runtime from "@/data/proposal-lessons/drafts/M6-02.json";
import m603Runtime from "@/data/proposal-lessons/drafts/M6-03.json";
import m604Runtime from "@/data/proposal-lessons/drafts/M6-04.json";
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
  lessonSpecSchema,
  problemBlueprintSchema,
  proposalProblemBlueprintSchema,
  proposalLessonSpecSchema,
  type ReviewEvidence,
} from "@/contracts/handoff";

const proposalLessonSpecs = [
  m504Spec,
  m505Spec,
  m506Spec,
  m507Spec,
  m508Spec,
  m509Spec,
  m510Spec,
  m511Spec,
  m512Spec,
  m513Spec,
  m514Spec,
  m515Spec,
  m516Spec,
  m517Spec,
  m518Spec,
  m519Spec,
  m520Spec,
  m521Spec,
  m522Spec,
  m523Spec,
  m524Spec,
  m601Spec,
  m602Spec,
  m603Spec,
  m604Spec,
];

const proposalProblemBlueprints = [
  m509Blueprint,
  m510Blueprint,
  m511Blueprint,
  m512Blueprint,
  m513Blueprint,
  m514Blueprint,
  m515Blueprint,
  m516Blueprint,
  m517Blueprint,
  m518Blueprint,
  m519Blueprint,
  m520Blueprint,
  m521Blueprint,
  m522Blueprint,
  m523Blueprint,
  m524Blueprint,
  m601Blueprint,
  m602Blueprint,
  m603Blueprint,
  m604Blueprint,
];

const proposalContents = [m514Content, m515Content, m516Content, m517Content, m518Content, m519Content, m520Content, m521Content, m522Content, m523Content, m524Content, m601Content, m602Content, m603Content, m604Content];
const proposalRuntimeContents = [m514Runtime, m515Runtime, m516Runtime, m517Runtime, m518Runtime, m519Runtime, m520Runtime, m521Runtime, m522Runtime, m523Runtime, m524Runtime, m601Runtime, m602Runtime, m603Runtime, m604Runtime];
const proposalContentUnitIds = ["M5-14", "M5-15", "M5-16", "M5-17", "M5-18", "M5-19", "M5-20", "M5-21", "M5-22", "M5-23", "M5-24", "M6-01", "M6-02", "M6-03", "M6-04"];

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

  it("validates proposal lesson specs separately from the M0 legacy handoff", () => {
    for (const input of proposalLessonSpecs) {
      const proposalSpec = proposalLessonSpecSchema.parse(input);
      const proposalUnit = proposalUnits.find(
        (unit) => unit.id === proposalSpec.unitId,
      );

      expect(lessonSpecSchema.safeParse(input).success).toBe(false);
      expect(proposalUnit).toBeDefined();
      expect(proposalSpec.levelId).toBe(`LEVEL ${proposalSpec.unitId[1]}`);
      expect({
        id: proposalSpec.unitId,
        title: proposalSpec.title,
        concepts: proposalSpec.proposalMetadata.concepts,
        prerequisiteUnits: proposalSpec.proposalMetadata.prerequisiteUnits,
        visualization: proposalSpec.proposalMetadata.visualization,
      }).toEqual({
        id: proposalUnit?.id,
        title: proposalUnit?.title,
        concepts: proposalUnit?.concepts,
        prerequisiteUnits: proposalUnit?.prerequisiteUnits,
        visualization: proposalUnit?.visualization,
      });

      expect(proposalSpec.subunits).toHaveLength(6);
      expect(
        proposalSpec.subunits.every((subunit) =>
          subunit.targetSkills.every((skill) =>
            proposalSpec.targetSkills.includes(skill),
          ),
        ),
      ).toBe(true);
      const phaseIds = proposalSpec.learningPhases.map(
        (phase) => phase.phaseId,
      );
      expect(phaseIds).toHaveLength(15);
      expect(new Set(phaseIds).size).toBe(15);
      expect(phaseIds).toEqual(
        Array.from({ length: 15 }, (_, index) =>
          `phase-${String(index + 1).padStart(2, "0")}`,
        ),
      );

      expect(proposalSpec.questionBlueprint.familyCount).toBe(3);
      expect(proposalSpec.questionBlueprint.draftItemCount).toBe(6);
      expect(proposalSpec.questionBlueprint.familyCriteria).toHaveLength(3);
      expect(proposalSpec.questionBlueprint.draftPracticeGoals).toHaveLength(6);
      expect(
        new Set(proposalSpec.questionBlueprint.draftPracticeGoals).size,
      ).toBe(6);
      expect(proposalSpec.questionBlueprint.assessmentInstanceCount).toBe(0);
      expect(proposalSpec.officialStandards).toEqual([]);
      expect(proposalSpec.reviewStatus).toBe("draft");
      expect(proposalSpec.publicationApproved).toBe(false);
      expect(proposalSpec.designReview.humanPublicationApproval).toBe(false);
      if (proposalSpec.designReview.decision !== undefined) {
        expect(proposalSpec.designReview.decision).toBe("implementation-ready");
        expect(proposalSpec.designReview.status).toBe("ai-reviewed");
      }
      expect(proposalSpec.implementationReadiness.publicationReady).toBe(false);
    }
  });

  it("keeps M5-14~M6-04 renderer data schema-valid and identical to curriculum drafts", () => {
    for (const [index, input] of proposalContents.entries()) {
      expect(() => contentSchema.parse(proposalRuntimeContents[index])).not.toThrow();
      expect(proposalRuntimeContents[index]).toEqual(input);
      expect(proposalRuntimeContents[index].unitId).toBe(proposalContentUnitIds[index]);
      expect(proposalRuntimeContents[index].blocks).toHaveLength(8);
      expect(proposalRuntimeContents[index].blocks.some((block) => block.type === "AssessmentBlock")).toBe(false);
      const lab = proposalRuntimeContents[index].blocks.find((block) => block.type === "InteractiveBlock");
      expect(lab?.type === "InteractiveBlock" ? lab.interaction : undefined).toBe(`${proposalContentUnitIds[index]?.toLowerCase()}-visual`);
    }
  });

  it("validates proposal problem blueprints separately from M0 and preserves draft-only practice", () => {
    for (const [index, input] of proposalProblemBlueprints.entries()) {
      const proposalBlueprint = proposalProblemBlueprintSchema.parse(input);
      const lessonSpec = proposalLessonSpecSchema.parse(
        proposalLessonSpecs[index + 5],
      );

      expect(problemBlueprintSchema.safeParse(input).success).toBe(false);
      expect(proposalBlueprint.unitId).toBe(lessonSpec.unitId);
      expect(proposalBlueprint.unitTitle).toBe(lessonSpec.title);
      expect(proposalBlueprint.contentVersion).toBe(lessonSpec.contentVersion);
      expect(proposalBlueprint.reviewStatus).toBe("draft");
      expect(proposalBlueprint.officialMappingStatus).toBe("unverified");
      expect(proposalBlueprint.publicationApproved).toBe(false);
      if (proposalBlueprint.unitId === "M5-24" || proposalBlueprint.unitId.startsWith("M6-")) {
        expect(proposalBlueprint.assessmentInstanceCount).toBe(0);
      }
      expect(proposalBlueprint.families).toHaveLength(3);
      expect(
        new Set(proposalBlueprint.families.map((family) => family.id)).size,
      ).toBe(3);

      const items = proposalBlueprint.families.flatMap((family) => {
        expect(lessonSpec.targetSkills).toContain(family.skillId);
        expect(family.items).toHaveLength(2);
        return family.items;
      });
      expect(items).toHaveLength(6);
      expect(new Set(items.map((item) => item.id)).size).toBe(6);
      expect(items.every((item) => item.purpose === "practice-draft")).toBe(true);
      expect(items.every((item) => item.status === "draft")).toBe(true);
      expect(items.every((item) => item.verification.humanVerified === false)).toBe(true);
      const answerIds: string[] = [];
      for (const family of proposalBlueprint.families) {
        for (const item of family.items) {
          expect(item.skillLabel).toBe(family.skillId);
          expect(
            [...new Set(item.choices.map((choice) => choice.id))].sort(),
          ).toEqual(["A", "B", "C"]);
          answerIds.push(item.answer.value);
          const answerChoice = item.choices.find(
            (choice) => choice.id === item.answer.value,
          );
          expect(answerChoice).toBeDefined();
          expect(answerChoice?.label).toBe(item.semanticAnswer);
        }
      }
      expect({
        A: answerIds.filter((id) => id === "A").length,
        B: answerIds.filter((id) => id === "B").length,
        C: answerIds.filter((id) => id === "C").length,
      }).toEqual({ A: 2, B: 2, C: 2 });
    }

    const wrongSemanticAnswer = structuredClone(proposalProblemBlueprints[0]);
    wrongSemanticAnswer.families[0].items[0].semanticAnswer = "incorrect";
    expect(
      proposalProblemBlueprintSchema.safeParse(wrongSemanticAnswer).success,
    ).toBe(false);

    const duplicateChoices = structuredClone(proposalProblemBlueprints[0]);
    duplicateChoices.families[0].items[0].choices[1].id =
      duplicateChoices.families[0].items[0].choices[0].id;
    expect(
      proposalProblemBlueprintSchema.safeParse(duplicateChoices).success,
    ).toBe(false);

    const assessmentBlueprint: unknown = {
      ...proposalProblemBlueprints.find((candidate) => candidate.unitId === "M6-01")!,
      assessmentInstanceCount: 1,
    };
    expect(proposalProblemBlueprintSchema.safeParse(assessmentBlueprint).success).toBe(false);
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
