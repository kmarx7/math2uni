import { describe, it, expect, vi, afterEach } from "vitest";
import {
  GET as practiceGET,
  POST as practicePOST,
} from "@/app/api/practice/route";
import {
  GET as assessmentGET,
  POST as assessmentPOST,
} from "@/app/api/assessment/route";
const request = (body: unknown) =>
  new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
vi.stubEnv("NODE_ENV", "development");
vi.stubEnv("MATH90_CONTENT_PREVIEW", "1");
describe("server submission boundaries", () => {
  afterEach(() => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("MATH90_CONTENT_PREVIEW", "1");
  });
  it("production never publishes unapproved AI content even with preview enabled", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect((await practiceGET().json()).problems).toEqual([]);
    expect((await assessmentGET().json()).problems).toEqual([]);
    expect(
      (await practicePOST(request({ problemId: "p-place-1", answer: "c" })))
        .status,
    ).toBe(404);
    expect((await assessmentPOST(request({ answers: {} }))).status).toBe(400);
  });
  it("keeps both GET payloads free of grading fields", async () => {
    for (const get of [practiceGET, assessmentGET]) {
      const response = get();
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
        headers: { "Content-Type": "application/json" },
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
