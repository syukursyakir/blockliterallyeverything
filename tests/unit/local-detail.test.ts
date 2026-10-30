import { expect, it } from 'vitest'
import { changedSubstantially, lostLocalDetail, sameTranslatedFrame } from '../../electron/screen-cache'
const width=64
function frame(offset=0) {
 const p=new Uint8Array(width*width*4).fill(15)
 for(let y=16;y<28;y++)for(let x=12;x<24;x++)for(let c=0;c<3;c++)p[(y*width+x+offset)*4+c]=(x+y)%2?180:60
 return p
}
it('finds localized removal below the whole-screen threshold while preserving textured motion',()=>{
 const before=frame(),flat=new Uint8Array(before.length).fill(15)
 expect(changedSubstantially(before,flat)).toBe(false)
 expect(lostLocalDetail(before,flat,width)).toBe(true)
 expect(sameTranslatedFrame(before,flat,width)).toBe(false)
 expect(lostLocalDetail(before,before,width)).toBe(false)
 const moving=frame()
 for(let y=16;y<28;y++)for(let x=12;x<24;x++)moving[(y*width+x)*4]+=10
 expect(lostLocalDetail(before,moving,width)).toBe(false)
 const shifted=frame(8)
 expect(lostLocalDetail(before,shifted,width)).toBe(true)
 expect(sameTranslatedFrame(before,shifted,width)).toBe(true)
})
it('ignores alpha and mild resampling; rejects malformed buffers conservatively',()=>{
 const after=frame();for(let i=0;i<after.length;i+=4){after[i]++;after[i+3]=0}
 expect(lostLocalDetail(frame(),after,width)).toBe(false)
 for(const w of [0,-1,NaN,3,63,129])expect(lostLocalDetail(frame(),frame(),w)).toBe(true)
 expect(lostLocalDetail(new Uint8Array(),new Uint8Array(),width)).toBe(true)
 expect(lostLocalDetail(frame(),new Uint8Array(4),width)).toBe(true)
})
it('does not claim to detect every replacement with similarly detailed content',()=>{
 const after=frame();for(let i=0;i<after.length;i+=4)after[i]=255-after[i]
 expect(lostLocalDetail(frame(),after,width)).toBe(false)
})
