import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { createInterface } from 'node:readline'
import path from 'node:path'
import { existsSync } from 'node:fs'
import { randomUUID } from 'node:crypto'

export class ModelWorker {
  private child: ChildProcessWithoutNullStreams | null = null
  private pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void; timer: NodeJS.Timeout }>()
  constructor(private root: string, private resources: string | null, private dataDir: string, private progress: (message: string) => void) {}
  private launch() {
    if (this.child) return
    const bundled = this.resources && path.join(this.resources, 'worker', process.platform === 'win32' ? 'ble-worker.exe' : 'ble-worker')
    const venv = path.join(this.root, 'worker', '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python')
    const executable = bundled || process.env.BLE_PYTHON || (existsSync(venv) ? venv : process.platform === 'win32' ? 'python' : 'python3')
    const args = bundled ? [] : [path.join(this.root, 'worker', 'main.py')]
    const { TYPESAFE_API_KEY: _cloudCredential, ...localEnvironment } = process.env
    const child = spawn(executable, args, { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'], env: { ...localEnvironment, BLE_DATA_DIR: this.dataDir, PYTHONUNBUFFERED: '1', HF_HUB_DISABLE_TELEMETRY: '1' } })
    this.child = child
    const fail = () => {
      if (this.child !== child) return
      this.child = null
      child.kill()
      for (const p of this.pending.values()) { clearTimeout(p.timer); p.reject(new Error('The local AI worker stopped. Check its installation, then retry.')) }
      this.pending.clear()
    }
    child.on('error', fail); child.on('exit', fail)
    child.stdin.on('error', fail)
    // Consume library diagnostics without retaining potentially sensitive input or crash logs.
    child.stderr.on('data', () => {})
    const lines = createInterface({ input: child.stdout })
    lines.on('line', line => {
      if (this.child !== child) return
      if (line.length > 1_000_000) return
      let response: { id?: string; event?: string; message?: string; error?: string; result?: unknown }
      try { response = JSON.parse(line) } catch { return }
      if (response.event === 'progress') { this.progress(String(response.message ?? '').slice(0, 200)); return }
      if (!response.id) return
      const p = this.pending.get(response.id)
      if (!p) return
      clearTimeout(p.timer); this.pending.delete(response.id)
      if (response.error) p.reject(new Error(response.error.slice(0, 500)))
      else p.resolve(response.result)
    })
  }
  request<T>(method: string, payload: object = {}, timeout = 90_000): Promise<T> {
    this.launch()
    return new Promise((resolve, reject) => {
      const id = randomUUID()
      const timer = setTimeout(() => { this.pending.delete(id); this.close(); reject(new Error('Local AI timed out. Protection is paused; try fewer rules or a longer interval.')) }, timeout)
      this.pending.set(id, { resolve: v => resolve(v as T), reject, timer })
      this.child!.stdin.write(JSON.stringify({ ...payload, id, method }) + '\n', error => {
        if (error) { clearTimeout(timer); this.pending.delete(id); reject(new Error('Could not communicate with the local AI worker.')) }
      })
    })
  }
  close() {
    const child = this.child; this.child = null; child?.kill()
    for (const p of this.pending.values()) { clearTimeout(p.timer); p.reject(new Error('Local AI operation cancelled.')) }
    this.pending.clear()
  }
}
