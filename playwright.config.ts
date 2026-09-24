import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const UPSTREAM_PORT = 4010;
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * End-to-end tests against a production build, with the µLearn API replaced
 * by e2e/mock-upstream.mjs so no real pledges are created.
 */
export default defineConfig({
  testDir: "./e2e",
  // The mock API is stateful; run specs in a predictable order.
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      command: "node e2e/mock-upstream.mjs",
      port: UPSTREAM_PORT,
      reuseExistingServer: !process.env.CI,
      env: { MOCK_UPSTREAM_PORT: String(UPSTREAM_PORT) },
    },
    {
      command: `npm run build && npm run start -- --port ${PORT} --hostname 127.0.0.1`,
      url: baseURL,
      timeout: 300_000,
      reuseExistingServer: !process.env.CI,
      env: { MULEARN_API_BASE_URL: `http://127.0.0.1:${UPSTREAM_PORT}/` },
    },
  ],
});
