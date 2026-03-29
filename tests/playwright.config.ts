import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const API_URL = process.env['API_URL'] ?? 'http://localhost:8000';
const UI_URL = process.env['UI_URL'] ?? 'http://localhost:4200';

export default defineConfig({
  testDir: './specs',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'api',
      testMatch: 'specs/api/**/*.spec.ts',
      use: {
        baseURL: API_URL,
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
        },
      },
    },
    {
      name: 'ui',
      testMatch: 'specs/ui/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: UI_URL,
      },
    },
  ],
});

export { API_URL, UI_URL };
