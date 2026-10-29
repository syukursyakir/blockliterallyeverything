import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, screen, desktopCapturer, safeStorage, net, globalShortcut, powerMonitor, dialog, type IpcMainInvokeEvent } from 'electron'
import path from 'node:path'
import { existsSync } from 'node:fs'
import { readFile, writeFile, rename, mkdir, unlink } from 'node:fs/promises'
import { createHash, randomUUID } from 'node:crypto'
import { ModelWorker } from './worker'
import { emptyLedger, validateLedger, reserveCloud, requestJev, type CloudLedger } from './jev'
import { ScreenCache, changedSubstantially, isBlankCapture } from './screen-cache'
import { defaultSettings, initialStatus, validateSettings, matchingRule, type Settings, type Status, type Snapshot, type CheckResult, type BlockInfo } from '../src/shared'

let mainWindow: BrowserWindow
let tray: Tray
let worker: ModelWorker
let settings: Settings = structuredClone(defaultSettings)
let status: Status = structuredClone(initialStatus)
const covers = new Set<BrowserWindow>()
const coverInfo = new Map<number, BlockInfo>()
let generation = 0
let timer: NodeJS.Timeout | undefined
let sessionTimer: NodeJS.Timeout | undefined
let quitting = false
let localModelInstalled = false
let installing = false
let testing = false
let onboardingComplete = false
let cloudVerified = false
let cloudKey = ''
let cloudLedger: CloudLedger = emptyLedger()
let cloudLedgerError = false
let cloudBusy = false
let cloudAbort: AbortController | undefined
const screenCache = new ScreenCache()
function cloudPaths() { return { key: path.join(app.getPath('userData'), 'jev-key.enc'), ledger: path.join(app.getPath('userData'), 'jev-budget.json') } }
function cloudStatus() { status.cloudKeyConfigured = Boolean(cloudKey); status.cloudSpentUsd = cloudLedger.reservedUsd; status.cloudEstimatedUsd = cloudLedger.inputTokens * 0.042 / 1_000_000; status.cloudRequests = cloudLedger.requests }
async function persistLedger(next: CloudLedger) {
  const file = cloudPaths().ledger
  await writeFile(file + '.tmp', JSON.stringify(next), { mode: 0o600 }); await rename(file + '.tmp', file)
  cloudLedger = next; cloudStatus(); publish()
}
function requireCloud() {
  if (!settings.cloudConsent) throw new Error('Enable consent in Model & settings before sending screenshots and rules to TypeSafe.')
  if (!cloudKey) throw new Error('Add your TypeSafe API key in Model & settings.')
  if (cloudLedgerError) throw new Error('Cloud budget history is unreadable. Restore it before using Jev.')
}
function cloudImage(bytes: Buffer) {
  let image = nativeImage.createFromBuffer(bytes)
  if (image.isEmpty()) throw new Error('The selected image could not be decoded.')
  const size = image.getSize()
  const scale = Math.min(1, 1280 / Math.max(size.width, size.height))
  const enlargement = Math.max(1, 280 / (Math.min(size.width, size.height) * scale))
  const width = Math.round(size.width * scale * enlargement), height = Math.round(size.height * scale * enlargement)
  if (width > 1568 || height > 1568) throw new Error('This image is too narrow for Jev. Choose a normal screenshot or crop it first.')
  image = image.resize({ width, height })
  return image.toPNG()
}
async function inferCloud(bytes: Buffer, rules = settings.rules.filter(r => r.enabled)): Promise<CheckResult> {
  requireCloud()
  if (cloudBusy) throw new Error('A Jev request is still finishing. Wait before starting another.')
  cloudBusy = true
  const controller = new AbortController(); cloudAbort = controller
  const timeout = setTimeout(() => controller.abort(), 10_000)
  try {
    const image = cloudImage(bytes)
    const next = reserveCloud(cloudLedger, settings.cloudBudgetUsd)
    try { await persistLedger(next) } catch { cloudLedgerError = true; throw new Error('Could not save the cloud budget. No request was sent.') }
    if (controller.signal.aborted) throw new Error('Jev request cancelled before sending.')
    const result = await requestJev(image, rules, cloudKey, controller.signal, net.fetch as typeof fetch)
    try { await persistLedger({ ...cloudLedger, inputTokens: cloudLedger.inputTokens + result.inputTokens }) }
    catch { cloudLedgerError = true; throw new Error('Could not save Jev usage. Protection is paused.') }
    return { verdicts: result.verdicts, elapsedMs: result.elapsedMs }
  } finally { clearTimeout(timeout); cloudBusy = false; if (cloudAbort === controller) cloudAbort = undefined }
}

