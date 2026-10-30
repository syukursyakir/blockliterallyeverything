// No provider calls. Prepares a controlled reviewed scene and a retained budget COPY.
import { chromium } from '@playwright/test'
import { paintReviewedVideo } from '../lab/video-scene.ts'
import reviewedVideos from '../lab/reviewed-videos.json' with {type:'json'}
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { validateEvaluationBudget } from '../lab/evaluation-budget.ts'
import { nativeBudget } from '../lab/native-process.ts'
const scene=process.env.BLE_LIVE_SCENE || 'social-synthetic'
if(!['social-synthetic','youtube-public','explicit-public','youtube-video','youtube-compact-video',...Object.keys(reviewedVideos)].includes(scene))throw new Error('Unknown controlled scene.')
const sourceHeaders={'User-Agent':'BlockLiterallyEverythingValidation/0.1 (https://github.com/syukursyakir/blockliterallyeverything; provenance research)'}
const videoContext=reviewedVideos[scene]?.context ?? (scene==='youtube-video'?'youtube':scene==='youtube-compact-video'?'youtube-compact':undefined)
const videoReference=reviewedVideos[scene] ?? reviewedVideos[videoContext?'safe-video':scene]
const explicitReference={"url":"https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/ERA110_Erika_Kole_nude_R_4_030.jpg/960px-ERA110_Erika_Kole_nude_R_4_030.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail","sha256":"9304d80530f8d9fa8c8405d911f5f8850335df417a8269a0566523e0c0af0b12","source":"https://commons.wikimedia.org/wiki/File:ERA110_Erika_Kole_nude_R_4_030.jpg","adult_provenance":"Source declares model adult age 22 at capture.","rights":{"license":"CC BY-SA 4.0","license_url":"https://creativecommons.org/licenses/by-sa/4.0","attribution":"Carol Ash"}}
const destination=path.resolve(process.argv[2] || 'native-live')
if(!process.env.BLE_RETAINED_BUDGET)throw new Error('Provide the authoritative retained budget metadata in BLE_RETAINED_BUDGET. No empty allowance is created.')
const budget=validateEvaluationBudget(JSON.parse(process.env.BLE_RETAINED_BUDGET))
nativeBudget(budget.current,budget.capUsd,process.env.BLE_LIVE_POSITIVE_AT_START==='true')
await mkdir(destination,{recursive:true})
if((await readdir(destination)).length)throw new Error('Destination must be empty.')
await writeFile(path.join(destination,'budget.json'),JSON.stringify(budget,null,2)+'\n',{flag:'wx',mode:0o600})
const browser=await chromium.launch({executablePath:process.env.BLE_TEST_BROWSER || undefined,args:['--no-sandbox'],proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined,env:{...process.env,TYPESAFE_API_KEY:''}})
try {
 const page=await browser.newPage({viewport:{width:1280,height:900}})
 let provenance={origin:'self-authored synthetic browser screenshot',labels:{explicit:false,video:false,social:true},label_note:'Predefined synthetic Instagram-like feed; integration only, not real-service accuracy.'}
 if(scene==='social-synthetic'){
 await page.setContent('<html><meta charset="utf-8"><body style="margin:0;font:22px Arial;background:#fafafa"><header style="padding:25px;border-bottom:1px solid #ddd;font-size:40px">Instagram</header><main style="width:620px;margin:24px auto;background:white;border:1px solid #ddd"><p style="padding:10px">example_garden · Follow</p><div style="height:420px;background:linear-gradient(130deg,#194c38,#b6d18a,#f8d892)"></div><p style="padding:10px">♡　Comment　Share　Save</p><p style="padding:10px">1,240 likes · A quiet garden afternoon</p><p style="padding:10px;color:#555">View all comments　　Add a comment…</p></main></body></html>')
 }else if(scene==='youtube-public'){
  const url='https://www.youtube.com/results?search_query=nasa+space'
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:25000})
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('ytd-thumbnail img')).filter(i=>i instanceof HTMLImageElement && i.naturalWidth>100 && i.getBoundingClientRect().top<900 && i.getBoundingClientRect().bottom>0).length>=2,{},{timeout:30000})
  const loaded=await page.locator('ytd-thumbnail img').evaluateAll(images=>images.filter(i=>i.naturalWidth>100 && i.getBoundingClientRect().top<900 && i.getBoundingClientRect().bottom>0).length)
  if(response?.status()!==200 || new URL(page.url()).hostname!=='www.youtube.com' || !await page.locator('ytd-app').count() || loaded<2)throw new Error('Real YouTube UI not sufficiently loaded. No provider request.')
  provenance={origin:'real public YouTube search-page screenshot, reviewed source URL with DOM loading guard',labels:{explicit:false,video:true,social:false},label_note:'Same search source previously inspected in the frozen development corpus. Actual visible thumbnails required; integration-only repeat, not a new accuracy sample.',source:url,visible_loaded_thumbnails:loaded}
 }else if(videoReference){
  const response=await fetch(videoReference.url,{redirect:'error',headers:sourceHeaders,signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error('Reviewed video unavailable; no provider call.')
  if(Number(response.headers.get('content-length'))>12*1024*1024)throw new Error('Video too large.')
  const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length>12*1024*1024 || createHash('sha256').update(bytes).digest('hex')!==videoReference.sha256)throw new Error('Reviewed video hash changed; no provider call.')
  await writeFile(path.join(destination,'reviewed.webm'),bytes,{flag:'wx',mode:0o600})
  await page.setContent('<html><body style="margin:0;background:#eee;display:grid;place-items:center;height:100vh"><video muted style="width:96vw;max-height:96vh" src="data:video/webm;base64,'+bytes.toString('base64')+'"></video></body></html>')
  await page.locator('video').evaluate(async(v,start)=>{if(v.readyState<1)await new Promise((r,j)=>{v.onloadedmetadata=r;v.onerror=j});v.currentTime=start;await new Promise(r=>v.onseeked=r)},videoReference.start)
  if(videoContext)await page.evaluate(paintReviewedVideo,{data:'data:video/webm;base64,'+bytes.toString('base64'),start:videoReference.start,end:videoReference.end,rate:1,context:videoContext})
  provenance={origin:videoReference.explicit===false?'actual decoded licensed nonsexual safe-video control':'actual decoded licensed source-declared adult educational video, pinned hash',labels:{explicit:videoReference.explicit!==false,video:false,social:false},label_note:'Reviewed source segment before native inference. Actual decoded video, source/author correlation retained; poster is only preflight metadata, not a still substitution.',source:videoReference.source,source_sha256:videoReference.sha256,adult_provenance:videoReference.adult_provenance,rights:videoReference.rights,video_file:'reviewed.webm',video_sha256:videoReference.sha256,video_start:videoReference.start,video_end:videoReference.end}
  if(videoContext)Object.assign(provenance,{origin:'self-authored YouTube-like watch interface with actual decoded licensed video',labels:{explicit:false,video:true,social:false},video_context:videoContext,label_note:'Controlled moving-player composition. Synthetic UI and pinned licensed media; same-source/layout correlation retained, not real-service or independent accuracy coverage.'})
 }else{
  const response=await fetch(explicitReference.url,{redirect:'error',headers:sourceHeaders,signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error('Adult reference download unavailable; no provider call.')
  const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length>12*1024*1024 || createHash('sha256').update(bytes).digest('hex')!==explicitReference.sha256)throw new Error('Reviewed adult reference hash changed; no provider call.')
  await page.setContent('<html><body style="margin:0;background:#eee;height:100vh;display:grid;place-items:center"><img style="max-width:100vw;max-height:100vh;object-fit:contain" src="data:image/jpeg;base64,'+bytes.toString('base64')+'"></body></html>')
  await page.locator('img').evaluate(img=>img.decode())
  provenance={origin:'real licensed source-declared adult photograph, exact source hash verified',labels:{explicit:true,video:false,social:false},label_note:'Same adult photo previously pixel-reviewed before development inference; uncovered adult anatomy. Not a new independent accuracy source.',source:explicitReference.source,source_sha256:explicitReference.sha256,adult_provenance:explicitReference.adult_provenance,rights:explicitReference.rights}
 }
 const id='native-'+scene,file=id+'.png';await page.screenshot({path:path.join(destination,file)})
 const sha256=createHash('sha256').update(await readFile(path.join(destination,file))).digest('hex')
 await writeFile(path.join(destination,'manifest.json'),JSON.stringify({scope:'Controlled real-capture integration scene; no model calls during preparation and no independent accuracy claim.',cases:[{id,file,sha256,family:'integration-'+scene,split:'integration',needs_visual_label:false,...provenance}]},null,2)+'\n',{flag:'wx'})
}finally{await browser.close()}
console.log('Prepared controlled integration scene and retained accounting copy. No model calls. Only one ledger copy may be authoritative during a remote run.')
