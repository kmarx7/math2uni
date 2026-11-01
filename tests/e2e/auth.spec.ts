import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
const password = "Math90TestOnly123";
import { viewports } from "./viewports";
for (const variant of viewports) {
  test.describe(variant.name, () => {
    test.use(variant.options);
    test("login is required before learning and private APIs", async ({
      page,
      request,
    }) => {
      await page.goto("/learn/M0-01");
      await expect(page).toHaveURL("/login");
      await expect(
        page.getByRole("heading", { name: "나의 수학 여정에 로그인" }),
      ).toBeVisible();
      for (const url of [
        "/api/practice",
        "/api/assessment",
        "/api/progress",
        "/api/practice?unitId=M1-01",
        "/api/assessment?unitId=M1-01",
      ])
        expect((await request.get(url)).status()).toBe(401);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    });
    test("signup, wrong password, logout and returning login retain server records", async ({
      page,
      browser,
    }) => {
      const email = `signup-${randomUUID()}@math90.test`;
      await page.goto("/signup");
      await page.getByLabel("아이디 (이메일)").fill(email);
      await page.getByLabel("비밀번호", { exact: true }).fill(password);
      await page.getByLabel("비밀번호 확인").fill("DifferentPass123");
      await page.getByRole("button", { name: "회원가입", exact: true }).click();
      await expect(page.locator(".auth-form-wrap [role=alert]")).toHaveText(
        "비밀번호 확인이 일치하지 않아요.",
      );
      await page.getByLabel("비밀번호 확인").fill(password);
      await page.getByRole("button", { name: "회원가입", exact: true }).click();
      await expect(page).toHaveURL("/");
      await expect(page.locator(".account-email")).toHaveText(email);
      const cookies = await page.context().cookies();
      expect(
        cookies
          .filter((c) => c.name.includes("auth-token"))
          .every((c) => c.httpOnly),
      ).toBe(true);
      expect(
        await page.evaluate(() =>
          Object.keys(localStorage).filter((k) => k.includes("auth-token")),
        ),
      ).toEqual([]);
      await page.getByRole("link", { name: "첫 학습 시작하기" }).click();
      const practice = page.locator("#practice");
      await practice.locator('input[value="c"]').check();
      await practice.getByRole("button", { name: "답안 확인" }).click();
      await expect(
        practice.getByText("정답이에요!", { exact: true }),
      ).toBeVisible();
      await page.getByRole("button", { name: "로그아웃", exact: true }).click();
      await expect(page).toHaveURL("/login");
      expect((await page.request.get("/api/progress")).status()).toBe(401);
      await page.getByLabel("아이디 (이메일)").fill(email);
      await page.getByLabel("비밀번호", { exact: true }).fill("WrongPass123");
      await page.getByRole("button", { name: "로그인", exact: true }).click();
      await expect(page.locator(".auth-form-wrap [role=alert]")).toContainText(
        "아이디 또는 비밀번호",
      );
      const other = await browser.newContext();
      const fresh = await other.newPage();
      await fresh.goto("http://localhost:3005/login");
      await fresh.getByLabel("아이디 (이메일)").fill(email);
      await fresh.getByLabel("비밀번호", { exact: true }).fill(password);
      await fresh.getByRole("button", { name: "로그인", exact: true }).click();
      await expect(fresh.locator(".stat-number").first()).toHaveText("1회");
      await other.close();
    });
    test("accounts are isolated and client cannot overwrite ownership or score", async ({
      page,
      browser,
    }) => {
      const signup = async (email: string) => {
        const result = await page.request.post("/api/auth/signup", {
          headers: { Origin: "http://localhost:3005" },
          data: { email, password },
        });
        expect(result.status()).toBe(200);
      };
      await signup(`owner-${randomUUID()}@math90.test`);
      await page.goto("/");
      const a = await (await page.request.get("/api/progress")).json();
      const result = await page.request.post("/api/progress", {
        headers: { Origin: "http://localhost:3005" },
        data: {
          type: "complete-block",
          unitId: "M0-01",
          blockId: "goals",
          user_id: randomUUID(),
          assessmentScore: 100,
        },
      });
      expect(result.status()).toBe(400);
      const context = await browser.newContext();
      const b = await context.newPage();
      await b.goto("http://localhost:3005/login");
      const bEmail = `other-${randomUUID()}@math90.test`;
      await b.request.post("http://localhost:3005/api/auth/signup", {
        headers: { Origin: "http://localhost:3005" },
        data: { email: bEmail, password },
      });
      const state = await (
        await b.request.get(
          `http://localhost:3005/api/progress?user_id=${a.progress.profileId}`,
        )
      ).json();
      expect(state.progress.profileId).not.toBe(a.progress.profileId);
      expect(state.progress.attempts).toHaveLength(0);
      await context.close();
    });
  });
}
