import {describe,it,expect} from 'vitest'
import {changedSubstantially,sameTranslatedFrame} from '../../electron/screen-cache'

const width=32
function frame(dx=0,dy=0) {
 const bytes=new Uint8Array(width*width*4).fill(240)
 for(let y=10;y<22;y++)for(let x=10;x<22;x++){
  const nx=x+dx,ny=y+dy
  if(nx<0||nx>=width||ny<0||ny>=width)continue
  const i=(ny*width+nx)*4
  bytes[i]=x%2?15:80;bytes[i+1]=y%3?30:110;bytes[i+2]=(x+y)%3?40:170
 }
 return bytes
}
describe('freshness comparison of fully visible translated content',()=>{
 it('recognizes horizontal/vertical movement that exceeded the original difference guard',()=>{
  for(const [dx,dy] of [[8,0],[-8,0],[0,8],[0,-8]]){
   expect(changedSubstantially(frame(),frame(dx,dy))).toBe(true)
   expect(sameTranslatedFrame(frame(),frame(dx,dy),width)).toBe(true)
  }
 })
 it('rejects vanished content, unrelated replacement and content moved partly offscreen',()=>{
  expect(sameTranslatedFrame(frame(),new Uint8Array(width*width*4).fill(240),width)).toBe(false)
  const replacement=frame(8)
  for(let y=10;y<22;y++)for(let x=18;x<30;x++)replacement[(y*width+x)*4+1]=230
  expect(sameTranslatedFrame(frame(),replacement,width)).toBe(false)
  expect(sameTranslatedFrame(frame(),frame(15),width)).toBe(false)
  expect(sameTranslatedFrame(frame(15),frame(),width)).toBe(false)
 })
 it('rejects newly exposed content in the padding and a changed background',()=>{
  const after=frame(8);after.fill(0,0,width*4*3)
  expect(sameTranslatedFrame(frame(),after,width)).toBe(false)
  expect(sameTranslatedFrame(new Uint8Array(width*width*4),new Uint8Array(width*width*4).fill(255),width)).toBe(false)
 })
 it('permits small resampling differences and ignores alpha, without accepting altered content',()=>{
  const after=frame(8)
  for(let i=0;i<after.length;i+=4){for(let c=0;c<3;c++)after[i+c]+=2;after[i+3]=0}
  expect(sameTranslatedFrame(frame(),after,width)).toBe(true)
 })
 it('rejects missing, malformed and oversized dimensions',()=>{
  for(const w of [0,-1,NaN,3,31,129])expect(sameTranslatedFrame(frame(),frame(),w)).toBe(false)
  expect(sameTranslatedFrame(frame(),new Uint8Array(4),width)).toBe(false)
  expect(sameTranslatedFrame(new Uint8Array(),new Uint8Array(),width)).toBe(false)
 })
})
