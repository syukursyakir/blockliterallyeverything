import { expect, it } from 'vitest'
import { frameAt, replay, type Scenario } from '../../lab/session-replay'
import { isBlankCapture } from '../../electron/screen-cache'
import { parityScenarios } from '../../lab/session-scenarios'
const base: Scenario = { id: 'unit', kind: 'neutral', responseMs: 300, moving: false, detectionOnly: true }
it('uses cache separately from fresh decisions and honors exact30s expiry', () => {
 const r=replay(base)
 expect(r.events.filter(e=>e.kind==='request').map(e=>e.at)).toEqual([0,30300])
 expect(r.accepted).toBe(2);expect(r.cacheHits).toBe(18)
 expect(r.freshGaps.closedMaxMs).toBe(30300)
 expect(r.observationGaps.closedMaxMs).toBe(3300)
})
it('honors stop during the final poll wait and response/horizon boundaries',()=>{
 const r=replay({...base,responseMs:1000,horizonMs:3500,cancelAtMs:3000})
 expect(r.ended).toBe('cancel');expect(r.observationEndMs).toBe(3000)
 expect(r.events.at(-1)).toEqual({at:3000,kind:'cancel'})
 expect(replay({...base,horizonMs:300}).accepted).toBe(1)
 const pending=replay({...base,horizonMs:3300})
 expect(pending.requests).toBe(1) // at3300 an exact unchanged frame uses the cache
 expect(pending.cacheHits).toBe(1)
 const moving=replay({...base,kind:'positive',moving:true,horizonMs:3300})
 expect(moving.requests).toBe(2);expect(moving.events.at(-1)?.kind).toBe('pending')
})
it('latches fixture verdict at capture, cancels in-flight work, and times out rather than accepting late',()=>{
 const s=parityScenarios.find(s=>s.id==='fresh-switch-block')!,r=replay(s)
 const discard=r.events.find(e=>e.kind==='discard')!
 expect(discard).toMatchObject({capturedState:'detail',responseState:'neutral',positive:true})
 expect(r.staleMatches).toBe(0);expect(r.events.filter(e=>e.kind==='accepted'&&e.positive)).toHaveLength(0)
 expect(replay(parityScenarios.find(s=>s.id==='cancel-in-flight')!).ended).toBe('cancel')
 const timeout=replay(parityScenarios.find(s=>s.id==='provider-timeout')!)
 expect(timeout.ended).toBe('timeout');expect(timeout.observationEndMs).toBe(10000);expect(timeout.accepted).toBe(0)
})
it('does not create post-block observations, tracks warning origin and nonblank states',()=>{
 const blocked=replay(parityScenarios.find(s=>s.id==='moving-positive-block')!)
 expect(blocked.ended).toBe('blocked-positive')
 expect(blocked.events.every(e=>e.at<=blocked.observationEndMs)).toBe(true)
 const lock=replay(parityScenarios.find(s=>s.id==='explicit-phase-lock')!)
 expect(lock.firstMatchAtMs).toBeNull();expect(lock.maxConsecutiveDiscards).toBeGreaterThan(1)
 expect(lock.firstWarningAtMs).toBe(lock.events.find(e=>e.kind==='discard')!.at+15000)
 for(const s of parityScenarios)for(const t of [0,350,3300,3600,10000])expect(isBlankCapture(frameAt(s,t).pixels)).toBe(false)
})
it('rejects invalid replay parameters',()=>{
 for(const patch of [{responseMs:NaN},{horizonMs:-1},{sessionMs:0},{kind:'periodic' as const,periodMs:100,flatMs:100}])expect(()=>replay({...base,...patch})).toThrow()
})
