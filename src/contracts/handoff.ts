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

/** Proposal curriculum documents have their own data dialect and do not represent
 * the M0 legacy completion/assessment handoff parsed by lessonSpecSchema. */
export const proposalLessonSpecSchema = z
  .object({
    schemaVersion: z.literal(1),
    unitId: z.string().regex(/^M[0-8]-\d{2}$/),
    levelId: z.enum([
      "LEVEL 0", "LEVEL 1", "LEVEL 2", "LEVEL 3", "LEVEL 4",
      "LEVEL 5", "LEVEL 6", "LEVEL 7", "LEVEL 8",
    ]),
    title: text,
    contentVersion: id,
    reviewStatus: z.enum(["draft", "researched", "reviewed"]),
    authorRole: z.literal("curriculum"),
    publicationApproved: z.literal(false),
    officialStandards: z.array(z.object({
      authority: id,
      code: id,
      sourceUrl: z.url(),
      verifiedAt: z.iso.datetime(),
    }).strict()),
    proposalMetadata: z.object({
      concepts: z.array(text).min(1),
      prerequisiteUnits: z.array(z.string().regex(/^M[0-8]-\d{2}$/)),
      visualization: text,
    }).strict(),
    objectives: z.array(text).min(1),
    prerequisiteSkills: z.array(z.object({
      id,
      status: text,
      description: text,
    }).strict()),
    targetSkills: z.array(id).min(1),
    instructionalStrategy: z.object({
      sequence: text,
      principleDerivation: text,
      accessibility: text,
    }).strict(),
    subunits: z.array(z.object({
      id,
      title: text,
      targetSkills: z.array(id).min(1),
      explanation: text,
      activity: text,
      check: text,
    }).strict()).min(6),
    interactiveComponents: z.array(z.object({
      id,
      kind: text,
      interaction: text,
      description: text,
      features: z.array(text).min(1),
    }).strict()).min(1),
    questionBlueprint: z.object({
      familyCount: z.number().int().positive(),
      draftItemCount: z.number().int().positive(),
      familyCriteria: z.array(text).min(1),
      draftPracticeGoals: z.array(text).min(1),
      assessmentInstanceCount: z.number().int().nonnegative(),
      assessment: text,
      distinctReasoningRule: text,
    }).strict(),
    assessmentCriteria: z.array(text).min(1),
    reviewPolicy: z.object({
      intervalDays: z.array(z.number().int().positive()),
      status: text,
      retrieval: text,
    }).strict(),
    workedExample: z.object({
      prompt: text,
      solution: text,
      verification: text,
    }).strict(),
    learningPhases: z.array(z.object({
      phaseId: id,
      title: text,
    }).strict()).length(15),
    misconceptionsToCheck: z.array(text),
    designReview: z.object({
      decision: z.enum(["pending", "implementation-ready"]).optional(),
      status: text,
      reviewerRole: text,
      reviewerIdentity: text,
      scope: text.optional(),
      humanPublicationApproval: z.literal(false),
    }).strict(),
    implementationReadiness: z.object({
      status: text,
      publicationReady: z.literal(false),
      pending: z.array(text),
    }).strict(),
  })
  .strict();
export type ProposalLessonSpec = z.infer<typeof proposalLessonSpecSchema>;

/** Research proposal blueprints are draft practice collections, not the M0
 * legacy family/assessment handoff parsed by problemBlueprintSchema. */
export const proposalProblemBlueprintSchema = z
  .object({
    schemaVersion: z.literal("1"),
    unitId: z.string().regex(/^M[0-8]-\d{2}$/),
    unitTitle: text,
    contentVersion: id,
    reviewStatus: z.enum(["draft", "researched", "reviewed"]),
    officialMappingStatus: z.literal("unverified"),
    publicationApproved: z.literal(false),
    families: z.array(z.object({
      id,
      status: z.literal("draft"),
      title: text,
      reasoningStructure: text,
      thinkingType: text,
      skillId: id,
      distinctFrom: text,
      items: z.array(z.object({
        id,
        status: z.literal("draft"),
        purpose: z.literal("practice-draft"),
        difficulty: z.enum(["D1", "D2", "D3", "D4", "D5"]),
        inputType: z.literal("choice"),
        prompt: text,
        answer: z.object({
          type: z.literal("choice"),
          value: z.enum(["A", "B", "C"]),
        }).strict(),
        semanticAnswer: text,
        rationale: text,
        skillLabel: id,
        misconceptionHypothesis: text,
        contentVersion: id,
        provenance: z.object({
          sourceType: z.literal("original-author-created"),
          sourceReference: z.null(),
          rightsStatus: text,
        }).strict(),
        verification: z.object({
          method: text,
          result: text,
          humanVerified: z.literal(false),
          autoGrade: z.literal("supported"),
        }).strict(),
        choices: z.array(z.object({ id: z.enum(["A", "B", "C"]), label: text }).strict()).length(3),
      }).strict()).length(2),
      counts: z.object({
        distinctFamilies: z.literal(1),
        draftItems: z.literal(2),
        humanApprovedItems: z.literal(0),
      }).strict(),
    }).strict()).length(3),
  })
  .strict()
  .superRefine((blueprint, context) => {
    const familyIds = blueprint.families.map((family) => family.id);
    if (new Set(familyIds).size !== familyIds.length) {
      context.addIssue({ code: "custom", message: "Problem family IDs must be unique." });
    }
    const itemIds = blueprint.families.flatMap((family) => family.items.map((item) => item.id));
    if (new Set(itemIds).size !== itemIds.length) {
      context.addIssue({ code: "custom", message: "Problem item IDs must be unique." });
    }
    blueprint.families.forEach((family) => {
      family.items.forEach((item) => {
        const choiceIds = item.choices.map((choice) => choice.id);
        const labels = item.choices.map((choice) => choice.label);
        const answerChoices = item.choices.filter((choice) => choice.id === item.answer.value);
        if (new Set(choiceIds).size !== choiceIds.length || new Set(labels).size !== labels.length) {
          context.addIssue({ code: "custom", message: `Choice IDs/labels must be unique: ${item.id}.` });
        }
        if (answerChoices.length !== 1 || answerChoices[0]?.label !== item.semanticAnswer) {
          context.addIssue({ code: "custom", message: `Answer key must match the semantic answer: ${item.id}.` });
        }
        if (item.skillLabel !== family.skillId) {
          context.addIssue({ code: "custom", message: `Item skill must match its family: ${item.id}.` });
        }
        if (item.contentVersion !== blueprint.contentVersion) {
          context.addIssue({ code: "custom", message: `Item version must match its blueprint: ${item.id}.` });
        }
      });
    });
  });
export type ProposalProblemBlueprint = z.infer<typeof proposalProblemBlueprintSchema>;

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
