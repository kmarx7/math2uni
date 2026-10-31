import { z } from "zod";
import {
  privateProblems,
  publicProblems,
  isPreview,
} from "@/modules/question-bank/server";
import { scoreAssessment } from "@/modules/assessment";
import { apiAccount, sameOrigin, forbiddenOrigin } from "@/modules/auth/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SupabaseProgressRepository } from "@/modules/progress/server";
import { transactProgress } from "@/modules/progress/account-repository";
import { applySubmission } from "@/modules/progress/mutations";
import { badRequest, noStore, readJson } from "../http";
export async function GET(request?: Request) {
  const unitId = request
    ? (new URL(request.url).searchParams.get("unitId") ?? "M0-01")
    : "M0-01";
  const { response } = await apiAccount();
  if (response) return response;
  return Response.json(
    { problems: publicProblems("assessment", unitId), preview: isPreview() },
    { headers: noStore },
  );
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbiddenOrigin();
  const { account, response } = await apiAccount();
  if (response) return response;
  let input: {
    unitId: string;
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
        answers: z.record(z.string().max(100), z.string().min(1).max(64)),
        requestId: z.uuid(),
      })
      .strict()
      .parse(await readJson(request));
    result = scoreAssessment(
      privateProblems("assessment", input.unitId),
      input.answers,
    );
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
        requestId: input.requestId,
        answers: input.answers,
        feedback: result.results,
        hintUsed: false,
        purpose: "assessment",
        at: new Date().toISOString(),
        score: result.score,
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
