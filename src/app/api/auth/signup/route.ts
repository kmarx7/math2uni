import { signupSchema } from "@/modules/auth/input";
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
    const input = signupSchema.parse(await readJson(request));
    const client = await createSupabaseServerClient();
    const { data, error } = await client.auth.signUp({
      ...input,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
      },
    });
    if (error)
      return Response.json(
        {
          error:
            "가입 요청을 처리하지 못했어요. 입력 정보를 확인하고 잠시 후 다시 시도해 주세요.",
        },
        { status: 400, headers: noStore },
      );
    return Response.json(
      {
        signedIn: !!data.session,
        message:
          "가입 가능한 주소라면 인증 메일이 발송됩니다. 이메일의 인증 링크를 확인한 뒤 로그인해 주세요.",
      },
      { headers: noStore },
    );
  } catch {
    return Response.json(
      { error: "이메일과 10자 이상의 영문·숫자 비밀번호를 입력해 주세요." },
      { status: 400, headers: noStore },
    );
  }
}
