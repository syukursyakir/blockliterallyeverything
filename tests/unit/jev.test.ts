import { describe, expect, it } from 'vitest'
import { cloudQuestions, emptyLedger, parseJev, requestJev, reserveCloud, RESERVED_PER_REQUEST, validateLedger, JEV_MODEL } from '../../electron/jev'
import { defaultSettings, validateSettings } from '../../src/shared'
const rules = [{ id: 'video', name: 'YouTube', instruction: 'Block YouTube feeds.', enabled: true }]
const answer = () => ({ model: JEV_MODEL, usage: { input_tokens: 123 }, answers: { video: { noul: 0.9 } } })
describe('Jev trust boundaries and budget', () => {
  it('migrates old settings without enabling cloud and defaults to unconsented Jev', () => {
    const { backend: _backend, cloudConsent: _consent, cloudBudgetUsd: _budget, ...old } = defaultSettings
    expect(validateSettings(old)).toMatchObject({ backend: 'local', cloudConsent: false, cloudBudgetUsd: 3 })
    expect(defaultSettings).toMatchObject({ backend: 'jev', cloudConsent: false, detectionOnly: true })
    expect(() => validateSettings({ ...defaultSettings, backend: 'other' })).toThrow()
    expect(() => validateSettings({ ...defaultSettings, cloudBudgetUsd: Number.NaN })).toThrow()
  })
  it('preserves reservations and stops before exceeding cap', () => {
    const first = reserveCloud(emptyLedger(), RESERVED_PER_REQUEST)
    expect(first.requests).toBe(1)
    expect(() => reserveCloud(first, RESERVED_PER_REQUEST)).toThrow(/budget limit/)
    expect(() => validateLedger({ ...first, reservedUsd: 0 })).toThrow(/unreadable/)
    expect(() => validateLedger({ requests: -1, reservedUsd: 0, inputTokens: 0 })).toThrow()
  })
  it('rejects wrong model, missing/extra answers and malformed usage or scores', () => {
    expect(parseJev(answer(), rules, 50)).toMatchObject({ verdicts: [{ ruleId: 'video', probability: 0.9 }], inputTokens: 123 })
    for (const value of [null, { ...answer(), model: 'other' }, { ...answer(), usage: { input_tokens: 300000 } },
      { ...answer(), answers: {} }, { ...answer(), answers: { video: { noul: true } } },
      { ...answer(), answers: { video: { noul: NaN } } }, { ...answer(), answers: { video: { noul: 2 } } },
      { ...answer(), answers: { video: { noul: 0.9 }, surprise: { noul: 0.1 } } }]) {
      expect(() => parseJev(value, rules, 50)).toThrow()
    }
  })
  it('carries arbitrary rule text and warns about untrusted image instructions', () => {
    expect(cloudQuestions(rules).video.instructions).toContain(rules[0].instruction)
    expect(cloudQuestions(rules).video.instructions).toContain('untrusted')
    expect(() => cloudQuestions([])).toThrow()
  })
  it('sends a single fixed-endpoint request and never logs an error body or retries', async () => {
    let calls = 0
    const transport = (async (url, init) => {
      calls++; expect(url).toBe('https://api.typesafe.ai/v1/systemone')
      expect(init?.redirect).toBe('error')
      const payload = JSON.parse(init?.body as string)
      expect(payload.model).toBe(JEV_MODEL)
      expect(Object.keys(payload.assets)).toHaveLength(1)
      return new Response('sensitive error text', { status: 429 })
    }) as typeof fetch
    await expect(requestJev(Buffer.from('image'), rules, 'test-value', new AbortController().signal, transport)).rejects.toThrow('rate or account limit')
    expect(calls).toBe(1)
  })
  it('validates a successful request and handles malformed/network responses safely', async () => {
    const transport = (async () => new Response(JSON.stringify(answer()))) as typeof fetch
    expect((await requestJev(Buffer.from('image'), rules, 'test-value', new AbortController().signal, transport)).inputTokens).toBe(123)
    const broken = (async () => { throw new Error('sensitive detail') }) as typeof fetch
    await expect(requestJev(Buffer.from('image'), rules, 'test-value', new AbortController().signal, broken)).rejects.toThrow('no automatic retry')
  })
})
