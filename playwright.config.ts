import { defineConfig, devices } from "@playwright/test";

/**
 * Component and integration tests for the verification UI.
 *
 * These run against a real dev server reading the real deployed program on
 * devnet, not a mock. The whole product claim is that a shopper can trust the
 * chain rather than us, so testing the page against fixtures would prove the
 * wrong thing.
 *
 * The trade-off is that RPC latency is in the loop, hence the generous
 * timeouts: the public devnet endpoint routinely takes over a second.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 25_000 },
  reporter: [["list"]],
  // Point at a deployed URL to run the same suite against Netlify:
  //   PLAYWRIGHT_BASE_URL=https://bario-seeker.netlify.app pnpm test:e2e
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "mobile",
      // The PRD sets the accessibility bar with a 5" screen and one-handed use,
      // so the default viewport is a phone, not a desktop.
      use: { ...devices["Pixel 7"] },
    },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  // Only spin up a dev server when testing locally.
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "pnpm dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
