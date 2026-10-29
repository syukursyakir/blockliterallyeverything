// Opt-in live Windows integration. No provider or capture substitutions.
import { _electron, expect } from '@playwright/test'
import { open, mkdir, readFile, writeFile, rename, unlink } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { preflight, evaluationSettings } from './app-evaluation.ts'
import { validateLedger, RESERVED_PER_REQUEST } from '../electron/jev.ts'

if (process.platform !== 'win32') throw new Error('Live native validation requires an interactive Windows desktop; no test ran.')
const { values } = parseArgs({ options: { corpus:{type:'string'}, case:{type:'string'}, ledger:{type:'string'}, output:{type:'string'}, 'allow-cloud':{type:'boolean'} } })
if (!values['allow-cloud'] || !values.corpus || !values.case || !values.ledger || !values.output || !process.env.TYPESAFE_API_KEY) throw new Error('Requires --allow-cloud --corpus MANIFEST --case ID --ledger RETAINED --output NEW_REPORT and a securely configured TYPESAFE_API_KEY. All visible displays may be uploaded.')
const prepared=await preflight(values.corpus)
const selected=prepared.cases.find(c=>c.item.id===values.case)
if (!selected) throw new Error('Case not found.')
const positive=evaluationSettings.rules.find(rule=>selected.item.labels[rule.id]===true)
if (!positive) throw new Error('Select a reviewed positive case.')
const file=path.resolve(values.ledger), output=path.resolve(values.output), profile=output+'.profile'
// A retained lock after interruption prevents a new process from using stale accounting.
const lock=await open(file+'.lock','wx',0o600)
let desktop: Awaited<ReturnType<typeof _electron.launch>> | undefined
let reconcile=false, profileSeeded=false, reportReady=false, profileConfirmed=false, nativeStopped=true
let ledger: {capUsd:number;priorUsage:unknown;current:ReturnType<typeof validateLedger>}
const report: Record<string,unknown>={scope:'Opt-in real Windows capture -> live Jev -> native cover -> button recovery. No capture/provider fixtures. Initial configuration seeded into an isolated profile; onboarding is not tested.',passed:false,caseId:selected.item.id,preparedSha256:selected.item.sha256,manifestSha256:prepared.manifestSha256,rule:positive,startedAt:new Date().toISOString(),timingMethod:'Epoch timestamp after two requestAnimationFrame callbacks on controlled content; to automation-observed painted cover. Includes poll/IPC delay; not external frame-accurate timing.'}
const atomic=async(file:string,value:unknown)=>{await writeFile(file+'.tmp',JSON.stringify(value,null,2)+'\n',{mode:0o600});await rename(file+'.tmp',file)}
try {
  ledger=JSON.parse(await readFile(file,'utf8'))
  if(ledger.capUsd!==0.5 || !ledger.priorUsage) throw new Error('Unexpected retained budget metadata.')
  ledger.current=validateLedger(ledger.current)
  // At most three real attempts: initial negative, target, and one additional check.
  const runBudget=ledger.current.reservedUsd+3*RESERVED_PER_REQUEST
  if(runBudget>ledger.capUsd) throw new Error('Fewer than three reservations remain. No native test started.')
  await mkdir(profile) // Never reuse a personal or previous test profile.
  await writeFile(path.join(profile,'settings.json'),JSON.stringify({...evaluationSettings,cloudConsent:true,cloudBudgetUsd:runBudget,detectionOnly:false,rules:evaluationSettings.rules.map(r=>({...r,enabled:r.id===positive.id}))}),{mode:0o600})
  await writeFile(path.join(profile,'onboarding.json'),'{"complete":true}',{mode:0o600})
  await writeFile(path.join(profile,'jev-budget.json'),JSON.stringify(ledger.current),{mode:0o600});profileSeeded=true
  const handle=await open(output,'wx',0o600);await handle.close();reportReady=true
  report.budgetBefore=ledger.current;report.recoveryProfile=profile
  desktop=await _electron.launch({executablePath:process.env.BLE_SMOKE_APP_EXE || undefined,args:[...(process.env.BLE_SMOKE_APP_EXE?[]:[path.resolve('.')]),'--user-data-dir='+profile],env:{...process.env,BLE_DEV_URL:''},timeout:60_000})
  nativeStopped=false
  const page=await desktop.firstWindow();await page.waitForFunction(()=>Boolean(window.desktop))
  const actual=await desktop.evaluate(({app})=>app.getPath('userData'))
  if(path.resolve(actual).toLowerCase()!==profile.toLowerCase())throw new Error('Profile isolation failed; no session started.')
  profileConfirmed=true
  const displays=await desktop.evaluate(({screen,app})=>({os:process.getSystemVersion(),electron:process.versions.electron,appVersion:app.getVersion(),displays:screen.getAllDisplays().map(d=>({id:d.id,bounds:d.bounds,scaleFactor:d.scaleFactor}))}))
  report.runtime=displays
  if(displays.displays.length!==1)throw new Error('First live check requires exactly one controlled display. No session started.')
  // Same native window remains visible; only its pixels change after protection starts.
  await desktop.evaluate(async({BrowserWindow,screen})=>{
    const main=BrowserWindow.getAllWindows().find(w=>!w.webContents.getURL().endsWith('#block'))!
    main.hide()
    const scene=new BrowserWindow({...screen.getPrimaryDisplay().bounds,frame:false,show:false,resizable:true,fullscreenable:true,webPreferences:{sandbox:true,contextIsolation:true,nodeIntegration:false}})
    ;(globalThis as any).bleLiveScene=scene
    await scene.loadURL('data:text/html,'+encodeURIComponent('<html><head><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data:; style-src \'unsafe-inline\'"></head><body style="margin:0;background:#ececec;display:grid;place-items:center;height:100vh;font:30px sans-serif"><p>Neutral work notes</p></body></html>'))
    scene.setFullScreen(true);scene.show();scene.focus()
  })
  const snapshot=()=>page.evaluate(()=>window.desktop!.snapshot())
  await page.evaluate(()=>window.desktop!.start())
  await expect.poll(async()=>(await snapshot()).status.mode,{timeout:20_000}).toBe('watching')
  const negative=await snapshot();report.settings=negative.settings
  if(negative.status.blocks!==0)throw new Error('Negative control matched; stopped before showing positive.')
  const paintedAt=await desktop.evaluate(async(_,{data})=>{
    const scene=(globalThis as any).bleLiveScene
    return await scene.webContents.executeJavaScript(`(async()=>{ const img=new Image();img.src=${JSON.stringify(data)};await img.decode();img.style='max-width:100vw;max-height:100vh;object-fit:contain';document.body.replaceChildren(img);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return Date.now()})()`)
  },{data:'data:image/png;base64,'+selected.bytes.toString('base64')})
  await expect.poll(async()=>(await snapshot()).status.mode,{timeout:20_000}).toBe('blocked')
  const cover=desktop.windows().find(p=>p.url().endsWith('#block'))
  if(!cover)throw new Error('No native cover window found.')
  await expect(cover.getByRole('heading',{name:'This content is blocked.'})).toBeVisible()
  report.contentToObservedCoverMs=Date.now()-paintedAt
  report.cover=await desktop.evaluate(({BrowserWindow})=>{
    const w=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().endsWith('#block'))!
    return {bounds:w.getBounds(),visible:w.isVisible(),topmost:w.isAlwaysOnTop(),focused:w.isFocused(),fullScreen:w.isFullScreen()}
  })
  const bounds=(report.cover as {bounds:unknown}).bounds
  expect(bounds).toEqual(displays.displays[0].bounds)
  expect(report.cover).toMatchObject({visible:true,topmost:true,focused:true,fullScreen:true})
  const blocked=await snapshot();report.blockedRule=blocked.status.activity.find(a=>a.kind==='blocked')?.message
  await cover.getByRole('button',{name:'Pause & return to app'}).click()
  await expect.poll(async()=>(await snapshot()).status.mode).toBe('idle')
  await expect.poll(()=>desktop!.windows().filter(p=>p.url().endsWith('#block')).length).toBe(0)
  report.recovery='Button released cover and paused session.';report.passed=true
} catch {
  report.failure='Live validation failed; inspect native state/accounting. No sensitive screenshot, provider response body or credentials retained.'
  process.exitCode=1
} finally {
  // Stop before reading accounting. Preserve the profile for crash/budget recovery.
  if(desktop && profileConfirmed) {
    await desktop.firstWindow().then(p=>p.evaluate(()=>window.desktop!.stop())).catch(()=>{})
    await desktop.close().catch(()=>{})
  } else if(desktop) await desktop.close().catch(()=>{})
  if(desktop)nativeStopped=desktop.process().exitCode!==null || desktop.process().signalCode!==null
  try {
    if(!nativeStopped)throw new Error('Native process may still hold the ledger')
    if(profileSeeded){
      const current=validateLedger(JSON.parse(await readFile(path.join(profile,'jev-budget.json'),'utf8')))
      if(current.requests<ledger!.current.requests || current.reservedUsd>ledger!.capUsd || current.inputTokens<ledger!.current.inputTokens)throw new Error('Accounting regression')
      ledger!.current=current;await atomic(file,ledger!);report.budgetAfter=current
    }
    reconcile=true
  } catch { report.accountingError='Could not reconcile native ledger. LOCK RETAINED: recover from the isolated profile before any further calls.';report.passed=false;process.exitCode=1 }
  if(reportReady)await atomic(output,report)
  await lock.close();if(reconcile)await unlink(file+'.lock')
}
if(!reportReady)throw new Error('Native test failed preflight; no report created. Existing files/budget were preserved.')
console.log(JSON.stringify(report,null,2))
