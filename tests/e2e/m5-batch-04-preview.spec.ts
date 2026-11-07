import { test, expect } from "./fixtures";
import { viewports } from "./viewports";

const units = [
  ["M5-14", "삼각함수의 그래프", "진폭"],
  ["M5-15", "삼각방정식과 부등식", "구간 안의 해"],
  ["M5-16", "사인법칙", "대응쌍 계산"],
  ["M5-17", "코사인법칙", "두 변과 끼인각"],
  ["M5-18", "삼각형의 넓이와 활용", "높이 h="],
] as const;

for (const viewport of viewports) {
  test.describe(`M5-14~M5-18 ${viewport.name}`, () => {
    test.use(viewport.options);
    test("renders labs and redacted practice banks, then records one isolated attempt", async ({ page }) => {
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

      await page.goto("/learn/M5-14");
      const practice = page.locator("#practice");
      await practice.locator('input[type="radio"][value="A"]').check();
      await practice.getByRole("button", { name: "답안 확인" }).click();
      await expect(practice.locator(".feedback")).toBeVisible();
      await page.reload();
      const progress = (await (await page.request.get("/api/progress")).json()).progress;
      expect(progress.attempts.some((attempt: { unitId?: string }) => attempt.unitId === "M5-14")).toBe(true);
      expect(progress.unitProgress["M5-14"]).toBeDefined();
      expect(progress.unitProgress["M5-15"]).toBeUndefined();
      expect(progress.assessmentScore).toBeNull();
      expect(progress.completedBlocks).not.toContain("goals");
    });
  });
}
