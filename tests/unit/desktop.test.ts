import { expect, it, vi } from 'vitest'
import { defaultSettings } from '../../src/shared'

const mock = vi.hoisted(() => ({
  handlers: new Map<string, (...args: any[]) => any>(), windows: [] as any[],
  load: (() => Promise.resolve({ ready: true })) as () => Promise<unknown>, failNextNavigation: false,
  fetch: vi.fn(),
  capture: null as null | (() => Promise<any[]>),
  infer: { verdicts: [{ ruleId: 'explicit', probability: 0.9 }], elapsedMs: 10, foregroundChanged: false },
}))

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn(async () => {}), writeFile: vi.fn(async () => {}), rename: vi.fn(async () => {}),
  unlink: vi.fn(async () => {}),
  readFile: vi.fn(async (file: string) => { if (file.endsWith('settings.json')) return JSON.stringify({ ...defaultSettings, backend: 'local' }); throw Object.assign(new Error('No settings yet'), { code: 'ENOENT' }) }),
}))
vi.mock('../../electron/worker', () => ({ ModelWorker: class {
  request(method: string) {
    if (method === 'load') return mock.load()
    if (method === 'infer') return Promise.resolve(mock.infer)
    if (method === 'context') return Promise.resolve({ foreground: 1 })
    return Promise.resolve({ installed: true })
  }
  close() {}
} }))
vi.mock('electron', () => {
  class FakeWindow {
    webContents: any
    events = new Map<string, (...args: any[]) => void>()
    destroyed = false
    show = vi.fn()
    constructor() {
      const events = new Map<string, (...args: any[]) => void>()
      this.webContents = { id: mock.windows.length + 1, mainFrame: {}, events, send: vi.fn(), setWindowOpenHandler: vi.fn(),
        on: (event: string, cb: (...args: any[]) => void) => events.set(event, cb), once: (event: string, cb: (...args: any[]) => void) => events.set(event, cb) }
      mock.windows.push(this)
    }
    on(event: string, cb: (...args: any[]) => void) { this.events.set(event, cb) }
    loadFile() { if (mock.failNextNavigation) { mock.failNextNavigation = false; return Promise.reject(new Error('Missing interface')) }; return Promise.resolve() }
    loadURL() { return Promise.resolve() }
    isDestroyed() { return this.destroyed }
    destroy() { this.destroyed = true }
    removeAllListeners() {}
    setContentProtection() {}
    setFullScreen() {}
    setAlwaysOnTop() {}
    focus() {}
    hide() {}
  }
  return {
    app: { isPackaged: false, setPath: vi.fn(), setAppUserModelId: vi.fn(), requestSingleInstanceLock: () => true,
      on: vi.fn(), whenReady: () => Promise.resolve(), getPath: () => '/tmp/ble-desktop-test', quit: vi.fn() },
    BrowserWindow: FakeWindow, Tray: class { setToolTip() {}; setContextMenu() {}; on() {} },
    Menu: { buildFromTemplate: () => [] },
    safeStorage: { isEncryptionAvailable: () => true, getSelectedStorageBackend: () => 'gnome_libsecret', encryptString: (key: string) => Buffer.from('encrypted-test'), decryptString: () => 'saved-key' },
    net: { fetch: (...args: unknown[]) => mock.fetch(...args) },
    nativeImage: { createFromPath: () => ({}), createFromBuffer: () => ({ isEmpty: () => false, getSize: () => ({width:1280,height:900}), resize: () => ({toPNG: () => Buffer.from('image')}) }) },
    screen: { getAllDisplays: () => [{ id: 1, bounds: {} }, { id: 2, bounds: {} }], getPrimaryDisplay: () => ({ id: 1, bounds: {} }), on: vi.fn() },
    desktopCapturer: { getSources: async () => mock.capture ? mock.capture() : ['1', '2'].map(display_id => ({ display_id, thumbnail: { isEmpty: () => false, toPNG: () => Buffer.from('synthetic pixels'), toBitmap: () => Buffer.from([0,0,0,255,255,255,255,255]), resize: () => ({toBitmap: () => Buffer.alloc(64*64*4)}) } })) },
    globalShortcut: { register: () => true, unregisterAll: vi.fn() }, powerMonitor: { on: vi.fn() }, dialog: { showErrorBox: vi.fn() },
    ipcMain: { handle: (name: string, callback: (...args: any[]) => any) => mock.handlers.set(name, callback) },
  }
})

