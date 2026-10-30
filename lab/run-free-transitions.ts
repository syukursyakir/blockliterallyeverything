// Offline screenshot-comparator probe: no provider client, inference or native enforcement.
import { chromium } from '@playwright/test'
import { transform } from 'esbuild'
import { parseArgs } from 'node:util'
import { execFileSync } from 'node:child_process'
import { readFile, writeFile, open, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { paintReviewedVideo } from './video-scene.ts'
import { changedSubstantially, lostLocalDetail, sameTranslatedFrame } from '../electron/screen-cache.ts'
import reviewedVideos from './reviewed-videos.json' with { type: 'json' }

const { values } = parseArgs({ options: { video: { type: 'string' }, output: { type: 'string' }, review: { type: 'string' } } })
if (!values.video || !values.output) throw new Error('Provide --video PINNED_CC0_WEBM --output NEW_JSON; no downloads or model calls.')
const output = path.resolve(values.output)
const bytes = await readFile(values.video)
const hash = (value: Buffer | Uint8Array | string) => createHash('sha256').update(value).digest('hex')
assert(bytes.length <= 12 * 1024 * 1024 && bytes.subarray(0, 4).toString('hex') === '1a45dfa3')
assert.equal(hash(bytes), reviewedVideos['safe-video'].sha256, 'Changed/unreviewed media; stop before browser.')
// Build the historical comparator from the pinned local Git object, not a hand-written approximation.
const baselineCommit = '2a1aced76d7930799fc3d645ca070fbc74462692'
const baselineSource = execFileSync('git', ['show', baselineCommit + ':electron/screen-cache.ts'], { encoding: 'utf8' })
const compiled = await transform(baselineSource, { loader: 'ts', format: 'esm', target: 'es2022' })
const baseline = await import('data:text/javascript;base64,' + Buffer.from(compiled.code).toString('base64')) as {
  changedSubstantially(a: Uint8Array, b: Uint8Array): boolean
  sameTranslatedFrame(a: Uint8Array, b: Uint8Array, width: number): boolean
}
await mkdir(path.dirname(output), { recursive: true })
const handle = await open(output, 'wx', 0o600); await handle.close()
const browser = await chromium.launch({
  executablePath: process.env.BLE_TEST_BROWSER || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
  args: ['--no-sandbox'], env: { ...process.env, TYPESAFE_API_KEY: '', GH_TOKEN: '' },
})
const rows: Record<string, unknown>[] = []
const phases = [0.25, 0.9, 1.55, 2.2, 2.85, 3.5]
const flats = [{ id: 'black', filter: 'brightness(0)' }, { id: 'white', filter: 'brightness(0) invert(1)' }, { id: 'gray', filter: 'brightness(0) invert(.5)' }]
let externalRequests = 0, completed = false
let renderer: Record<string, unknown> = {}
try {
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 }, offline: true })
  context.on('request', request => { if (/^https?:/.test(request.url())) externalRequests++ })
  await context.route('**/*', route => /^https?:/.test(route.request().url()) ? route.abort() : route.continue())
  const page = await context.newPage()
  renderer = { chromium: browser.version(), userAgent: await page.evaluate(() => navigator.userAgent), viewport: page.viewportSize(), resampling: 'Browser Canvas2D screenshot to64x64; not Electron nativeImage.resize.' }
  const settle = () => page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
  const capture = async () => {
    const png = await page.screenshot()
    return Uint8Array.from(await page.evaluate(async data => {
      const img = new Image(); img.src = data; await img.decode()
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 64
      const ctx = canvas.getContext('2d')!; ctx.drawImage(img, 0, 0, 64, 64)
      return Array.from(ctx.getImageData(0, 0, 64, 64).data)
    }, 'data:image/png;base64,' + png.toString('base64')))
  }
  const compare = (id: string, family: string, transition: string, ruleContext: string, before: Uint8Array, after: Uint8Array) => {
    const oldGlobal = baseline.changedSubstantially(before, after)
    const global = changedSubstantially(before, after)
    const local = !global && lostLocalDetail(before, after, 64)
    const oldDiscard = oldGlobal && !baseline.sameTranslatedFrame(before, after, 64)
    const discard = (global || local) && !sameTranslatedFrame(before, after, 64)
    let difference = 0
    for (let i = 0; i < before.length; i += 4) for (let c = 0; c < 3; c++) difference += Math.abs(before[i + c] - after[i + c])
    const row = { id, family, transition, ruleContext, samePage: true, beforeSha256: hash(before), afterSha256: hash(after), globalMeanRgbDifference: difference / (64 * 64 * 3 * 255), oldDiscard, discard, addedRecheck: discard && !oldDiscard, localTriggered: local }
    if (transition === 'steady' || transition === 'flat-hold') assert(!oldDiscard && !discard, 'Exact steady controls must remain eligible')
    rows.push(row)
  }
  let flowerImage = ''
  for (const family of ['watch-large', 'watch-compact', 'generic-local-player']) {
    await page.setContent('<html><body></body></html>')
    const videoOptions: Parameters<typeof paintReviewedVideo>[0] = { data: 'data:video/webm;base64,' + bytes.toString('base64'), start: 0.2, end: 4.5, rate: 1, context: family === 'watch-large' ? 'youtube' : 'youtube-compact' }
    await page.evaluate(paintReviewedVideo, videoOptions)
    if (family === 'generic-local-player') await page.evaluate(() => {
      document.querySelector('header')!.textContent = 'Local lesson player · Open file'
      document.querySelector('h2')!.textContent = 'Garden footage — local file'
      document.querySelectorAll('main p')[0].textContent = 'Play · Pause · Volume'
      document.querySelectorAll('main p')[1].textContent = 'Personal viewing notes'
    })
    await page.locator('video').evaluate(element => { const v = element as HTMLVideoElement; v.pause(); v.ontimeupdate = null; v.onseeked = null })
    const ruleContext = family === 'generic-local-player' ? 'author-labeled all-stock-rules-negative' : 'author-labeled video-positive,explicit/social-negative'
    for (const phase of phases) {
      await page.locator('video').evaluate(async (element, time) => {
        const v = element as HTMLVideoElement
        v.style.filter = ''; v.currentTime = time
        await new Promise<void>(resolve => { v.onseeked = () => resolve() })
      }, phase)
      await settle()
      const detailed = await capture()
      if (!flowerImage) flowerImage = await page.locator('video').evaluate(element => { const v = element as HTMLVideoElement; const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d')!.drawImage(v, 0, 0); return c.toDataURL() })
      for (const flat of flats) {
        await page.locator('video').evaluate((v, filter) => { v.style.filter = filter }, flat.filter)
        await settle(); const renderedFlat = await capture()
        const id = family + '-' + phase + '-' + flat.id
        compare(id + '-cut', family, 'detail-to-flat', ruleContext, detailed, renderedFlat)
        compare(id + '-hold', family, 'flat-hold', ruleContext, renderedFlat, renderedFlat)
        compare(id + '-resume', family, 'flat-to-detail', ruleContext, renderedFlat, detailed)
      }
      if (values.review && phase === phases[0]) {
        await mkdir(values.review, { recursive: true })
        await page.screenshot({ path: path.join(values.review, family + '-flat.png') })
      }
    }
  }
  // Self-authored negative lookalikes; these labels are not model predictions.
  const fixtures = [
    { id: 'notes-thumbnail', title: 'Research notes', body: '<p>Today: outline a chapter, review references, write a summary.</p>', panel: '<div style="height:230px;background:repeating-conic-gradient(#24583c 0 25%,#e7bd69 0 50%) 0/32px 32px"></div>', after: '<p>Image placeholder — notes remain open</p>' },
    { id: 'local-sign-in', title: 'Local account sign-in', body: '<p>Offline interface fixture. No account or credentials.</p>', panel: '<form style="color:#111;background:#eee;padding:24px"><h2>Sign in</h2><p>Email <input placeholder="name@example.invalid"></p><p>Password <input type="password"></p><button>Continue</button></form>', after: '<div style="height:230px;background:#eee;color:#111">Loading local form…</div>' },
    { id: 'quotation-article', title: 'An article about video websites', body: '<p>The quoted word “YouTube” is a mention in an article, not a watch page or feed.</p>', panel: '<pre style="white-space:pre-wrap;background:#eee;color:#111;padding:16px">'+('A research quotation: compare sources and take notes.\n'.repeat(12))+'</pre>', after: '<p>Example collapsed — article remains open</p>' },
    { id: 'photo-editor', title: 'Local photo editor', body: '<p>Flower photograph · Crop · Adjust · Export</p>', panel: '<img style="width:100%;height:230px;object-fit:cover" src="'+flowerImage+'">', after: '<p>Preview cleared — editor remains open</p>' },
    { id: 'file-gallery', title: 'Local file gallery', body: '<p>Sample illustrations · Filter by name</p>', panel: '<div style="height:230px;background:repeating-linear-gradient(45deg,#4473a5 0 16px,#e8b24e 16px 32px)"></div>', after: '<p>No files match the filter</p>' },
  ]
  for (const f of fixtures) {
    await page.setContent('<html><body style="margin:0;background:#0f0f0f;color:#eee;font:20px Arial"><header style="padding:20px;border-bottom:1px solid #444">'+f.title+'</header><main style="padding:24px">'+f.body+'<section id="panel" style="width:42vw;height:280px">'+f.panel+'</section></main></body></html>')
    await page.locator('img').evaluateAll(images => Promise.all(images.map(img => (img as HTMLImageElement).decode())))
    await settle(); const before = await capture()
    if (values.review) { await mkdir(values.review, { recursive: true }); await page.screenshot({ path: path.join(values.review, f.id + '-before.png') }) }
    await page.locator('#panel').evaluate((panel, content) => { panel.innerHTML = content }, f.after)
    await settle(); const after = await capture()
    compare(f.id + '-steady-before', f.id, 'steady', 'author-labeled all-stock-rules-negative', before, before)
    compare(f.id + '-change', f.id, 'safe-same-page-change', 'author-labeled all-stock-rules-negative', before, after)
    compare(f.id + '-steady-after', f.id, 'steady', 'author-labeled all-stock-rules-negative', after, after)
  }
  assert.equal(rows.length, 177)
  assert.equal(externalRequests, 0, 'Offline probe attempted external HTTP')
  completed = true
} finally {
  await browser.close()
  const summary = Array.from(new Set(rows.map(r => String(r.family)))).map(family => {
    const subset = rows.filter(r => r.family === family)
    return { family, rows: subset.length, uniquePairs: new Set(subset.map(r => r.beforeSha256 + ':' + r.afterSha256)).size, oldDiscards: subset.filter(r => r.oldDiscard).length, newDiscards: subset.filter(r => r.discard).length, addedRechecks: subset.filter(r => r.addedRecheck).length, transitions: Array.from(new Set(subset.map(r => String(r.transition)))).map(transition => { const cases = subset.filter(r => r.transition === transition); return { transition, rows: cases.length, oldDiscards: cases.filter(r => r.oldDiscard).length, newDiscards: cases.filter(r => r.discard).length, addedRechecks: cases.filter(r => r.addedRecheck).length } }) }
  })
  const codeSha256: Record<string, string> = {}
  for (const file of ['lab/run-free-transitions.ts', 'lab/video-scene.ts', 'electron/screen-cache.ts']) codeSha256[file] = hash(await readFile(file))
  await writeFile(output, JSON.stringify({ scope: 'Free offline Chromium screenshot comparator probe, not model accuracy or Windows enforcement. Controlled flat cuts, known CC0 media and synthetic safe lookalikes.', completed, sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), baselineCommit, baselineCodeSha256: hash(baselineSource), codeSha256, renderer, mediaSha256: hash(bytes), mediaRights: reviewedVideos['safe-video'].rights, phases, flats, providerCalls: 0, externalHttpRequests: externalRequests, summary, rows }, null, 2) + '\n', { mode: 0o600 })
}
console.log(JSON.stringify({ completed, providerCalls: 0, output, rows: rows.length }))
