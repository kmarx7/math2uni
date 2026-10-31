import { z } from "zod";
export const id = z.string().min(1).max(100);
const text = z.string().min(1).max(20000);
export const unitSchema = z.object({
  id: z.string().regex(/^M[0-8]-\d{2}$/),
  level: z.number().int().min(0).max(8),
  order: z.number().int().positive(),
  title: z.string().min(1),
  status: z.enum(["draft", "published"]),
  version: id,
  objectives: z.array(id).min(1),
  concepts: z.array(z.object({ id, label: id })).min(1),
  prerequisites: z.array(id),
  visualization: z.array(id).min(1),
  problemTypes: z.array(id).min(1),
  assessmentPlan: id,
  standards: z.array(
    z.object({
      authority: id,
      code: id,
      sourceUrl: z.url(),
      verifiedAt: z.iso.datetime(),
    }),
  ),
});
export type Unit = z.infer<typeof unitSchema>;
export const curriculumSchema = z.object({
  version: id,
  coverage: z.enum(["partial", "canonical"]),
  targetCount: z.literal(170),
  canonicalManifest: z.array(id),
  registeredManifest: z.array(id).min(1),
  units: z.array(unitSchema),
});
export type Curriculum = z.infer<typeof curriculumSchema>;
const base = { id, title: id };
export const blockSchema = z.discriminatedUnion("type", [
  z.object({ ...base, type: z.literal("ConceptBlock"), body: text }),
  z.object({
    ...base,
    type: z.literal("ExplanationBlock"),
    body: text,
    readinessCheck: z.boolean().optional(),
  }),
  z.object({
    ...base,
    type: z.literal("WorkedExampleBlock"),
    steps: z.array(text).min(1),
  }),
  z.object({
    ...base,
    type: z.literal("InteractiveBlock"),
    interaction: z.literal("place-value"),
  }),
  z.object({
    ...base,
    type: z.literal("PracticeBlock"),
    purpose: z.literal("practice"),
  }),
  z.object({ ...base, type: z.literal("FeedbackBlock"), body: text }),
  z.object({
    ...base,
    type: z.literal("AssessmentBlock"),
    purpose: z.literal("assessment"),
  }),
  z.object({ ...base, type: z.literal("ReviewBlock"), body: text }),
]);
export const contentSchema = z.object({
  unitId: id,
  version: id,
  blocks: z.array(blockSchema).min(1),
});
export type ContentDocument = z.infer<typeof contentSchema>;
export type Block = z.infer<typeof blockSchema>;
export const answerRuleSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("choice"), expected: id }),
  z.object({
    kind: z.literal("integer"),
    expected: z.string().regex(/^-?\d{1,12}$/),
  }),
  z.object({
    kind: z.literal("decimal"),
    expected: z.string().regex(/^-?\d{1,12}(\.\d{1,12})?$/),
  }),
  z.object({
    kind: z.literal("fraction"),
    expected: z.string().regex(/^-?\d{1,12}\/-?\d{1,12}$/),
  }),
  z.object({ kind: z.literal("expression"), expected: id }),
]);
export type AnswerRule = z.infer<typeof answerRuleSchema>;
export const reviewSchema = z.object({
  version: id,
  reviewer: id,
  at: z.iso.datetime(),
  decision: z.enum(["reviewed", "approved"]),
  actorType: z.enum(["human", "automated"]),
  mathChecked: z.boolean(),
});
export const problemSchema = z.object({
  id,
  unitId: id,
  skillId: id,
  familyId: id,
  templateId: id.optional(),
  reasoning: z.enum(["basic", "variation", "application"]),
  difficulty: z.enum(["D1", "D2", "D3", "D4", "D5"]),
  input: z.enum(["choice", "integer", "decimal", "fraction", "expression"]),
  prompt: text,
  choices: z.array(z.object({ id, label: id })).optional(),
  answerRule: answerRuleSchema,
  answerDisplay: id,
  explanation: text,
  steps: z.array(text).min(1),
  misconceptions: z.array(id).min(1),
  status: z.enum(["draft", "reviewed", "approved"]),
  version: id,
  provenance: z.object({
    author: id,
    license: id,
    source: id,
    aiGenerated: z.boolean(),
  }),
  reviewHistory: z.array(reviewSchema),
  purpose: z.enum(["practice", "assessment"]),
});
export type ProblemInstance = z.infer<typeof problemSchema>;
export type ProblemFamily = { id: string; title: string; strategy: string };
export type ProblemTemplate = {
  id: string;
  familyId: string;
  version: string;
  constraints: { min: number; max: number; places: readonly number[] };
};
export type PublicProblem = Pick<
  ProblemInstance,
  | "id"
  | "unitId"
  | "skillId"
  | "familyId"
  | "reasoning"
  | "difficulty"
  | "input"
  | "prompt"
  | "choices"
  | "purpose"
  | "version"
>;
export type Grade = {
  status: "correct" | "incorrect" | "invalid" | "unsupported";
  message: string;
};
export type Feedback = Grade & {
  problemId: string;
  version: string;
  skillId: string;
  purpose: "practice" | "assessment";
  answerDisplay?: string;
  explanation?: string;
  steps?: string[];
  misconception?: string;
};
export const attemptSchema = z.object({
  id,
  problemId: id,
  version: id,
  skillId: id,
  purpose: z.enum(["practice", "assessment", "review"]),
  answer: z.string().max(64),
  correct: z.boolean(),
  hintUsed: z.boolean(),
  retry: z.boolean(),
  at: z.iso.datetime(),
  feedback: z.object({
    answerDisplay: id,
    explanation: text,
    steps: z.array(text),
    misconception: id.optional(),
  }),
});
export type Attempt = z.infer<typeof attemptSchema>;
export const progressSchema = z.object({
  schemaVersion: z.literal(1),
  profileId: z.uuid(),
  attempts: z.array(attemptSchema).max(10000),
  completedBlocks: z.array(id),
  assessmentScore: z.number().min(0).max(100).nullable(),
});
export type ProgressState = z.infer<typeof progressSchema>;
export interface ProgressRepository {
  load(profileId: string): ProgressState;
  save(profileId: string, state: ProgressState): void;
}
