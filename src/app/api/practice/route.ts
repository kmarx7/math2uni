import { z } from "zod";
import {
  privateProblems,
  publicProblems,
  isPreview,
} from "@/modules/question-bank/server";
import { scoreProblem } from "@/modules/assessment";
import { apiAccount, sameOrigin, forbiddenOrigin } from "@/modules/auth/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SupabaseProgressRepository } from "@/modules/progress/server";
import { transactProgress } from "@/modules/progress/account-repository";
import { applySubmission } from "@/modules/progress/mutations";
import { badRequest, noStore, readJson } from "../http";
export async function GET() {
  const { response } = await apiAccount();
  if (response) return response;
  return Response.json(
    { problems: publicProblems("practice"), preview: isPreview() },
    { headers: noStore },
  );
}
const inputSchema = z
  .object({
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
  const problem = privateProblems("practice").find(
    (p) => p.id === input.problemId,
  );
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
