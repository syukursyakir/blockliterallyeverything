import { describe, expect, it } from 'vitest'
import { defaultSettings, presets, upgradeStarterRuleWording, validateSettings } from '../../src/shared'
const oldVideo='Block visible YouTube browsing, video playback, Shorts, and the YouTube home feed.'
const oldSocial='Block visible Instagram and TikTok feeds, including short-form video scrolling.'
describe('clarified starter rules on saved-preference loading',()=>{
 it('upgrades exact stock text while retaining names, enabled flags and all other settings',()=>{
  const saved={...structuredClone(defaultSettings),threshold:0.35,rules:[{id:'video',name:'My video boundary',instruction:oldVideo,enabled:true},{id:'social',name:'Social feeds',instruction:oldSocial,enabled:false}]}
  const upgraded=upgradeStarterRuleWording(saved)
  expect(upgraded.rules.map(r=>r.instruction)).toEqual(presets.filter(p=>['video','social'].includes(p.id)).map(p=>p.instruction))
  expect(upgraded.rules.map(({name,enabled})=>({name,enabled}))).toEqual(saved.rules.map(({name,enabled})=>({name,enabled})))
  expect(upgraded.threshold).toBe(0.35);expect(saved.rules[0].instruction).toBe(oldVideo)
 })
 it('preserves custom rules even when they reuse a stock ID or stock text under a custom ID',()=>{
  const saved={...structuredClone(defaultSettings),rules:[{id:'video',name:'Custom',instruction:'Block all video websites.',enabled:true},{id:'custom',name:'User text',instruction:oldVideo,enabled:true}]}
  expect(upgradeStarterRuleWording(saved)).toBe(saved)
 })
 it('is idempotent and does not change literal validation or user edits',()=>{
  const saved={...structuredClone(defaultSettings),rules:[{id:'video',name:'YouTube',instruction:oldVideo,enabled:true}]}
  expect(validateSettings(saved).rules[0].instruction).toBe(oldVideo)
  const upgraded=upgradeStarterRuleWording(saved);expect(upgradeStarterRuleWording(upgraded)).toBe(upgraded)
 })
})
