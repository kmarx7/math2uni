import { problemCollectionSchema } from "@/contracts";
import { z } from "zod";
import {
  privateProblems,
  publicProblems,
  isPreview,
  publicFamilies,
} from "@/modules/question-bank/server";
import { scoreProblem } from "@/modules/assessment";
import { apiAccount, sameOrigin, forbiddenOrigin } from "@/modules/auth/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SupabaseProgressRepository } from "@/modules/progress/server";
import { transactProgress } from "@/modules/progress/account-repository";
import { applySubmission } from "@/modules/progress/mutations";
import { isDraftPreviewUnitId } from "@/data/proposal-preview-manifest";
import { badRequest, noStore, readJson } from "../http";
export async function GET(request?: Request) {
  const unitId = request
    ? (new URL(request.url).searchParams.get("unitId") ?? "M0-01")
    : "M0-01";
  const { response } = await apiAccount();
  if (response) return response;
  const parsedCollection = problemCollectionSchema.safeParse(
    request
      ? (new URL(request.url).searchParams.get("collection") ?? "core")
      : "core",
  );
  if (!parsedCollection.success) return badRequest(parsedCollection.error);
  const collection = parsedCollection.data;
  if (collection === "proposal-preview" && (!isPreview() || !isDraftPreviewUnitId(unitId)))
    return Response.json({ error: "검토용 문항을 찾을 수 없습니다." }, { status: 404, headers: noStore });
  return Response.json(
    {
      problems: publicProblems("practice", unitId, collection),
      families: publicFamilies("practice", unitId, collection),
      preview: isPreview(),
    },
    { headers: noStore },
  );
}
const inputSchema = z
  .object({
    unitId: z
      .string()
      .regex(/^M[0-8]-\d{2}$/)
      .default("M0-01"),
    collection: problemCollectionSchema.default("core"),
    problemId: z.string().max(100),
    answer: z.string().max(64),
    requestId: z.uuid(),
    hintUsed: z.boolean(),
    mode: z.enum(["practice", "review"]),
  })
  .strict();
export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbiddenOrigin();
  const { account, response } = await apiAccount();
  if (response) return response;
  let input: z.infer<typeof inputSchema>;
  try {
    input = inputSchema.parse(await readJson(request));
  } catch (error) {
    return badRequest(error);
  }
  if (input.collection === "proposal-preview" && (!isPreview() || !isDraftPreviewUnitId(input.unitId)))
    return Response.json({ error: "검토용 문항을 찾을 수 없습니다." }, { status: 404, headers: noStore });
  const problem = privateProblems(
    "practice",
    input.unitId,
    input.collection,
  ).find((p) => p.id === input.problemId);
  if (!problem)
    return Response.json(
      { error: "연습 문항을 찾을 수 없습니다." },
      { status: 404, headers: noStore },
    );
  const feedback = scoreProblem(problem, input.answer);
  if (feedback.status === "invalid" || feedback.status === "unsupported")
    return Response.json(feedback, { headers: noStore });
  try {
    const repository = new SupabaseProgressRepository(
      await createSupabaseServerClient(),
    );
    const snapshot = await transactProgress(repository, account.id, (s) =>
      applySubmission(s, {
        unitId: problem.unitId,
        collection: input.collection,
        requestId: input.requestId,
        answers: { [problem.id]: input.answer },
        feedback: [feedback],
        hintUsed: input.hintUsed,
        purpose: input.mode,
        at: new Date().toISOString(),
      }),
    );
    return Response.json({ ...feedback, ...snapshot }, { headers: noStore });
  } catch {
    return Response.json(
      { error: "답안을 저장하지 못했어요. 같은 답안으로 다시 제출해 주세요." },
      { status: 503, headers: noStore },
    );
  }
}
