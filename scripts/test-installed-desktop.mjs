import { _electron, expect } from '@playwright/test'
import electron from 'electron'
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { tmpdir } from 'node:os'
import path from 'node:path'

// Runs real Windows/Electron/UI/storage/capture/overlay code. Only the provider
// replies and explicitly labeled capture faults are fixtures; lock/suspend signals
// are emitted in-process. No real keys, API calls, charges or accuracy claims.
if (process.platform !== 'win32') throw new Error('This suite requires a Windows desktop.')
const profile = await mkdtemp(path.join(tmpdir(), 'ble-installed-tests-'))
const evidence = path.resolve('desktop-test-results')
await mkdir(evidence, { recursive: true })
const executable = process.env.BLE_SMOKE_APP_EXE || electron
const args = [...(process.env.BLE_SMOKE_APP_EXE ? [] : [path.resolve('.')]), '--user-data-dir=' + profile]
const env = { ...process.env, TYPESAFE_API_KEY: '', BLE_DEV_URL: '' }
const report = { scope: 'Real Windows installed-app checks with fixture provider replies, injected blank/missing captures, and emitted lock/suspend signals. No real AI inference or paid calls.', cases: [], displays: null }
const testKey = 'ble-ci-fixture-not-a-provider-key'
let desktop, page
const snapshot = () => page.evaluate(() => window.desktop.snapshot())
const api = (method, value) => page.evaluate(({ method, value }) => window.desktop[method](value), { method, value })
const fixture = (mode, capture = 'real') => desktop.evaluate((_, { mode, capture }) => {
  globalThis.bleTestFixture.mode = mode; globalThis.bleTestFixture.capture = capture
}, { mode, capture })
const counts = () => desktop.evaluate(() => ({ calls: globalThis.bleTestFixture.calls, aborted: globalThis.bleTestFixture.aborted }))
const waitMode = mode => expect.poll(async () => (await snapshot()).status.mode, { timeout: 20_000 }).toBe(mode)
const waitNoCovers = () => expect.poll(() => desktop.windows().filter(p => p.url().endsWith('#block')).length).toBe(0)
async function launch() {
  desktop = await _electron.launch({ executablePath: executable, args, env, timeout: 60_000 })
  page = await desktop.firstWindow()
  await page.waitForFunction(() => Boolean(window.desktop))
  // Assert isolation before touching any settings, keys or profile files.
  const actualProfile = await desktop.evaluate(({ app }) => app.getPath('userData'))
  expect(path.resolve(actualProfile).toLowerCase()).toBe(path.resolve(profile).toLowerCase())
  await desktop.evaluate(({ net, desktopCapturer, nativeImage }) => {
    const originalCapture = desktopCapturer.getSources.bind(desktopCapturer)
    const state = globalThis.bleTestFixture = { mode: 'allow', capture: 'real', calls: 0, aborted: 0 }
    net.fetch = async (url, options) => {
      if (url !== 'https://api.typesafe.ai/v1/systemone') throw new Error('Unexpected test transport destination')
      state.calls++
      const payload = JSON.parse(options.body)
      if (state.mode === 'offline') throw new Error('Fixture connection unavailable')
      if (state.mode === 'hang') return new Promise((_, reject) => {
        const abort = () => { state.aborted++; reject(new Error('Fixture aborted')) }
        if (options.signal.aborted) abort(); else options.signal.addEventListener('abort', abort, { once: true })
      })
      if (state.mode === 'rate-limit') return new Response('fixture', { status: 429 })
      if (state.mode === 'bad-key') return new Response('fixture', { status: 401 })
      const answers = Object.fromEntries(Object.keys(payload.questions).map(id => [id,
        { noul: state.mode === 'malformed' ? 'invalid' : state.mode === 'match' ? 0.95 : 0.02 }]))
      return new Response(JSON.stringify({ model: 'jev-1.14.0', usage: { input_tokens: 100 }, answers }))
    }
    desktopCapturer.getSources = async options => {
      const sources = await originalCapture(options)
      if (state.capture === 'missing') return []
      if (state.capture === 'blank') {
        const bitmap = Buffer.alloc(320 * 320 * 4, 255)
        return sources.map(source => ({ ...source, thumbnail: nativeImage.createFromBitmap(bitmap, { width: 320, height: 320 }) }))
      }
      return sources
    }
  })
}
async function run(name, action) {
  const started = Date.now()
  try { await action(); report.cases.push({ name, passed: true, milliseconds: Date.now() - started }); console.log('PASS:', name) }
  catch (error) {
    report.cases.push({ name, passed: false, milliseconds: Date.now() - started, error: String(error.message) })
    await page?.screenshot({ path: path.join(evidence, 'failure.png') }).catch(() => {})
    throw error
  } finally { await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 2) + '\n') }
}
async function save(patch) { return api('save', { ...(await snapshot()).settings, ...patch }) }
async function startCover() {
  await fixture('match')
  await save({ detectionOnly: false, intervalSeconds: 1 })
  const created = desktop.waitForEvent('window', { timeout: 20_000 })
  await api('start')
  const cover = await created
  await expect(cover.getByRole('heading', { name: 'This content is blocked.' })).toBeVisible({ timeout: 20_000 })
  await waitMode('blocked')
  return cover
}
async function expectPaused() { await waitMode('idle'); await waitNoCovers(); expect((await snapshot()).status.endsAt).toBeNull() }

