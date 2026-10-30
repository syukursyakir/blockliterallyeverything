// Pinned public media only. No provider credentials, model calls or budget files.
import {readFile,mkdir,readdir,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import path from 'node:path'
const reference=JSON.parse(await readFile('lab/reviewed-videos.json','utf8'))['sintel-safe-video']
const destination=path.resolve(process.argv[2]||'capture-timing')
await mkdir(destination,{recursive:true})
if((await readdir(destination)).length)throw new Error('Timing preparation destination must be empty.')
const response=await fetch(reference.url,{redirect:'error',signal:AbortSignal.timeout(30000)})
if(!response.ok||Number(response.headers.get('content-length'))>12*1024*1024)throw new Error('Pinned timing media unavailable.')
const bytes=Buffer.from(await response.arrayBuffer())
if(bytes.length>12*1024*1024||createHash('sha256').update(bytes).digest('hex')!==reference.sha256)throw new Error('Timing media hash changed.')
await writeFile(path.join(destination,'reviewed.webm'),bytes,{flag:'wx',mode:0o600})
console.log('Prepared pinned timing media; no model calls or allowance created.')
