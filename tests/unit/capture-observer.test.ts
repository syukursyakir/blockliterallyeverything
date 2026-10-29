import { expect, it } from 'vitest'
import { observeCaptures } from '../../lab/capture-observer'
import { changedSubstantially } from '../../electron/screen-cache'
it('observes actual returned sources without substitution, bounds metadata and tolerates audit failures', async () => {
 let pixels=new Uint8Array([0,0,0,255,100,100,100,255]), fail=false
 const source={display_id:'one',thumbnail:{resize:()=>{if(fail)throw new Error('audit only');return {toBitmap:()=>pixels}}}}
 const sources=[source]
 const capturer={getSources:async (_:unknown)=>sources}
 const rows=observeCaptures(capturer)
 const options={thumbnailSize:{width:1280}}
 expect(await capturer.getSources(options)).toBe(sources)
 const before=pixels;pixels=new Uint8Array([30,30,30,255,130,130,130,255])
 expect(await capturer.getSources(options)).toBe(sources)
 expect(rows[1].meanRgbDifference!>0.08).toBe(changedSubstantially(before,pixels))
 expect(rows[1].meanRgbDifference).toBeCloseTo(30/255)
 const count=rows.length
 await capturer.getSources({thumbnailSize:{width:64}});expect(rows.length).toBe(count)
 fail=true;expect(await capturer.getSources(options)).toBe(sources);expect(rows.at(-1)?.auditError).toBe(true)
 fail=false
 for(let i=0;i<20;i++)await capturer.getSources(options)
 expect(rows.length).toBe(12)
 expect(JSON.stringify(rows)).not.toContain('pixels')
})
