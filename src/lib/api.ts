import { defaultSettings, initialStatus, validateSettings, type DesktopAPI, type Snapshot } from '../shared'

// Browser mode previews the interface only. It never simulates model decisions.
let previewSettings = structuredClone(defaultSettings)
try { const saved = localStorage.getItem('ble-ui-preview-settings'); if (saved) previewSettings = validateSettings(JSON.parse(saved)) } catch { /* Invalid browser-preview preferences fall back to presets. */ }
const unavailable = async (): Promise<never> => { throw new Error('Open the Windows desktop app to use screen capture and the local AI. This browser is an interface preview only.') }
const previewAPI: DesktopAPI = {
  snapshot: async (): Promise<Snapshot> => ({ settings: previewSettings, status: structuredClone(initialStatus), desktop: false }),
  save: async settings => { previewSettings = validateSettings(settings); localStorage.setItem('ble-ui-preview-settings', JSON.stringify(previewSettings)); return previewSettings },
  installModel: unavailable, setCloudKey: unavailable, verifyCloud: unavailable, completeOnboarding: unavailable, start: unavailable, stop: async () => {}, testImage: unavailable,
  previewBlock: async () => { window.location.hash = 'block' },
  recover: async () => { window.location.hash = '' },
  onUpdate: () => () => {}, onBlock: () => () => {},
}
export const api = window.desktop ?? previewAPI
