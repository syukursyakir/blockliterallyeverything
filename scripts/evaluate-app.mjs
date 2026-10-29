// Bundle the real application modules with the existing pinned build dependency.
import { build } from 'esbuild'
import { mkdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
await mkdir('work', { recursive:true })
await build({ entryPoints:['lab/run-app-evaluation.ts'], outfile:'work/run-app-evaluation.mjs', bundle:true, platform:'node', format:'esm', packages:'external' })
const result=spawnSync(process.execPath,['--use-env-proxy','work/run-app-evaluation.mjs',...process.argv.slice(2)],{stdio:'inherit',env:process.env})
process.exit(result.status ?? 1)
