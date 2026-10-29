import { describe, expect, it } from 'vitest'
import { defaultSettings, matchingRule, validateSettings } from '../../src/shared'

describe('settings boundaries', () => {
  it('preserves defaults and arbitrary custom rules', () => {
    const settings = structuredClone(defaultSettings)
    settings.rules.push({ id: 'games', name: 'Games', instruction: 'Block visible video games', enabled: true })
    expect(validateSettings(settings)).toEqual(settings)
  })
  it.each([NaN, Infinity, 0, 31, '3'])('rejects invalid interval %s', intervalSeconds => {
    expect(() => validateSettings({ ...defaultSettings, intervalSeconds })).toThrow()
  })
  it('rejects duplicate identifiers and empty instructions', () => {
    expect(() => validateSettings({ ...defaultSettings, rules: [defaultSettings.rules[0], defaultSettings.rules[0]] })).toThrow()
    expect(() => validateSettings({ ...defaultSettings, rules: [{ ...defaultSettings.rules[0], instruction: ' ' }] })).toThrow()
  })
})
describe('blocking decisions', () => {
  it('uses the user threshold including the boundary', () => {
    expect(matchingRule({ verdicts: [{ ruleId: 'explicit', probability: 0.4 }], elapsedMs: 3 }, defaultSettings)?.id).toBe('explicit')
    expect(matchingRule({ verdicts: [{ ruleId: 'explicit', probability: 0.39 }], elapsedMs: 3 }, defaultSettings)).toBeUndefined()
  })
  it.each([NaN, Infinity, -1, 2])('rejects invalid probability %s', probability => {
    expect(() => matchingRule({ verdicts: [{ ruleId: 'explicit', probability }], elapsedMs: 3 }, defaultSettings)).toThrow()
  })
  it('does not classify incomplete, duplicate or unrelated output as safe', () => {
    for (const verdicts of [[], [{ ruleId: 'unknown', probability: 0.1 }], [{ ruleId: 'explicit', probability: 0.1 }, { ruleId: 'explicit', probability: 0.1 }]]) {
      expect(() => matchingRule({ verdicts, elapsedMs: 1 }, defaultSettings)).toThrow()
    }
  })
})
