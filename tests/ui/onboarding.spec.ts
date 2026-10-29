import { expect, test } from '@playwright/test'
import { defaultSettings, initialStatus } from '../../src/shared'

test('first launch: consent, secure key, verification retry, presets and finish without starting capture', async ({ page }) => {
  await page.addInitScript(({ settings, status }) => {
    const state = { settings, status, desktop: true, onboardingComplete: false, localAvailable: false }
    const listeners = new Set<(value: unknown) => void>()
    const calls = { verify: 0, start: 0, completed: false }
    let verified = false
    const update = () => listeners.forEach(listener => listener(structuredClone(state)))
    Object.assign(window, { setupFixtureCalls: calls, desktop: {
      snapshot: async () => structuredClone(state),
      save: async (value: typeof settings) => { state.settings = value; update(); return value },
      setCloudKey: async (value: string) => { state.status.cloudKeyConfigured = Boolean(value); verified = false; update() },
      verifyCloud: async () => {
        calls.verify++
        if (!state.settings.cloudConsent || !state.status.cloudKeyConfigured) throw new Error('Consent and key required.')
        if (calls.verify === 1) {
          state.status.cloudSpentUsd = 3; update()
          throw new Error('TypeSafe is temporarily unavailable. Check your connection and retry.')
        }
        state.status.cloudSpentUsd = 3.1; update(); verified = true
        return { elapsedMs: 120 }
      },
      completeOnboarding: async (value: typeof settings) => {
        if (!verified || !value.cloudConsent) throw new Error('Verify the connection first.')
        state.settings = value; state.onboardingComplete = true; calls.completed = true; update()
      },
      start: async () => { calls.start++ }, stop: async () => {}, installModel: async () => {},
      testImage: async () => { throw new Error('This fixture sends no real images.') },
      previewBlock: async () => {}, recover: async () => {},
      onUpdate: (listener: (value: unknown) => void) => { listeners.add(listener); return () => listeners.delete(listener) },
      onBlock: () => () => {},
    } })
  }, { settings: structuredClone(defaultSettings), status: structuredClone(initialStatus) })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'A little setup. A little more focus.' })).toBeVisible()
  await expect(page.getByText('This edition uses Jev cloud analysis', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start focus session' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Get started' }).click()
  const consent = page.getByRole('switch', { name: 'Allow images and rules to be sent to TypeSafe' })
  const verify = page.getByRole('button', { name: 'Verify connection', exact: true })
  await expect(consent).not.toBeChecked()
  await expect(verify).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled()

  const key = page.getByLabel('TypeSafe API key', { exact: true })
  await expect(key).toHaveAttribute('type', 'password')
  await key.fill('setup-fixture-not-a-real-key')
  await page.getByRole('button', { name: 'Save API key', exact: true }).click()
  await expect(key).toHaveValue('')
  expect(await page.evaluate(async () => JSON.stringify(await window.desktop!.snapshot()))).not.toContain('setup-fixture-not-a-real-key')
  await expect(verify).toBeDisabled()
  await consent.check()
  await expect(page.getByText('Verification sends a generated, harmless image and a fixed test question to TypeSafe.', { exact: false })).toBeVisible()
  await verify.click()
  await expect(page.getByRole('alert').filter({ hasText: 'TypeSafe is temporarily unavailable' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled()
  await expect(verify).toBeDisabled()
  await page.getByLabel('Setup budget cap (USD)', { exact: true }).fill('4')
  await verify.click()
  await expect(page.getByText('Connection verified using a generated neutral image. Your screen was not captured.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Choose your first boundaries.' })).toBeVisible()
  await page.getByRole('switch', { name: 'YouTube', exact: true }).check()
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(key).toHaveValue('')
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByRole('switch', { name: 'YouTube', exact: true })).toBeChecked()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'You’re ready to try it.' })).toBeVisible()
  await expect(page.getByText('25 minutes · detection only', { exact: true })).toBeVisible()
  await page.screenshot({ path: 'test-results/onboarding-ready.png', fullPage: true })
  await page.getByRole('button', { name: 'Finish setup', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Make room for what matters.' })).toBeVisible()
  await page.getByRole('button', { name: 'Model & settings', exact: true }).click()
  await expect(page.getByRole('tab', { name: 'OmniJev · local' })).toHaveCount(0)
  await expect(page.getByText('Local AI isn’t included in this edition.', { exact: false })).toBeVisible()
  const result = await page.evaluate(async () => ({
    calls: (window as unknown as { setupFixtureCalls: { verify: number; start: number; completed: boolean } }).setupFixtureCalls,
    snapshot: await window.desktop!.snapshot(),
  }))
  expect(result.calls).toEqual({ verify: 2, start: 0, completed: true })
  expect(result.snapshot.settings).toMatchObject({ backend: 'jev', cloudConsent: true, cloudBudgetUsd: 4, detectionOnly: true, sessionMinutes: 25, intervalSeconds: 3 })
  expect(result.snapshot.settings.rules.find(rule => rule.id === 'video')?.enabled).toBe(true)
  expect(result.snapshot.status.cloudSpentUsd).toBe(3.1)
})
