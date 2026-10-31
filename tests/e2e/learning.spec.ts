import { test, expect } from "./fixtures";
import { viewports } from "./viewports";
for (const variant of viewports) {
  test.describe(variant.name, () => {
    test.use(variant.options);
    test("lesson → wrong answer → correction → saved progress → isolated profile", async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("/");
      await expect(
        page.getByRole("heading", { name: "오늘도, 한 개념 더 단단하게." }),
      ).toBeVisible();
      await page.getByRole("link", { name: "첫 학습 시작하기" }).click();
      await expect(
        page.getByRole("heading", { name: "자연수와 자리값", exact: true }),
      ).toBeVisible();
      await expect(page.locator(".account-email")).not.toHaveText("");
      await page.getByLabel("천의 자리", { exact: true }).fill("4");
      await expect(page.locator(".lab-result strong")).toHaveText("4,042");
      const practice = page.locator("#practice");
      await practice.locator('input[value="a"]').check();
      await practice.getByRole("button", { name: "답안 확인" }).click();
      await expect(
        practice.getByText("정답: 500", { exact: true }),
      ).toBeVisible();
      await page.getByRole("link", { name: "오답노트", exact: true }).click();
      await expect(
        page.getByRole("heading", { name: "제출 답안: a" }),
      ).toBeVisible();
      await page.getByRole("button", { name: "이 문제 복습하기" }).click();
      const retry = page.locator(".problem-session");
      await retry.locator('input[value="c"]').check();
      await retry.getByRole("button", { name: "답안 확인" }).click();
      await expect(
        retry.getByText("정답이에요!", { exact: true }),
      ).toBeVisible();
      await page.reload();
      await expect(
        page.getByText("아직 남아 있는 오답이 없어요"),
      ).toBeVisible();
      await page
        .getByRole("link", { name: "학습 대시보드", exact: true })
        .click();
      await expect(page.locator(".stat-number").first()).toHaveText("2회");
      expect(errors).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    });
    test("assessment is private until full submit and saves result", async ({
      page,
      request,
    }) => {
      const response = await request.get("/api/assessment");
      const body = await response.json();
      for (const problem of body.problems) {
        expect(problem).not.toHaveProperty("answerRule");
        expect(problem).not.toHaveProperty("answerDisplay");
        expect(problem).not.toHaveProperty("explanation");
      }
      const partial = await request.post("/api/assessment", {
        headers: { Origin: "http://localhost:3005" },
        data: {
          requestId: crypto.randomUUID(),
          answers: { "a-place-1": "200" },
        },
      });
      expect(partial.status()).toBe(400);
      expect(await partial.text()).not.toContain("answerDisplay");
      await page.goto("/learn/M0-01#assessment");
      const section = page.locator("#assessment");
      await expect(section.getByText("정답:", { exact: false })).toHaveCount(0);
      await section.locator("#a-place-1").fill("200");
      await section.locator("#a-compose-1").fill("6509");
      await section.locator("#a-infer-1").fill("3064");
      await section.getByRole("button", { name: "전체 답안 제출" }).click();
      await expect(section.getByText("100점", { exact: true })).toBeVisible();
      await page.reload();
      await expect(page.getByText(/형성평가 100점/)).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    });
    test("curriculum distinguishes draft units; unreleased route is 404", async ({
      page,
      request,
    }) => {
      await page.goto("/curriculum");
      await expect(page.locator(".unit-row")).toHaveCount(12);
      await expect(
        page.getByRole("link", { name: "학습하기", exact: true }),
      ).toHaveCount(12);
      await page.getByRole("button", { name: "LEVEL 8", exact: true }).click();
      await expect(
        page.getByRole("heading", {
          name: "LEVEL 8 정본 목록을 기다리고 있어요",
        }),
      ).toBeVisible();
      expect((await request.get("/learn/M1-01")).status()).toBe(404);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    });
    test("complete the unit and return for a delayed review", async ({
      page,
    }) => {
      const initialTime = Date.now();
      await page.clock.install({ time: new Date(initialTime) });
      await page.goto("/learn/M0-01");
      const practice = page.locator("#practice");
      await practice.locator('input[value="c"]').check();
      await practice.getByRole("button", { name: "답안 확인" }).click();
      await expect(
        practice.getByText("정답이에요!", { exact: true }),
      ).toBeVisible();
      await practice.getByRole("button", { name: "다음 문제" }).click();
      await practice.getByLabel("답안 (정수 · 쉼표 없이)").fill("4068");
      await practice.getByRole("button", { name: "답안 확인" }).click();
      await expect(
        practice.getByText("정답이에요!", { exact: true }),
      ).toBeVisible();
      await practice.getByRole("button", { name: "다음 문제" }).click();
      await practice.getByLabel("답안 (정수 · 쉼표 없이)").fill("2063");
      await practice.getByRole("button", { name: "답안 확인" }).click();
      await expect(
        practice.getByText("정답이에요!", { exact: true }),
      ).toBeVisible();
      const assessment = page.locator("#assessment");
      await assessment.locator("#a-place-1").fill("200");
      await assessment.locator("#a-compose-1").fill("6509");
      await assessment.locator("#a-infer-1").fill("3064");
      await assessment.getByRole("button", { name: "전체 답안 제출" }).click();
      await expect(
        assessment.getByText("100점", { exact: true }),
      ).toBeVisible();
      for (let i = 0; i < 9; i++) {
        await page
          .getByRole("button", { name: "이 단계를 확인했어요", exact: true })
          .first()
          .click();
        await expect(page.locator(".block-check.done")).toHaveCount(i + 1);
      }
      await expect(
        page.getByRole("heading", { name: "첫 단원을 완료했어요!" }),
      ).toBeVisible();
      await page.reload();
      await expect(
        page.getByRole("heading", { name: "첫 단원을 완료했어요!" }),
      ).toBeVisible();
      await page.clock.setSystemTime(
        new Date(initialTime + 25 * 60 * 60 * 1000),
      );
      await page.getByRole("link", { name: "복습하기", exact: true }).click();
      await expect(page.locator(".record-card")).toHaveCount(6);
      await page
        .locator(".record-card")
        .filter({ hasText: "p-place-1" })
        .getByRole("button", { name: "이 문제 복습하기" })
        .click();
      const review = page.locator(".problem-session");
      await review.locator('input[value="c"]').check();
      await review.getByRole("button", { name: "답안 확인" }).click();
      await expect(
        review.getByText("정답이에요!", { exact: true }),
      ).toBeVisible();
      await expect(page.locator(".record-card")).toHaveCount(5);
    });

    test("an in-flight answer cannot write into a different account", async ({
      page,
      account,
    }) => {
      let release!: () => void;
      let received!: () => void;
      let delivered!: () => void;
      const settled = new Promise<void>((resolve) => {
        delivered = resolve;
      });
      const paused = new Promise<void>((resolve) => {
        release = resolve;
      });
      const intercepted = new Promise<void>((resolve) => {
        received = resolve;
      });
      await page.route("**/api/practice", async (route) => {
        if (route.request().method() !== "POST") {
          await route.continue();
          return;
        }
        const response = await route.fetch();
        received();
        await paused;
        try {
          await route.fulfill({ response });
        } catch {
          /* Logout navigation can cancel the old document request. */
        } finally {
          delivered();
        }
      });
      await page.goto("/learn/M0-01");
      const section = page.locator("#practice");
      await section.locator('input[value="c"]').check();
      await section.getByRole("button", { name: "답안 확인" }).click();
      await intercepted;
      await page.getByRole("button", { name: "로그아웃", exact: true }).click();
      await expect(page).toHaveURL("/login");
      const created = await page.request.post("/api/auth/signup", {
        headers: { Origin: "http://localhost:3005" },
        data: {
          email: `other-${crypto.randomUUID()}@math90.test`,
          password: "Math90TestOnly123",
        },
      });
      expect(created.status()).toBe(200);
      release();
      await settled;
      await page.goto("/");
      await expect(page.locator(".stat-number").first()).toHaveText("0회");
      await expect(page.locator(".account-email")).toContainText("other-");
      await page.getByRole("button", { name: "로그아웃", exact: true }).click();
      await expect(page).toHaveURL("/login");
      const signedIn = await page.request.post("/api/auth/login", {
        headers: { Origin: "http://localhost:3005" },
        data: account,
      });
      expect(signedIn.status()).toBe(200);
      await page.goto("/");
      await expect(page.locator(".stat-number").first()).toHaveText("1회");
    });
  });
}
