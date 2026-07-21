import { defineConfig, devices } from '@playwright/test';

/**
 * Visual / e2e config for Mushaf.
 * Golden pages (design): 1, 2, 50, 187, 604 — fixture corpus currently covers 1–5.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 30_000,
  // Drop {platform} so darwin/linux share baselines when fonts match closely enough
  snapshotPathTemplate:
    '{testDir}/{testFilePath}-snapshots/{arg}{-projectName}{ext}',
  expect: {
    toHaveScreenshot: {
      // Fonts/OS raster differences — keep relatively tolerant for open fonts
      maxDiffPixelRatio: process.env.CI ? 0.04 : 0.02,
      animations: 'disabled',
    },
  },
  use: {
    trace: 'on-first-retry',
    colorScheme: 'light',
    locale: 'en-US',
    viewport: { width: 480, height: 800 },
    deviceScaleFactor: 1,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], deviceScaleFactor: 1 },
    },
  ],
  // Update baselines: pnpm test:e2e:update
});
