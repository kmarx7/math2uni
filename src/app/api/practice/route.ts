import { z } from "zod";
import {
  privateProblems,
  publicProblems,
  isPreview,
} from "@/modules/question-bank/server";
import { scoreProblem } from "@/modules/assessment";
import { badRequest, noStore, readJson } from "../http";
export function GET() {
  return Response.json(
    { problems: publicProblems("practice"), preview: isPreview() },
    { headers: noStore },
  );
}
export async function POST(request: Request) {
  try {
    const { problemId, answer } = z
      .object({ problemId: z.string().max(100), answer: z.string().max(64) })
      .strict()
      .parse(await readJson(request));
    const problem = privateProblems("practice").find((p) => p.id === problemId);
    if (!problem)
      return Response.json(
        { error: "연습 문항을 찾을 수 없습니다." },
        { status: 404, headers: noStore },
      );
    return Response.json(scoreProblem(problem, answer), { headers: noStore });
  } catch (error) {
    return badRequest(error);
  }
}
