import { test, expect } from "./fixtures";
const firstAnswers = [
  "c",
  "59",
  "24",
  "4",
  "14",
  "4",
  "3/8",
  "4/7",
  "1.55",
  "60",
  "2",
  "13",
];
import { viewports } from "./viewports";
for (const variant of viewports) {
  test.describe(variant.name, () => {
    test.use(variant.options);
    for (let index = 0; index < 12; index++) {
      const unitId = `M0-${String(index + 1).padStart(2, "0")}`;
      test(`${unitId} has a usable lab, isolated bank and persistent practice`, async ({
        page,
      }, testInfo) => {
        await page.goto(`/learn/${unitId}`);
        await expect(page.locator(".blocks>.lesson-block")).toHaveCount(9);
        const before = await page
          .locator("#lab .lab-result strong")
          .innerText();
        const control = page.locator("#lab input[type=range]").first();
        await control.focus();
        await control.press("ArrowRight");
        await expect(page.locator("#lab .lab-result strong")).not.toHaveText(
          before,
        );
        if (index === 7) {
          await page
            .locator("#lab")
            .screenshot({ path: testInfo.outputPath("fraction-lab.png") });
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.screenshot({
            path: testInfo.outputPath("lesson-viewport.png"),
          });
        }
        const assessment = await (
          await page.request.get(`/api/assessment?unitId=${unitId}`)
        ).json();
        expect(assessment.problems).toHaveLength(3);
        for (const p of assessment.problems) {
          expect(p.unitId).toBe(unitId);
          expect(p).not.toHaveProperty("answerRule");
          expect(p).not.toHaveProperty("explanation");
        }
        const practice = page.locator("#practice");
        if (index === 0) await practice.locator('input[value="c"]').check();
        else
          await practice
            .locator("input:not([type=radio])")
            .fill(firstAnswers[index]);
        await practice.getByRole("button", { name: "답안 확인" }).click();
        await expect(
          practice.getByText("정답이에요!", { exact: true }),
        ).toBeVisible();
        await page.reload();
        const progress = await (await page.request.get("/api/progress")).json();
        expect(progress.progress.attempts).toHaveLength(1);
        expect(progress.progress.attempts[0].unitId).toBe(unitId);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBe(true);
      });
    }
    test("unit assessment and block progress cannot spill into another unit", async ({
      page,
    }) => {
      const post = (path: string, data: unknown) =>
        page.request.post(path, {
          headers: { Origin: "http://localhost:3005" },
          data,
        });
      let result = await post("/api/assessment", {
        unitId: "M0-02",
        requestId: crypto.randomUUID(),
        answers: { "a-m0-02-1": "59", "a-m0-02-2": "35", "a-m0-02-3": "35" },
      });
      expect(result.status()).toBe(200);
      expect((await result.json()).score).toBe(100);
      result = await post("/api/assessment", {
        unitId: "M0-03",
        requestId: crypto.randomUUID(),
        answers: { "a-m0-03-1": "0", "a-m0-03-2": "0", "a-m0-03-3": "0" },
      });
      expect(result.status()).toBe(200);
      expect((await result.json()).score).toBe(0);
      result = await post("/api/progress", {
        type: "complete-block",
        unitId: "M0-02",
        blockId: "goals",
      });
      expect(result.status()).toBe(200);
      const state = (await (await page.request.get("/api/progress")).json())
        .progress;
      expect(state.unitProgress["M0-02"]).toEqual({
        completedBlocks: ["goals"],
        assessmentScore: 100,
      });
      expect(state.unitProgress["M0-03"]).toEqual({
        completedBlocks: [],
        assessmentScore: 0,
      });
      expect(state.assessmentScore).toBeNull();
      expect(state.completedBlocks).toEqual([]);
      expect(
        (
          await post("/api/assessment", {
            unitId: "M0-03",
            requestId: crypto.randomUUID(),
            answers: {
              "a-m0-02-1": "59",
              "a-m0-02-2": "35",
              "a-m0-02-3": "35",
            },
          })
        ).status(),
      ).toBe(400);
    });
    test("fraction mistakes return to the correct unit for correction", async ({
      page,
    }) => {
      await page.goto("/learn/M0-08");
      const practice = page.locator("#practice");
      await practice.getByLabel("답안 (분수 · a/b)").fill("0/1");
      await practice.getByRole("button", { name: "답안 확인" }).click();
      await expect(
        practice.getByText("정답: 4/7", { exact: true }),
      ).toBeVisible();
      await page.getByRole("link", { name: "오답노트", exact: true }).click();
      await expect(page.locator(".record-card .eyebrow")).toContainText(
        "M0-08",
      );
      await page.getByRole("button", { name: "이 문제 복습하기" }).click();
      const retry = page.locator(".problem-session");
      await retry.getByLabel("답안 (분수 · a/b)").fill("4/7");
      await retry.getByRole("button", { name: "답안 확인" }).click();
      await expect(
        retry.getByText("정답이에요!", { exact: true }),
      ).toBeVisible();
      await page.reload();
      await expect(
        page.getByText("아직 남아 있는 오답이 없어요"),
      ).toBeVisible();
    });
  });
}
