import { execFileSync } from 'node:child_process'
import { readFile, open, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { transform } from 'esbuild'
import { parseArgs } from 'node:util'
import path from 'node:path'
import assert from 'node:assert/strict'
import { replay, currentComparator, type Comparator } from './session-replay.ts'
import { gridScenarios, parityScenarios } from './session-scenarios.ts'
const { values } = parseArgs({ options: { output: { type: 'string' } } })
if (!values.output) throw new Error('Provide --output NEW_JSON. This runner performs no provider or network calls.')
const output = path.resolve(values.output)
await mkdir(path.dirname(output), { recursive: true }); await (await open(output, 'wx', 0o600)).close()
const baselineCommit = '2a1aced76d7930799fc3d645ca070fbc74462692'
const source = execFileSync('git', ['show', baselineCommit + ':electron/screen-cache.ts'], { encoding: 'utf8' })
const compiled = await transform(source, { loader: 'ts', format: 'esm', target: 'es2022' })
const baseline = await import('data:text/javascript;base64,' + Buffer.from(compiled.code).toString('base64')) as Comparator
const cases: unknown[] = [], traces: unknown[] = []
const grid = gridScenarios(); assert.equal(grid.length, 576)
for (const scenario of [...grid, ...parityScenarios]) for (const [version, comparator] of [['pre-fix', baseline], ['current', currentComparator]] as const) {
  const { events, ...metrics } = replay(scenario, comparator)
  cases.push({ version, group: grid.includes(scenario) ? 'constructed-grid' : 'control', ...metrics })
  if (parityScenarios.includes(scenario)) traces.push({ version, ...metrics, events })
}
const codeSha256: Record<string, string> = {}
for (const file of ['lab/session-replay.ts', 'lab/session-scenarios.ts', 'lab/run-session-replay.ts', 'electron/main.ts', 'electron/screen-cache.ts']) codeSha256[file] = createHash('sha256').update(await readFile(file)).digest('hex')
const meta = { scope: 'Free synthetic ONE-display scheduling/cache replay, fixture verdicts and frame bytes. Not real media timing, model accuracy, provider latency, actual PNG codec, native capture or continuous protection guarantee.', sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), baselineCommit, codeSha256, gridVersionCases: grid.length * 2, controlVersionCases: parityScenarios.length * 2, providerCalls: 0, intervalMs: 3000, cacheMs: 30000, timeoutMs: 10000, fixturePositiveScore: 0.95, fixtureNegativeScore: 0.02, warningDefinition: 'Potential interval after15s since first unresolved discard, not a rendered UI observation.', censoredGaps: 'Initial and terminal intervals explicitly included, blocking stops at first match.' }
await writeFile(output, '{"meta":' + JSON.stringify(meta) + ',\n"cases":[\n' + cases.map(r => JSON.stringify(r)).join(',\n') + '\n],\n"traces":' + JSON.stringify(traces) + '}\n', { mode: 0o600 })
console.log(JSON.stringify({ output, gridCases: grid.length * 2, controls: parityScenarios.length * 2, providerCalls: 0 }))
