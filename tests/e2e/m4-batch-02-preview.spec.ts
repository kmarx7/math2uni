import { test, expect } from "./fixtures";
import { viewports } from "./viewports";

const units = [
  ["M4-09", "집합의 표현과 포함", "A⊆B는 참"],
  ["M4-10", "집합의 연산", "A∪B = {1, 2, 3, 4}"],
  ["M4-11", "명제와 조건", "진리집합 T="],
  ["M4-12", "역·대우와 조건 관계", "원명제 p⇒q"],
  ["M4-13", "명제의 증명", "가정 → 정의 적용 → 결론/모순"],
] as const;

for (const viewport of viewports) {
  test.describe(`M4-09~M4-13 ${viewport.name}`, () => {
    test.use(viewport.options);

    test("renders accessible labs and keeps preview learning in unitProgress", async ({ page }) => {
      for (const [unitId, title, labText] of units) {
        await page.goto(`/learn/${unitId}`);
        await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
        await expect(page.getByText("개발 미리보기 · 제안 교육과정 초안", { exact: true })).toBeVisible();
        await expect(page.locator("#lab .lab-result")).toContainText(labText);
        await expect(page.locator("#concept .instruction-sections article")).toHaveCount(6);
        const bankResponse = await page.request.get(`/api/practice?unitId=${unitId}&collection=proposal-preview`);
        expect(bankResponse.status()).toBe(200);
        const bank = await bankResponse.json();
        expect(bank.problems).toHaveLength(6);
        expect(bank.families).toHaveLength(3);
        expect(JSON.stringify(bank.problems)).not.toMatch(/answerRule|answerDisplay|explanation|steps/);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      }

      await page.goto("/learn/M4-09");
      const practice = page.locator("#practice");
      await practice.locator('input[type="radio"][value="B"]').check();
      await practice.getByRole("button", { name: "답안 확인" }).click();
      await expect(practice.getByText("정답이에요!", { exact: true })).toBeVisible();
      await page.reload();
      const progress = (await (await page.request.get("/api/progress")).json()).progress;
      expect(progress.unitProgress["M4-09"]).toBeDefined();
      expect(progress.unitProgress["M4-10"]).toBeUndefined();
      expect(progress.assessmentScore).toBeNull();
      expect(progress.completedBlocks).not.toContain("goals");
    });
  });
}
