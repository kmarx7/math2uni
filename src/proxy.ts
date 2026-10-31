import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { curriculum } from "@/data/curriculum";
import { supabaseConfig } from "@/lib/supabase/config";
export async function proxy(request: NextRequest) {
  const config = supabaseConfig();
  const publicRoute =
    ["/login", "/signup", "/auth/callback"].includes(
      request.nextUrl.pathname,
    ) || request.nextUrl.pathname.startsWith("/api/auth/");
  if (!config) {
    if (publicRoute) return NextResponse.next();
    return request.nextUrl.pathname.startsWith("/api/")
      ? NextResponse.json(
          { error: "로그인 서비스 연결 설정이 필요합니다." },
          { status: 503 },
        )
      : NextResponse.redirect(new URL("/login", request.url));
  }
  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.key, {
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        for (const { name, value } of values) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of values)
          response.cookies.set(name, value, options);
      },
    },
  });
  // Refresh and verify the token; cookie presence alone is never authorization.
  const { data, error } = await supabase.auth.getClaims();
  if (!publicRoute && (error || !data?.claims)) {
    const denied = request.nextUrl.pathname.startsWith("/api/")
      ? NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url));
    for (const cookie of response.cookies.getAll()) denied.cookies.set(cookie);
    denied.headers.set("Cache-Control", "private, no-store");
    return denied;
  }
  const learningPath = request.nextUrl.pathname.match(/^\/learn\/([^/]+)/);
  if (
    learningPath &&
    !curriculum.units.some(
      (unit) => unit.id === learningPath[1] && unit.status === "published",
    )
  ) {
    const unavailable = NextResponse.rewrite(
      new URL("/unavailable", request.url),
      { status: 404 },
    );
    for (const cookie of response.cookies.getAll())
      unavailable.cookies.set(cookie);
    unavailable.headers.set("Cache-Control", "private, no-store");
    return unavailable;
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
