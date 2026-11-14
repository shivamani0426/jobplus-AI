import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 100_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 30_000,
  },
  projects: [{ name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'] } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : [
    { command: 'python -m uvicorn app.main:app --host 127.0.0.1 --port 8000', cwd: '../../services/intelligence', url: 'http://127.0.0.1:8000/healthz', reuseExistingServer: !process.env.CI, timeout: 90_000 },
    { command: 'npm run start -- --port 3100', url: 'http://127.0.0.1:3100/api/health', reuseExistingServer: !process.env.CI, timeout: 120_000 },
  ],
})
