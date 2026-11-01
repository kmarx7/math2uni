import { test, expect } from "./fixtures";
import { viewports } from "./viewports";
for (const viewport of viewports) {
  test.describe(viewport.name, () => {
    test.use(viewport.options);
    test("review all 170 proposed units without opening unfinished lessons", async ({
      page,
    }, testInfo) => {
      await page.goto("/curriculum");
      await page
        .getByRole("link", { name: "170단원 전체 제안안 보기" })
        .click();
      // The first RSC navigation compiles the full plan on a cold dev server.
      // Wait for the actual route commit before asserting its rendered content.
      await expect(page).toHaveURL("/curriculum/plan", { timeout: 60000 });
      await expect(
        page.getByRole("heading", { name: "170단원 전체 학습 계획" }),
      ).toBeVisible();
      await expect(page.locator(".plan-unit")).toHaveCount(170);
      await expect(
        page.getByText("정본 확정 전 제안안 · 콘텐츠 완성과 다릅니다", {
          exact: true,
        }),
      ).toBeVisible();
      await expect(page.locator('a[href^="/learn/M1-"]')).toHaveCount(0);
      await page.getByLabel("LEVEL 필터").selectOption("7");
      await expect(page.locator(".plan-unit")).toHaveCount(20);
      await page.getByLabel("단원 검색").fill("모비율");
      await expect(page.locator(".plan-unit")).toHaveCount(1);
      await page.locator(".plan-unit summary").click();
      await expect(
        page.getByText(
          "표본비율의 분포: 뜻과 성립 조건을 설명하고 예를 구분한다",
          { exact: true },
        ),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "M7-14 · 이항분포 보기", exact: true })
        .click();
      await expect(page.locator(".plan-unit")).toHaveCount(1);
      await expect(page.locator(".plan-unit summary")).toContainText(
        "이항분포",
      );
      await page.getByLabel("단원 검색").fill("없는단원xyz");
      await expect(
        page.getByRole("heading", { name: "검색 결과가 없어요" }),
      ).toBeVisible();
      await page.getByRole("button", { name: "전체 목록 보기" }).click();
      await expect(page.locator(".plan-unit")).toHaveCount(170);
      const downloadEvent = page.waitForEvent("download");
      await page.getByRole("button", { name: "제안안 JSON 내려받기" }).click();
      const download = await downloadEvent;
      expect(download.suggestedFilename()).toBe(
        "math90-curriculum-proposal-0.1.0.json",
      );
      const stream = await download.createReadStream();
      const chunks: Buffer[] = [];
      for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
      const proposal = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      expect(proposal.status).toBe("proposed");
      expect(proposal.curriculum.units).toHaveLength(170);
      expect(proposal.curriculum.canonicalManifest).toEqual([]);
      expect((await page.request.get("/learn/M1-01")).status()).toBe(404);
      await page
        .getByRole("button", {
          name: "LEVEL 1 · 20단원 수와 식·도형의 기초 선수 기반",
        })
        .click();
      await expect(page.locator(".plan-unit")).toHaveCount(20);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath("curriculum-plan.png"),
      });
    });
  });
}
