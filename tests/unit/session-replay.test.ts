import { expect, it } from 'vitest'
import { frameAt, replay, currentComparator, type Scenario } from '../../lab/session-replay'
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

it('experimental discard-only phase shift resets on a settled acceptance and preserves stop boundaries',()=>{
 const offsets=[250,500,750,1000]
 const settled=parityScenarios.find(s=>s.id==='settled-cut-block')!
 expect(replay(settled,undefined,offsets).firstMatchAtMs).toBe(replay(settled).firstMatchAtMs!+250)
 const normal=parityScenarios.find(s=>s.id==='static-positive-cache')!
 expect(replay(normal,undefined,offsets).events).toEqual(replay(normal).events)
 const stopped={...base,kind:'settled-cut' as const,cancelAtMs:6700,horizonMs:7000,moving:true}
 expect(replay(stopped,undefined,offsets).observationEndMs).toBe(6700)
 expect(replay(stopped,undefined,offsets).ended).toBe('cancel')
 const cycle=replay({...base,horizonMs:20000},{...currentComparator,changedSubstantially:()=>true,sameTranslatedFrame:()=>false},offsets)
 expect(cycle.events.filter(e=>e.kind==='request').map(e=>e.at)).toEqual([0,3550,7350,11400,15700,19250])
 const observed=replay(parityScenarios.find(s=>s.id==='settled-cut-observe')!,undefined,offsets)
 expect(observed.events.some(e=>e.kind==='request'&&e.at===10150)).toBe(true)
 expect(()=>replay(base,undefined,[-1])).toThrow()
 expect(()=>replay(base,undefined,[1001])).toThrow()
})

it('escalation waits15s from unresolved discard, starts at250, and leaves healthy traces unchanged',()=>{
 const offsets=[250,500,750,1000]
 for(const s of parityScenarios.filter(s=>s.id!=='explicit-phase-lock'))expect(replay(s,undefined,offsets,15000).events).toEqual(replay(s).events)
 const lock=parityScenarios.find(s=>s.id==='explicit-phase-lock')!
 const baseTrace=replay(lock),candidate=replay(lock,undefined,offsets,15000)
 const activation=baseTrace.events.find(e=>e.kind==='discard')!.at+15000
 expect(candidate.events.filter(e=>e.at<activation)).toEqual(baseTrace.events.filter(e=>e.at<activation))
 const firstActiveDiscard=candidate.events.find(e=>e.kind==='discard'&&e.at>=activation)!
 expect(candidate.events.some(e=>e.kind==='request'&&e.at===firstActiveDiscard.at+3250)).toBe(true)
 expect(candidate.firstMatchAtMs).not.toBeNull()
 const stopped=replay({...lock,cancelAtMs:20000,horizonMs:24000},undefined,offsets,15000)
 expect(stopped.ended).toBe('cancel');expect(stopped.observationEndMs).toBe(20000)
 expect(stopped.events.every(e=>e.at<=20000)).toBe(true)
 expect(()=>replay(base,undefined,offsets,NaN)).toThrow()
})
