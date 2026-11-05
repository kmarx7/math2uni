import { test, expect } from "./fixtures";
import { viewports } from "./viewports";

const units = [
  ["M4-14", "절대부등식 기초", "a,b≥0"],
  ["M4-15", "함수와 그래프", "이 대응은 함수예요"],
  ["M4-16", "합성함수", "먼저 안쪽 함수를"],
  ["M4-17", "역함수", "역관계는 함수가 아니에요"],
  ["M4-18", "유리함수", "정의역에서 x≠1"],
] as const;

for (const viewport of viewports) {
  test.describe(`M4-14~M4-18 ${viewport.name}`, () => {
    test.use(viewport.options);

    test("renders each preview lab and isolates practice progress", async ({ page }) => {
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

      await page.goto("/learn/M4-14");
      const practice = page.locator("#practice");
      await practice.locator('input[type="radio"][value="B"]').check();
      await practice.getByRole("button", { name: "답안 확인" }).click();
      await expect(practice.getByText("정답이에요!", { exact: true })).toBeVisible();
      await page.reload();
      const progress = (await (await page.request.get("/api/progress")).json()).progress;
      expect(progress.unitProgress["M4-14"]).toBeDefined();
      expect(progress.unitProgress["M4-15"]).toBeUndefined();
      expect(progress.assessmentScore).toBeNull();
      expect(progress.completedBlocks).not.toContain("goals");
    });
  });
}
