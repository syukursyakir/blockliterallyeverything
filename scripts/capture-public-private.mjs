// No inference/key access. Only encrypted screenshots leave the runner.
import {chromium} from '@playwright/test'
import {mkdir,writeFile,readdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {encryptCaptures} from '../lab/capture-package.ts'
const destination=process.argv[2]||'private-captures'
const key=process.env.BLE_CAPTURE_PUBLIC_KEY
if(!key || !process.env.BLE_CAPTURE_TARGETS)throw new Error('Capture requires a PUBLIC encryption key and explicit public targets.')
const targets=JSON.parse(process.env.BLE_CAPTURE_TARGETS)
const allowed=new Set(['www.youtube.com','m.youtube.com','www.youtube-nocookie.com','www.instagram.com','www.tiktok.com','en.wikipedia.org','developer.mozilla.org','github.com'])
if(!Array.isArray(targets)||!targets.length||targets.length>24)throw new Error('Choose 1–24 targets.')
const ids=new Set()
for(const t of targets){const u=new URL(t.url);if(!/^[a-z0-9-]{1,70}$/.test(t.id)||ids.has(t.id)||u.protocol!=='https:'||!allowed.has(u.hostname)||u.username||u.password||u.port)throw new Error('Unapproved capture target.');ids.add(t.id)}
await mkdir(destination,{recursive:true});if((await readdir(destination)).length)throw new Error('Destination must be empty.')
const env={...process.env,TYPESAFE_API_KEY:'',BLE_CAPTURE_PUBLIC_KEY:'',BLE_CAPTURE_TARGETS:''}
const browser=await chromium.launch({executablePath:process.env.BLE_TEST_BROWSER||undefined,args:['--no-sandbox'],proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined,env})
const files={},cases=[]
try {
 for(let i=0;i<targets.length;i+=3)await Promise.all(targets.slice(i,i+3).map(async(t)=>{
  const width=t.width||1280,height=t.height||900;if(width<320||width>1280||height<320||height>1280)throw new Error('Viewport outside prepared capture bounds.')
  const page=await browser.newPage({viewport:{width,height}})
  const row={id:t.id,url:t.url,family:t.family||t.id,split:t.split||'development',origin:'real public browser capture on Windows',captured_at:new Date().toISOString(),labels:{explicit:null,video:null,social:null},needs_visual_label:true,rights:'Third-party public page; local evaluation only. Raw pixels transported encrypted, not publicly redistributed.'}
  try{
   const response=await page.goto(t.url,{waitUntil:'domcontentloaded',timeout:22000});await page.waitForTimeout(2500)
   if(t.dismissSignup){const close=page.getByRole('button',{name:'Close',exact:true});if(await close.count())await close.first().click();else await page.keyboard.press('Escape');await page.mouse.wheel(0,420);await page.waitForTimeout(1000)}
   const bytes=await page.screenshot({timeout:6000});if(bytes.length>5*1024*1024)throw new Error('Screenshot too large.')
   row.file=t.id+'.png';files[row.file]=bytes;row.sha256=createHash('sha256').update(bytes).digest('hex');row.status=response?.status();row.final_url=page.url();row.title=await page.title();row.visible_text=(await page.locator('body').innerText()).slice(0,2500)
  }catch(e){row.capture_error=e.name;row.error_message=e.message.slice(0,500)}finally{cases.push(row);await page.close()}
 }))
 files['manifest.json']=Buffer.from(JSON.stringify({scope:'Public Windows captures, UNLABELED. Inspect pixels and freeze labels before any model calls.',cases},null,2)+'\n')
 await writeFile(destination+'/captures.enc.json',encryptCaptures(files,key),{flag:'wx'})
 await writeFile(destination+'/status.json',JSON.stringify({scope:'No model calls; raw captures encrypted for local-only review.',requested:targets.length,saved:cases.filter(c=>c.file).length,failed:cases.filter(c=>c.capture_error).length,publicKeySha256:createHash('sha256').update(key).digest('hex')},null,2)+'\n',{flag:'wx'})
 console.log('Encrypted captures saved; no plaintext screenshots, secret values or model calls in output artifacts.')
}finally{await browser.close()}
