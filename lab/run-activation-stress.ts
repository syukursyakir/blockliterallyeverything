import { replay, currentComparator, type Scenario } from './session-replay.ts'
import { parseArgs } from 'node:util'
import { open,writeFile,readFile,mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import assert from 'node:assert/strict'
const {values}=parseArgs({options:{output:{type:'string'}}})
if(!values.output)throw new Error('Provide --output NEW_JSON; no provider calls.')
const output=path.resolve(values.output);await mkdir(path.dirname(output),{recursive:true});await(await open(output,'wx',0o600)).close()
const rows=[]
for(const periodMs of [3340,3760,4280])for(const flatMs of [120,280,560])for(const offsetMs of [50,50+flatMs/2,50+flatMs+100])for(const moving of [false,true])for(const detectionOnly of [false,true]){
 const scenario:Scenario={id:['activation',periodMs,flatMs,offsetMs,moving?'moving':'static',detectionOnly?'observe':'block'].join('-'),kind:'periodic',periodMs,flatMs,offsetMs,responseMs:periodMs-3000,moving,detectionOnly}
 for(const version of ['current','escalation'] as const){
  let reads=0
  const offsets=new Proxy([250,500,750,1000],{get(target,key,receiver){if(typeof key==='string'&&/^[0-3]$/.test(key))reads++;return Reflect.get(target,key,receiver)}})
  const {events,...metrics}=replay(scenario,currentComparator,version==='escalation'?offsets:[],15000)
  let since:number|null=null,active=0,phaseIndex=0,shiftedRequests=0,shiftedCaches=0
  for(let i=0;i<events.length;i++){
   const event=events[i]
   if(event.kind==='accepted'||event.kind==='cache'){since=null;phaseIndex=0}
   if(event.kind==='discard'){
    since??=event.at
    if(version==='escalation'&&event.at-since>=15000){
     active++;const shift=[250,500,750,1000][phaseIndex++%4]
     const next=events.slice(i+1).find(e=>e.kind==='request'||e.kind==='cache')
     if(next){assert.equal(next.at-event.at,3000+shift);if(next.kind==='request')shiftedRequests++;else shiftedCaches++}
    }
   }
  }
  if(version==='escalation')assert.equal(active,reads-4)
  rows.push({version,...metrics,appliedOffsets:active,shiftedRequests,shiftedCaches,events})
 }
}
assert.equal(rows.length,216)
const codeSha256:Record<string,string>={}
for(const f of ['lab/session-replay.ts','lab/run-activation-stress.ts','docs/RETRY-ACTIVATION-PLAN.md'])codeSha256[f]=createHash('sha256').update(await readFile(f)).digest('hex')
await writeFile(output,'{"meta":'+JSON.stringify({scope:'Prospectively fixed deliberate lock/near-lock synthetic STRESS, not natural/media/model evidence.',providerCalls:0,codeSha256})+',\n"cases":[\n'+rows.map(row=>JSON.stringify(row)).join(',\n')+'\n]}\n')
console.log(JSON.stringify({output,cases:rows.length,providerCalls:0}))
