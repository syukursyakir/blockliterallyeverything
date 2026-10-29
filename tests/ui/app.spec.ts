import { test, expect } from '@playwright/test'
import { defaultSettings, initialStatus } from '../../src/shared'

test('honest browser preview; editable rules persist after save and reload', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto('/')
  await expect(page.getByText('Interface preview', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start focus session' })).toBeDisabled()
  await page.getByRole('button', { name: 'Rules', exact: false }).first().click()
  await page.getByRole('button', { name: 'Add rule', exact: true }).click()
  await page.getByLabel('Rule name', { exact: true }).fill('No games during study')
  await page.getByLabel('What should stay out?').fill('Block visible video games and game launchers.')
  await page.getByRole('button', { name: 'Apply rule' }).click()
  await expect(page.getByRole('button', { name: 'No games during study', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Save changes' }).click()
  await page.reload()
  await page.getByRole('button', { name: 'Rules', exact: false }).first().click()
  await expect(page.getByRole('button', { name: 'No games during study', exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

test('invalid custom rule stays in dialog; cancel preserves rules', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Rules', exact: false }).first().click()
  await page.getByRole('button', { name: 'Add rule', exact: true }).click()
  await page.getByRole('button', { name: 'Apply rule' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Add a name' })).toBeVisible()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByText('You have unsaved changes.')).toHaveCount(0)
})

test('blocking screen preview and recovery work', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Test lab', exact: true }).click()
  await page.getByRole('button', { name: 'Preview cover' }).click()
  await expect(page.getByRole('heading', { name: 'This content is blocked.' })).toBeVisible()
  await page.screenshot({ path: 'test-results/blocking-screen.png', fullPage: true })
  await page.getByRole('button', { name: 'Pause & return to app' }).click()
  await expect(page.getByRole('heading', { name: 'Make room for what matters.' })).toBeVisible()
})

test('settings validate bounds and preserve detection-only default', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Model & settings', exact: true }).click()
  await expect(page.getByRole('switch', { name: 'Detection-only mode' })).toBeChecked()
  await page.getByLabel('Time between checks', { exact: true }).fill('0')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Invalid intervalSeconds' })).toBeVisible()
  await page.getByLabel('Time between checks', { exact: true }).fill('5')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByText('Changes saved on this device.')).toBeVisible()
})

test('dark dashboard fits desktop and narrow screens without overflow', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Make room for what matters.' })).toBeVisible()
  await page.screenshot({ path: 'test-results/dashboard.png', fullPage: true })
  for (const width of [1280, 800, 390]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
})

test('fixture desktop bridge: pause works during loading and image controls lock during analysis', async ({ page }) => {
  await page.addInitScript(({ settings, status }) => {
    const state = { settings, status: { ...status, model: 'installed' }, desktop: true }
    const listeners = new Set<(value: unknown) => void>()
    let finishStart: () => void = () => {}
    const update = () => listeners.forEach(listener => listener(structuredClone(state)))
    Object.assign(window, { desktop: {
      snapshot: async () => structuredClone(state),
      save: async (value: typeof settings) => { state.settings = value; update(); return value },
      start: async () => { state.status.mode = 'starting'; update(); await new Promise<void>(resolve => { finishStart = resolve }) },
      stop: async () => { state.status.mode = 'idle'; state.status.model = 'ready'; update(); finishStart() },
      installModel: async () => {}, recover: async () => {}, previewBlock: async () => {},
      testImage: async () => new Promise(resolve => { Object.assign(window, { finishImage: () => resolve({ verdicts: [{ ruleId: 'explicit', probability: 0.9 }], elapsedMs: 100 }) }) }),
      onUpdate: (listener: (value: unknown) => void) => { listeners.add(listener); return () => listeners.delete(listener) },
      onBlock: () => () => {},
    } })
  }, { settings: { ...defaultSettings, backend: 'local' as const }, status: initialStatus })
  await page.goto('/')
  await page.getByRole('button', { name: 'Start focus session' }).click()
  await expect(page.getByRole('button', { name: 'Pause session' })).toBeEnabled()
  await page.getByRole('button', { name: 'Pause session' }).click()
  await expect(page.getByRole('button', { name: 'Start focus session' })).toBeEnabled()
  await page.getByRole('button', { name: 'Test lab', exact: true }).click()
  await page.locator('#test-image').setInputFiles({ name: 'synthetic.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXioAAAAASUVORK5CYII=', 'base64') })
  await page.getByRole('button', { name: 'Analyze against 1 enabled rule' }).click()
  await expect(page.getByRole('button', { name: 'Choose test image' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Remove test image' })).toBeDisabled()
  await page.evaluate(() => (window as unknown as { finishImage(): void }).finishImage())
  await expect(page.getByText('Would block this image', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Choose test image' })).toBeEnabled()
})

test('fixture Jev setup requires consent, clears saved key input, and keeps local setup separate', async ({ page }) => {
  await page.addInitScript(({ settings, status }) => {
    const state = { settings, status: { ...status, model: 'missing' }, desktop: true }
    const listeners = new Set<(value: unknown) => void>()
    const update = () => listeners.forEach(listener => listener(structuredClone(state)))
    Object.assign(window, { desktop: {
      snapshot: async () => structuredClone(state),
      save: async (value: typeof settings) => { state.settings = value; update(); return value },
      setCloudKey: async (value: string) => { state.status.cloudKeyConfigured = Boolean(value); state.status.model = 'ready'; update() },
      start: async () => {}, stop: async () => {}, installModel: async () => {},
      recover: async () => {}, previewBlock: async () => {},
      testImage: async () => { throw new Error('This fixture never sends images to a provider.') },
      onUpdate: (listener: (value: unknown) => void) => { listeners.add(listener); return () => listeners.delete(listener) },
      onBlock: () => () => {},
    } })
  }, { settings: { ...defaultSettings, backend: 'jev' as const, cloudConsent: false }, status: initialStatus })
  await page.goto('/')
  await expect(page.getByText('Jev uses cloud image analysis', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start focus session' })).toBeDisabled()
  await page.getByRole('button', { name: 'Model & settings', exact: true }).click()
  await expect(page.getByRole('switch', { name: 'Allow screenshots to be sent to TypeSafe' })).not.toBeChecked()
  await expect(page.getByRole('button', { name: 'Download local model', exact: true })).toHaveCount(0)
  const key = page.getByLabel('TypeSafe API key', { exact: true })
  await expect(key).toHaveAttribute('type', 'password')
  await key.fill('fixture-key-not-a-real-credential')
  await page.getByRole('button', { name: 'Save API key', exact: true }).click()
  await expect(key).toHaveValue('')
  await expect(page.getByText('fixture-key-not-a-real-credential', { exact: true })).toHaveCount(0)
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('fixture-key-not-a-real-credential')
  await page.getByRole('button', { name: 'Overview', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Start focus session' })).toBeDisabled()
  await page.getByRole('button', { name: 'Model & settings', exact: true }).click()
  await page.getByRole('switch', { name: 'Allow screenshots to be sent to TypeSafe' }).check()
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(page.getByText('Budget reserved', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Overview', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Start focus session' })).toBeEnabled()
  await page.getByRole('button', { name: 'Model & settings', exact: true }).click()
  await page.getByRole('tab', { name: 'OmniJev · local' }).click()
  await expect(page.getByRole('button', { name: 'Download local model', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Overview', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Start focus session' })).toBeDisabled()
})
