import { describe, expect, it } from 'vitest'
import { validateEvaluationBudget } from '../../lab/evaluation-budget'
import { RESERVED_PER_REQUEST } from '../../electron/jev'
const current={requests:45,reservedUsd:45*RESERVED_PER_REQUEST,inputTokens:137877}
describe('cumulative evaluation authorization',()=>{
 it('accepts an authorized cap increase without resetting history or counters',()=>{
  const budget={capUsd:3,priorUsage:{retainedReservations:62},current,authorizationHistory:[{from:0.5,to:3,atRequests:45}]}
  expect(validateEvaluationBudget(budget)).toEqual(budget)
  expect(validateEvaluationBudget({...budget,capUsd:0.5}).current.requests).toBe(45)
 })
 it.each([0,-1,3.01,NaN,Infinity,'3'])('rejects unapproved or invalid cap %s',capUsd=>{
  expect(()=>validateEvaluationBudget({capUsd,priorUsage:{retainedReservations:62},current})).toThrow()
 })
 it('rejects missing prior history and corrupted or over-budget accounting',()=>{
  expect(()=>validateEvaluationBudget({capUsd:3,current})).toThrow()
  expect(()=>validateEvaluationBudget({capUsd:3,priorUsage:{},current:{...current,reservedUsd:0}})).toThrow()
  expect(()=>validateEvaluationBudget({capUsd:0.1,priorUsage:{},current})).toThrow(/exceeds/)
 })
})
