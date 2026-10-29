import { describe, expect, it } from 'vitest'
import { nativeExitGuard, nativeBudget, nativeMotion } from '../../lab/native-process'
import { RESERVED_PER_REQUEST } from '../../electron/jev'
describe('live native cleanup and explicit protocol accounting',()=>{
 it('rejects unsupported motion and mixing motion with startup-only evidence',()=>{
  expect(nativeMotion(undefined,false)).toBe('none')
  expect(nativeMotion('pan',false)).toBe('pan')
  expect(nativeMotion('switch-away',false)).toBe('switch-away')
  expect(()=>nativeMotion('unknown',false)).toThrow()
  expect(()=>nativeMotion('pan',true)).toThrow()
  expect(()=>nativeMotion('switch-away',true)).toThrow()
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
