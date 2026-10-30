import { parseArgs } from 'node:util'
import { readFile, open, mkdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import assert from 'node:assert/strict'
import { replay, currentComparator } from './session-replay.ts'
import { gridScenarios, parityScenarios, timingHoldout } from './session-scenarios.ts'
const { values } = parseArgs({ options: { output: { type: 'string' } } })
if (!values.output) throw new Error('Provide --output NEW_JSON. Offline synthetic experiment only.')
const offsets = [250, 500, 750, 1000] as const
const known = gridScenarios(), holdout = timingHoldout()
assert.equal(known.length, 576); assert.equal(holdout.length, 432)
const output = path.resolve(values.output)
await mkdir(path.dirname(output), { recursive: true }); await (await open(output, 'wx', 0o600)).close()
const cases = [], traces = []
for (const [group, scenarios] of [['development', known], ['timing-holdout', holdout], ['control', parityScenarios]] as const) for (const scenario of scenarios) for (const version of ['current', 'candidate'] as const) {
  const { events, ...metrics } = replay(scenario, currentComparator, version === 'candidate' ? offsets : [])
  cases.push({ group, version, ...metrics })
  if (group === 'control') traces.push({ group, version, ...metrics, events })
}
const codeSha256: Record<string, string> = {}
for (const f of ['lab/session-replay.ts', 'lab/session-scenarios.ts', 'lab/run-retry-experiment.ts', 'electron/screen-cache.ts', 'docs/RETRY-PHASE-PLAN.md']) codeSha256[f] = createHash('sha256').update(await readFile(f)).digest('hex')
const meta = { scope: 'Free simulator hypothesis, same synthetic frames/verdicts. Candidate NOT wired into production. Disjoint timing parameters are not real-media/accuracy holdout.', offsetsMs: offsets, codeSha256, providerCalls: 0, developmentVersionCases: 1152, holdoutVersionCases: 864, controlVersionCases: parityScenarios.length * 2 }
await writeFile(output, '{"meta":' + JSON.stringify(meta) + ',\n"cases":[\n' + cases.map(row => JSON.stringify(row)).join(',\n') + '\n],\n"traces":' + JSON.stringify(traces) + '}\n', { mode: 0o600 })
console.log(JSON.stringify({ output, cases: cases.length, providerCalls: 0 }))
