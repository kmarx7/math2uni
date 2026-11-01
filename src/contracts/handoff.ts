import { z } from "zod";
import { id, thinkingTypeSchema } from "./index";
export const learningPhases = [
  "learning-objectives",
  "prerequisite-check",
  "concept-introduction",
  "concept-explanation",
  "visual-exploration",
  "principle-derivation",
  "worked-example",
  "foundation-practice",
  "family-practice",
  "application-practice",
  "advanced-transfer",
  "error-analysis",
  "formative-assessment",
  "spaced-review",
  "next-unit",
] as const;
export const workflowStages = [
  "draft",
  "researched",
  "reviewed",
  "approved",
  "implemented",
  "tested",
  "published",
] as const;
const text = z.string().min(1);
export const lessonSpecSchema = z
  .object({
    schemaVersion: z.literal("1"),
    unitId: id,
    levelId: z.number().int().min(0).max(8),
    title: text,
    contentVersion: id,
    reviewStatus: z.enum(["draft", "researched", "reviewed"]),
    authorRole: z.literal("curriculum"),
    publicationApproved: z.literal(false),
    objectives: z.array(text).min(1),
    prerequisiteSkills: z.array(
      z.object({ id, status: text, description: text }),
    ),
    targetSkills: z.array(id).min(1),
    instructionalStrategy: z.object({
      sequence: text,
      principleDerivation: text,
      naturalNumberConvention: text,
      accessibility: text,
    }),
    subunits: z
      .array(
        z.object({
          id,
          title: text,
          targetSkills: z.array(id).min(1),
          explanation: text,
          activity: text,
          check: text,
        }),
      )
      .min(6),
    lessonBlocks: z
      .array(
        z.object({
          phaseId: z.enum(learningPhases),
          title: text,
          existingBlockId: id,
          implementationStatus: text,
          requiredForLegacyCompletion: z.boolean(),
        }),
      )
      .length(15),
    interactiveComponents: z
      .array(
        z
          .object({ id, existing: z.boolean(), features: z.array(text).min(1) })
          .passthrough(),
      )
      .min(1),
    questionBlueprint: id,
    assessmentCriteria: z.object({
      legacy: z.object({
        scoreThreshold: z.number().min(0).max(100),
        skillThreshold: z.number().min(0).max(100),
        evidence: text,
        blockIds: z.array(id).min(1),
      }),
      extension: z
        .object({
          scoreThreshold: z.number().min(0).max(100),
          questionCount: z.number().int().positive(),
          allAnswersBeforeFeedback: z.literal(true),
          legacyCompletionUnaffected: z.literal(true),
        })
        .passthrough(),
    }),
    reviewPolicy: z.object({
      intervalDays: z.array(z.number().int().positive()),
      incorrectResetDays: z.number().int().positive(),
      immediateRetryIndependent: z.literal(false),
      delayedIndependentAfterHours: z.number().positive(),
      existingSchedulePreserved: z.literal(true),
    }),
    designReview: z
      .object({
        status: text,
        reviewerRole: text,
        humanPublicationApproval: z.literal(false),
      })
      .passthrough(),
    implementationReadiness: z.object({
      status: text,
      publicationReady: z.literal(false),
      pending: z.array(text),
    }),
  })
  .passthrough();
export type LessonSpec = z.infer<typeof lessonSpecSchema>;
export const problemBlueprintSchema = z
  .object({
    schemaVersion: z.literal("1"),
    unitId: id,
    contentVersion: id,
    reviewStatus: z.enum(["draft", "researched", "reviewed"]),
    publicationApproved: z.literal(false),
    families: z
      .array(
        z.object({
          id,
          skillId: id,
          title: text,
          thinkingType: thinkingTypeSchema,
          strategy: text,
          distinctFrom: text,
          difficulty: z.array(z.enum(["D1", "D2", "D3", "D4", "D5"])).min(1),
          practiceCount: z.number().int().nonnegative(),
          assessmentCount: z.number().int().nonnegative(),
          validation: text,
        }),
      )
      .min(10),
    counts: z
      .object({
        newFamilies: z.number().int().nonnegative(),
        reusedFamilies: z.number().int().nonnegative(),
        totalDistinctFamilies: z.number().int().positive(),
        newFixedDrafts: z.number().int().min(30),
        newPracticeDrafts: z.number().int().positive(),
        newAssessmentDrafts: z.number().int().positive(),
      })
      .passthrough(),
    requiredPractice: z.object({
      legacyBaseline: z.number().int().positive(),
      extensionRecommended: z.number().int().positive(),
      extensionBankCount: z.number().int().positive(),
      advancedOptional: z.literal(true),
      explanation: text,
    }),
  })
  .passthrough();
export const reviewEvidenceSchema = z.object({
  artifactVersion: id,
  contentDigest: z.string().regex(/^[a-f0-9]{64}$/),
  actorId: id,
  actorType: z.enum(["agent", "automated", "human"]),
  stage: z.enum(workflowStages),
  at: z.iso.datetime(),
  mathChecked: z.boolean(),
  rightsChecked: z.boolean(),
  notes: text,
});
export type ReviewEvidence = z.infer<typeof reviewEvidenceSchema>;
export const approvalArtifactSchema = z
  .object({
    unitId: id,
    contentVersion: id,
    publicationStatus: z.literal("pending"),
    approvedContent: z.null(),
    humanApproval: z.null(),
    reason: text,
  })
  .strict();
