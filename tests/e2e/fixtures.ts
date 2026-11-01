import { test as base, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
export const password = "Math90TestOnly123";
export const test = base.extend<{
  account: { email: string; password: string };
}>({
  account: [
    async ({ page }, provide) => {
      const email = `learner-${randomUUID()}@math90.test`;
      const response = await page.request.post("/api/auth/signup", {
        maxRetries: 2,
        headers: { Origin: "http://localhost:3005" },
        data: { email, password },
      });
      expect(response.status(), await response.text()).toBe(200);
      await provide({ email, password });
    },
    { auto: true },
  ],
  request: async ({ context }, provide) => {
    await provide(context.request);
  },
});
export { expect };
