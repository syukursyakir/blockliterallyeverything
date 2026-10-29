// Public pages only, isolated browser. No inference or labels; inspect before scoring.
import {chromium} from '@playwright/test'
import {mkdir,writeFile,readFile,readdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
const dir=process.argv[2]; if(!dir) throw new Error('Pass a NEW empty capture directory; existing datasets must not be overwritten.'); await mkdir(dir,{recursive:true}); if((await readdir(dir)).length) throw new Error('Capture directory is not empty.')
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox'],proxy:{server:process.env.HTTPS_PROXY}})
const targets=[
 ['youtube-home','https://www.youtube.com/'],
 ['youtube-watch','https://www.youtube.com/watch?v=jNQXAC9IVRw'],
 ['youtube-embed','https://www.youtube-nocookie.com/embed/jNQXAC9IVRw'],
 ['instagram-nasa','https://www.instagram.com/nasa/'],
 ['instagram-nasa-grid','https://www.instagram.com/nasa/'],
 ['tiktok-sports','https://www.tiktok.com/channel/sports'],
 ['tiktok-feed','https://www.tiktok.com/explore'],
 ['youtube-channel','https://www.youtube.com/@NASA/videos'],
 ['wikipedia-youtube','https://en.wikipedia.org/wiki/YouTube'],
 ['mdn-video','https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video'],
 ['wikipedia-running','https://en.wikipedia.org/wiki/Running'],
 ['wikipedia-swimming','https://en.wikipedia.org/wiki/Swimming_(sport)'],
 ['github-react','https://github.com/facebook/react'],
 ['wikipedia-instagram','https://en.wikipedia.org/wiki/Instagram']]
const records=[]
for(let i=0;i<targets.length;i+=3) await Promise.all(targets.slice(i,i+3).map(async([id,url])=>{
 const page=await browser.newPage({viewport:{width:1280,height:900}})
 const row={id,url,captured_at:new Date().toISOString(),origin:'live public browser capture',family:new URL(url).hostname,split:'development',labels:{explicit:null,video:null,social:null},needs_visual_label:true,rights:'Public website; third-party rights retained. Local evaluation only; no image redistribution.'}
 try{const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:22000});await page.waitForTimeout(3000);if(id==='instagram-nasa-grid'){const close=page.getByRole('button',{name:'Close',exact:true});if(await close.count())await close.first().click();else await page.keyboard.press('Escape');await page.mouse.wheel(0,430);await page.waitForTimeout(2000)}row.http_status=response?.status();row.final_url=page.url();row.title=await page.title();row.visible_text=(await page.locator('body').innerText({timeout:3000})).slice(0,2000);row.file=id+'.png';await page.screenshot({path:dir+'/'+row.file,timeout:5000});row.sha256=createHash('sha256').update(await readFile(dir+'/'+row.file)).digest('hex');console.log(id,row.http_status,row.title)}catch(e){row.capture_error=e.name;console.log(id,e.name)}finally{records.push(row);await page.close();await writeFile(dir+'/captures.json',JSON.stringify({scope:'Unlabeled public capture inventory, not a scored dataset',cases:records},null,2)+'\n')}
}))
await browser.close()
