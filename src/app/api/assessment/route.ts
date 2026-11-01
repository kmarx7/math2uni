import { problemCollectionSchema, type ProblemCollection } from "@/contracts";
import { z } from "zod";
import {
  privateProblems,
  publicProblems,
  isPreview,
  publicFamilies,
} from "@/modules/question-bank/server";
import { scoreAssessment } from "@/modules/assessment";
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
    return Response.json({ error: "검토용 평가를 찾을 수 없습니다." }, { status: 404, headers: noStore });
  const problems = publicProblems("assessment", unitId, collection);
  if (collection === "proposal-preview" && !problems.length)
    return Response.json({ error: "이 단원의 검토용 평가는 아직 준비되지 않았습니다." }, { status: 404, headers: noStore });
  return Response.json(
    {
      problems,
      families: publicFamilies("assessment", unitId, collection),
      preview: isPreview(),
    },
    { headers: noStore },
  );
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbiddenOrigin();
  const { account, response } = await apiAccount();
  if (response) return response;
  let input: {
    unitId: string;
    collection: ProblemCollection;
    answers: Record<string, string>;
    requestId: string;
  };
  let result: ReturnType<typeof scoreAssessment>;
  try {
    input = z
      .object({
        unitId: z
          .string()
          .regex(/^M[0-8]-\d{2}$/)
          .default("M0-01"),
        collection: problemCollectionSchema.default("core"),
        answers: z.record(z.string().max(100), z.string().min(1).max(64)),
        requestId: z.uuid(),
      })
      .strict()
      .parse(await readJson(request));
    if (input.collection === "proposal-preview" && (!isPreview() || !isDraftPreviewUnitId(input.unitId)))
      return Response.json({ error: "검토용 평가를 찾을 수 없습니다." }, { status: 404, headers: noStore });
    const problems = privateProblems("assessment", input.unitId, input.collection);
    if (input.collection === "proposal-preview" && !problems.length)
      return Response.json({ error: "이 단원의 검토용 평가는 아직 준비되지 않았습니다." }, { status: 404, headers: noStore });
    result = scoreAssessment(problems, input.answers);
  } catch (error) {
    return badRequest(error);
  }
  try {
    const repository = new SupabaseProgressRepository(
      await createSupabaseServerClient(),
    );
    const snapshot = await transactProgress(repository, account.id, (s) =>
      applySubmission(s, {
        unitId: input.unitId,
        collection: input.collection,
        requestId: input.requestId,
        answers: input.answers,
        feedback: result.results,
        hintUsed: false,
        purpose: "assessment",
        at: new Date().toISOString(),
        score: input.collection === "core" ? result.score : undefined,
      }),
    );
    return Response.json({ ...result, ...snapshot }, { headers: noStore });
  } catch {
    return Response.json(
      {
        error:
          "평가 결과를 저장하지 못했어요. 같은 답안으로 다시 제출해 주세요.",
      },
      { status: 503, headers: noStore },
    );
  }
}
