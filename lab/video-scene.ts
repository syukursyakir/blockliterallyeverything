// Runs inside the isolated scene document, never the production renderer.
export async function paintReviewedVideo(options: { data: string; start: number; end: number; rate: number; context?: 'youtube' | 'youtube-compact' }) {
  const v = document.createElement('video')
  v.muted = true
  v.style.cssText = 'width:96vw;max-height:96vh;object-fit:contain'
  if (options.context) {
    document.body.style.cssText = 'margin:0;background:#0f0f0f;color:white;font:20px Arial;display:block;height:100vh'
    const header = document.createElement('header')
    header.textContent = '▶ YouTube                     Search                     Sign in'
    header.style.cssText = 'padding:20px;border-bottom:1px solid #444;font-size:28px'
    const main = document.createElement('main')
    main.style.cssText = 'padding:24px'
    v.style.cssText = options.context === 'youtube-compact' ? 'width:42vw;max-height:38vh;object-fit:contain' : 'width:78vw;max-height:65vh;object-fit:contain'
    const title = document.createElement('h2')
    title.textContent = 'A garden afternoon | YouTube'
    const details = document.createElement('p')
    details.textContent = 'Garden channel · Subscribe     Like     Share     Save'
    const comments = document.createElement('p')
    comments.textContent = 'Comments · Add a comment…'
    main.append(v, title, details, comments)
    document.body.replaceChildren(header, main)
  } else document.body.replaceChildren(v)
  v.src = options.data
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Video metadata timeout')), 8000)
    v.onloadedmetadata = () => { clearTimeout(timeout); resolve() }
    v.onerror = () => { clearTimeout(timeout); reject(new Error('Reviewed video decoding failed')) }
  })
  if (v.duration < options.end) throw new Error('Reviewed video too short')
  v.currentTime = options.start
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Video seek timeout')), 8000)
    v.onseeked = () => { clearTimeout(timeout); resolve() }
  })
  v.ontimeupdate = () => { if (v.currentTime >= options.end) v.currentTime = options.start }
  v.onseeked = () => { void v.play() }
  v.playbackRate = options.rate
  await v.play()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  return Date.now()
}