try {
  await launch()
  await run('first launch stays inactive; real encrypted key save and verification retry', async () => {
    await expect(page.getByRole('heading', { name: 'A little setup. A little more focus.' })).toBeVisible()
    expect((await counts()).calls).toBe(0)
    await page.getByRole('button', { name: 'Get started' }).click()
    const verify = page.getByRole('button', { name: 'Verify connection', exact: true })
    await expect(verify).toBeDisabled()
    await page.getByLabel('TypeSafe API key', { exact: true }).fill(testKey)
    await page.getByRole('button', { name: 'Save API key', exact: true }).click()
    await expect(page.getByLabel('TypeSafe API key', { exact: true })).toHaveValue('')
    const encrypted = await readFile(path.join(profile, 'jev-key.enc'))
    expect(encrypted.includes(Buffer.from(testKey))).toBe(false)
    expect(JSON.stringify(await snapshot())).not.toContain(testKey)
    await page.getByRole('switch', { name: 'Allow images and rules to be sent to TypeSafe' }).check()
    await fixture('bad-key'); await verify.click()
    await expect(page.getByRole('alert').filter({ hasText: 'rejected the API key' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled()
    await fixture('allow'); await verify.click()
    await expect(page.getByText('Connection verified using a generated neutral image. Your screen was not captured.', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.getByRole('switch', { name: 'Explicit content', exact: true }).uncheck()
    await page.getByRole('switch', { name: 'YouTube', exact: true }).check()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.getByRole('button', { name: 'Finish setup', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Make room for what matters.' })).toBeVisible()
    expect((await snapshot()).status).toMatchObject({ mode: 'idle', checks: 0, cloudRequests: 2 })
  })
  await run('detection-only session records fixture matches without covers', async () => {
    await fixture('match'); await save({ detectionOnly: true, intervalSeconds: 1 })
    await page.getByRole('button', { name: 'Start focus session' }).click()
    await expect.poll(async () => (await snapshot()).status.blocks, { timeout: 20_000 }).toBeGreaterThan(0)
    await waitNoCovers()
    expect((await snapshot()).status.activity.some(event => event.message === 'Preview match: YouTube')).toBe(true)
    await page.getByRole('button', { name: 'Pause session' }).click(); await expectPaused()
  })
  await run('fullscreen test window is covered; native bounds/topmost/focus and button recovery', async () => {
    await desktop.evaluate(async ({ BrowserWindow }) => {
      const window = globalThis.bleFullscreenFixture = new BrowserWindow({ width: 900, height: 700, webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false } })
      await window.loadURL('data:text/html,' + encodeURIComponent('<body style="margin:0;background:linear-gradient(45deg,#234567,#ad7834);color:white;font:36px Arial;min-height:100vh"><h1>Automated fullscreen fixture</h1><p>No live service or private content.</p></body>'))
      window.setFullScreen(true); window.show(); window.focus()
    })
    await expect.poll(() => desktop.evaluate(() => globalThis.bleFullscreenFixture.isFullScreen())).toBe(true)
    const cover = await startCover()
    const displayBounds = await desktop.evaluate(({ screen }) => screen.getAllDisplays().map(d => d.bounds))
    report.displays = displayBounds.length
    await expect.poll(() => desktop.windows().filter(p => p.url().endsWith('#block')).length).toBe(displayBounds.length)
    const covers = desktop.windows().filter(p => p.url().endsWith('#block'))
    await expect.poll(async () => {
      const result = []
      for (const overlay of covers) {
        const window = await desktop.browserWindow(overlay)
        result.push(await window.evaluate(win => win.getBounds()))
      }
      return result
    }).toEqual(expect.arrayContaining(displayBounds))
    const bounds = []
    for (const overlay of covers) {
      await expect(overlay.getByRole('heading', { name: 'This content is blocked.' })).toBeVisible()
      const window = await desktop.browserWindow(overlay)
      const details = await window.evaluate(win => ({ bounds: win.getBounds(), topmost: win.isAlwaysOnTop() }))
      expect(details.topmost).toBe(true); bounds.push(details.bounds)
      expect(await overlay.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    }
    expect(bounds).toEqual(expect.arrayContaining(displayBounds))
    await expect.poll(async () => {
      for (const overlay of covers) {
        const window = await desktop.browserWindow(overlay)
        if (await window.evaluate(win => win.isFocused())) return true
      }
      return false
    }).toBe(true)
    await cover.screenshot({ path: path.join(evidence, 'fullscreen-cover.png') })
    await cover.getByRole('button', { name: 'Pause & return to app' }).click(); await expectPaused()
    await desktop.evaluate(() => globalThis.bleFullscreenFixture.destroy())
  })
  await run('native close dismisses covers and pauses rather than trapping the desktop', async () => {
    const cover = await startCover(); const window = await desktop.browserWindow(cover)
    await window.evaluate(win => win.close()); await expectPaused()
  })
  await run('real Windows emergency keyboard shortcut releases the blocking cover', async () => {
    await startCover()
    expect(await desktop.evaluate(({ globalShortcut }) => globalShortcut.isRegistered('CommandOrControl+Shift+F12'))).toBe(true)
    const powershell = `Add-Type -Namespace BLE -Name Keyboard -MemberDefinition '[System.Runtime.InteropServices.DllImport("user32.dll")] public static extern void keybd_event(byte key, byte scan, uint flags, System.UIntPtr extra);'; try { foreach ($k in @(17,16,123)) { [BLE.Keyboard]::keybd_event($k,0,0,[System.UIntPtr]::Zero) } } finally { foreach ($k in @(123,16,17)) { [BLE.Keyboard]::keybd_event($k,0,2,[System.UIntPtr]::Zero) } }`
    await promisify(execFile)('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', powershell], { windowsHide: true, timeout: 20_000 })
    await expectPaused()
    expect((await snapshot()).status.activity[0].message).toContain('Emergency pause')
  })
  await run('lock and suspend signals release covers', async () => {
    for (const signal of ['lock-screen', 'suspend']) {
      await startCover(); await desktop.evaluate(({ powerMonitor }, signal) => powerMonitor.emit(signal), signal)
      await expectPaused()
    }
  })
  await run('HTTP failure, offline connection and malformed replies pause with no automatic retry', async () => {
    for (const [mode, message] of [['rate-limit', 'rate or account limit'], ['offline', 'connection stopped'], ['malformed', 'invalid decision']]) {
      await fixture(mode); const before = (await counts()).calls
      await api('start'); await waitMode('error'); await waitNoCovers()
      expect((await snapshot()).status.error).toContain(message)
      expect((await counts()).calls).toBe(before + 1)
      await api('stop')
    }
  })
  await run('pause aborts a pending request and a real timeout does not retry', async () => {
    await fixture('hang'); const before = await counts()
    await api('start'); await expect.poll(async () => (await counts()).calls).toBe(before.calls + 1)
    await api('stop'); await expectPaused()
    await expect.poll(async () => (await counts()).aborted).toBe(before.aborted + 1)
    expect((await snapshot()).status.error).toBeNull()
    await api('start'); await waitMode('error')
    expect((await snapshot()).status.error).toContain('timed out')
    expect((await counts()).calls).toBe(before.calls + 2)
    await api('stop')
  })
  await run('blank and unavailable capture fail before any provider request', async () => {
    for (const [capture, error] of [['blank', 'blank or protected'], ['missing', 'capture is unavailable']]) {
      await fixture('allow', capture); const before = (await counts()).calls
      await api('start'); await waitMode('error')
      expect((await snapshot()).status.error).toContain(error)
      expect((await counts()).calls).toBe(before); await waitNoCovers(); await api('stop')
    }
    await fixture('allow')
  })
  await run('budget blocks network requests; preferences/key/usage survive restart without auto-start', async () => {
    await save({ cloudBudgetUsd: 0.01 }); const before = (await counts()).calls
    await api('start'); await waitMode('error')
    expect((await snapshot()).status.error).toContain('budget limit')
    expect((await counts()).calls).toBe(before)
    const saved = await snapshot(); await desktop.close(); desktop = undefined
    await launch()
    await expect(page.getByRole('heading', { name: 'Make room for what matters.' })).toBeVisible()
    const restored = await snapshot()
    expect(restored.onboardingComplete).toBe(true)
    expect(restored.settings).toEqual(saved.settings)
    expect(restored.status).toMatchObject({ mode: 'idle', checks: 0, endsAt: null, cloudKeyConfigured: true, cloudSpentUsd: saved.status.cloudSpentUsd, cloudRequests: saved.status.cloudRequests })
    expect((await counts()).calls).toBe(0)
  })
  await run('corrupted budget history refuses protection without resetting spend or sending requests', async () => {
    await desktop.close(); desktop = undefined
    await writeFile(path.join(profile, 'jev-budget.json'), 'corrupt-fixture')
    await launch(); await api('start'); await waitMode('error')
    expect((await snapshot()).status.error).toContain('budget history is unreadable')
    expect((await counts()).calls).toBe(0)
  })
  console.log(`PASS: ${report.cases.length} real Windows scenarios; provider decisions were fixtures, no live AI inference.`)
} finally {
  await desktop?.close()
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}
