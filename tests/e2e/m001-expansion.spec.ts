import { test, expect } from "./fixtures";
import { viewports } from "./viewports";
for (const variant of viewports) {
  test.describe(variant.name, () => {
    test.use(variant.options);
    test("expanded family practice corrects an error and preserves account history after reload", async ({
      page,
    }) => {
      await page.goto("/learn/M0-01");
      const practice = page.locator("#practice");
      await practice.getByLabel("연습 문항 묶음").selectOption("extended");
      const bank = await (
        await page.request.get("/api/practice?unitId=M0-01&collection=extended")
      ).json();
      expect(bank.problems).toHaveLength(20);
      expect(bank.families).toHaveLength(10);
      for (const problem of bank.problems) {
        for (const key of [
          "answerRule",
          "answerDisplay",
          "explanation",
          "steps",
          "reviewHistory",
          "provenance",
        ])
          expect(problem).not.toHaveProperty(key);
      }
      await practice
        .getByLabel("문제 원형")
        .selectOption("m001x-zero-placeholder");
      await expect(
        practice.getByText(
          "학생이 수 4,052의 백의 자리 0 한 개를 지우고 남은 숫자를 붙여 썼습니다. 잘못 적힌 수는 무엇인가요?",
          { exact: true },
        ),
      ).toBeVisible();
      await practice.getByLabel("답안 (정수 · 쉼표 없이)").fill("0");
      await practice.getByRole("button", { name: "답안 확인" }).click();
      await expect(
        practice.getByText("정답: 452", { exact: true }),
      ).toBeVisible();
      await page.reload();
      let state = (await (await page.request.get("/api/progress")).json())
        .progress;
      expect(state.attempts).toHaveLength(1);
      expect(state.attempts[0]).toMatchObject({
        problemId: "p-m001x-zero-placeholder-01",
        unitId: "M0-01",
        correct: false,
      });
      await page.getByRole("link", { name: "오답노트", exact: true }).click();
      await page.getByRole("button", { name: "이 문제 복습하기" }).click();
      const retry = page.locator(".problem-session");
      await retry.getByLabel("답안 (정수 · 쉼표 없이)").fill("452");
      await retry.getByRole("button", { name: "답안 확인" }).click();
      await expect(
        retry.getByText("정답이에요!", { exact: true }),
      ).toBeVisible();
      await page.reload();
      await expect(
        page.getByText("아직 남아 있는 오답이 없어요", { exact: true }),
      ).toBeVisible();
      state = (await (await page.request.get("/api/progress")).json()).progress;
      expect(state.attempts).toHaveLength(2);
      expect(state.attempts[1]).toMatchObject({
        problemId: "p-m001x-zero-placeholder-01",
        correct: true,
        retry: true,
        purpose: "review",
      });
    });
    test("extended assessment uses its own exact set and cannot overwrite the core completion score", async ({
      page,
    }) => {
      const post = (path: string, data: unknown) =>
        page.request.post(path, {
          headers: { Origin: "http://localhost:3005" },
          data,
        });
      const core = await post("/api/assessment", {
        unitId: "M0-01",
        collection: "core",
        requestId: crypto.randomUUID(),
        answers: {
          "a-place-1": "200",
          "a-compose-1": "6509",
          "a-infer-1": "3064",
        },
      });
      expect(core.status()).toBe(200);
      expect((await core.json()).score).toBe(100);
      const response = await (
        await page.request.get(
          "/api/assessment?unitId=M0-01&collection=extended",
        )
      ).json();
      expect(response.problems).toHaveLength(10);
      for (const problem of response.problems) {
        expect(problem.id).toMatch(/^a-m001x-/);
        expect(problem).not.toHaveProperty("answerRule");
        expect(problem).not.toHaveProperty("explanation");
      }
      expect(
        (
          await post("/api/assessment", {
            unitId: "M0-01",
            collection: "extended",
            requestId: crypto.randomUUID(),
            answers: { "a-m001x-identify-03": "9000" },
          })
        ).status(),
      ).toBe(400);
      const answers = Object.fromEntries(
        response.problems.map((problem: { id: string; input: string }) => [
          problem.id,
          problem.input === "choice" ? "a" : "0",
        ]),
      );
      const extended = await post("/api/assessment", {
        unitId: "M0-01",
        collection: "extended",
        requestId: crypto.randomUUID(),
        answers,
      });
      expect(extended.status()).toBe(200);
      expect((await extended.json()).score).toBe(0);
      const progress = (await (await page.request.get("/api/progress")).json())
        .progress;
      expect(progress.assessmentScore).toBe(100);
      expect(progress.unitProgress["M0-01"].assessmentScore).toBe(100);
      expect(progress.attempts).toHaveLength(13);
      expect(
        progress.attempts.filter((attempt: { problemId: string }) =>
          attempt.problemId.startsWith("a-m001x-"),
        ),
      ).toHaveLength(10);
      expect(
        (
          await post("/api/practice", {
            unitId: "M0-01",
            collection: "extended",
            problemId: "a-m001x-identify-03",
            answer: "9000",
            requestId: crypto.randomUUID(),
            hintUsed: false,
            mode: "practice",
          })
        ).status(),
      ).toBe(404);
      const retained = await (
        await page.request.get("/api/assessment?unitId=M0-01")
      ).json();
      expect(retained.problems).toHaveLength(3);
    });
  });
}
