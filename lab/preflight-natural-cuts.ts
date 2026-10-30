// Fixed prospective Sintel cohort preflight; no provider client or native capture.
import {chromium} from '@playwright/test'
import {readFile,writeFile,open} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import assert from 'node:assert/strict'
import {paintReviewedVideo} from './video-scene.ts'
import {preflight} from './app-evaluation.ts'
import {nativeVideo,nativeVideoRange} from './native-process.ts'
const root='work/natural-cuts-20261030'
const output=root+'/preflight.json'
await (await open(output,'wx',0o600)).close()
const browser=await chromium.launch({executablePath:process.env.BLE_TEST_BROWSER||'/usr/bin/chromium',args:['--no-sandbox'],env:{...process.env,TYPESAFE_API_KEY:'',GH_TOKEN:''}})
const reports:unknown[]=[]
let externalRequests=0,completed=false
try{
 const context=await browser.newContext({viewport:{width:1024,height:768},offline:true})
 context.on('request',r=>{if(/^https?:/.test(r.url()))externalRequests++})
 await context.route('**/*',r=>/^https?:/.test(r.request().url())?r.abort():r.continue())
 const page=await context.newPage()
 for(const [scene,expectedContext] of [['sintel-wide-video','youtube'],['sintel-compact-video','youtube-compact'],['sintel-safe-video',undefined]] as const){
  const directory=root+'/'+scene
  const prepared=await preflight(directory+'/manifest.json')
  assert.equal(prepared.cases.length,1)
  const item=prepared.cases[0].item
  assert.deepEqual(item.labels,{explicit:false,video:expectedContext!==undefined,social:false})
  assert.equal(item.video_context,expectedContext)
  const bytes=await nativeVideo(directory,item.video_file,item.video_sha256)
  const range=nativeVideoRange(item.video_start,item.video_end)
  assert.deepEqual(range,{start:20,end:38})
  await page.setContent('<html><body style="margin:0;background:#ececec;display:grid;place-items:center;height:100vh"></body></html>')
  await page.evaluate(paintReviewedVideo,{data:'data:video/webm;base64,'+bytes.toString('base64'),...range,rate:1,context:expectedContext})
  const state=()=>page.locator('video').evaluate((v:HTMLVideoElement)=>({time:v.currentTime,frames:v.getVideoPlaybackQuality().totalVideoFrames,paused:v.paused,rate:v.playbackRate,width:v.getBoundingClientRect().width}))
  const start=await state()
  await page.waitForTimeout(1200)
  const advancing=await state()
  assert(advancing.time>start.time+.5&&advancing.frames>start.frames&&!advancing.paused&&advancing.rate===1)
  await page.screenshot({path:directory+'/native-layout-review.png'})
  // Observe an actual end->start loop rather than merely a low timestamp.
  await page.waitForFunction(()=>document.querySelector('video')!.currentTime>37.5,undefined,{timeout:20000})
  const beforeLoop=await state()
  await page.waitForFunction(()=>document.querySelector('video')!.currentTime<21,undefined,{timeout:3000})
  const looped=await state()
  assert(looped.frames>beforeLoop.frames&&!looped.paused&&looped.rate===1)
  reports.push({scene,manifestSha256:prepared.manifestSha256,posterSha256:item.sha256,mediaSha256:createHash('sha256').update(bytes).digest('hex'),labels:item.labels,videoContext:expectedContext,start,advancing,beforeLoop,looped})
  console.log('PASS: new-media preflight',scene)
 }
 assert.equal(externalRequests,0)
 completed=true
}finally{
 await browser.close()
 const codeSha256:Record<string,string>={}
 for(const file of ['lab/preflight-natural-cuts.ts','lab/video-scene.ts','scripts/prepare-windows-live.mjs','lab/reviewed-videos.json'])codeSha256[file]=createHash('sha256').update(await readFile(file)).digest('hex')
 await writeFile(output,JSON.stringify({scope:'Offline Chromium decoded-media/layout preflight; not native capture/model accuracy.',completed,providerCalls:0,externalRequests,sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),chromium:browser.version(),codeSha256,reports},null,2)+'\n',{mode:0o600})
}
