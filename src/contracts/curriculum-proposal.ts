import { z } from "zod";
import { curriculumSchema, id } from "./index";

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
  })
  .strict();
export type CurriculumProposal = z.infer<typeof curriculumProposalSchema>;
