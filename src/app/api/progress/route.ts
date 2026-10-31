import { z } from "zod";
import { apiAccount, sameOrigin, forbiddenOrigin } from "@/modules/auth/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SupabaseProgressRepository } from "@/modules/progress/server";
import { transactProgress } from "@/modules/progress/account-repository";
import { completeLearningBlock } from "@/modules/progress/mutations";
import { getLesson } from "@/data/content";
import { noStore, readJson, badRequest } from "../http";
export async function GET() {
  const { account, response } = await apiAccount();
  if (response) return response;
  try {
    const repository = new SupabaseProgressRepository(
      await createSupabaseServerClient(),
    );
    return Response.json(await repository.load(account.id), {
      headers: noStore,
    });
  } catch {
    return Response.json(
      { error: "학습 기록을 불러오지 못했어요. 다시 시도해 주세요." },
      { status: 503, headers: noStore },
    );
  }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbiddenOrigin();
  const { account, response } = await apiAccount();
  if (response) return response;
  let blockId: string;
  let unitId: string;
  try {
    const input = z
      .object({
        type: z.literal("complete-block"),
        unitId: z.string().regex(/^M[0-8]-\d{2}$/),
        blockId: z.string().max(100),
      })
      .strict()
      .parse(await readJson(request));
    if (!getLesson(input.unitId)?.blocks.some((b) => b.id === input.blockId))
      throw new Error("Unknown block");
    blockId = input.blockId;
    unitId = input.unitId;
  } catch (error) {
    return badRequest(error);
  }
  try {
    const repository = new SupabaseProgressRepository(
      await createSupabaseServerClient(),
    );
    const snapshot = await transactProgress(repository, account.id, (s) =>
      completeLearningBlock(s, blockId, unitId),
    );
    return Response.json(snapshot, { headers: noStore });
  } catch {
    return Response.json(
      { error: "학습 기록을 저장하지 못했어요. 다시 시도해 주세요." },
      { status: 503, headers: noStore },
    );
  }
}
