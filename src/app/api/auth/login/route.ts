import { loginSchema } from "@/modules/auth/input";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseConfig } from "@/lib/supabase/config";
import { sameOrigin, forbiddenOrigin } from "@/modules/auth/server";
import { noStore, readJson } from "../../http";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbiddenOrigin();
  if (!supabaseConfig())
    return Response.json(
      { error: "로그인 서비스 연결 설정이 필요합니다." },
      { status: 503, headers: noStore },
    );
  try {
    const input = loginSchema.parse(await readJson(request));
    const client = await createSupabaseServerClient();
    const { data, error } = await client.auth.signInWithPassword(input);
    if (error || !data.user)
      return Response.json(
        {
          error:
            "아이디 또는 비밀번호를 확인해 주세요. 가입 후 이메일 인증도 완료해야 합니다.",
        },
        { status: 401, headers: noStore },
      );
    return Response.json({ ok: true }, { headers: noStore });
  } catch {
    return Response.json(
      { error: "아이디와 비밀번호 형식을 확인해 주세요." },
      { status: 400, headers: noStore },
    );
  }
}
