// No provider calls. Creates only a self-authored scene and a retained budget COPY.
import { chromium } from '@playwright/test'
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { validateEvaluationBudget } from '../lab/evaluation-budget.ts'
import { nativeBudget } from '../lab/native-process.ts'
const destination=path.resolve(process.argv[2] || 'native-live')
if(!process.env.BLE_RETAINED_BUDGET)throw new Error('Provide the authoritative retained budget metadata in BLE_RETAINED_BUDGET. No empty allowance is created.')
const budget=validateEvaluationBudget(JSON.parse(process.env.BLE_RETAINED_BUDGET))
nativeBudget(budget.current,budget.capUsd,process.env.BLE_LIVE_POSITIVE_AT_START==='true')
await mkdir(destination,{recursive:true})
if((await readdir(destination)).length)throw new Error('Destination must be empty.')
await writeFile(path.join(destination,'budget.json'),JSON.stringify(budget,null,2)+'\n',{flag:'wx',mode:0o600})
const browser=await chromium.launch({executablePath:process.env.BLE_TEST_BROWSER || undefined,args:['--no-sandbox']})
try {
 const page=await browser.newPage({viewport:{width:1280,height:900}})
 await page.setContent('<html><meta charset="utf-8"><body style="margin:0;font:22px Arial;background:#fafafa"><header style="padding:25px;border-bottom:1px solid #ddd;font-size:40px">Instagram</header><main style="width:620px;margin:24px auto;background:white;border:1px solid #ddd"><p style="padding:10px">example_garden · Follow</p><div style="height:420px;background:linear-gradient(130deg,#194c38,#b6d18a,#f8d892)"></div><p style="padding:10px">♡　Comment　Share　Save</p><p style="padding:10px">1,240 likes · A quiet garden afternoon</p><p style="padding:10px;color:#555">View all comments　　Add a comment…</p></main></body></html>')
 const file='native-social-fixture.png';await page.screenshot({path:path.join(destination,file)})
 const sha256=createHash('sha256').update(await readFile(path.join(destination,file))).digest('hex')
 await writeFile(path.join(destination,'manifest.json'),JSON.stringify({scope:'Self-authored synthetic social interface for live native integration only. Not real feed accuracy.',cases:[{id:'native-social-fixture',file,sha256,family:'own-native-integration-scene',split:'integration',origin:'self-authored synthetic browser screenshot',labels:{explicit:false,video:false,social:true},needs_visual_label:false,label_note:'Predefined synthetic Instagram-like post/feed scene. Expected social match; no sexual content or YouTube. No claim of real-service coverage.'}]},null,2)+'\n',{flag:'wx'})
}finally{await browser.close()}
console.log('Prepared non-sensitive synthetic integration scene and retained accounting copy. No model calls. Only one ledger copy may be authoritative during a remote run.')
