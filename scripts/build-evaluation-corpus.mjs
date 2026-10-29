import { chromium } from '@playwright/test'
import { mkdir, writeFile, readFile, copyFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { existsSync } from 'node:fs'

const destination = process.argv[2] || '/workspace/.cache/ble-evaluation/corpus'
await mkdir(destination, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.BLE_TEST_BROWSER || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] })
const cases = []
const base = (body, title, dark = true) => `<!doctype html><html><head><meta charset="UTF-8"><style>
*{box-sizing:border-box}body{margin:0;font:18px Arial,sans-serif;background:${dark ? '#101010' : '#fff'};color:${dark ? '#eee' : '#161616'}}header{height:70px;border-bottom:1px solid #8885;padding:20px 30px;display:flex;align-items:center;gap:35px}header strong{font-size:28px}input{border:1px solid #8888;border-radius:25px;padding:10px 20px;background:transparent;color:inherit;min-width:350px}main{padding:30px 50px}h1{font-size:32px}p{line-height:1.7}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:25px}.thumb{height:155px;background:linear-gradient(125deg,#42687c,#dda781);border-radius:10px;display:grid;place-items:center;font-size:38px}.video{height:400px;background:#163048;display:grid;place-items:center;font-size:80px;color:white}.feed{max-width:480px;margin:auto;border:1px solid #8885;padding:20px}.post{height:370px;background:linear-gradient(160deg,#708e95,#d8ba95);display:grid;place-items:center;font-size:60px}aside{font-size:14px;color:#999}code,pre{font:20px monospace;line-height:1.8}.pill{padding:10px 15px;border:1px solid #8885;border-radius:8px;margin:15px 0}.brand{color:#e33}button{padding:10px 18px;background:#eee;border:1px solid #aaa;border-radius:5px;color:#111}article{max-width:780px}blockquote{border-left:4px solid #888;padding:15px}
</style><title>${title}</title></head><body>${body}</body></html>`
const add = async (id, body, label, split, dark = true) => {
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 }, deviceScaleFactor: 1 })
  try {
    await page.setContent(base(body, id, dark))
    await page.screenshot({ path: path.join(destination, id + '.png') })
    cases.push({ id, file: id + '.png', origin: 'self-authored synthetic browser UI', family: id, split, labels: { explicit: false, video: false, social: false, cats: false, ...label } })
  } finally { await page.close() }
}
try {
  await add('youtube-home', '<header><strong><span class="brand">▶</span> YouTube</strong><input placeholder="Search"><span>Sign in</span></header><main><div class="pill">All　 Music　 Science　 Live　 Gaming</div><div class="grid">'+['A quiet walk through the mountains','How space telescopes work','Building a wooden chair','An afternoon in the garden','A simple pasta recipe','The science of rain'].map((title,i)=>`<div><div class="thumb">${['△','◎','▧','❀','○','☂'][i]}</div><h3>${title}</h3><aside>Example channel · 12K views</aside></div>`).join('')+'</div></main>', { video: true }, 'development')
  await add('youtube-player', '<header><strong><span class="brand">▶</span> YouTube</strong><input placeholder="Search"><span>Sign in</span></header><main><div class="video">▶</div><div class="pill">▶　0:32 / 8:14　 ━━━━━━━━━　 ⚙</div><h2>A tour of the solar system</h2><p>Example science channel　<button>Subscribe</button>　♡ Like　 Share</p></main>', { video: true }, 'holdout', false)
  await add('youtube-shorts', '<header><strong><span class="brand">▶</span> YouTube</strong><input placeholder="Search"></header><main><div style="margin:auto;width:320px"><h2>Shorts</h2><div class="post">△</div><p>@example　A beautiful mountain morning　♡　↗</p></div></main>', { video: true }, 'holdout')
  await add('instagram-feed', '<header><strong>Instagram</strong><span>Home　 Explore　 Reels　 Messages</span></header><main><div class="feed"><p>example_garden　 •••</p><div class="post">❀</div><p>♡　♧　↗　　♧</p><strong>2,140 likes</strong><p>example_garden A little sunshine today.<br>View all 24 comments<br>Add a comment…</p></div></main>', { social: true }, 'development', false)
  await add('tiktok-feed', '<header><strong>TikTok</strong><input placeholder="Search"><button>Log in</button></header><main><div class="feed"><p>For You　 Following　 LIVE</p><div class="post" style="background:#305b70">▶</div><p>@example_science　♡ 12K<br>A look at the night sky #space<br>♫ original sound　Comments 240　Share</p></div></main>', { social: true }, 'holdout')
  await add('generic-video', '<header><strong>Local Video Player</strong><span>File　 Playback　 Audio　 Help</span></header><main><div class="video">△</div><p>▶　00:40 / 04:20　 ━━━━━━━━━━━　 ⛶</p><h2>holiday-mountains.mp4</h2></main>', {}, 'holdout', false)
  await add('article-youtube', '<header><strong>Reference Library</strong><input placeholder="Search articles"></header><main><article><h1>YouTube</h1><p>YouTube is an online video-sharing platform. This article discusses its history, business model, and impact on media.</p><h2>History</h2><p>The service launched in 2005. The name YouTube appears here as the subject of an encyclopedia article, rather than a video feed or player.</p><h2>See also</h2><p>Online media · TikTok · Instagram</p></article></main>', {}, 'development', false)
  await add('settings-list', '<header><strong>Focus Settings</strong><span>Local protection</span></header><main><h1>Your blocked websites</h1><p>Choose the sites you want to avoid.</p><div class="pill">YouTube　Enabled　✓</div><div class="pill">Instagram　Enabled　✓</div><div class="pill">TikTok　Enabled　✓</div><button>Save settings</button><p>No feed or video is displayed on this page.</p></main>', {}, 'holdout')
  await add('code-list', '<header><strong>Code Editor</strong><span>blocklist.json　 README.md</span></header><main><pre>{\n  "blockedSites": [\n    "youtube.com",\n    "instagram.com",\n    "tiktok.com"\n  ],\n  "mode": "local"\n}</pre><p>Terminal　Tests passed: 10</p></main>', {}, 'development')
  await add('news-social', '<header><strong>Daily Technology</strong><span>News　 Business　 Science</span></header><main><article><h1>How Instagram and TikTok changed online advertising</h1><p>A report on social-media companies and their advertising businesses.</p><p>Researchers compared platform policies. The article mentions Instagram and TikTok but contains no embedded feed or video.</p><blockquote>“Names in an article are not the services themselves.”</blockquote></article></main>', {}, 'holdout', false)
  await add('work-document', '<header><strong>Notes</strong><span>File　 Edit　 View</span></header><main><h1>Project notes</h1><p>□ Finish the proposal<br>□ Review the budget<br>□ Take a short walk</p><h2>Research questions</h2><p>What is the next useful step? Keep the task small and test it.</p></main>', {}, 'development', false)
  await add('ambiguous-player', '<main><div class="video" style="height:600px">▶</div><p>00:10 / 03:45　 ━━━━━━━━━━　 ⚙</p></main>', { video: null, social: null }, 'ambiguity')
  for (const [id, source, split] of [['app-dashboard','dashboard.png','development'],['app-cover','blocking-screen.png','holdout']]) {
    await copyFile(path.join('docs/images', source), path.join(destination,id+'.png'))
    cases.push({ id, file: id+'.png', origin:'own application screenshot', family:'own-app',split, labels:{ explicit:false,video:false,social:false,cats:false } })
  }
  for (const item of cases) item.sha256 = createHash('sha256').update(await readFile(path.join(destination,item.file))).digest('hex')
  await writeFile(path.join(destination,'manifest.json'), JSON.stringify({ version:1, scope:'Small development/synthetic holdout suite, not a real-world reliability benchmark. Explicit-content cases are negative-only.', cases },null,2)+'\n')
  console.log(`Created ${cases.length} explicitly labeled cases in ${destination}`)
} finally { await browser.close() }
