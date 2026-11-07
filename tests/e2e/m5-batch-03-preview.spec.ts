import { test, expect } from "./fixtures";
import { viewports } from "./viewports";

const units = [
  ["M5-09", "로그방정식과 부등식", "정의역과 해집합"],
  ["M5-10", "지수·로그의 활용", "N(n)=N₀qⁿ"],
  ["M5-11", "일반각과 호도법", "일반각은 방향"],
  ["M5-12", "삼각함수의 정의", "단위원 끝점"],
  ["M5-13", "삼각함수의 기본 관계", "sin²θ+cos²θ=1"],
] as const;

for (const viewport of viewports) {
  test.describe(`M5-09~M5-13 ${viewport.name}`, () => {
    test.use(viewport.options);
    test("renders five preview labs, redacted practice banks, and isolated progress", async ({ page }) => {
      for (const [unitId, title, labText] of units) {
        await page.goto(`/learn/${unitId}`);
        await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
        await expect(page.getByText("개발 미리보기 · 제안 교육과정 초안", { exact: true })).toBeVisible();
        await expect(page.locator("#lab .lab-result")).toContainText(labText);
        await expect(page.locator("#concept .instruction-sections article")).toHaveCount(6);
        const response = await page.request.get(`/api/practice?unitId=${unitId}&collection=proposal-preview`);
        expect(response.status()).toBe(200);
        const bank = await response.json();
        expect(bank.problems).toHaveLength(6); expect(bank.families).toHaveLength(3);
        expect(JSON.stringify(bank.problems)).not.toMatch(/answerRule|answerDisplay|explanation|steps/);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      }
      await page.goto("/learn/M5-09");
      const practice = page.locator("#practice");
      await practice.locator('input[type="radio"][value="A"]').check();
      await practice.getByRole("button", { name: "답안 확인" }).click();
      await expect(practice.getByText("정답이에요!", { exact: true })).toBeVisible();
      await page.reload();
      const progress = (await (await page.request.get("/api/progress")).json()).progress;
      expect(progress.unitProgress["M5-09"]).toBeDefined();
      expect(progress.unitProgress["M5-10"]).toBeUndefined();
      expect(progress.assessmentScore).toBeNull();
    });
  });
}
