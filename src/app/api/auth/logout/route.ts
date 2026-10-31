import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sameOrigin, forbiddenOrigin } from "@/modules/auth/server";
import { noStore } from "../../http";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbiddenOrigin();
  try {
    const client = await createSupabaseServerClient();
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) throw error;
    return Response.json({ ok: true }, { headers: noStore });
  } catch {
    return Response.json(
      { error: "로그아웃하지 못했어요. 다시 시도해 주세요." },
      { status: 503, headers: noStore },
    );
  }
}
