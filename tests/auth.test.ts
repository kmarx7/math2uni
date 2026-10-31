import { describe, it, expect, vi, beforeEach } from "vitest";
import { loginSchema, signupSchema } from "@/modules/auth/input";
import { currentAccount, apiAccount } from "@/modules/auth/server";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as signup } from "@/app/api/auth/signup/route";
import { POST as logout } from "@/app/api/auth/logout/route";
const fixture = vi.hoisted(() => ({
  getUser: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ auth: fixture })),
}));
const request = (body: unknown, origin = "http://localhost") =>
  new Request("http://localhost/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-publishable");
  fixture.getUser.mockResolvedValue({
    data: { user: null },
    error: { message: "unverified" },
  });
});
describe("account authentication boundaries", () => {
  it("validates email and strong new passwords", () => {
    expect(
      loginSchema.parse({ email: "TEST@example.com", password: "password" })
        .email,
    ).toBe("test@example.com");
    for (const password of ["1234567890", "abcdefghij", "short1"])
      expect(
        signupSchema.safeParse({ email: "a@b.com", password }).success,
      ).toBe(false);
    expect(
      signupSchema.safeParse({ email: "a@b.com", password: "ExamplePass123" })
        .success,
    ).toBe(true);
  });
  it("only accepts an Auth-server verified user", async () => {
    expect(await currentAccount()).toBeNull();
    fixture.getUser.mockResolvedValue({
      data: { user: { id: "user1", email: "a@b.com" } },
      error: null,
    });
    expect(await currentAccount()).toEqual({ id: "user1", email: "a@b.com" });
  });
  it("rejects absent or invalid sessions and missing setup", async () => {
    expect((await apiAccount()).response?.status).toBe(401);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect((await apiAccount()).response?.status).toBe(503);
  });
  it("never returns password or tokens after successful login", async () => {
    fixture.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: "user1" },
        session: { access_token: "SECRET_TEST_TOKEN" },
      },
      error: null,
    });
    const response = await login(
      request({ email: "a@b.com", password: "ExamplePass123" }),
    );
    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).not.toContain("SECRET_TEST_TOKEN");
    expect(body).not.toContain("ExamplePass123");
    expect(JSON.parse(body)).toEqual({ ok: true });
  });
  it("returns the same error for incorrect credentials", async () => {
    fixture.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: "No user" },
    });
    const response = await login(
      request({ email: "a@b.com", password: "wrong" }),
    );
    expect(response.status).toBe(401);
    expect(await response.text()).not.toContain("No user");
  });
  it("requires email confirmation when signup has no session", async () => {
    fixture.signUp.mockResolvedValue({ data: { session: null }, error: null });
    const response = await signup(
      request({ email: "a@b.com", password: "ExamplePass123" }),
    );
    expect(await response.json()).toMatchObject({ signedIn: false });
  });
  it("rejects weak password without calling the provider", async () => {
    expect(
      (await signup(request({ email: "a@b.com", password: "short" }))).status,
    ).toBe(400);
    expect(fixture.signUp).not.toHaveBeenCalled();
  });
  it("rejects cross-origin and missing-origin account mutations", async () => {
    for (const post of [login, signup, logout]) {
      expect(
        (
          await post(
            request(
              { email: "a@b.com", password: "ExamplePass123" },
              "https://evil.invalid",
            ),
          )
        ).status,
      ).toBe(403);
      const r = request({});
      r.headers.delete("Origin");
      expect((await post(r)).status).toBe(403);
    }
  });
  it("revokes the current login when logging out", async () => {
    fixture.signOut.mockResolvedValue({ error: null });
    expect((await logout(request({}))).status).toBe(200);
    expect(fixture.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
});
