import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseConfig } from "@/lib/supabase/config";
export type Account = { id: string; email: string };
export async function currentAccount(): Promise<Account | null> {
  if (!supabaseConfig()) return null;
  const client = await createSupabaseServerClient();
  const { data, error } = await client.auth.getUser();
  return error || !data.user || data.user.is_anonymous || !data.user.email
    ? null
    : { id: data.user.id, email: data.user.email ?? "" };
}
export async function requireAccount() {
  const account = await currentAccount();
  if (!account) redirect("/login");
  return account;
}
export async function apiAccount() {
  if (!supabaseConfig())
    return {
      account: null,
      response: Response.json(
        { error: "로그인 서비스 연결 설정이 필요합니다." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      ),
    };
  const account = await currentAccount();
  return account
    ? { account, response: null }
    : {
        account: null,
        response: Response.json(
          { error: "로그인이 필요합니다." },
          { status: 401, headers: { "Cache-Control": "no-store" } },
        ),
      };
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}
export function forbiddenOrigin() {
  return Response.json(
    { error: "허용되지 않은 요청입니다." },
    { status: 403, headers: { "Cache-Control": "no-store" } },
  );
}
