import { test, expect } from "./fixtures";
import { viewports } from "./viewports";

for (const viewport of viewports) {
  test.describe(viewport.name, () => {
    test.use(viewport.options);
    test("all five proposal units render their own interactive concept", async ({ page }) => {
      const units = [
        ["M1-01", "정수와 절댓값", "정수의 위치·원점 거리·두 점 사이 거리"],
        ["M1-02", "정수의 곱셈과 나눗셈", "부호와 크기를 나누어 곱하기"],
        ["M1-03", "유리수의 사칙연산", "같은 크기의 분수 조각 더하기"],
        ["M1-04", "거듭제곱과 지수법칙 기초", "거듭제곱은 같은 인수의 반복 곱"],
        ["M1-05", "문자와 식의 값", "값을 넣고 식의 결과 확인"],
      ];
      for (const [unitId, title, labTitle] of units) {
        await page.goto(`/learn/${unitId}`);
        await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
        await expect(page.getByText("개발 미리보기 · 제안 교육과정 초안", { exact: true })).toBeVisible();
        await expect(page.locator(".lab-result span", { hasText: labTitle })).toBeVisible();
        await expect(page.locator("#concept .instruction-sections article")).toHaveCount(6);
      }
    });
    test("M1 draft preview records practice without changing M0-01 progress", async ({ page }) => {
      await page.goto("/learn/M1-01");
      await expect(page.getByRole("heading", { name: "정수와 절댓값", exact: true })).toBeVisible();
      await expect(page.getByText("개발 미리보기 · 제안 교육과정 초안", { exact: true })).toBeVisible();
      await expect(page.getByText(/평가\/공식 완료 판정 미구현/)).toBeVisible();
      const firstInteger = page.getByLabel("첫 번째 정수");
      await firstInteger.focus();
      await firstInteger.press("ArrowRight");
      await expect(page.locator(".lab-result strong")).toContainText("-2 < 4");
      const bankResponse = await page.request.get("/api/practice?unitId=M1-01");
      expect(bankResponse.status()).toBe(200);
      const bank = await bankResponse.json();
      expect(bank.problems).toHaveLength(6);
      expect(bank.families).toHaveLength(2);
      for (const problem of bank.problems) {
        for (const key of ["answerRule", "answerDisplay", "explanation", "steps"])
          expect(problem).not.toHaveProperty(key);
      }
      const practice = page.locator("#practice");
      await practice.getByLabel("답안 (정수 · 쉼표 없이)").fill("-7");
      await practice.getByRole("button", { name: "답안 확인" }).click();
      await expect(practice.getByText("정답: 7", { exact: true })).toBeVisible();
      await page.locator("#goals").getByRole("button", { name: "이 단계를 확인했어요" }).click();
      await page.reload();
      const state = (await (await page.request.get("/api/progress")).json()).progress;
      expect(state.unitProgress["M1-01"].completedBlocks).toContain("goals");
      expect(state.completedBlocks).not.toContain("goals");
      expect(state.assessmentScore).toBeNull();
      expect(state.attempts).toHaveLength(1);
      expect(state.attempts[0]).toMatchObject({ unitId: "M1-01", problemId: "p-m1-01-m101-01", correct: false });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  });
}
