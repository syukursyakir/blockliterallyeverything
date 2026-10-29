import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultSettings, type Settings } from '../../src/shared'

const mock = vi.hoisted(() => ({
  handlers: new Map<string, (...args: any[]) => any>(),
  windows: [] as any[],
  files: new Map<string, string | Buffer>(),
  fetch: vi.fn(), captures: vi.fn(), bitmap: vi.fn(), workerRequest: vi.fn(),
  encrypted: true, failMarkerWrite: false,
}))

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn(async () => {}),
  readFile: vi.fn(async (file: string, encoding?: string) => {
    if (!mock.files.has(file)) throw Object.assign(new Error('Not found'), { code: 'ENOENT' })
    const data = mock.files.get(file)!
    return encoding ? data.toString() : Buffer.from(data)
  }),
  writeFile: vi.fn(async (file: string, data: string | Buffer) => {
    if (mock.failMarkerWrite && file.endsWith('onboarding.json.tmp')) throw new Error('Disk is full')
    mock.files.set(file, typeof data === 'string' ? data : Buffer.from(data))
  }),
  rename: vi.fn(async (from: string, to: string) => {
    if (!mock.files.has(from)) throw new Error('Missing temporary file')
    mock.files.set(to, mock.files.get(from)!); mock.files.delete(from)
  }),
  unlink: vi.fn(async (file: string) => { mock.files.delete(file) }),
}))

vi.mock('../../electron/worker', () => ({ ModelWorker: class {
  request(...args: unknown[]) { return mock.workerRequest(...args) }
  close() {}
} }))

vi.mock('electron', () => {
  class FakeWindow {
    webContents: any
    constructor() {
      this.webContents = { id: mock.windows.length + 1, mainFrame: {}, send: vi.fn(),
        setWindowOpenHandler: vi.fn(), on: vi.fn(), once: vi.fn() }
      mock.windows.push(this)
    }
    on() {}
    loadFile() { return Promise.resolve() }
    loadURL() { return Promise.resolve() }
    isDestroyed() { return false }
    show() {}
    hide() {}
  }
  return {
    app: { isPackaged: false, setPath: vi.fn(), setAppUserModelId: vi.fn(), requestSingleInstanceLock: () => true,
      on: vi.fn(), whenReady: () => Promise.resolve(), getPath: () => '/tmp/ble-onboarding-test', quit: vi.fn() },
    BrowserWindow: FakeWindow, Tray: class { setToolTip() {}; setContextMenu() {}; on() {} },
    Menu: { buildFromTemplate: () => [] },
    safeStorage: { isEncryptionAvailable: () => mock.encrypted, getSelectedStorageBackend: () => 'gnome_libsecret',
      encryptString: () => Buffer.from('opaque-ciphertext'), decryptString: () => 'restored-test-key' },
    net: { fetch: (...args: unknown[]) => mock.fetch(...args) },
    nativeImage: {
      createFromPath: () => ({}),
      createFromBitmap: (pixels: Buffer, size: unknown) => { mock.bitmap(Buffer.from(pixels), size); return { toPNG: () => Buffer.from('neutral-probe') } },
      createFromBuffer: () => ({ isEmpty: () => false, getSize: () => ({ width: 320, height: 320 }),
        resize: () => ({ toPNG: () => Buffer.from('neutral-probe') }) }),
    },
    screen: { on: vi.fn(), getAllDisplays: () => [] },
    desktopCapturer: { getSources: (...args: unknown[]) => mock.captures(...args) },
    globalShortcut: { register: () => true, unregisterAll: vi.fn() },
    powerMonitor: { on: vi.fn() }, dialog: { showErrorBox: vi.fn() },
    ipcMain: { handle: (name: string, callback: (...args: any[]) => any) => mock.handlers.set(name, callback) },
  }
})

const file = (name: string) => '/tmp/ble-onboarding-test/' + name
const preferences = (): Settings => structuredClone({ ...defaultSettings, cloudConsent: true })
const success = () => new Response(JSON.stringify({ model: 'jev-1.14.0', usage: { input_tokens: 120 }, answers: { connection: { noul: 0.02 } } }))
const flush = async () => { for (let i = 0; i < 50; i++) await Promise.resolve() }

