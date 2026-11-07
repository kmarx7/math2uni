import { test, expect } from "./fixtures";
import { viewports } from "./viewports";

const units = [
  ["M5-24", "대수 연결 점검", "두 개념 연결"],
  ["M6-01", "함수의 극한의 뜻", "좌극한"],
  ["M6-02", "극한의 성질과 계산", "극한값"],
  ["M6-03", "극한의 대소 관계", "양쪽 경계의 극한"],
  ["M6-04", "함수의 연속", "함수값 정의"],
] as const;

for (const viewport of viewports) {
  test.describe(`M5-24 and M6-01~M6-04 ${viewport.name}`, () => {
    test.use(viewport.options);
    test("renders accessible preview labs, redacted practice banks and isolated progress", async ({ page }) => {
      for (const [unitId, title, labText] of units) {
        await page.goto(`/learn/${unitId}`);
        await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
        await expect(page.getByText("개발 미리보기 · 제안 교육과정 초안", { exact: true })).toBeVisible();
        await expect(page.locator("#lab .lab-result")).toContainText(labText);
        await expect(page.locator("#concept .instruction-sections article")).toHaveCount(6);
        await expect(page.locator("#lab svg[role=img][aria-label]")).toBeVisible();
        const response = await page.request.get(`/api/practice?unitId=${unitId}&collection=proposal-preview`);
        expect(response.status()).toBe(200);
        const bank = await response.json();
        expect(bank.problems).toHaveLength(6); expect(bank.families).toHaveLength(3);
        expect(JSON.stringify(bank.problems)).not.toMatch(/answerRule|answerDisplay|explanation|steps/);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      }

      await page.goto("/learn/M5-24");
      const practice = page.locator("#practice");
      await practice.locator('input[type="radio"][value="A"]').check();
      await practice.getByRole("button", { name: "답안 확인" }).click();
      await expect(practice.locator(".feedback")).toBeVisible();
      await page.reload();
      const progress = (await (await page.request.get("/api/progress")).json()).progress;
      expect(progress.attempts.some((attempt: { unitId?: string }) => attempt.unitId === "M5-24")).toBe(true);
      expect(progress.unitProgress["M5-24"]).toBeDefined();
      expect(progress.unitProgress["M6-01"]).toBeUndefined();
      expect(progress.assessmentScore).toBeNull();
      expect(progress.completedBlocks).not.toContain("goals");
    });
  });
}
