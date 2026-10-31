import { z } from "zod";
import {
  privateProblems,
  publicProblems,
  isPreview,
} from "@/modules/question-bank/server";
import { scoreAssessment } from "@/modules/assessment";
import { badRequest, noStore, readJson } from "../http";
export function GET() {
  return Response.json(
    { problems: publicProblems("assessment"), preview: isPreview() },
    { headers: noStore },
  );
}
export async function POST(request: Request) {
  try {
    const { answers } = z
      .object({
        answers: z.record(z.string().max(100), z.string().min(1).max(64)),
      })
      .strict()
      .parse(await readJson(request));
    return Response.json(
      scoreAssessment(privateProblems("assessment"), answers),
      { headers: noStore },
    );
  } catch (error) {
    return badRequest(error);
  }
}
