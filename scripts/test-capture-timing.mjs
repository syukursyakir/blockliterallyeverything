import {build} from 'esbuild'
import {mkdir} from 'node:fs/promises'
import {spawnSync} from 'node:child_process'
if(process.platform!=='win32')throw new Error('Capture timing requires an interactive Windows desktop; no native test ran.')
if(process.env.TYPESAFE_API_KEY)throw new Error('Capture timing refuses a provider credential.')
await mkdir('work',{recursive:true})
await build({entryPoints:['lab/run-capture-timing.ts'],outfile:'work/run-capture-timing.mjs',bundle:true,platform:'node',format:'esm',packages:'external'})
const result=spawnSync(process.execPath,['work/run-capture-timing.mjs',...process.argv.slice(2)],{stdio:'inherit',env:{...process.env,TYPESAFE_API_KEY:''}})
process.exit(result.status??1)