const flush = async () => { for (let i = 0; i < 30; i++) await Promise.resolve() }

it('desktop lifecycle: cancelled loads remain usable, all displays are covered, and cover failures expose an error', async () => {
  vi.useFakeTimers()
  await import('../../electron/main')
  await flush()
  const sender = mock.windows[0].webContents
  const event = { sender, senderFrame: sender.mainFrame }
  const call = (name: string, ...args: unknown[]) => mock.handlers.get(name)!(event, ...args)
  expect((await call('snapshot')).status.model).toBe('installed')

  let resolveLoad!: (value: unknown) => void
  mock.load = () => new Promise(resolve => { resolveLoad = resolve })
  const start = call('start')
  expect((await call('snapshot')).status.mode).toBe('starting')
  call('stop')
  resolveLoad({ ready: true })
  await start
  expect((await call('snapshot')).status.mode).toBe('idle')
  expect((await call('snapshot')).status.model).toBe('ready')

  mock.load = async () => ({ ready: true })
  const current = await call('snapshot')
  await call('save', { ...current.settings, detectionOnly: false })
  await call('start'); await flush()
  expect((await call('snapshot')).status.mode).toBe('blocked')
  expect(mock.windows.filter(w => !w.destroyed)).toHaveLength(3)
  const cover = mock.windows[1]
  const coverSnapshot = mock.handlers.get('snapshot')!({ sender: cover.webContents, senderFrame: cover.webContents.mainFrame })
  expect(coverSnapshot.block.rule).toBe('Explicit content')

  cover.webContents.events.get('did-fail-load')!()
  expect((await call('snapshot')).status.mode).toBe('error')
  expect((await call('snapshot')).status.error).toContain('could not be displayed')
  expect(mock.windows.filter(w => !w.destroyed)).toHaveLength(1)
  expect(mock.windows[0].show).toHaveBeenCalled()

  mock.failNextNavigation = true
  await call('start'); await flush()
  expect((await call('snapshot')).status.mode).toBe('error')
  expect((await call('snapshot')).status.error).toContain('could not load')

  mock.load = async () => { throw new Error('Insufficient memory') }
  await expect(call('test-image', new ArrayBuffer(4))).rejects.toThrow('Insufficient memory')
  expect((await call('snapshot')).status.model).toBe('error')
  // Exercise real cloud IPC flow with an injected transport: consent, key secrecy,
  // budget reservation, all-monitor covers, request failures and persistent cap.
  await call('save', { ...(await call('snapshot')).settings, backend: 'jev', cloudConsent: false })
  await call('set-cloud-key', 'test-key')
  await call('start'); await flush()
  expect((await call('snapshot')).status.error).toContain('consent')
  expect(mock.fetch).not.toHaveBeenCalled()
  await call('save', { ...(await call('snapshot')).settings, cloudConsent: true })
  mock.fetch.mockResolvedValue(new Response(JSON.stringify({model:'jev-1.14.0',usage:{input_tokens:100},answers:{explicit:{noul:0.9}}})))
  await call('start'); await flush()
  expect((await call('snapshot')).status.mode).toBe('blocked')
  expect((await call('snapshot')).status.cloudRequests).toBe(1)
  expect(JSON.stringify(await call('snapshot'))).not.toContain('test-key')
  expect(mock.windows.filter(w => !w.destroyed)).toHaveLength(3)
  call('stop')
  mock.fetch.mockResolvedValue(new Response('do not expose', {status:429}))
  await call('start'); await flush()
  expect((await call('snapshot')).status.mode).toBe('error')
  expect((await call('snapshot')).status.error).toContain('rate or account limit')
  expect((await call('snapshot')).status.cloudRequests).toBe(2)
  expect(mock.fetch).toHaveBeenCalledTimes(2)
  await call('save', { ...(await call('snapshot')).settings, cloudBudgetUsd: 0.01 })
  await call('start'); await flush()
  expect((await call('snapshot')).status.error).toContain('budget limit')
  expect(mock.fetch).toHaveBeenCalledTimes(2)

  // An obsolete recapture must not seed the next session's unchanged-screen cache.
  await call('save', { ...(await call('snapshot')).settings, cloudBudgetUsd: 3, detectionOnly: true })
  mock.fetch.mockImplementation(async () => new Response(JSON.stringify({model:'jev-1.14.0',usage:{input_tokens:100},answers:{explicit:{noul:0.02}}})))
  const captures = () => ['1', '2'].map(display_id => ({ display_id, thumbnail: {
    isEmpty: () => false, toPNG: () => Buffer.from('same screen ' + display_id),
    toBitmap: () => Buffer.from([0,0,0,255,255,255,255,255]),
    resize: () => ({toBitmap: () => Buffer.alloc(64*64*4)}),
  } }))
  let captureCalls = 0
  let releaseOldRecapture!: (sources: ReturnType<typeof captures>) => void
  let releaseNewCapture!: (sources: ReturnType<typeof captures>) => void
  mock.capture = () => {
    captureCalls++
    if (captureCalls === 2) return new Promise(resolve => { releaseOldRecapture = resolve })
    if (captureCalls === 3) return new Promise(resolve => { releaseNewCapture = resolve })
    return Promise.resolve(captures())
  }
  await call('start'); await flush()
  expect(captureCalls).toBe(2)
  const callsBeforeRestart = mock.fetch.mock.calls.length
  const checksBeforeRestart = (await call('snapshot')).status.checks
  call('stop')
  await call('start'); await flush()
  expect(captureCalls).toBe(3)
  releaseOldRecapture(captures()); await flush()
  releaseNewCapture(captures()); await flush()
  expect(mock.fetch.mock.calls.length - callsBeforeRestart).toBe(2)
  expect((await call('snapshot')).status.checks - checksBeforeRestart).toBe(2)
  expect((await call('snapshot')).status.mode).toBe('watching')
  call('stop')
  // Movement on display 1 stays unresolved even while display 2 accepts a result.
  captureCalls = 0
  mock.capture = async () => {
    captureCalls++
    const sources = captures()
    if (captureCalls % 3 === 2) sources[0].thumbnail.resize = () => ({ toBitmap: () => Buffer.alloc(64*64*4, 255) })
    return sources
  }
  await call('start'); await flush()
  const firstDelay = (await call('snapshot')).status.delayedDisplays['1']
  expect(firstDelay).toBeTypeOf('number')
  expect((await call('snapshot')).status.delayedDisplays['2']).toBeUndefined()
  await vi.advanceTimersByTimeAsync(3000); await flush()
  expect((await call('snapshot')).status.delayedDisplays['1']).toBe(firstDelay)
  mock.capture = async () => captures()
  await vi.advanceTimersByTimeAsync(3000); await flush()
  expect((await call('snapshot')).status.delayedDisplays).toEqual({})
  call('stop')
  expect((await call('snapshot')).status.delayedDisplays).toEqual({})
  await call('start'); await flush()
  expect((await call('snapshot')).status.lastCheck).not.toBeNull()
  call('stop'); mock.capture = null
  await call('save', { ...(await call('snapshot')).settings, backend: 'local' })
  let finishOldLocal!: (value: unknown) => void
  mock.load = () => new Promise(resolve => { finishOldLocal = resolve })
  const oldLocalStart = call('start')
  call('stop')
  await call('save', { ...(await call('snapshot')).settings, backend: 'jev' })
  finishOldLocal({ready:true}); await oldLocalStart
  expect((await call('snapshot')).status.modelMessage).toContain('Jev')
  expect((await call('snapshot')).status.model).toBe('missing')
  vi.useRealTimers()
})
