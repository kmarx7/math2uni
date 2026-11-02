import { test, expect } from "./fixtures";
import { randomUUID } from "node:crypto";
import { viewports } from "./viewports";

for (const viewport of viewports) {
  test.describe(viewport.name, () => {
    test.use(viewport.options);
    test("proposal units render their own interactive concepts", async ({ page }) => {
      const units = [
        ["M1-01", "정수와 절댓값", "정수의 위치·원점 거리·두 점 사이 거리"],
        ["M1-02", "정수의 곱셈과 나눗셈", "부호와 크기를 나누어 곱하기"],
        ["M1-03", "유리수의 사칙연산", "같은 크기의 분수 조각 더하기"],
        ["M1-04", "거듭제곱과 지수법칙 기초", "거듭제곱은 같은 인수의 반복 곱"],
        ["M1-05", "문자와 식의 값", "값을 넣고 식의 결과 확인"],
        ["M1-06", "단항식의 계산", "계수끼리 곱하고 같은 문자 인수를 모아요"],
        ["M1-07", "다항식의 덧셈과 뺄셈", "문자와 지수가 같은 항만 모아요"],
        ["M1-08", "분배법칙과 식의 전개", "큰 직사각형을 두 부분으로 나누어 넓이를 더해요"],
        ["M1-09", "등식과 방정식의 의미", "저울의 균형을 유지하며 양변에 같은 수를 더해요"],
        ["M1-10", "일차방정식의 풀이", "양변에 같은 연산을 적용해 x를 구해요"],
        ["M1-11", "일차방정식의 활용", "상황의 양을 문자와 단위로 정리해요"],
        ["M1-12", "일차부등식", "양변을 계수로 나누고 해의 방향을 확인해요"],
        ["M1-13", "좌표평면과 순서쌍", "첫째 좌표는 가로, 둘째 좌표는 세로 위치예요"],
        ["M1-14", "정비례와 반비례", "정비례 · y/x가 일정해요"],
        ["M1-15", "각과 평행선", "평행선에서 같은 각은 같고 같은 쪽 내각은 180°예요"],
        ["M1-16", "삼각형과 다각형", "대응하는 조건으로 삼각형을 비교해요"],
        ["M1-17", "평면도형의 넓이", "직사각형을 대각선으로 나눠 삼각형 넓이를 찾아요"],
        ["M1-18", "입체도형과 부피", "같은 밑면을 층층이 쌓아 부피를 구해요"],
        ["M1-19", "자료의 정리와 대표값", "자료를 크기순으로 정리하고 대표값을 비교해요"],
        ["M1-20", "수와 식 기초 종합", "문자식과 표에서 같은 관계를 확인해요"],
        ["M2-01", "연립일차방정식의 뜻", "두 조건을 동시에 만족하는 순서쌍을 찾아요"],
        ["M2-02", "연립일차방정식의 풀이", "두 식에 같은 값을 대입해 해를 확인해요"],
        ["M2-03", "연립방정식의 활용", "두 종류의 표 수량을 두 조건으로 표현해요"],
        ["M2-04", "일차함수의 의미", "입력 하나에 출력 하나를 대응해요"],
        ["M2-05", "일차함수의 그래프", "기울기와 y절편이 직선의 모양을 정해요"],
        ["M2-06", "일차함수와 방정식", "두 그래프가 만나는 점은 두 식의 공통해예요"],
        ["M2-07", "제곱근과 실수", "넓이가"],
        ["M2-08", "근호를 포함한 계산", "근호 안의 완전제곱수를 밖으로 꺼내요"],
        ["M2-09", "다항식의 곱셈", "직사각형 넓이를 네 부분으로 나누어 전개해요"],
        ["M2-10", "인수분해 기초", "곱이 상수항, 합이 x의 계수가 되는 두 수를 찾아요"],
        ["M2-11", "이차방정식의 풀이", "방정식의 해는 곱이 0이 되는 값이에요"],
        ["M2-12", "이차방정식의 활용", "직사각형의 넓이 조건을 이차방정식으로 나타내요"],
        ["M2-13", "이차함수의 그래프", "꼭짓점과 대칭축이 포물선의 위치를 정해요"],
        ["M2-14", "이차함수와 최대·최소", "꼭짓점과 정의역에서 최댓값·최솟값을 확인해요"],
        ["M2-15", "닮음과 비례", "닮은 도형은 대응각이 같고 대응변의 비가 일정해요"],
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
      await expect(page.getByText(/초안 형성평가 미응시/)).toBeVisible();
      const firstInteger = page.getByLabel("첫 번째 정수");
      await firstInteger.focus();
      await firstInteger.press("ArrowRight");
      await expect(page.locator(".lab-result strong")).toContainText("-2 < 4");
      const bankResponse = await page.request.get("/api/practice?unitId=M1-01&collection=proposal-preview");
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
    test("M2 proposal practice returns public questions without answer data", async ({ page }) => {
      await page.goto("/learn/M2-01");
      await expect(page.getByRole("heading", { name: "연립일차방정식의 뜻", exact: true })).toBeVisible();
      const response = await page.request.get("/api/practice?unitId=M2-01&collection=proposal-preview");
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.problems).toHaveLength(6);
      expect(data.families).toHaveLength(2);
      expect(JSON.stringify(data.problems)).not.toMatch(/answerRule|answerDisplay|explanation|steps/);
    });
    test("M1-01 assessment hides answers until the complete submission and stores preview-only score", async ({ page }) => {
      await page.goto("/learn/M1-01");
      const assessmentResponse = await page.request.get("/api/assessment?unitId=M1-01&collection=proposal-preview");
      expect(assessmentResponse.status()).toBe(200);
      const bank = await assessmentResponse.json();
      expect(bank.problems).toHaveLength(3);
      expect(JSON.stringify(bank.problems)).not.toMatch(/answerRule|answerDisplay|explanation|steps/);
      const partial = await page.request.post("/api/assessment", {
        headers: { Origin: "http://localhost:3005" },
        data: { unitId: "M1-01", collection: "proposal-preview", requestId: randomUUID(), answers: { [bank.problems[0].id]: "B" } },
      });
      expect(partial.status()).toBe(400);
      const assessment = page.locator("#assessment");
      await assessment.locator('input[type="radio"]').nth(1).check();
      await assessment.locator('input:not([type="radio"])').nth(0).fill("13");
      await assessment.locator('input:not([type="radio"])').nth(1).fill("9");
      await assessment.getByRole("button", { name: "전체 답안 제출" }).click();
      await expect(assessment.getByText(/검토용 초안 결과/)).toContainText("100점");
      await page.reload();
      const state = (await (await page.request.get("/api/progress")).json()).progress;
      expect(state.assessmentScore).toBeNull();
      expect(state.unitProgress["M1-01"].assessmentScore).toBe(100);
      expect(state.attempts).toHaveLength(3);
      expect(state.attempts.every((attempt: { collection: string }) => attempt.collection === "proposal-preview")).toBe(true);
    });
    test("M1-06 assessment stores its score in that unit only", async ({ page }) => {
      await page.goto("/learn/M1-06");
      const response = await page.request.get("/api/assessment?unitId=M1-06&collection=proposal-preview");
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.problems).toHaveLength(3);
      expect(JSON.stringify(data.problems)).not.toMatch(/answerRule|answerDisplay|explanation|steps/);
      const assessment = page.locator("#assessment");
      await assessment.locator('input[type="radio"]').first().check();
      await assessment.locator('input:not([type="radio"])').nth(0).fill("3");
      await assessment.locator('input:not([type="radio"])').nth(1).fill("5");
      await assessment.getByRole("button", { name: "전체 답안 제출" }).click();
      await expect(assessment.getByText(/검토용 초안 결과/)).toContainText("100점");
      const state = (await (await page.request.get("/api/progress")).json()).progress;
      expect(state.assessmentScore).toBeNull();
      expect(state.unitProgress["M1-06"].assessmentScore).toBe(100);
      expect(state.attempts).toHaveLength(3);
    });
  });
}
