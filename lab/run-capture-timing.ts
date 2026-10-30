// Secret-free real Windows capture diagnostic. Never starts an inference session.
import {_electron} from '@playwright/test'
import {mkdir,open,readFile,writeFile,rename} from 'node:fs/promises'
import path from 'node:path'
import {parseArgs} from 'node:util'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import assert from 'node:assert/strict'
import {nativeVideo,nativeExitGuard} from './native-process.ts'
import {paintReviewedVideo} from './video-scene.ts'
import {capturePairs} from './capture-timing.ts'
import {isBlankCapture,changedSubstantially,lostLocalDetail,sameTranslatedFrame} from '../electron/screen-cache.ts'
import reviewed from './reviewed-videos.json' with {type:'json'}
if(process.platform!=='win32')throw new Error('Capture timing requires an interactive Windows desktop; no native test ran.')
if(process.env.TYPESAFE_API_KEY)throw new Error('Capture timing refuses a provider credential.')
const {values}=parseArgs({options:{media:{type:'string'},output:{type:'string'}}})
const mediaFile=path.resolve(values.media||'capture-timing/reviewed.webm')
const output=path.resolve(values.output||'capture-timing/report.json'),profile=output+'.profile'
const reference=reviewed['sintel-safe-video']
const bytes=await nativeVideo(path.dirname(mediaFile),path.basename(mediaFile),reference.sha256)
await mkdir(path.dirname(output),{recursive:true});await mkdir(profile)
await(await open(output,'wx',0o600)).close()
const hash=(value:Buffer|string)=>createHash('sha256').update(value).digest('hex')
const report:any={scope:'Free actual Windows desktop capture and hypothetical reception-gap guard comparisons, not inference/accuracy/app cadence/cover evidence.',completed:false,providerCalls:0,sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),mediaSha256:hash(bytes),range:[reference.start,reference.end],rights:reference.rights,cadenceMs:150,horizonMs:22000,gapsMs:[200,800,1600],maxOvershootMs:150,clockNote:'Capture monotonic clock is Electron main performance.now; scheduling clock is Node parent. Media snapshots bracket acquisition+resize but do not identify compositor exposure time.',layouts:[]}
let desktop:Awaited<ReturnType<typeof _electron.launch>>|undefined
let exited=()=>true,phase='launch'
type MediaState={epochMs:number;rendererMonotonicMs:number;time:number;decodedFrames:number;paused:boolean;rate:number;readyState:number}
type TimingSample={startedMs:number;getSourcesStartedMs:number;capturedMs:number;resizedMs:number;endedMs:number;mediaBefore:MediaState;mediaAfter:MediaState;sourceId:string;thumbnailSize:{width:number;height:number};resizedSize:{width:number;height:number};pixels:string}
const sleep=(ms:number)=>new Promise(resolve=>setTimeout(resolve,Math.max(0,ms)))
try{
 desktop=await _electron.launch({args:[path.resolve('.'),'--user-data-dir='+profile],env:{...process.env,TYPESAFE_API_KEY:'',BLE_DEV_URL:''},timeout:60000})
 exited=nativeExitGuard(desktop)
 const page=await desktop.firstWindow();await page.waitForFunction(()=>Boolean(window.desktop))
 assert.equal(path.resolve(await desktop.evaluate(({app})=>app.getPath('userData'))).toLowerCase(),profile.toLowerCase())
 report.runtime=await desktop.evaluate(({screen})=>({versions:process.versions,displays:screen.getAllDisplays().map(d=>({id:String(d.id),bounds:d.bounds,scale:d.scaleFactor})),providerCredentialPresent:Boolean(process.env.TYPESAFE_API_KEY)}))
 assert.equal(report.runtime.displays.length,1,'TIMING_DISPLAY_COUNT');assert.equal(report.runtime.providerCredentialPresent,false)
 await desktop.evaluate(async({BrowserWindow,screen})=>{
  const scene=new BrowserWindow({...screen.getPrimaryDisplay().bounds,frame:false,show:false,resizable:true,fullscreenable:true,webPreferences:{sandbox:true,contextIsolation:true,nodeIntegration:false}})
  ;(globalThis as any).captureTimingScene=scene
  await scene.loadURL('data:text/html,'+encodeURIComponent('<html><head><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; media-src data:; style-src \'unsafe-inline\'"></head><body style="margin:0;background:#ececec;display:grid;place-items:center;height:100vh"></body></html>'))
  scene.setFullScreen(true);scene.show();scene.focus()
 })
 for(const context of ['youtube','youtube-compact',undefined] as const){
  phase='capture-'+(context||'unbranded')
  const layout:any={context:context||'unbranded',completed:false,samples:[],pairs:[]};report.layouts.push(layout)
  await desktop.evaluate(async(_,{painter,options})=>await (globalThis as any).captureTimingScene.webContents.executeJavaScript('('+painter+')('+JSON.stringify(options)+')'),{painter:paintReviewedVideo.toString(),options:{data:'data:video/webm;base64,'+bytes.toString('base64'),start:reference.start,end:reference.end,rate:1,context}})
  layout.scene=await desktop.evaluate(()=>{const s=(globalThis as any).captureTimingScene;return {bounds:s.getBounds(),visible:s.isVisible(),focused:s.isFocused(),fullScreen:s.isFullScreen()}})
  assert.deepEqual(layout.scene.bounds,report.runtime.displays[0].bounds,'TIMING_SCENE_GEOMETRY')
  assert(layout.scene.visible&&layout.scene.focused&&layout.scene.fullScreen,'TIMING_SCENE_VISIBILITY')
  const frames:Buffer[]=[]
  const began=performance.now();layout.scheduleMonotonicStartMs=began;let slot=0
  try{
   while(performance.now()-began<22000){
    await sleep(began+slot*150-performance.now())
    if(performance.now()-began>=22000)break
    const sample:TimingSample=await desktop.evaluate(async({desktopCapturer,screen},{blank})=>{
     const scene=(globalThis as any).captureTimingScene
     const media=()=>scene.webContents.executeJavaScript(`(()=>{const v=document.querySelector('video');if(!v)throw new Error('TIMING_MEDIA_MISSING');return {epochMs:Date.now(),rendererMonotonicMs:performance.now(),time:v.currentTime,decodedFrames:v.getVideoPlaybackQuality().totalVideoFrames,paused:v.paused,rate:v.playbackRate,readyState:v.readyState}})()`)
     const startedMs=performance.now(),mediaBefore=await media(),getSourcesStartedMs=performance.now()
     let deadline:ReturnType<typeof setTimeout>|undefined
     const sources=await Promise.race([desktopCapturer.getSources({types:['screen'],thumbnailSize:{width:1280,height:1280},fetchWindowIcons:false}),new Promise<never>((_,reject)=>{deadline=setTimeout(()=>reject(new Error('TIMING_CAPTURE_DEADLINE')),5000)})]).finally(()=>clearTimeout(deadline))
     const capturedMs=performance.now(),display=screen.getPrimaryDisplay()
     const source=sources.find(s=>s.display_id===String(display.id))??(screen.getAllDisplays().length===1?sources[0]:undefined)
     if(!source||source.thumbnail.isEmpty())throw new Error('TIMING_CAPTURE_MISSING')
     const full=source.thumbnail.toBitmap()
     if(Function('return ('+blank+')')()(full))throw new Error('TIMING_CAPTURE_BLANK')
     const small=source.thumbnail.resize({width:64,height:64}),pixels=small.toBitmap().toString('base64'),resizedMs=performance.now()
     const mediaAfter=await media(),endedMs=performance.now()
     return {startedMs,getSourcesStartedMs,capturedMs,resizedMs,endedMs,mediaBefore,mediaAfter,sourceId:source.display_id,thumbnailSize:source.thumbnail.getSize(),resizedSize:small.getSize(),pixels}
    },{blank:isBlankCapture.toString()})
    const {pixels,...metadata}=sample
    const frame=Buffer.from(pixels,'base64');assert.equal(frame.length,64*64*4,'TIMING_FRAME_SIZE')
    assert.deepEqual(metadata.resizedSize,{width:64,height:64})
    assert(!metadata.mediaBefore.paused&&!metadata.mediaAfter.paused&&metadata.mediaBefore.rate===1&&metadata.mediaAfter.rate===1)
    const nextSlot=Math.max(slot+1,Math.floor((performance.now()-began)/150)+1)
    layout.samples.push({...metadata,slot,skippedSlotsAfter:nextSlot-slot-1,sha256:hash(frame)})
    frames.push(frame);slot=nextSlot
   }
  }finally{
   layout.scheduleMonotonicEndMs=performance.now();layout.elapsedMs=layout.scheduleMonotonicEndMs-began
   layout.firstCaptureMs=layout.samples[0]?.capturedMs??null;layout.lastCaptureMs=layout.samples.at(-1)?.capturedMs??null
   // Partial sequence still gets all available numeric pair rows; never serialize pixels.
   layout.pairs=capturePairs(layout.samples.map((s:any)=>s.capturedMs)).map(pair=>{
    if(pair.status!=='measured')return pair
    const before=frames[pair.from],after=frames[pair.to!]
    const changed=changedSubstantially(before,after),detailLost=!changed&&lostLocalDetail(before,after,64)
    const translated=(changed||detailLost)&&sameTranslatedFrame(before,after,64)
    let difference=0
    for(let i=0;i<before.length;i+=4)for(let c=0;c<3;c++)difference+=Math.abs(before[i+c]-after[i+c])
    return {...pair,changed,detailLost,translated,discard:(changed||detailLost)&&!translated,meanRgbDifference:difference/(64*64*3*255)}
   })
   layout.steadyControls={count:frames.length,allEligible:frames.every(f=>!changedSubstantially(f,f)&&!lostLocalDetail(f,f,64))}
   frames.length=0
  }
  assert(layout.samples.length>=2&&layout.steadyControls.allEligible)
  const states=layout.samples.flatMap((s:any)=>[s.mediaBefore,s.mediaAfter])
  layout.observedLoops=states.slice(1).filter((s:any,i:number)=>s.time<states[i].time-5&&s.decodedFrames>states[i].decodedFrames).length
  assert(layout.observedLoops>=1,'TIMING_LOOP_MISSING')
  assert(states.at(-1).decodedFrames>states[0].decodedFrames,'TIMING_MEDIA_STALLED')
  layout.summary=report.gapsMs.map((gap:number)=>{
   const rows=layout.pairs.filter((p:any)=>p.requestedMs===gap)
   return {requestedMs:gap,requested:rows.length,measured:rows.filter((p:any)=>p.status==='measured').length,discarded:rows.filter((p:any)=>p.discard).length,outOfTolerance:rows.filter((p:any)=>p.status==='out-of-tolerance').length,horizonCensored:rows.filter((p:any)=>p.status==='horizon-censored').length}
  })
  layout.completed=true
 }
 phase='idle-and-no-requests'
 const snapshot=await page.evaluate(()=>window.desktop!.snapshot())
 report.finalStatus={mode:snapshot.status.mode,cloudRequests:snapshot.status.cloudRequests,checks:snapshot.status.checks}
 assert.equal(snapshot.status.mode,'idle','TIMING_IDLE_STATE');assert.equal(snapshot.status.cloudRequests,0,'TIMING_UNEXPECTED_REQUEST');assert.equal(snapshot.status.checks,0,'TIMING_UNEXPECTED_CHECK')
 report.completed=true
}catch(error){report.failedPhase=phase;report.errorType=error instanceof Error?error.name:'UnknownError';report.failureCode=['TIMING_MEDIA_MISSING','TIMING_CAPTURE_DEADLINE','TIMING_CAPTURE_MISSING','TIMING_CAPTURE_BLANK','TIMING_LOOP_MISSING','TIMING_FRAME_SIZE','TIMING_DISPLAY_COUNT','TIMING_SCENE_GEOMETRY','TIMING_SCENE_VISIBILITY','TIMING_IDLE_STATE','TIMING_UNEXPECTED_REQUEST','TIMING_UNEXPECTED_CHECK','TIMING_MEDIA_STALLED'].find(code=>error instanceof Error&&error.message.includes(code))??'TIMING_UNCLASSIFIED';process.exitCode=1}
finally{
 if(desktop)await desktop.close().catch(()=>{})
 report.nativeProcessStopped=exited()
 if(!report.nativeProcessStopped){report.completed=false;report.cleanupCode='TIMING_NATIVE_NOT_STOPPED';process.exitCode=1}
 report.codeSha256={};report.codeLfSha256={}
 for(const file of ['lab/run-capture-timing.ts','lab/capture-timing.ts','lab/video-scene.ts','electron/screen-cache.ts','lab/reviewed-videos.json']){const source=await readFile(file);report.codeSha256[file]=hash(source);report.codeLfSha256[file]=hash(source.toString('utf8').replace(/\r\n/g,'\n'))}
 const serialized=JSON.stringify(report)
 await writeFile(output+'.tmp',serialized+'\n',{mode:0o600});await rename(output+'.tmp',output)
 const total=Math.ceil(serialized.length/9000)
 for(let part=0;part<total;part++)console.log('CAPTURE_TIMING_CHUNK='+JSON.stringify({part,total,json:serialized.slice(part*9000,(part+1)*9000)}))
 console.log('CAPTURE_TIMING_REPORT='+JSON.stringify({sha256:hash(serialized),completed:report.completed,layouts:report.layouts.map((l:any)=>({context:l.context,completed:l.completed,captures:l.samples.length,summary:l.summary})),providerCalls:0,nativeProcessStopped:report.nativeProcessStopped}))
}
