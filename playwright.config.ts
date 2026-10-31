import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: 2,
  globalTimeout: 240000,
  timeout: 45000,
  expect: { timeout: 12000 },
  reporter: "list",
  use: { baseURL: "http://localhost:3005", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: [
    {
      command: "node scripts/test-auth-service.mjs",
      url: "http://127.0.0.1:54329/health",
      reuseExistingServer: false,
      timeout: 20000,
    },
    {
      command: "npm run dev -- --port 3005",
      url: "http://localhost:3005/login",
      env: {
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54329",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "math90-test-publishable-key",
        MATH90_BUILD_DIR: ".next-e2e",
      },
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
});
