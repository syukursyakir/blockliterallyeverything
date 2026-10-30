import { _electron, expect } from '@playwright/test'
import electron from 'electron'
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { tmpdir } from 'node:os'
import path from 'node:path'

// Runs real Windows/Electron/UI/storage/capture/overlay code. Only the provider
// replies, explicitly labeled capture faults and retry clock are fixtures; lock/suspend signals
// are emitted in-process. No real keys, API calls, charges or accuracy claims.
if (process.platform !== 'win32') throw new Error('This suite requires a Windows desktop.')
const profile = await mkdtemp(path.join(tmpdir(), 'ble-installed-tests-'))
const evidence = path.resolve('desktop-test-results')
await mkdir(evidence, { recursive: true })
const executable = process.env.BLE_SMOKE_APP_EXE || electron
const args = [...(process.env.BLE_SMOKE_APP_EXE ? [] : [path.resolve('.')]), '--user-data-dir=' + profile]
const env = { ...process.env, TYPESAFE_API_KEY: '', BLE_DEV_URL: '' }
const report = { scope: 'Real Windows installed-app checks with fixture provider replies, injected blank/missing/translation/replacement/retry captures, injected retry clock, and emitted lock/suspend signals. No real AI inference or paid calls.', cases: [], displays: null }
const testKey = 'ble-ci-fixture-not-a-provider-key'
let desktop, page
const snapshot = () => page.evaluate(() => window.desktop.snapshot())
const api = (method, value) => page.evaluate(({ method, value }) => window.desktop[method](value), { method, value })
const fixture = (mode, capture = 'real') => desktop.evaluate((_, { mode, capture }) => {
  globalThis.bleTestFixture.mode = mode; globalThis.bleTestFixture.capture = capture; globalThis.bleTestFixture.captureCalls = 0
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
      if(state.capture==='retry-phase')state.requestTimeline.push({call:state.calls,at:state.realNow()})
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
      if (state.capture === 'retry-phase') {
        const index=state.captureCalls++
        if(index===2)state.clockOffset=16000 // Jump BEFORE main records this capture's age.
        const bitmap=Buffer.alloc(64*64*4,15)
        for(let i=3;i<bitmap.length;i+=4)bitmap[i]=255
        const put=(x,y,color)=>{const i=(y*64+x)*4;bitmap[i]=bitmap[i+1]=bitmap[i+2]=color}
        for(let y=2;y<5;y++)for(let x=3;x<35;x++)if(x%4<2)put(x,y,220)
        if(![1,3].includes(index))for(let y=14;y<30;y++)for(let x=4;x<30;x++)put(x,y,(Math.floor(x/2)+Math.floor(y/2))%2?180:60)
        return sources.map(source=>({...source,thumbnail:nativeImage.createFromBitmap(bitmap,{width:64,height:64})}))
      }
      if (['translated', 'replacement', 'cropped'].includes(state.capture)) {
        const after = state.captureCalls++ > 0
        const bitmap = Buffer.alloc(64 * 64 * 4, 240)
        const shift = after && state.capture !== 'replacement' ? (state.capture === 'cropped' ? 30 : 16) : 0
        for (let y = 20; y < 44; y++) for (let x = 20; x < 44 && x + shift < 64; x++) {
          const i = (y * 64 + x + shift) * 4
          const color = after && state.capture === 'replacement' ? [230, 190, 180] : [10, 30, 50]
          for (let c = 0; c < 3; c++) bitmap[i + c] = color[c]
        }
        return sources.map(source => ({ ...source, thumbnail: nativeImage.createFromBitmap(bitmap, { width: 64, height: 64 }) }))
      }
      return sources
    }
  })
}
async function run(name, action) {
  const started = Date.now()
  try { const details=await action(); report.cases.push({ name, passed: true, milliseconds: Date.now() - started, ...(details?{details}:{}) }); console.log('PASS:', name) }
  catch (error) {
    report.cases.push({ name, passed: false, milliseconds: Date.now() - started, error: String(error.message) })
    await page?.screenshot({ path: path.join(evidence, 'failure.png') }).catch(() => {})
    if (desktop) {
      const diagnostics = await desktop.evaluate(({ BrowserWindow, screen }) => ({
        displays: screen.getAllDisplays().map(d => ({ bounds:d.bounds, workArea:d.workArea, scaleFactor:d.scaleFactor })),
        windows: BrowserWindow.getAllWindows().map(w => ({title:w.getTitle(),bounds:w.getBounds(),contentBounds:w.getContentBounds(),fullscreen:w.isFullScreen(),resizable:w.isResizable(),focused:w.isFocused(),visible:w.isVisible()})),
      })).catch(() => null)
      await writeFile(path.join(evidence, 'window-diagnostics.json'), JSON.stringify(diagnostics,null,2))
      for (const [index, overlay] of desktop.windows().filter(p => p.url().endsWith('#block')).entries()) {
        await overlay.screenshot({path:path.join(evidence,`failure-cover-${index}.png`)}).catch(() => {})
      }
    }
    throw error
  } finally { await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 2) + '\n') }
}
async function save(patch) { return api('save', { ...(await snapshot()).settings, ...patch }) }
async function startCover(capture = 'real') {
  await fixture('match', capture)
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
  await run('fixture translated capture blocks through the new freshness path and recovers', async () => {
    const cover = await startCover('translated')
    expect((await snapshot()).status.activity.some(a => a.message === 'Screen moved; the full analyzed view is still visible.')).toBe(true)
    await cover.getByRole('button', { name: 'Pause & return to app' }).click(); await expectPaused()
  })
  await run('fixture replacement and cropped movement discard stale matches without covers', async () => {
    for (const capture of ['replacement', 'cropped']) {
      await fixture('match', capture)
      const before = (await snapshot()).status
      const previous = before.activity.filter(a => a.message === 'Screen changed during analysis; checking the new view next.').length
      await api('start')
      await expect.poll(async () => (await snapshot()).status.activity.filter(a => a.message === 'Screen changed during analysis; checking the new view next.').length).toBeGreaterThan(previous)
      expect((await snapshot()).status.blocks).toBe(before.blocks); await waitNoCovers()
      await api('stop'); await expectPaused()
    }
    await fixture('allow')
  })
  await run('clock-injected retry fixture schedules adjusted poll, then covers and recovers', async () => {
    expect(report.displays).toBe(1)
    try{
      await desktop.evaluate(()=>{
        const state=globalThis.bleTestFixture,now=Date.now,timer=globalThis.setTimeout
        state.realNow=now;state.clockOffset=0;state.pollScheduled=[];state.pollFired=[];state.requestTimeline=[]
        state.restoreRetryClock=()=>{Date.now=now;globalThis.setTimeout=timer;state.clockOffset=0}
        Date.now=()=>now()+state.clockOffset
        globalThis.setTimeout=(callback,delay,...args)=>{
          if(delay===1250&&typeof callback==='function'&&Function.prototype.toString.call(callback).includes('checkLoop')){
            const id=state.pollScheduled.length
            state.pollScheduled.push({id,delay,at:now()})
            return timer(()=>{state.pollFired.push({id,at:now()});return callback(...args)},delay)
          }
          return timer(callback,delay,...args)
        }
      })
      const cover=await startCover('retry-phase')
      const proof=await desktop.evaluate(()=>{
        const s=globalThis.bleTestFixture
        return {scope:'Injected main clock/captures/provider replies; actual scheduled poll callback and native cover, not real media/cadence.',scheduled:s.pollScheduled,fired:s.pollFired,requests:s.requestTimeline,captureCalls:s.captureCalls}
      })
      expect(proof.scheduled).toHaveLength(1);expect(proof.scheduled[0].delay).toBe(1250)
      expect(proof.fired).toHaveLength(1);expect(proof.fired[0].id).toBe(proof.scheduled[0].id)
      expect(proof.requests).toHaveLength(3);expect(proof.requests[2].at).toBeGreaterThanOrEqual(proof.fired[0].at)
      expect((await snapshot()).status.activity.some(a=>a.message==='Checks remain delayed; varying the next recheck time.')).toBe(true)
      await cover.getByRole('button',{name:'Pause & return to app'}).click();await expectPaused()
      console.log('RETRY_FIXTURE_PROOF='+JSON.stringify(proof))
      return proof
    }finally{
      await api('stop').catch(()=>{})
      await desktop.evaluate(()=>globalThis.bleTestFixture.restoreRetryClock?.())
      await fixture('allow','real')
    }
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
    expect(await readFile(path.join(profile, 'jev-budget.json'), 'utf8')).toBe('corrupt-fixture')
  })
  console.log(`PASS: ${report.cases.length} real Windows scenarios; provider decisions were fixtures, no live AI inference.`)
} finally {
  await desktop?.close()
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}
