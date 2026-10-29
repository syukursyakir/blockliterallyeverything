import { spawn } from 'node:child_process'
import { build } from 'esbuild'
import electron from 'electron'
await build({ entryPoints: ['electron/main.ts', 'electron/preload.ts'], bundle: true, platform: 'node', target: 'node22', outdir: 'dist-electron', external: ['electron'], format: 'cjs' })
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1'], { stdio: 'inherit' })
let desktop
function stop() { desktop?.kill(); server.kill() }
process.on('SIGINT', stop); process.on('SIGTERM', stop)
for (let attempt = 0; attempt < 80; attempt++) {
  try { if ((await fetch('http://127.0.0.1:5173')).ok) break } catch { /* Vite is still starting. */ }
  if (attempt === 79) { stop(); throw new Error('Vite did not start.') }
  await new Promise(resolve => setTimeout(resolve, 250))
}
desktop = spawn(electron, ['.'], { stdio: 'inherit', env: { ...process.env, BLE_DEV_URL: 'http://127.0.0.1:5173' } })
desktop.on('exit', code => { server.kill(); process.exitCode = code ?? 1 })
