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
    sections: z
      .array(
        z.object({ id, title: id, body: text, activity: text, check: text }),
      )
      .optional(),
  }),
  z.object({
    ...base,
    type: z.literal("WorkedExampleBlock"),
    steps: z.array(text).min(1),
  }),
  z.object({
    ...base,
    type: z.literal("InteractiveBlock"),
    interaction: z.enum([
      "place-value",
      "arithmetic",
      "fraction",
      "fraction-sum",
      "decimal",
      "ratio",
      "number-line",
      "integer-number-line",
      "signed-multiplication",
      "powers",
      "expression-value",
      "monomial-product",
      "like-terms",
      "distributive-area",
      "equation-balance",
      "linear-equation",
      "linear-word-problem",
      "inequality",
      "coordinate-plane",
      "proportion",
      "parallel-angles",
      "triangle-congruence",
      "area-model",
      "volume-model",
      "data-summary",
      "expression-table",
      "system-pair",
      "system-solve",
      "system-application",
      "function-mapping",
      "linear-function-graph",
      "line-intersection",
      "square-root-area",
      "radical-simplify",
      "polynomial-area",
      "polynomial-terms",
      "polynomial-multiplication",
      "polynomial-division",
      "identity-coefficients",
      "remainder-theorem",
      "factor-theorem",
      "polynomial-factorization",
      "complex-plane",
      "complex-operations",
      "quadratic-discriminant",
      "root-coefficient",
      "quadratic-intersection",
      "quadratic-interval-optimization",
      "polynomial-root-factory",
      "system-intersections",
      "linear-inequality-intersection",
      "quadratic-inequality-sign",
      "parameter-case-table",
      "counting-tree",
      "permutation-combination-cards",
      "matrix-operations",
      "condition-map",
      "coordinate-section",
      "line-equation-builder",
      "line-relation-slope-pair",
      "factor-pairs",
      "quadratic-roots",
      "quadratic-area",
      "quadratic-vertex",
      "quadratic-extrema",
      "similarity-scale",
      "pythagorean-model",
      "trig-ratios",
      "circle-theorems",
      "spread-data",
      "middle-review",
      "m5-14-visual",
      "m5-15-visual",
      "m5-16-visual",
      "m5-17-visual",
      "m5-18-visual",
      "m5-19-visual",
      "m5-20-visual",
      "m5-21-visual",
      "m5-22-visual",
      "m5-23-visual",
    ]),
    settings: z
      .object({
        operation: z
          .enum(["add", "multiply", "divide", "mixed", "factors"])
          .optional(),
        initialA: z.number().int().min(-20).max(60),
        initialB: z.number().int().min(-20).max(60),
        initialC: z.number().int().min(0).max(12).optional(),
      })
      .optional(),
  }),
  z.object({
    ...base,
    type: z.literal("PracticeBlock"),
    purpose: z.literal("practice"),
    hint: text.optional(),
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
  learningPhases: z
    .array(
      z.object({
        id,
        title: id,
        blockId: id,
        state: z.enum(["available", "planned"]),
      }),
    )
    .optional(),
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
export const thinkingTypeSchema = z.enum([
  "개념 이해",
  "기초 계산",
  "단계별 풀이",
  "빈칸 완성",
  "오류 발견",
  "표현 변환",
  "실생활 응용",
  "시각적 탐구",
  "복합 개념",
  "심화·전이",
]);
export type ThinkingType = z.infer<typeof thinkingTypeSchema>;
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
export const problemCollectionSchema = z.enum(["core", "extended", "proposal-preview"]);
export type ProblemCollection = z.infer<typeof problemCollectionSchema>;
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
  unitId?: string;
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
  collection: problemCollectionSchema.optional(),
  unitId: z
    .string()
    .regex(/^M[0-8]-\d{2}$/)
    .optional(),
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
  unitProgress: z
    .record(
      z.string().regex(/^M[0-8]-\d{2}$/),
      z.object({
        completedBlocks: z.array(id),
        assessmentScore: z.number().min(0).max(100).nullable(),
      }),
    )
    .optional(),
});
export type ProgressState = z.infer<typeof progressSchema>;
export interface ProgressRepository {
  load(profileId: string): ProgressState;
  save(profileId: string, state: ProgressState): void;
}
