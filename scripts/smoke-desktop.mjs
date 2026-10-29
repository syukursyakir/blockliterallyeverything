import { _electron, expect } from '@playwright/test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

// This test uses the real desktop shell and IPC, without substituting AI decisions.
const userData = await mkdtemp(path.join(tmpdir(), 'ble-desktop-smoke-'))
let desktop
try {
  desktop = await _electron.launch({ executablePath: process.env.BLE_SMOKE_APP_EXE || undefined, args: process.env.BLE_SMOKE_APP_EXE ? [] : [path.resolve('.')], env: { ...process.env, BLE_DEV_URL: '', BLE_SMOKE_USER_DATA_DIR: userData }, timeout: 60_000 })
  const page = await desktop.firstWindow()
  await expect(page.getByRole('heading', { name: 'A little setup. A little more focus.' })).toBeVisible()
  await expect(page.getByText('Interface preview', { exact: true })).toHaveCount(0)
  const snapshot = await page.evaluate(() => window.desktop.snapshot())
  if (!snapshot.desktop || snapshot.settings.rules.length !== 3 || snapshot.onboardingComplete !== false) throw new Error('Real desktop bridge or default settings failed')

  const captures = await desktop.evaluate(async ({ desktopCapturer }) => {
    const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 320, height: 320 } })
    return sources.map(source => {
      const pixels = source.thumbnail.getBitmap()
      return { empty: source.thumbnail.isEmpty(), width: source.thumbnail.getSize().width,
        varied: pixels.some((value, index) => index % 4 !== 3 && value !== pixels[index % 4]) }
    })
  })
  if (!captures.length || captures.some(capture => capture.empty || capture.width < 1 || !capture.varied)) throw new Error('Native screen capture returned missing or blank thumbnails')

  const nextWindow = desktop.waitForEvent('window')
  await page.evaluate(() => window.desktop.previewBlock())
  const cover = await nextWindow
  await expect(cover.getByRole('heading', { name: 'This content is blocked.' })).toBeVisible()
  const nativeCover = await desktop.browserWindow(cover)
  if (!await nativeCover.evaluate(window => window.isAlwaysOnTop())) throw new Error('Cover was not marked always-on-top')
  const closed = cover.waitForEvent('close')
  await cover.getByRole('button', { name: 'Pause & return to app' }).click()
  await closed
  const recovered = await page.evaluate(() => window.desktop.snapshot())
  if (recovered.status.mode !== 'idle') throw new Error('Native cover recovery did not pause the session')
  console.log('PASS: first-launch onboarding, real Electron bridge, screen thumbnails, topmost cover and recovery. AI decisions were not tested.')
} finally {
  await desktop?.close()
  await rm(userData, { recursive: true, force: true })
}
