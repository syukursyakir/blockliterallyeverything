import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { build } from 'esbuild'
import { preflight, predictions, rate, sha256, summarize, evaluationSettings } from '../../lab/app-evaluation'
const dirs: string[]=[]
afterEach(async()=>{for(const dir of dirs.splice(0)) await rm(dir,{recursive:true,force:true})})
async function corpus() {
 const dir=await mkdtemp(path.join(tmpdir(),'ble-eval-'));dirs.push(dir)
 const bytes=Buffer.alloc(24);Buffer.from('89504e470d0a1a0a','hex').copy(bytes);bytes.write('IHDR',12);bytes.writeUInt32BE(1280,16);bytes.writeUInt32BE(900,20)
 await writeFile(path.join(dir,'case.png'),bytes)
 const item={id:'public-page',file:'case.png',sha256:sha256(bytes),family:'public-site-session',split:'development',origin:'public capture',labels:{explicit:false,video:true,social:null},needs_visual_label:false,label_note:'Visible video; social ambiguous.'}
 const manifest=path.join(dir,'manifest.json')
 const save=async(cases:unknown[])=>writeFile(manifest,JSON.stringify({cases}))
 await save([item]);return {dir,item,manifest,save}
}
describe('actual app evaluation evidence boundaries',()=>{
 it('accepts frozen labels and verifies hash and bounds before any requests',async()=>{
  const c=await corpus();expect((await preflight(c.manifest)).cases).toHaveLength(1)
  await writeFile(path.join(c.dir,'case.png'),'changed');await expect(preflight(c.manifest)).rejects.toThrow(/Changed/)
 })
 it('rejects pending/missing labels, duplicates and escaping paths',async()=>{
  const c=await corpus()
  for(const cases of [[{...c.item,needs_visual_label:true}],[{...c.item,labels:{video:true}}],[c.item,c.item],[{...c.item,file:'../outside.png'}]]){
   await c.save(cases);await expect(preflight(c.manifest)).rejects.toThrow()
  }
 })
 it('uses app threshold independently per rule and preserves global match',()=>{
  expect(predictions({elapsedMs:1,verdicts:[{ruleId:'explicit',probability:0.4},{ruleId:'video',probability:0.9},{ruleId:'social',probability:0.39}]})).toEqual({matchedRule:'video',perRule:{explicit:true,video:true,social:false}})
 })
 it('does not count errors as successful detection or ambiguity as a negative',()=>{
  const m=summarize([
   {caseId:'miss',labels:{explicit:true,video:false,social:null},error:'timeout'},
   {caseId:'catch',labels:{explicit:true,video:false,social:false},predicted:{explicit:true,video:true,social:false}}
  ])
  expect(m.explicit.recall.rate).toBe(0.5);expect(m.explicit.labeledErrors).toBe(1)
  expect(m.video.falseBlockRate.rate).toBe(0.5);expect(m.social.ambiguous).toBe(1)
 })
 it('reports absent positive coverage and wide uncertainty for tiny perfect sets',()=>{
  expect(rate(0,0).rate).toBeNull();expect(rate(4,4).wilson95![0]).toBeLessThan(0.6)
 })
})

describe('evaluation CLI refuses unsafe budget state before network',()=>{
 it('preserves missing/corrupt/exhausted ledgers and refuses overwrite/concurrent runs',async()=>{
  const c=await corpus(), runner=path.join(c.dir,'runner.mjs'), ledger=path.join(c.dir,'budget.json'), report=path.join(c.dir,'report.json')
  await build({entryPoints:['lab/run-app-evaluation.ts'],outfile:runner,bundle:true,platform:'node',format:'esm',packages:'external'})
  const run=(...flags:string[])=>spawnSync(process.execPath,[runner,'--corpus',c.manifest,'--output',report,'--ledger',ledger,'--allow-cloud',...flags],{encoding:'utf8',env:{...process.env,TYPESAFE_API_KEY:'offline-test-placeholder',HTTPS_PROXY:'http://127.0.0.1:1'}})
  expect(run().stderr).toContain('ENOENT');await expect(readFile(ledger)).rejects.toThrow()
  await writeFile(ledger,'corrupt');expect(run().status).not.toBe(0);expect(await readFile(ledger,'utf8')).toBe('corrupt')
  const state=JSON.stringify({capUsd:0.5,priorUsage:{retainedReservations:62},current:{requests:45,reservedUsd:45*262144*0.042/1e6,inputTokens:0}})
  await writeFile(ledger,state);expect(run().stderr).toContain('exceed');expect(await readFile(ledger,'utf8')).toBe(state)
  expect(run('--init-budget').stderr).toContain('EEXIST');expect(await readFile(ledger,'utf8')).toBe(state)
  await writeFile(ledger+'.lock','held');expect(run().stderr).toContain('EEXIST');await expect(readFile(report)).rejects.toThrow()
 })
})

describe('candidate settings are explicit, reproducible and restricted to starter IDs',()=>{
 it('applies the supplied threshold rather than the baseline threshold',()=>{
  const result={elapsedMs:1,verdicts:[{ruleId:'explicit',probability:0.5},{ruleId:'video',probability:0.5},{ruleId:'social',probability:0.5}]}
  expect(predictions(result,{...evaluationSettings,threshold:0.9}).perRule).toEqual({explicit:false,video:false,social:false})
 })
 it('records candidate prompts in a dry run and rejects disabled policies before calls',async()=>{
  const c=await corpus(), runner=path.join(c.dir,'runner.mjs'), config=path.join(c.dir,'settings.json'), output=path.join(c.dir,'report.json')
  await build({entryPoints:['lab/run-app-evaluation.ts'],outfile:runner,bundle:true,platform:'node',format:'esm',packages:'external'})
  const settings={...evaluationSettings,threshold:0.8,rules:evaluationSettings.rules.map(r=>({...r,instruction:'Only the specifically named visible platform: '+r.name}))}
  await writeFile(config,JSON.stringify(settings))
  const run=()=>spawnSync(process.execPath,[runner,'--corpus',c.manifest,'--settings',config,'--output',output],{encoding:'utf8',env:{...process.env,TYPESAFE_API_KEY:''}})
  const result=run();expect(result.status).toBe(0)
  const plan=JSON.parse(result.stdout);expect(plan.dryRun).toBe(true);expect(plan.settings.threshold).toBe(0.8);expect(plan.questions.video.instructions).toContain(settings.rules[1].instruction)
  settings.rules[0].enabled=false;await writeFile(config,JSON.stringify(settings));expect(run().stderr).toContain('all three')
  await expect(readFile(output)).rejects.toThrow()
 })
})
