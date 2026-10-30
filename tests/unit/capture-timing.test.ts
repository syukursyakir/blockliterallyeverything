import {describe,it,expect} from 'vitest'
import {capturePairs} from '../../lab/capture-timing'
describe('diagnostic capture gap pairing',()=>{
 it('chooses first at-or-after target, never an earlier closer or favorable sample',()=>{
  expect(capturePairs([0,190,260,400],[200],100)).toEqual([
   {from:0,requestedMs:200,to:2,actualMs:260,status:'measured'},
   {from:1,requestedMs:200,to:3,actualMs:210,status:'measured'},
   {from:2,requestedMs:200,to:null,actualMs:null,status:'horizon-censored'},
   {from:3,requestedMs:200,to:null,actualMs:null,status:'horizon-censored'}])
 })
 it('retains inclusive tolerance, overshoot and every censored denominator',()=>{
  const rows=capturePairs([0,350,701],[200,800,1600],150)
  expect(rows).toHaveLength(9)
  expect(rows[0]).toMatchObject({to:1,actualMs:350,status:'measured'})
  expect(rows[3]).toMatchObject({to:2,actualMs:351,status:'out-of-tolerance'})
  expect(rows.filter(r=>r.status==='horizon-censored')).toHaveLength(7)
  expect(capturePairs([])).toEqual([])
 })
 it('rejects reversed/duplicate/nonfinite clocks and invalid gap bounds',()=>{
  for(const times of [[1,1],[2,1],[0,NaN],[Infinity]])expect(()=>capturePairs(times)).toThrow()
  for(const gaps of [[0],[-1],[NaN],[Infinity]])expect(()=>capturePairs([0,200],gaps)).toThrow()
  expect(()=>capturePairs([0,200],[200],-1)).toThrow()
  expect(()=>capturePairs([0,200],[200],NaN)).toThrow()
 })
})
