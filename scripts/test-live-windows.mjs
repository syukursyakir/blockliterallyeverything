import { build } from 'esbuild'
import { mkdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
if(process.platform!=='win32')throw new Error('Requires an interactive Windows desktop. No native test ran.')
await mkdir('work',{recursive:true})
await build({entryPoints:['lab/run-windows-live.ts'],outfile:'work/run-windows-live.mjs',bundle:true,platform:'node',format:'esm',packages:'external'})
const result=spawnSync(process.execPath,['work/run-windows-live.mjs',...process.argv.slice(2)],{stdio:'inherit',env:process.env})
process.exit(result.status??1)
