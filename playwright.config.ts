import { defineConfig } from '@playwright/test'
import { existsSync } from 'node:fs'
export default defineConfig({
  testDir: './tests/ui', fullyParallel: false, workers: 1,
  use: { baseURL: 'http://127.0.0.1:4173', colorScheme: 'dark', viewport: { width: 1440, height: 1000 },
    launchOptions: { executablePath: process.env.BLE_TEST_BROWSER || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] },
    screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'npm exec vite preview -- --host 127.0.0.1 --port 4173 --strictPort', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI },
})
