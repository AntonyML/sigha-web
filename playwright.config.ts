import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.e2e' });

const WEB_URL = process.env.E2E_WEB_URL ?? 'http://localhost:3001';

// "true" abre una ventana con GUI (headed); "false"/vacío corre headless.
// Al pasarlo explícito (''|'true'|'false') evita el aviso de conflicto con
// --headed/--headless; --headed/--headless siguen teniendo prioridad si se pasan.
const HEADED = process.env.E2E_HEADED === 'true';

/**
 * Antes de ejecutar los tests, el proyecto necesita:
 *   - El frontend Next.js corriendo en http://localhost:3001 (se reutiliza si ya está activo)
 *   - La API NestJS corriendo en http://localhost:3000 (proxy de Next.js)
 *   - Un `.env.e2e` con `E2E_ADMIN_EMAIL` y `E2E_ADMIN_PASSWORD` (ver .env.e2e.example)
 */
export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  outputDir: 'test-results/.artifacts',
  timeout: 45_000,
  expect: { timeout: 12_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['line'], ['html', { outputFolder: 'test-results/html', open: 'never' }]]
    : [['list'], ['html', { outputFolder: 'test-results/html', open: 'never' }]],
  use: {
    baseURL: WEB_URL,
    storageState: './e2e/.auth/user.json',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: !HEADED,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: {
    command: 'bun run dev',
    url: WEB_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