async function boot() {
  vi.resetModules()
  mock.handlers.clear(); mock.windows.length = 0
  await import('../../electron/main')
  await flush()
  const sender = mock.windows[0].webContents
  const event = { sender, senderFrame: sender.mainFrame }
  return (name: string, ...args: unknown[]) => mock.handlers.get(name)!(event, ...args)
}

beforeEach(() => {
  vi.stubEnv('TYPESAFE_API_KEY', '')
  mock.files.clear(); mock.encrypted = true; mock.failMarkerWrite = false
  mock.fetch.mockReset(); mock.captures.mockReset(); mock.bitmap.mockReset(); mock.workerRequest.mockReset()
  mock.fetch.mockImplementation(async () => success())
})
afterEach(() => vi.unstubAllEnvs())

describe('fresh desktop onboarding', () => {
  it('starts incomplete and blocks screen protection without invoking capture, Python or the cloud', async () => {
    const call = await boot()
    const snapshot = await call('snapshot')
    expect(snapshot.onboardingComplete).toBe(false)
    expect(snapshot.settings).toMatchObject({ backend: 'jev', cloudConsent: false, detectionOnly: true })
    expect(snapshot.status.mode).toBe('idle')
    await expect(call('start')).rejects.toThrow('guided setup')
    expect(JSON.parse(String(mock.files.get(file('onboarding.json'))))).toEqual({ complete: false })
    expect(mock.captures).not.toHaveBeenCalled()
    expect(mock.workerRequest).not.toHaveBeenCalled()
    expect(mock.fetch).not.toHaveBeenCalled()
  })

  it('requires consent and a key before a verification request can be sent', async () => {
    const call = await boot()
    await call('set-cloud-key', 'test-key')
    await expect(call('verify-cloud')).rejects.toThrow('consent')
    await call('save', preferences())
    await call('set-cloud-key', '')
    await expect(call('verify-cloud')).rejects.toThrow('API key')
    expect(mock.fetch).not.toHaveBeenCalled()
    await expect(call('complete-onboarding', preferences())).rejects.toThrow('Verify your key')
  })

  it('verifies only a fixed neutral image, persists completion across restart, and never auto-starts', async () => {
    const call = await boot()
    await call('save', preferences())
    await call('set-cloud-key', 'test-key')
    await expect(call('verify-cloud')).resolves.toMatchObject({ elapsedMs: expect.any(Number) })
    expect(mock.fetch).toHaveBeenCalledTimes(1)
    const [endpoint, request] = mock.fetch.mock.calls[0]
    expect(endpoint).toBe('https://api.typesafe.ai/v1/systemone')
    const payload = JSON.parse(request.body)
    expect(Object.keys(payload.questions)).toEqual(['connection'])
    expect(payload.questions.connection.instructions).toContain('blue circle')
    expect(Buffer.from((Object.values(payload.assets)[0] as { data_base64: string }).data_base64, 'base64').toString()).toBe('neutral-probe')
    const [pixels, size] = mock.bitmap.mock.calls[0]
    expect(size).toEqual({ width: 320, height: 320 })
    expect(pixels.length).toBe(320 * 320 * 4)
    expect(pixels.every((value: number, i: number) => value === (i % 4 === 3 ? 255 : 240))).toBe(true)
    expect(mock.captures).not.toHaveBeenCalled()
    await call('complete-onboarding', preferences())
    expect((await call('snapshot')).onboardingComplete).toBe(true)
    expect((await call('snapshot')).status.mode).toBe('idle')
    expect((await call('snapshot')).status.endsAt).toBeNull()
    expect(JSON.parse(String(mock.files.get(file('onboarding.json'))))).toEqual({ complete: true })
    expect(String(mock.files.get(file('jev-key.enc')))).not.toContain('test-key')
    expect(JSON.stringify(await call('snapshot'))).not.toContain('test-key')
    const restarted = await boot()
    expect((await restarted('snapshot')).onboardingComplete).toBe(true)
    expect((await restarted('snapshot')).status.mode).toBe('idle')
    expect(mock.fetch).toHaveBeenCalledTimes(1)
    expect(mock.captures).not.toHaveBeenCalled()
    expect(mock.workerRequest).not.toHaveBeenCalled()
  })

  it('requires successful verification, consent, detection-only mode and an enabled rule to complete', async () => {
    const call = await boot()
    await call('save', preferences())
    await call('set-cloud-key', 'test-key')
    await expect(call('complete-onboarding', preferences())).rejects.toThrow('Verify your key')
    await call('verify-cloud')
    for (const next of [
      { ...preferences(), cloudConsent: false },
      { ...preferences(), detectionOnly: false },
      { ...preferences(), backend: 'local' },
      { ...preferences(), rules: preferences().rules.map(rule => ({ ...rule, enabled: false })) },
    ]) await expect(call('complete-onboarding', next)).rejects.toThrow('Verify your key')
    expect((await call('snapshot')).onboardingComplete).toBe(false)
    await call('complete-onboarding', preferences())
    expect((await call('snapshot')).onboardingComplete).toBe(true)
  })

  it('invalidates prior verification when a key is replaced or removed', async () => {
    const call = await boot()
    await call('save', preferences())
    await call('set-cloud-key', 'first-test-key')
    await call('verify-cloud')
    await call('set-cloud-key', 'second-test-key')
    await expect(call('complete-onboarding', preferences())).rejects.toThrow('Verify your key')
    await call('verify-cloud')
    await call('set-cloud-key', '')
    await expect(call('complete-onboarding', preferences())).rejects.toThrow('Verify your key')
    expect((await call('snapshot')).onboardingComplete).toBe(false)
  })

  it('keeps setup incomplete after provider rejection or malformed responses without automatic retries', async () => {
    const call = await boot()
    await call('save', preferences())
    await call('set-cloud-key', 'test-key')
    mock.fetch.mockImplementationOnce(async () => new Response('private provider details', { status: 401 }))
    await expect(call('verify-cloud')).rejects.toThrow('rejected the API key')
    expect(mock.fetch).toHaveBeenCalledTimes(1)
    await expect(call('complete-onboarding', preferences())).rejects.toThrow('Verify your key')
    mock.fetch.mockImplementationOnce(async () => new Response(JSON.stringify({ model: 'jev-1.14.0', usage: { input_tokens: 50 }, answers: {} })))
    await expect(call('verify-cloud')).rejects.toThrow('every enabled rule')
    expect(mock.fetch).toHaveBeenCalledTimes(2)
    expect((await call('snapshot')).status.cloudRequests).toBe(2)
    expect((await call('snapshot')).onboardingComplete).toBe(false)
  })

  it('refuses to persist an API key when OS encryption is unavailable', async () => {
    const call = await boot()
    mock.encrypted = false
    await expect(call('set-cloud-key', 'never-save-this')).rejects.toThrow('encryption is unavailable')
    expect(mock.files.has(file('jev-key.enc'))).toBe(false)
    expect(mock.files.has(file('jev-key.enc.tmp'))).toBe(false)
    expect((await call('snapshot')).status.cloudKeyConfigured).toBe(false)
    expect(mock.fetch).not.toHaveBeenCalled()
  })

  it('keeps completion false if writing the marker fails, then permits a safe retry', async () => {
    const call = await boot()
    await call('save', preferences())
    await call('set-cloud-key', 'test-key')
    await call('verify-cloud')
    mock.failMarkerWrite = true
    await expect(call('complete-onboarding', preferences())).rejects.toThrow('Disk is full')
    expect((await call('snapshot')).onboardingComplete).toBe(false)
    expect(JSON.parse(String(mock.files.get(file('onboarding.json'))))).toEqual({ complete: false })
    mock.failMarkerWrite = false
    await call('complete-onboarding', preferences())
    expect((await call('snapshot')).onboardingComplete).toBe(true)
    expect((await call('snapshot')).status.mode).toBe('idle')
    expect(mock.fetch).toHaveBeenCalledTimes(1)
  })
})
