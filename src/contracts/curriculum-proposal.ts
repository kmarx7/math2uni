import { z } from "zod";
import { curriculumSchema, id } from "./index";

export const learningPathProposalSchema = z
  .object({
    id,
    version: id,
    status: z.literal("proposed"),
    baseProposalVersion: id,
    masterDesignVersion: id,
    levels: z
      .array(
        z
          .object({
            level: z.number().int().min(0).max(8),
            title: id,
            requestedCount: z.number().int().positive(),
            proposedCount: z.number().int().positive(),
          })
          .strict(),
      )
      .length(9),
    entries: z
      .array(
        z
          .object({
            unitId: id,
            pathLevel: z.number().int().min(0).max(8),
            pathOrder: z.number().int().min(1).max(170),
            placementKind: z.enum([
              "first-instruction-candidate",
              "transfer-candidate",
              "checkpoint",
              "strategy-practice",
              "assessment",
              "extension-scope-unverified",
            ]),
          })
          .strict(),
      )
      .length(170),
    openDecisions: z.array(z.string().min(1)).min(1),
  })
  .strict();

// A proposal cannot be mistaken for an approval event or a canonical curriculum.
export const curriculumProposalSchema = z
  .object({
    id,
    version: id,
    status: z.literal("proposed"),
    baseVersion: id,
    createdAt: z.iso.datetime(),
    levels: z
      .array(
        z
          .object({
            level: z.number().int().min(0).max(8),
            title: id,
            count: z.number().int().positive(),
            role: z.enum(["foundation", "target", "integration"]),
          })
          .strict(),
      )
      .length(9),
    sources: z
      .array(
        z
          .object({
            title: z.string().min(1),
            url: z.url(),
            checkedAt: z.iso.datetime(),
            purpose: z.string().min(1),
          })
          .strict(),
      )
      .min(1),
    curriculum: curriculumSchema.extend({
      coverage: z.literal("partial"),
      canonicalManifest: z.array(id).length(0),
    }),
    learningPath: learningPathProposalSchema,
  })
  .strict();
export type CurriculumProposal = z.infer<typeof curriculumProposalSchema>;
