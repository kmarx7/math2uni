import { test, expect } from "./fixtures";
import { viewports } from "./viewports";

const units = [
  ["M4-19", "무리함수", "현재 정의역: x ≥ 2"],
  ["M4-20", "공통수학2 연결 점검", "표본 입력 중 허용되는 값: {1, 3, 4, 5, 6}"],
  ["M5-01", "지수의 확장", "8^(2/3) = 4"],
  ["M5-02", "실수 지수와 지수법칙", "2^1.5 = 2.8284"],
  ["M5-03", "로그의 정의", "log_2(8) = 3"],
] as const;

for (const viewport of viewports) {
  test.describe(`M4-19~M5-03 ${viewport.name}`, () => {
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

      await page.goto("/learn/M4-19");
      const practice = page.locator("#practice");
      await practice.locator('input[type="radio"][value="B"]').check();
      await practice.getByRole("button", { name: "답안 확인" }).click();
      await expect(practice.getByText("정답이에요!", { exact: true })).toBeVisible();
      await page.reload();
      const progress = (await (await page.request.get("/api/progress")).json()).progress;
      expect(progress.unitProgress["M4-19"]).toBeDefined();
      expect(progress.unitProgress["M4-20"]).toBeUndefined();
      expect(progress.assessmentScore).toBeNull();
      expect(progress.completedBlocks).not.toContain("goals");
    });
  });
}
