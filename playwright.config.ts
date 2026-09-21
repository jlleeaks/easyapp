import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
          args: ["--no-sandbox", "--disable-dev-shm-usage"],
        }
      : {},
  },
  reporter: [["list"]],
  timeout: 60000,
  webServer: [
    {
      command: "node tests/mock-supabase.mjs",
      url: "http://127.0.0.1:54321",
      reuseExistingServer: false,
    },
    {
      command: "npm run start -- --hostname 127.0.0.1",
      url: "http://localhost:3000",
      reuseExistingServer: false,
      env: {
        ANTHROPIC_API_KEY: "fixture-only-not-a-real-key",
        ANTHROPIC_BASE_URL: "http://127.0.0.1:54321",
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key-not-a-real-credential",
      },
    },
  ],
});