const root = path.resolve(__dirname, '..')
const devURL = !app.isPackaged && process.env.BLE_DEV_URL === 'http://127.0.0.1:5173' ? process.env.BLE_DEV_URL : undefined

const localAvailable = () => !app.isPackaged || existsSync(path.join(process.resourcesPath, 'worker', process.platform === 'win32' ? 'ble-worker.exe' : 'ble-worker'))
const snapshot = (): Snapshot => ({ settings, status, desktop: true, onboardingComplete, localAvailable: localAvailable() })
function publish() { if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('update', snapshot()) }
function activity(kind: Status['activity'][number]['kind'], message: string) {
  status.activity = [{ id: randomUUID(), time: Date.now(), kind, message }, ...status.activity].slice(0, 80)
  publish()
}
function loadUI(window: BrowserWindow, hash = '') {
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  window.webContents.on('will-navigate', event => event.preventDefault())
  const loading = devURL ? window.loadURL(devURL + '/' + hash) : window.loadFile(path.join(root, 'dist/index.html'), { hash: hash.replace(/^#/, '') })
  void loading.catch(() => {
    if (window.isDestroyed()) return
    if (window === mainWindow) { dialog.showErrorBox('Unable to open the app', 'The interface could not load. Reinstall the app or rebuild the frontend.'); quitting = true; app.quit() }
    else fail(new Error('The blocking screen could not load. Protection is paused.'))
  })
}
function browserOptions() { return { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true, devTools: !app.isPackaged } }
function closeCovers() { for (const cover of covers) { cover.removeAllListeners('close'); cover.destroy() }; covers.clear(); coverInfo.clear() }
function stop(message = 'Session paused.') {
  generation++; cloudAbort?.abort(); screenCache.clear(); clearTimeout(timer); clearTimeout(sessionTimer); closeCovers()
  status.mode = 'idle'; status.endsAt = null; status.error = null
  activity('info', message)
}
function fail(error: unknown) {
  generation++; cloudAbort?.abort(); screenCache.clear(); clearTimeout(timer); clearTimeout(sessionTimer); closeCovers()
  status.mode = 'error'; status.endsAt = null
  status.error = error instanceof Error ? error.message : 'Something went wrong. Protection is paused.'
  activity('error', status.error)
  mainWindow?.show()
}
function showCover(displayId: string, info: BlockInfo) {
  const display = screen.getAllDisplays().find(d => String(d.id) === displayId) ?? screen.getPrimaryDisplay()
  const cover = new BrowserWindow({ ...display.bounds, frame: false, alwaysOnTop: true, skipTaskbar: true, backgroundColor: '#090909', show: false, resizable: false, movable: false, minimizable: false, webPreferences: browserOptions() })
  covers.add(cover); cover.setContentProtection(true); cover.setAlwaysOnTop(true, 'screen-saver')
  coverInfo.set(cover.webContents.id, info)
  const coverFailed = () => { if (!cover.isDestroyed()) fail(new Error('The blocking screen could not be displayed. Protection is paused.')) }
  cover.webContents.on('did-fail-load', coverFailed)
  cover.webContents.on('render-process-gone', coverFailed)
  cover.on('close', event => { if (!quitting) { event.preventDefault(); stop('Blocking cover dismissed. Session paused.'); mainWindow.show() } })
  cover.webContents.once('did-finish-load', () => { if (!cover.isDestroyed()) { cover.webContents.send('block', info); cover.show(); cover.focus() } })
  loadUI(cover, '#block')
}
async function checkLoop(token: number) {
  if (token !== generation || status.mode === 'blocked') return
  if (status.endsAt && Date.now() >= status.endsAt) { stop('Focus session complete.'); return }
  try {
    status.mode = 'checking'; publish()
    const context = settings.backend === 'local' ? await worker.request<{ foreground: number }>('context') : undefined
    const displays = screen.getAllDisplays()
    const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1280, height: 1280 }, fetchWindowIcons: false })
    const capturedAt = Date.now()
    if (!sources.length) throw new Error('Screen capture is unavailable. Protection is paused.')
    for (const display of displays) {
      if (token !== generation) return
      if (Date.now() - capturedAt > 15_000) throw new Error('Screenshots became stale during analysis. Protection is paused; try fewer rules or displays.')
      const source = sources.find(s => s.display_id === String(display.id)) ?? (displays.length === 1 ? sources[0] : undefined)
      if (!source || source.thumbnail.isEmpty()) throw new Error('A display could not be captured. Protection is paused.')
      if (settings.backend === 'jev' && isBlankCapture(source.thumbnail.toBitmap())) throw new Error('Screen capture is blank or protected. Protection is paused.')
      const bytes = source.thumbnail.toPNG()
      const hash = createHash('sha256').update(bytes).digest('hex')
      if (settings.backend === 'jev' && !screenCache.shouldCheck(String(display.id), hash, Date.now())) continue
      const result = settings.backend === 'jev'
        ? await inferCloud(bytes)
        : await worker.request<CheckResult & { foregroundChanged?: boolean }>('infer', { image: bytes.toString('base64'), rules: settings.rules.filter(r => r.enabled), foreground: context!.foreground })
      if (settings.backend === 'jev' && token === generation) {
        const latest = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1280, height: 1280 }, fetchWindowIcons: false })
        if (token !== generation) return
        const fresh = latest.find(s => s.display_id === String(display.id)) ?? (displays.length === 1 ? latest[0] : undefined)
        if (!fresh || fresh.thumbnail.isEmpty() || isBlankCapture(fresh.thumbnail.toBitmap())) throw new Error('Screen capture became unavailable. Protection is paused.')
        if (changedSubstantially(source.thumbnail.resize({width:64,height:64}).toBitmap(), fresh.thumbnail.resize({width:64,height:64}).toBitmap())) {
          activity('info', 'Screen changed during analysis; checking the new view next.'); continue
        }
        screenCache.mark(String(display.id), hash, Date.now())
      }
      if (token !== generation) return
      if ('foregroundChanged' in result && result.foregroundChanged) { activity('info', 'Screen changed during analysis; checking the new view next.'); continue }
      if (Date.now() - capturedAt > 15_000) throw new Error('AI analysis took over 15 seconds. Protection is paused; try fewer rules. This device may not meet the response target.')
      const rule = matchingRule(result, settings)
      status.lastCheck = Date.now(); status.lastLatency = result.elapsedMs; status.checks++
      if (rule) {
        const probability = result.verdicts.find(v => v.ruleId === rule.id)!.probability
        status.blocks++; activity('blocked', `${settings.detectionOnly ? 'Preview match' : 'Blocked'}: ${rule.name}`)
        if (!settings.detectionOnly) { status.mode = 'blocked'; for (const target of screen.getAllDisplays()) showCover(String(target.id), { rule: rule.name, probability }); publish(); return }
      } else activity('allowed', 'No enabled rule matched the visible screen.')
    }
    if (token !== generation) return
    status.mode = 'watching'; publish()
    timer = setTimeout(() => void checkLoop(token), settings.intervalSeconds * 1000)
  } catch (error) { if (token === generation) fail(error) }
}
async function start() {
  if (installing || testing || cloudBusy || ['starting', 'checking', 'watching', 'blocked'].includes(status.mode)) throw new Error('Finish or pause the current operation first.')
  if (!onboardingComplete) throw new Error('Finish the guided setup first.')
  if (settings.backend === 'local' && !localAvailable()) throw new Error('Local AI is not included in this edition.')
  if (!settings.rules.some(r => r.enabled)) throw new Error('Enable at least one rule first.')
  const token = ++generation
  status.mode = 'starting'; status.model = 'loading'; status.error = null; publish()
  try {
    if (settings.backend === 'jev') { requireCloud(); status.model = 'ready'; status.modelMessage = 'Jev 1.14 · cloud image API (experimental)' }
    else {
      await worker.request('load', {}, 300_000); localModelInstalled = true
      if (settings.backend === 'local') { status.model = 'ready'; status.modelMessage = 'OmniJev · running locally'; publish() }
    }
    if (token !== generation) return
    screenCache.clear(); publish()
    status.endsAt = Date.now() + settings.sessionMinutes * 60_000
    sessionTimer = setTimeout(() => stop('Focus session complete.'), settings.sessionMinutes * 60_000)
    activity('info', settings.detectionOnly ? 'Detection-only session started. No screen covers.' : 'Blocking session started. Emergency pause: Ctrl+Shift+F12.')
    void checkLoop(token)
  } catch (error) {
    if (token !== generation) return
    status.model = 'error'; status.modelMessage = settings.backend === 'jev' ? 'Jev setup needs attention.' : 'Model could not load. Check setup and retry.'; fail(error)
  }
}
function guard(event: IpcMainInvokeEvent, allowCover = false) {
  if (event.senderFrame !== event.sender.mainFrame) throw new Error('Subframes cannot control the desktop app.')
  if (event.sender !== mainWindow.webContents && !(allowCover && [...covers].some(c => c.webContents === event.sender))) throw new Error('Untrusted desktop request.')
}
app.setAppUserModelId('org.blockliterallyeverything.desktop')
if (!app.isPackaged && process.env.BLE_SMOKE_USER_DATA_DIR) app.setPath('userData', process.env.BLE_SMOKE_USER_DATA_DIR)
if (!app.requestSingleInstanceLock()) app.quit()
else {
  app.on('second-instance', () => { mainWindow?.show(); mainWindow?.focus() })
  app.whenReady().then(async () => {
    const dataDir = app.getPath('userData'); await mkdir(dataDir, { recursive: true })
    const settingsPath = path.join(dataDir, 'settings.json')
    try { cloudLedger = validateLedger(JSON.parse(await readFile(cloudPaths().ledger, 'utf8'))) }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') { cloudLedgerError = true; status.error = 'Cloud budget history is unreadable. Jev is disabled until it is restored.' } }
    cloudKey = process.env.TYPESAFE_API_KEY || ''
    if (!cloudKey) {
      try {
        const encrypted = await readFile(cloudPaths().key)
        if (!safeStorage.isEncryptionAvailable() || (process.platform === 'linux' && safeStorage.getSelectedStorageBackend() === 'basic_text')) throw new Error('Secure key storage unavailable.')
        cloudKey = safeStorage.decryptString(encrypted)
      } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') status.error = 'Saved Jev key could not be opened. Add the key again in Model & settings.' }
    }
    cloudStatus()
    let existingPreferences = false
    try { settings = validateSettings(JSON.parse(await readFile(settingsPath, 'utf8'))); existingPreferences = true }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') { status.error = 'Saved settings could not be read. Defaults restored; review your rules.'; activity('error', status.error) } }
    const onboardingPath = path.join(dataDir, 'onboarding.json')
    try {
      const saved = JSON.parse(await readFile(onboardingPath, 'utf8'))
      onboardingComplete = saved.complete === true
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        onboardingComplete = existingPreferences
        await writeFile(onboardingPath, JSON.stringify({ complete: onboardingComplete }), { mode: 0o600 })
      } else { onboardingComplete = false }
    }
    mainWindow = new BrowserWindow({ width: 1200, height: 850, minWidth: 800, minHeight: 620, backgroundColor: '#0a0a0a', title: 'Block Literally Everything', icon: path.join(root, 'assets/icon.png'), autoHideMenuBar: true, webPreferences: browserOptions() })
    mainWindow.on('close', e => { if (!quitting) { e.preventDefault(); mainWindow.hide() } })
    loadUI(mainWindow)
    worker = new ModelWorker(root, app.isPackaged ? process.resourcesPath : null, dataDir, message => { status.modelMessage = message; publish() })
    const icon = nativeImage.createFromPath(path.join(root, 'assets/tray.png'))
    tray = new Tray(icon); tray.setToolTip('Block Literally Everything')
    tray.setContextMenu(Menu.buildFromTemplate([{ label: 'Open app', click: () => mainWindow.show() }, { label: 'Pause protection', click: () => stop() }, { type: 'separator' }, { label: 'Quit', click: () => { quitting = true; app.quit() } }]))
    tray.on('double-click', () => mainWindow.show())
    if (!globalShortcut.register('CommandOrControl+Shift+F12', () => { stop('Emergency pause used.'); mainWindow.show() })) activity('error', 'Emergency shortcut unavailable. Use the tray Pause action.')
    powerMonitor.on('lock-screen', () => stop('Session paused when the screen locked.'))
    powerMonitor.on('suspend', () => stop('Session paused before sleep.'))
    screen.on('display-added', () => stop('Display configuration changed. Review and restart protection.'))
    screen.on('display-removed', () => stop('Display configuration changed. Review and restart protection.'))
    screen.on('display-metrics-changed', () => stop('Display configuration changed. Review and restart protection.'))
    ipcMain.handle('snapshot', event => { guard(event, true); return { ...snapshot(), block: coverInfo.get(event.sender.id) } })
    const savePreferences = async (value: unknown) => {
      const next = validateSettings(value)
      if (next.backend === 'local' && !localAvailable()) throw new Error('Local AI is not included in this edition.')
      if (['starting', 'checking', 'watching', 'blocked'].includes(status.mode) || testing || installing || cloudBusy) throw new Error('Pause the session or finish testing before editing rules.')
      await writeFile(settingsPath + '.tmp', JSON.stringify(next, null, 2), { mode: 0o600 }); await rename(settingsPath + '.tmp', settingsPath)
      const changedBackend = settings.backend !== next.backend
      settings = next; screenCache.clear()
      if (changedBackend) {
        if (settings.backend === 'local') {
          try { localModelInstalled = (await worker.request<{installed:boolean}>('status', {}, 20_000)).installed }
          catch { localModelInstalled = false }
          status.model = localModelInstalled ? 'installed' : 'missing'; status.modelMessage = localModelInstalled ? 'Local model installed.' : 'Set up the local worker and model.'
        } else { status.model = 'missing'; status.modelMessage = 'Jev image API · add a key and consent in Model & settings.' }
      }
      publish(); return settings
    }
    ipcMain.handle('save', async (event, value: unknown) => { guard(event); return savePreferences(value) })
    ipcMain.handle('verify-cloud', async event => {
      guard(event)
      if (testing || installing || cloudBusy || !['idle', 'error'].includes(status.mode)) throw new Error('Finish the current operation before checking the connection.')
      if (settings.backend !== 'jev') throw new Error('Select Jev and save before verifying.')
      testing = true; cloudVerified = false
      try {
        const pixels = Buffer.alloc(320 * 320 * 4, 240)
        for (let i = 3; i < pixels.length; i += 4) pixels[i] = 255
        const neutral = nativeImage.createFromBitmap(pixels, { width: 320, height: 320 }).toPNG()
        const result = await inferCloud(neutral, [{ id: 'connection', name: 'Connection check', enabled: true, instruction: 'Block images showing a blue circle.' }])
        cloudVerified = true; status.error = null; status.modelMessage = 'Jev connection verified.'; publish()
        return { elapsedMs: result.elapsedMs }
      } finally { testing = false }
    })
    ipcMain.handle('complete-onboarding', async (event, value: unknown) => {
      guard(event)
      const next = validateSettings(value)
      if (!cloudVerified || !cloudKey || next.backend !== 'jev' || !next.cloudConsent || !next.detectionOnly || !next.rules.some(r => r.enabled)) throw new Error('Verify your key, consent and choose at least one rule. First setup uses detection-only mode.')
      await savePreferences(next)
      await writeFile(onboardingPath + '.tmp', JSON.stringify({ complete: true }), { mode: 0o600 }); await rename(onboardingPath + '.tmp', onboardingPath)
      onboardingComplete = true; publish()
    })
    ipcMain.handle('set-cloud-key', async (event, value: unknown) => {
      guard(event)
      if (testing || installing || cloudBusy || !['idle', 'error'].includes(status.mode)) throw new Error('Pause and finish the current operation before changing the key.')
      if (typeof value !== 'string' || value.length > 4096 || /[\r\n]/.test(value)) throw new Error('Invalid API key.')
      const key = value.trim()
      if (!key) { await unlink(cloudPaths().key).catch(error => { if (error.code !== 'ENOENT') throw new Error('Could not remove the saved key.') }); cloudKey = process.env.TYPESAFE_API_KEY || '' }
      else {
        if (!safeStorage.isEncryptionAvailable() || (process.platform === 'linux' && safeStorage.getSelectedStorageBackend() === 'basic_text')) throw new Error('OS-backed encryption is unavailable. A key cannot be saved securely on this device.')
        await writeFile(cloudPaths().key + '.tmp', safeStorage.encryptString(key), { mode: 0o600 }); await rename(cloudPaths().key + '.tmp', cloudPaths().key)
        cloudKey = key
      }
      cloudVerified = false; cloudStatus(); publish()
    })
    ipcMain.handle('start', event => { guard(event); return start() })
    ipcMain.handle('stop', event => { guard(event); stop() })
    ipcMain.handle('recover', event => { guard(event, true); stop('Session paused from the blocking screen.'); mainWindow.show() })
    ipcMain.handle('preview-block', event => { guard(event); if (status.mode !== 'idle' && status.mode !== 'error') throw new Error('Pause first to preview the blocking screen.'); showCover(String(screen.getPrimaryDisplay().id), { rule: 'Blocking screen preview', probability: 1 }) })
    ipcMain.handle('install-model', async event => {
      guard(event)
      if (installing || testing || !['idle', 'error'].includes(status.mode)) throw new Error('Pause or finish the current operation first.')
      if (settings.backend !== 'local') throw new Error('Select local mode before installing the local model.')
      installing = true; status.model = 'downloading'; status.error = null; publish()
      try { await worker.request('install', {}, 30 * 60_000); localModelInstalled = true; status.model = 'installed'; status.modelMessage = 'Model installed. Ready for a test.'; activity('info', 'Local model downloaded and checksummed.') }
      catch (error) { status.model = 'error'; status.modelMessage = 'Model setup failed. You can retry.'; fail(error); throw error }
      finally { installing = false; publish() }
    })
    ipcMain.handle('test-image', async (event, bytes: unknown) => {
      guard(event)
      if (!(bytes instanceof ArrayBuffer) || !bytes.byteLength || bytes.byteLength > 15 * 1024 * 1024) throw new Error('Choose an image smaller than 15 MB.')
      if (testing || installing || cloudBusy || !['idle', 'error'].includes(status.mode)) throw new Error('Pause or finish the current operation first.')
      if (!settings.rules.some(r => r.enabled)) throw new Error('Enable at least one rule.')
      testing = true; status.model = 'loading'; publish()
      let loaded = false
      try {
        if (settings.backend === 'jev') {
          const result = await inferCloud(Buffer.from(bytes)); loaded = true; status.model = 'ready'; status.modelMessage = 'Jev 1.14 · cloud image API (experimental)'
          matchingRule(result, settings); return result
        }
        await worker.request('load', {}, 300_000); loaded = true; status.model = 'ready'; status.modelMessage = 'OmniJev · running locally'
        const result = await worker.request<CheckResult>('infer', { image: Buffer.from(bytes).toString('base64'), rules: settings.rules.filter(r => r.enabled) })
        matchingRule(result, settings); return result
      } catch (error) { if (!loaded) { status.model = 'error'; status.modelMessage = 'Model could not load. Check setup and retry.' }; fail(error); throw error } finally { testing = false; publish() }
    })
    if (settings.backend === 'jev') { status.modelMessage = 'Jev image API · add a key and consent in Model & settings.'; publish(); return }
    try { const info = await worker.request<{ installed: boolean }>('status', {}, 20_000); if (info.installed) { localModelInstalled = true; status.model = 'installed'; status.modelMessage = 'Local model installed.' }; publish() }
    catch { status.modelMessage = 'Set up the local worker and model in Model settings.'; publish() }
  }).catch(error => { console.error('Desktop startup failed:', error.message); app.quit() })
}
app.on('before-quit', () => { quitting = true; cloudAbort?.abort(); clearTimeout(timer); clearTimeout(sessionTimer); worker?.close(); globalShortcut.unregisterAll(); closeCovers() })
app.on('window-all-closed', () => { /* Tray owns the app lifecycle. */ })
