import { test, expect } from "./fixtures";
import { viewports } from "./viewports";

const units = [
  ["M5-04", "로그의 성질", "= 5"],
  ["M5-05", "상용로그", "k=-2, m≈4"],
  ["M5-06", "지수함수의 그래프", "수평점근선 y=0"],
  ["M5-07", "로그함수의 그래프", "수직점근선 x=0"],
  ["M5-08", "지수방정식과 부등식", "x≥2"],
] as const;

for (const viewport of viewports) {
  test.describe(`M5-04~M5-08 ${viewport.name}`, () => {
    test.use(viewport.options);

    test("renders five math labs, six preview problems, and unit-isolated progress", async ({ page }) => {
      for (const [unitId, title, labText] of units) {
        await page.goto(`/learn/${unitId}`);
        await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
        await expect(page.getByText("개발 미리보기 · 제안 교육과정 초안", { exact: true })).toBeVisible();
        await expect(page.locator("#lab .lab-result")).toContainText(labText);
        await expect(page.locator("#concept .instruction-sections article")).toHaveCount(6);
        const response = await page.request.get(`/api/practice?unitId=${unitId}&collection=proposal-preview`);
        expect(response.status()).toBe(200);
        const bank = await response.json();
        expect(bank.problems).toHaveLength(6);
        expect(bank.families).toHaveLength(3);
        expect(JSON.stringify(bank.problems)).not.toMatch(/answerRule|answerDisplay|explanation|steps/);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      }

      await page.goto("/learn/M5-04");
      const practice = page.locator("#practice");
      await practice.locator('input[type="radio"][value="A"]').check();
      await practice.getByRole("button", { name: "답안 확인" }).click();
      await expect(practice.getByText("정답이에요!", { exact: true })).toBeVisible();
      await page.reload();
      const progress = (await (await page.request.get("/api/progress")).json()).progress;
      expect(progress.unitProgress["M5-04"]).toBeDefined();
      expect(progress.unitProgress["M5-05"]).toBeUndefined();
      expect(progress.assessmentScore).toBeNull();
      expect(progress.completedBlocks).not.toContain("goals");
    });
  });
}
