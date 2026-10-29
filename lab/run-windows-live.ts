// Opt-in live Windows integration. No provider or capture substitutions.
import { _electron, expect, type Page } from '@playwright/test'
import { open, mkdir, readFile, writeFile, rename, unlink } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { validateEvaluationBudget, type EvaluationBudget } from './evaluation-budget.ts'
import { nativeExitGuard, nativeBudget, nativeMotion, nativeVideo } from './native-process.ts'
import { preflight, evaluationSettings } from './app-evaluation.ts'
import { validateLedger } from '../electron/jev.ts'
import { isBlankCapture } from '../electron/screen-cache.ts'

if (process.platform !== 'win32') throw new Error('Live native validation requires an interactive Windows desktop; no test ran.')
const { values } = parseArgs({ options: { corpus:{type:'string'}, case:{type:'string'}, ledger:{type:'string'}, output:{type:'string'}, motion:{type:'string'}, 'allow-cloud':{type:'boolean'}, 'positive-at-start':{type:'boolean'} } })
const motion=nativeMotion(values.motion,values['positive-at-start']===true)
if (!values['allow-cloud'] || !values.corpus || !values.case || !values.ledger || !values.output || !process.env.TYPESAFE_API_KEY) throw new Error('Requires --allow-cloud --corpus MANIFEST --case ID --ledger RETAINED --output NEW_REPORT and a securely configured TYPESAFE_API_KEY. All visible displays may be uploaded.')
const prepared=await preflight(values.corpus)
const selected=prepared.cases.find(c=>c.item.id===values.case)
if (!selected) throw new Error('Case not found.')
if(Boolean(selected.item.video_file)!==(motion==='video'))throw new Error('A video case requires explicit video motion mode; still cases cannot claim playback.')
const media=motion==='video'?await nativeVideo(path.dirname(path.resolve(values.corpus)),selected.item.video_file,selected.item.video_sha256):undefined
const positive=evaluationSettings.rules.find(rule=>selected.item.labels[rule.id]===true)
if (!positive) throw new Error('Select a reviewed positive case.')
const file=path.resolve(values.ledger), output=path.resolve(values.output), profile=output+'.profile'
// A retained lock after interruption prevents a new process from using stale accounting.
const lock=await open(file+'.lock','wx',0o600)
let desktop: Awaited<ReturnType<typeof _electron.launch>> | undefined
let mainPage: Page | undefined
let phase = 'preflight'
let processExited = () => true
const positiveAtStart = values['positive-at-start'] === true
let reconcile=false, profileSeeded=false, reportReady=false, profileConfirmed=false, nativeStopped=true
let ledger: EvaluationBudget
const report: Record<string,unknown>={scope:'Opt-in real Windows capture -> live Jev -> native cover -> button recovery. No capture/provider fixtures. Initial configuration seeded into an isolated profile; onboarding is not tested.',passed:false,caseId:selected.item.id,preparedSha256:selected.item.sha256,manifestSha256:prepared.manifestSha256,rule:positive,caseProvenance:{origin:selected.item.origin,source:selected.item.source,source_sha256:selected.item.source_sha256,adult_provenance:selected.item.adult_provenance,rights:selected.item.rights},protocol:positiveAtStart?'positive-at-session-start':'neutral-to-positive-during-session',startedAt:new Date().toISOString(),timingMethod:'Epoch timestamp after two requestAnimationFrame callbacks on controlled content; to automation-observed painted cover. Includes poll/IPC delay; not external frame-accurate timing.'}
report.motion=motion
if(motion==='switch-away'){
  report.scope='Real Windows stale-result control: actual capture/provider, positive replaced by neutral during inference. Must remain uncovered, recheck neutral and stop cleanly. Does not test successful positive blocking/recovery.'
  report.protocol='switch-away-during-inference'
}
const atomic=async(file:string,value:unknown)=>{await writeFile(file+'.tmp',JSON.stringify(value,null,2)+'\n',{mode:0o600});await rename(file+'.tmp',file)}
try {
  ledger=validateEvaluationBudget(JSON.parse(await readFile(file,'utf8')))
  const planned=nativeBudget(ledger.current,ledger.capUsd,positiveAtStart)
  const runBudget=planned.limitUsd
  report.maximumRequests=planned.maximumRequests
  if(positiveAtStart)report.timingMethod='Positive image painted before session starts; presentation to automation-observed complete cover includes session-start/IPC/capture overhead. NOT an already-active-session transition or frame-accurate latency.'
  await mkdir(profile) // Never reuse a personal or previous test profile.
  await writeFile(path.join(profile,'settings.json'),JSON.stringify({...evaluationSettings,cloudConsent:true,cloudBudgetUsd:runBudget,detectionOnly:false,rules:evaluationSettings.rules.map(r=>({...r,enabled:r.id===positive.id}))}),{mode:0o600})
  await writeFile(path.join(profile,'onboarding.json'),'{"complete":true}',{mode:0o600})
  await writeFile(path.join(profile,'jev-budget.json'),JSON.stringify(ledger.current),{mode:0o600});profileSeeded=true
  const handle=await open(output,'wx',0o600);await handle.close();reportReady=true
  report.budgetBefore=ledger.current;report.recoveryProfile=profile
  phase='launch'
  desktop=await _electron.launch({executablePath:process.env.BLE_SMOKE_APP_EXE || undefined,args:[...(process.env.BLE_SMOKE_APP_EXE?[]:[path.resolve('.')]),'--user-data-dir='+profile],env:{...process.env,BLE_DEV_URL:''},timeout:60_000})
  processExited=nativeExitGuard(desktop)
  nativeStopped=false
  const page=mainPage=await desktop.firstWindow();await page.waitForFunction(()=>Boolean(window.desktop))
  phase='profile-and-display-check'
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
    await scene.loadURL('data:text/html,'+encodeURIComponent('<html><head><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data:; media-src data:; style-src \'unsafe-inline\'"></head><body style="margin:0;background:#ececec;display:grid;place-items:center;height:100vh;font:30px sans-serif"><p>Neutral work notes</p></body></html>'))
    scene.setFullScreen(true);scene.show();scene.focus()
  })
  // Showing a native window does not guarantee its compositor frame is ready.
  // Wait on real capture pixels, without uploading or retaining a screenshot.
  phase='scene-paint-preflight'
  await expect.poll(async()=>{
    const pixels=await desktop!.evaluate(async({desktopCapturer})=>{
      const sources=await desktopCapturer.getSources({types:['screen'],thumbnailSize:{width:64,height:64},fetchWindowIcons:false})
      return sources.length===1 && !sources[0].thumbnail.isEmpty()?Array.from(sources[0].thumbnail.toBitmap()):[]
    })
    return !isBlankCapture(Uint8Array.from(pixels))
  },{timeout:10_000}).toBe(true)
  report.capturePreflight='Actual display capture varied before session start; pixels discarded without provider call or file.'
  const snapshot=()=>page.evaluate(()=>window.desktop!.snapshot())
  const playback=()=>desktop!.evaluate(async()=>await (globalThis as any).bleLiveScene.webContents.executeJavaScript(`(()=>{const v=document.querySelector('video');return v?{time:v.currentTime,paused:v.paused,readyState:v.readyState,decodedFrames:v.getVideoPlaybackQuality().totalVideoFrames}:null})()`))
  const paintPositive=async()=>desktop!.evaluate(async(_,{data,motion})=>{
    const scene=(globalThis as any).bleLiveScene
    if(motion==='video')return await scene.webContents.executeJavaScript(`(async()=>{const v=document.createElement('video');v.muted=true;v.style='width:96vw;max-height:96vh;object-fit:contain';v.src=${JSON.stringify(data)};document.body.replaceChildren(v);await new Promise((r,j)=>{v.onloadedmetadata=r;v.onerror=()=>j(new Error('Reviewed video decoding failed'))});if(v.duration<25)throw new Error('Reviewed video too short');v.currentTime=10;await new Promise(r=>v.onseeked=r);v.ontimeupdate=()=>{if(v.currentTime>=25)v.currentTime=10};await v.play();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return Date.now()})()`)
    return await scene.webContents.executeJavaScript(`(async()=>{ const img=new Image();img.src=${JSON.stringify(data)};await img.decode();img.style=${JSON.stringify(motion==='pan'?'max-width:96vw;max-height:96vh;object-fit:contain':'max-width:100vw;max-height:100vh;object-fit:contain')};document.body.replaceChildren(img);if(${JSON.stringify(motion)}==='pan'){globalThis.bleMotionFrames=0;const start=performance.now();function move(now){img.style.transform='translateX('+12*Math.sin((now-start)/400)+'px)';globalThis.bleMotionFrames++;requestAnimationFrame(move)}requestAnimationFrame(move)}await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return Date.now()})()`)
  },{data:media?'data:video/webm;base64,'+media.toString('base64'):'data:image/png;base64,'+selected.bytes.toString('base64'),motion})
  let paintedAt:number
  report.settings=(await snapshot()).settings
  let negativeChecks=0, negativeRequests=0
  if(positiveAtStart){
    phase='paint-positive';paintedAt=await paintPositive()
    phase='start-positive-session';await page.evaluate(()=>window.desktop!.start())
  }else{
    phase='neutral-control';await page.evaluate(()=>window.desktop!.start())
    await expect.poll(async()=>(await snapshot()).status.mode,{timeout:20_000}).toBe('watching')
    const negative=await snapshot()
    if(negative.status.blocks!==0)throw new Error('Negative control matched; stopped before showing positive.')
    negativeChecks=negative.status.checks;negativeRequests=negative.status.cloudRequests
    report.negativeControl='Live neutral frame allowed without a cover.'
    phase='paint-positive';paintedAt=await paintPositive()
  }
  if(motion==='video'){
    phase='verify-decoded-playback'
    await expect.poll(async()=>(await playback())?.time,{timeout:3000}).toBeGreaterThan(10.1)
    report.playbackAtStart=await playback()
    report.videoSha256=selected.item.video_sha256
    report.videoRangeSeconds=[10,25]
  }
  if(motion==='switch-away'){
    phase='await-positive-request'
    await expect.poll(async()=>(await snapshot()).status.cloudRequests,{intervals:[5],timeout:10_000}).toBe(negativeRequests+1)
    const inFlight=await snapshot()
    if(inFlight.status.mode!=='checking')throw new Error('Inference already completed; switch-away race not exercised.')
    report.positiveRequestObservedAt=Date.now()
    phase='replace-with-neutral'
    report.replacedAt=await desktop.evaluate(async()=>{
      const scene=(globalThis as any).bleLiveScene
      return await scene.webContents.executeJavaScript(`(async()=>{document.body.replaceChildren(Object.assign(document.createElement('p'),{textContent:'A different neutral document'}));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return Date.now()})()`)
    })
    phase='verify-stale-result-rejected'
    await expect.poll(async()=>(await snapshot()).status.activity.some(a=>a.message==='Screen changed during analysis; checking the new view next.'),{timeout:15_000}).toBe(true)
    await expect.poll(async()=>(await snapshot()).status.checks,{timeout:15_000}).toBeGreaterThan(negativeChecks)
    const final=await snapshot()
    expect(final.status.blocks).toBe(0)
    expect(final.status.mode).toBe('watching')
    expect(desktop.windows().filter(p=>p.url().endsWith('#block'))).toHaveLength(0)
    report.staleControl={discarded:true,neutralRechecked:true,blocks:final.status.blocks,checks:final.status.checks,cloudRequests:final.status.cloudRequests}
    await page.evaluate(()=>window.desktop!.stop())
    await expect.poll(async()=>(await snapshot()).status.mode).toBe('idle')
    report.passed=true
  }else{
  phase='wait-for-cover'
  await expect.poll(async()=>(await snapshot()).status.mode,{timeout:20_000}).toBe('blocked')
  const cover=desktop.windows().find(p=>p.url().endsWith('#block'))
  if(!cover)throw new Error('No native cover window found.')
  await expect(cover.getByRole('heading',{name:'This content is blocked.'})).toBeVisible()
  report.contentToObservedCoverMs=Date.now()-paintedAt
  if(motion==='video'){
    report.playbackAtCover=await playback()
    expect(report.playbackAtCover).toMatchObject({paused:false})
    expect((report.playbackAtCover as {decodedFrames:number}).decodedFrames).toBeGreaterThan((report.playbackAtStart as {decodedFrames:number}).decodedFrames)
    report.motionLimits='Actual decoded licensed adult video, reviewed10–25s range, source repeat, one trial; not representative video recall.'
  }
  if(motion==='pan'){
    report.motionFrames=await desktop.evaluate(async()=>await (globalThis as any).bleLiveScene.webContents.executeJavaScript('globalThis.bleMotionFrames'))
    expect(report.motionFrames).toBeGreaterThan(10)
    report.motionLimits='Reviewed screenshot pans horizontally +/-12px continuously; not actual video playback, large motion or new accuracy data.'
  }
  report.blockInfo=await cover.evaluate(async()=>(await window.desktop!.snapshot()).block)
  report.cover=await desktop.evaluate(({BrowserWindow})=>{
    const w=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().endsWith('#block'))!
    return {bounds:w.getBounds(),visible:w.isVisible(),topmost:w.isAlwaysOnTop(),focused:w.isFocused(),fullScreen:w.isFullScreen()}
  })
  phase='native-cover-assertions'
  const bounds=(report.cover as {bounds:unknown}).bounds
  expect(bounds).toEqual(displays.displays[0].bounds)
  expect(report.cover).toMatchObject({visible:true,topmost:true,focused:true,fullScreen:true})
  const blocked=await snapshot();report.blockedRule=blocked.status.activity.find(a=>a.kind==='blocked')?.message
  phase='recovery'
  await cover.getByRole('button',{name:'Pause & return to app'}).click()
  await expect.poll(async()=>(await snapshot()).status.mode).toBe('idle')
  await expect.poll(()=>desktop!.windows().filter(p=>p.url().endsWith('#block')).length).toBe(0)
  report.recovery='Button released cover and paused session.';report.passed=true
  }
} catch (error) {
  report.failedPhase=phase
  report.errorType=error instanceof Error ? error.name : 'UnknownError'
  if(mainPage)report.lastStatus=await mainPage.evaluate(async()=>{const {status}=await window.desktop!.snapshot();return {mode:status.mode,error:status.error,checks:status.checks,blocks:status.blocks,cloudRequests:status.cloudRequests}}).catch(()=>null)
  report.failure='Live validation failed; inspect native state/accounting. No sensitive screenshot, provider response body or credentials retained.'
  process.exitCode=1
} finally {
  // Preserve the primary outcome even if native cleanup/accounting later fails.
  if(reportReady)await atomic(output,report).catch(()=>{report.reportWriteError='Could not save pre-cleanup outcome.';report.passed=false;process.exitCode=1})
  // Stop before reading accounting. Preserve the profile for crash/budget recovery.
  if(desktop && profileConfirmed) {
    await desktop.firstWindow().then(p=>p.evaluate(()=>window.desktop!.stop())).catch(()=>{})
    await desktop.close().catch(()=>{})
  } else if(desktop) await desktop.close().catch(()=>{})
  if(desktop)nativeStopped=processExited()
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
