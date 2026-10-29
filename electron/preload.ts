import { contextBridge, ipcRenderer } from 'electron'
import type { DesktopAPI } from '../src/shared'
function listen<T>(channel: string, callback: (value: T) => void) {
  const handler = (_: unknown, value: T) => callback(value)
  ipcRenderer.on(channel, handler)
  return () => { ipcRenderer.removeListener(channel, handler) }
}
const api: DesktopAPI = {
  snapshot: () => ipcRenderer.invoke('snapshot'), save: s => ipcRenderer.invoke('save', s),
  verifyCloud: () => ipcRenderer.invoke('verify-cloud'),
  completeOnboarding: settings => ipcRenderer.invoke('complete-onboarding', settings),
  setCloudKey: key => ipcRenderer.invoke('set-cloud-key', key),
  installModel: () => ipcRenderer.invoke('install-model'), start: () => ipcRenderer.invoke('start'),
  stop: () => ipcRenderer.invoke('stop'), testImage: bytes => ipcRenderer.invoke('test-image', bytes),
  previewBlock: () => ipcRenderer.invoke('preview-block'), recover: () => ipcRenderer.invoke('recover'),
  onUpdate: callback => listen('update', callback), onBlock: callback => listen('block', callback),
}
contextBridge.exposeInMainWorld('desktop', api)
