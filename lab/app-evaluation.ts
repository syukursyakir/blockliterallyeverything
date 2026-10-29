import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { defaultSettings, matchingRule, presets, type CheckResult, type Settings } from '../src/shared.ts'

export const evaluationSettings = { ...defaultSettings, rules: presets.map(rule => ({ ...rule, enabled: true })) }
export const sha256 = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex')
export type EvaluationCase = { id: string; file: string; sha256: string; family: string; split: string; origin: string; labels: Record<string, boolean | null>; needs_visual_label?: boolean; label_note: string; source?: string; source_sha256?: string; adult_provenance?: string; rights?: unknown }
export async function preflight(manifestPath: string) {
  const source = await readFile(manifestPath, 'utf8')
  const manifest = JSON.parse(source) as { cases: EvaluationCase[] }
  if (!Array.isArray(manifest.cases) || !manifest.cases.length) throw new Error('Empty or invalid corpus.')
  const ids = new Set<string>(), hashes = new Set<string>()
  const cases = []
  for (const item of manifest.cases) {
    if (!item.id || ids.has(item.id) || !item.family || !item.split || !item.origin || !item.label_note || item.needs_visual_label !== false) throw new Error('Cases require unique IDs, provenance, split and reviewed labels.')
    ids.add(item.id)
    if (!item.labels || presets.some(rule => !Object.hasOwn(item.labels, rule.id) || ![true, false, null].includes(item.labels[rule.id]))) throw new Error('Every app preset requires an explicit boolean or ambiguous label.')
    const root = path.dirname(path.resolve(manifestPath))
    const file = path.resolve(root, item.file)
    if (!file.startsWith(root + path.sep)) throw new Error('Corpus path escapes its directory.')
    const bytes = await readFile(file)
    if (sha256(bytes) !== item.sha256 || hashes.has(item.sha256)) throw new Error('Changed or duplicate corpus image.')
    hashes.add(item.sha256)
    // shortcut: only already-prepared PNGs; add explicit preparation when testing other capture sizes.
    if (bytes.length < 24 || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' || bytes.subarray(12, 16).toString() !== 'IHDR') throw new Error('Expected prepared PNG.')
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20)
    if (!width || !height || width > 1280 || height > 1280 || bytes.length > 15_000_000) throw new Error('PNG exceeds app capture bounds.')
    cases.push({ item, bytes, width, height })
  }
  return { manifest, manifestSha256: sha256(source), cases }
}
export function predictions(result: CheckResult, settings: Settings = evaluationSettings) {
  const match = matchingRule(result, settings)
  return { matchedRule: match?.id ?? null, perRule: Object.fromEntries(settings.rules.map(rule => [rule.id,
    Boolean(matchingRule({ ...result, verdicts: result.verdicts.filter(v => v.ruleId === rule.id) }, { ...settings, rules: [rule] }))])) }
}
export function rate(successes: number, total: number) {
  if (!total) return { numerator: successes, denominator: total, rate: null, wilson95: null }
  const p = successes / total, z = 1.959963984540054, d = 1 + z*z/total
  const center = (p + z*z/(2*total))/d, half = z*Math.sqrt(p*(1-p)/total + z*z/(4*total*total))/d
  return { numerator: successes, denominator: total, rate: p, wilson95: [Math.max(0, center-half), Math.min(1, center+half)] }
}
export type ScoredRow = { caseId: string; labels: Record<string, boolean | null>; predicted?: Record<string, boolean>; error?: string }
export function summarize(rows: ScoredRow[]) {
  return Object.fromEntries(presets.map(rule => {
    let positives=0, negatives=0, caught=0, falseBlocks=0, errors=0, ambiguous=0
    for (const row of rows) {
      const truth = row.labels[rule.id]
      if (truth === null) { ambiguous++; continue }
      if (truth) positives++; else negatives++
      if (row.error || !row.predicted) { errors++; continue }
      if (truth && row.predicted[rule.id]) caught++
      if (!truth && row.predicted[rule.id]) falseBlocks++
    }
    return [rule.id, { recall: rate(caught,positives), falseBlockRate: rate(falseBlocks,negatives), precision: rate(caught,caught+falseBlocks), labeledErrors:errors, ambiguous,
      note:'Recall includes errored positives as uncaught; false-block rate alone does not describe errors. Cases may be correlated; intervals are descriptive.' }]
  }))
}
