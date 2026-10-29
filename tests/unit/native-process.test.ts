import { describe, expect, it } from 'vitest'
import { nativeExitGuard, nativeBudget, nativeMotion, nativeVideo } from '../../lab/native-process'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { RESERVED_PER_REQUEST } from '../../electron/jev'
describe('live native cleanup and explicit protocol accounting',()=>{
 it('rejects unsupported motion and mixing motion with startup-only evidence',()=>{
  expect(nativeMotion(undefined,false)).toBe('none')
  expect(nativeMotion('pan',false)).toBe('pan')
  expect(nativeMotion('switch-away',false)).toBe('switch-away')
  expect(nativeMotion('video',false)).toBe('video')
  expect(()=>nativeMotion('unknown',false)).toThrow()
  expect(()=>nativeMotion('pan',true)).toThrow()
  expect(()=>nativeMotion('switch-away',true)).toThrow()
  expect(()=>nativeMotion('video',true)).toThrow()
 })
 it('rejects video path traversal, changed bytes and wrong container headers before native launch',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'ble-video-'))
  try{
   const bytes=Buffer.from('1a45dfa300112233','hex'),hash=createHash('sha256').update(bytes).digest('hex')
   await writeFile(path.join(root,'reviewed.webm'),bytes)
   expect(await nativeVideo(root,'reviewed.webm',hash)).toEqual(bytes)
   await expect(nativeVideo(root,'../reviewed.webm',hash)).rejects.toThrow(/basename/)
   await expect(nativeVideo(root,'reviewed.webm','0'.repeat(64))).rejects.toThrow(/changed/)
   await writeFile(path.join(root,'reviewed.webm'),'not-video')
   await expect(nativeVideo(root,'reviewed.webm',hash)).rejects.toThrow(/changed/)
  }finally{await rm(root,{recursive:true,force:true})}
 })
 it('uses a cached child handle after the Playwright application dispatcher is disposed',()=>{
  let closed=false,calls=0
  const child:{exitCode:number|null;signalCode:string|null}={exitCode:null,signalCode:null}
  const app={process(){calls++;if(closed)throw new Error('Disposed dispatcher');return child}}
  const exited=nativeExitGuard(app);expect(exited()).toBe(false)
  closed=true;child.exitCode=0;expect(exited()).toBe(true);expect(calls).toBe(1)
 })
 it('recognizes signal termination and keeps a still-running child uncertain',()=>{
  const child:{exitCode:number|null;signalCode:string|null}={exitCode:null,signalCode:null}
  const exited=nativeExitGuard({process:()=>child});expect(exited()).toBe(false)
  child.signalCode='SIGTERM';expect(exited()).toBe(true)
 })
 it('allows the last reservation only for explicitly selected single-request mode',()=>{
  const ledger={requests:44,reservedUsd:44*RESERVED_PER_REQUEST,inputTokens:134310}
  expect(()=>nativeBudget(ledger,0.5,false)).toThrow(/budget limit/)
  expect(nativeBudget(ledger,0.5,true)).toMatchObject({maximumRequests:1})
  expect(nativeBudget(ledger,0.5,true).limitUsd).toBeCloseTo(45*RESERVED_PER_REQUEST)
  expect(ledger.requests).toBe(44)
  expect(()=>nativeBudget({requests:45,reservedUsd:45*RESERVED_PER_REQUEST,inputTokens:0},0.5,true)).toThrow(/budget limit/)
 })
})
