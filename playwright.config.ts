import { defineConfig, devices } from '@playwright/test';
import { ENV } from './config/env';
import { LOGGED_OUT } from './utils/constants';

const desktop = { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } };

// UI projects share one rule: every folder under tests/ is picked up automatically, except auth/setup/api.
const uiTests = { testMatch: /.*\.spec\.ts/, testIgnore: /(auth|setup|api)\//, dependencies: ['setup'] };

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // never let a stray test.only reach CI
  retries: process.env.CI ? 1 : 0, // retries are off locally so flaky tests are not hidden
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    // Module-wise single-file reports + a CSV of the cases about to run + a history index (see reporters/)
    ['./reporters/offline-report.ts', { outputDir: 'reports' }],
  ],
  use: {
    baseURL: ENV.baseURL,
    testIdAttribute: 'data-test', // the demo app exposes data-test attributes
    trace: 'on-first-retry',
    screenshot: 'on', // a screenshot for every test goes into the reports
    video: 'off',
    launchOptions: { slowMo: Number(process.env.SLOWMO ?? 0) }, // SLOWMO=300 to watch a headed run
  },
  projects: [
    // 1) Log in once and save the session
    { name: 'setup', testMatch: /setup\/auth\.setup\.ts/ },
    // 2) Login tests start logged out
    {
      name: 'auth',
      testMatch: /auth\/.*\.spec\.ts/,
      use: { ...desktop, storageState: LOGGED_OUT },
    },
    // 3) All other UI modules reuse the saved session
    { name: 'chromium', ...uiTests, use: { ...desktop, storageState: '.auth/user.json' } },
    // 4) API tests need no browser
    { name: 'api', testMatch: /api\/.*\.spec\.ts/ },
    // Optional cross-browser run: ALL_BROWSERS=1 npx playwright test --project=firefox --project=webkit
    ...(process.env.ALL_BROWSERS
      ? [
          { name: 'firefox', ...uiTests, use: { ...devices['Desktop Firefox'], storageState: '.auth/user.json' } },
          { name: 'webkit', ...uiTests, use: { ...devices['Desktop Safari'], storageState: '.auth/user.json' } },
        ]
      : []),
  ],
});
