import {expect,it} from 'vitest'
import {recheckTiming} from '../../electron/recheck-timing'
it('keeps healthy/young/rolled-back clocks unchanged and treats timestamp0 as valid',()=>{
 expect(recheckTiming(3000,14999,0,3)).toEqual({waitMs:3000,phaseIndex:0,adjusted:false})
 expect(recheckTiming(3000,15000,0,0)).toEqual({waitMs:3250,phaseIndex:1,adjusted:true})
 expect(recheckTiming(3000,20000,null,3)).toEqual({waitMs:3000,phaseIndex:0,adjusted:false})
 expect(recheckTiming(3000,100,200,2)).toEqual({waitMs:3000,phaseIndex:0,adjusted:false})
})
it('cycles bounded extra waits without an earlier request and resets after all screens recover',()=>{
 let phase=0;const waits=[]
 for(let i=0;i<5;i++){const next=recheckTiming(3000,20000,0,phase);waits.push(next.waitMs);phase=next.phaseIndex}
 expect(waits).toEqual([3250,3500,3750,4000,3250])
 const reset=recheckTiming(3000,20000,null,phase)
 expect(recheckTiming(3000,40000,25000,reset.phaseIndex).waitMs).toBe(3250)
 for(const base of [1000,3000,30000])for(let p=0;p<4;p++){const v=recheckTiming(base,20000,0,p).waitMs;expect(v).toBeGreaterThanOrEqual(base);expect(v).toBeLessThanOrEqual(base+1000)}
})
it('rejects invalid state instead of scheduling a NaN/immediate timer',()=>{
 for(const [base,now,since,phase] of [[NaN,0,null,0],[999,0,null,0],[30001,0,null,0],[3000,NaN,null,0],[3000,0,NaN,0],[3000,0,null,-1],[3000,0,null,4],[3000,0,null,1.5]])expect(()=>recheckTiming(base!,now!,since,phase!)).toThrow()
})
