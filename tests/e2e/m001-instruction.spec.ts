import { test, expect } from "./fixtures";
import { viewports } from "./viewports";
for (const viewport of viewports)
  test.describe(viewport.name, () => {
    test.use(viewport.options);
    test("six learning sections and bounded place-value explorations work with a keyboard", async ({
      page,
    }, testInfo) => {
      await page.goto("/learn/M0-01");
      await expect(
        page
          .getByRole("navigation", { name: "15단계 학습 경로" })
          .getByRole("link"),
      ).toHaveCount(15);
      await expect(
        page.locator("#concept .instruction-sections article"),
      ).toHaveCount(6);
      await expect(page.locator(".blocks>.lesson-block")).toHaveCount(9);
      const exploration = page.locator(".place-exploration");
      const tens = exploration.getByLabel(/십 묶음 수/);
      await tens.focus();
      await tens.press("ArrowRight");
      await expect(
        exploration.getByText("3백과 13십 = 4백과 3십 = 430", { exact: true }),
      ).toBeVisible();
      await exploration.getByLabel("비교할 수").selectOption("6008");
      await expect(
        exploration.getByText("0 하나를 지워 쓰면 6,008 → 608", {
          exact: true,
        }),
      ).toBeVisible();
      const digit = exploration.getByLabel(/백의 자리 바꾸기/);
      await digit.focus();
      await digit.press("ArrowRight");
      await expect(
        exploration.getByText("3,042 → 3,542 · 늘어난 값 5 × 100 = 500", {
          exact: true,
        }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await exploration.screenshot({
        path: testInfo.outputPath("place-exploration.png"),
      });
    });
  });
