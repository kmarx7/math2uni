import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  GET as practiceGET,
  POST as practicePOST,
} from "@/app/api/practice/route";
import {
  GET as assessmentGET,
  POST as assessmentPOST,
} from "@/app/api/assessment/route";
import { emptyProgress } from "@/modules/progress/repository";
import type { ProgressState } from "@/contracts";
const fixtures = vi.hoisted(() => ({
  account: {
    id: "124d3c71-9359-4cf2-b111-9ba5502df231",
    email: "test@example.invalid",
  },
  authenticated: true,
  states: new Map<string, { progress: ProgressState; revision: number }>(),
}));
vi.mock("@/modules/auth/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/modules/auth/server")>()),
  apiAccount: vi.fn(async () =>
    fixtures.authenticated
      ? { account: fixtures.account, response: null }
      : {
          account: null,
          response: Response.json(
            { error: "로그인이 필요합니다." },
            { status: 401 },
          ),
        },
  ),
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({})),
}));
vi.mock("@/modules/progress/server", () => ({
  SupabaseProgressRepository: class {
    async load(id: string) {
      return (
        fixtures.states.get(id) ?? { progress: emptyProgress(id), revision: 0 }
      );
    }
    async compareAndSwap(id: string, revision: number, state: ProgressState) {
      if ((fixtures.states.get(id)?.revision ?? 0) !== revision) return false;
      fixtures.states.set(id, { progress: state, revision: revision + 1 });
      return true;
    }
  },
}));
const request = (body: unknown) =>
  new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost" },
    body: JSON.stringify({
      ...{ requestId: crypto.randomUUID(), hintUsed: false, mode: "practice" },
      ...(body as object),
      ...((body as { answers?: unknown }).answers
        ? { hintUsed: undefined, mode: undefined }
        : {}),
    }),
  });
vi.stubEnv("NODE_ENV", "development");
vi.stubEnv("MATH90_CONTENT_PREVIEW", "1");
describe("server submission boundaries", () => {
  it("rejects every protected endpoint without a verified account", async () => {
    fixtures.authenticated = false;
    expect((await practiceGET()).status).toBe(401);
    expect((await assessmentGET()).status).toBe(401);
    expect(
      (await practicePOST(request({ problemId: "p-place-1", answer: "c" })))
        .status,
    ).toBe(401);
  });
  it("blocks cross-origin grading requests", async () => {
    const r = request({ problemId: "p-place-1", answer: "c" });
    r.headers.set("Origin", "https://untrusted.invalid");
    expect((await practicePOST(r)).status).toBe(403);
  });
  it("stores a server-graded result under the authenticated account", async () => {
    await practicePOST(request({ problemId: "p-place-1", answer: "c" }));
    expect(
      fixtures.states.get(fixtures.account.id)?.progress.attempts[0],
    ).toMatchObject({ correct: true, answer: "c" });
    expect(fixtures.states.size).toBe(1);
  });
  beforeEach(() => {
    fixtures.states.clear();
    fixtures.authenticated = true;
  });
  afterEach(() => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("MATH90_CONTENT_PREVIEW", "1");
  });
  it("production never publishes unapproved AI content even with preview enabled", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect((await (await practiceGET()).json()).problems).toEqual([]);
    expect((await (await assessmentGET()).json()).problems).toEqual([]);
    expect(
      (await practicePOST(request({ problemId: "p-place-1", answer: "c" })))
        .status,
    ).toBe(404);
    expect((await assessmentPOST(request({ answers: {} }))).status).toBe(400);
  });
  it("keeps both GET payloads free of grading fields", async () => {
    for (const get of [practiceGET, assessmentGET]) {
      const response = await get();
      expect(response.headers.get("Cache-Control")).toBe("no-store");
      const body = await response.json();
      expect(body.problems.length).toBeGreaterThan(0);
      for (const p of body.problems) {
        expect(p).not.toHaveProperty("answerRule");
        expect(p).not.toHaveProperty("explanation");
        expect(p).not.toHaveProperty("answerDisplay");
      }
    }
  });
  it("blocks retrieving assessment results through practice", async () =>
    expect(
      (await practicePOST(request({ problemId: "a-place-1", answer: "200" })))
        .status,
    ).toBe(404));
  it("grades practice on server, then returns explanation", async () => {
    const response = await practicePOST(
      request({ problemId: "p-place-1", answer: "c" }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      status: "correct",
      answerDisplay: "500",
    });
  });
  it("rejects partial, invalid, oversized and malformed assessment with no answers leaked", async () => {
    for (const body of [
      { answers: {} },
      { answers: { "a-place-1": "200" } },
      {
        answers: {
          "a-place-1": "200",
          "a-compose-1": "bad",
          "a-infer-1": "3064",
        },
      },
      { answers: { x: "a".repeat(5000) } },
    ]) {
      const response = await assessmentPOST(request(body));
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(await response.text()).not.toContain("answerDisplay");
    }
    const malformed = await assessmentPOST(
      new Request("http://localhost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: "{",
      }),
    );
    expect(malformed.status).toBe(400);
  });
  it("only returns assessment score/feedback after full submission", async () => {
    const response = await assessmentPOST(
      request({
        answers: {
          "a-place-1": "200",
          "a-compose-1": "6509",
          "a-infer-1": "3064",
        },
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ score: 100 });
  });
});
