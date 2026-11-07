import { test, expect } from "./fixtures";
import { viewports } from "./viewports";

const units = [
  ["M5-19", "수열과 일반항", "처음 세 항은 두 규칙에서 같아요"],
  ["M5-20", "등차수열", "a₁=3, d=-2"],
  ["M5-21", "등비수열", "a₁=2, q=-2"],
  ["M5-22", "합의 기호와 여러 수열의 합", "Σ(k²)"],
  ["M5-23", "수학적 귀납법", "귀납 증명의 구조"],
] as const;

for (const viewport of viewports) {
  test.describe(`M5-19~M5-23 ${viewport.name}`, () => {
    test.use(viewport.options);
    test("renders draft labs and redacted problem banks, then records isolated practice progress", async ({ page }) => {
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

      await page.goto("/learn/M5-19");
      const practice = page.locator("#practice");
      await practice.locator('input[type="radio"][value="A"]').check();
      await practice.getByRole("button", { name: "답안 확인" }).click();
      await expect(practice.locator(".feedback")).toBeVisible();
      await page.reload();
      const progress = (await (await page.request.get("/api/progress")).json()).progress;
      expect(progress.attempts.some((attempt: { unitId?: string }) => attempt.unitId === "M5-19")).toBe(true);
      expect(progress.unitProgress["M5-19"]).toBeDefined();
      expect(progress.unitProgress["M5-20"]).toBeUndefined();
      expect(progress.assessmentScore).toBeNull();
      expect(progress.completedBlocks).not.toContain("goals");
    });
  });
}
