import { open, readFile, rename, writeFile, unlink } from 'node:fs/promises'
import { parseArgs } from 'node:util'
import { execFileSync } from 'node:child_process'
import { validateEvaluationBudget } from './evaluation-budget.ts'
import { validateSettings, presets } from '../src/shared.ts'
import { cloudQuestions, requestJev, reserveCloud, JEV_MODEL, RESERVED_PER_REQUEST } from '../electron/jev.ts'
import { evaluationSettings, preflight, predictions, summarize, sha256, type ScoredRow } from './app-evaluation.ts'
const {values} = parseArgs({ options: { corpus:{type:'string'}, settings:{type:'string'}, output:{type:'string'}, ledger:{type:'string'}, 'allow-cloud':{type:'boolean'} } })
if (!values.corpus || !values.output) throw new Error('Use --corpus manifest.json --output new-report.json [--allow-cloud --ledger existing-ledger.json]. Dry-run is the default.')
const settings = values.settings ? validateSettings(JSON.parse(await readFile(values.settings, 'utf8'))) : evaluationSettings
if (settings.backend !== 'jev' || settings.rules.length !== presets.length || settings.rules.some(r => !r.enabled || !presets.some(p => p.id === r.id))) throw new Error('This evaluator requires all three Jev starter-policy IDs enabled; custom instructions may be supplied in --settings.')
const prepared = await preflight(values.corpus)
const plan = { cases:prepared.cases.length, manifestSha256:prepared.manifestSha256, model:JEV_MODEL, settings, questions:cloudQuestions(settings.rules), maximumNewReservationUsd:prepared.cases.length*RESERVED_PER_REQUEST }
if (!values['allow-cloud']) { console.log(JSON.stringify({dryRun:true,...plan},null,2)); process.exit(0) }
if (!values.ledger || !process.env.TYPESAFE_API_KEY) throw new Error('Live evaluation requires a ledger and configured TYPESAFE_API_KEY.')
const lock = await open(values.ledger+'.lock','wx',0o600)
const atomic = async (file:string,value:unknown) => { await writeFile(file+'.tmp',JSON.stringify(value,null,2)+'\n',{mode:0o600}); await rename(file+'.tmp',file) }
try {
  const ledger=validateEvaluationBudget(JSON.parse(await readFile(values.ledger,'utf8')))
  const cap=ledger.capUsd
  if (ledger.current.reservedUsd + prepared.cases.length*RESERVED_PER_REQUEST > cap) throw new Error("Entire run would exceed the authorized reservation cap.")
  const handle=await open(values.output,'wx',0o600); await handle.close()
  const rows: (ScoredRow & Record<string,unknown>)[]=[]
  const report={scope:'Live actual app request/prompt/parser and matchingRule on fixed public/synthetic PNGs via Node transport. Not Electron capture, Windows enforcement or a 95% reliability certification.',
    startedAt:new Date().toISOString(),sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
    codeSha256:sha256(await readFile(new URL(import.meta.url))),...plan,corpus:prepared.manifest,rows,metrics:{},budget:ledger,completed:false}
  await atomic(values.output,report)
  for (const {item,bytes,width,height} of prepared.cases) {
    ledger.current=reserveCloud(ledger.current,cap)
    await atomic(values.ledger,ledger) // Persist before network; failures keep reservations.
    const row: ScoredRow & Record<string,unknown>={caseId:item.id,labels:item.labels,preparedSha256:sha256(bytes),width,height}
    try {
      const result=await requestJev(bytes,settings.rules,process.env.TYPESAFE_API_KEY!,AbortSignal.timeout(10_000))
      ledger.current.inputTokens+=result.inputTokens
      await atomic(values.ledger,ledger)
      const decision=predictions(result,settings)
      Object.assign(row,{predicted:decision.perRule,matchedRule:decision.matchedRule,scores:result.verdicts,requestMs:result.elapsedMs,inputTokens:result.inputTokens})
    } catch { row.error='Request, parsing or persistence failed; reservation retained. Stopped without retries. Check provider/account and ledger before continuing.' }
    rows.push(row); report.metrics=summarize(rows); await atomic(values.output,report)
    console.log(JSON.stringify({caseId:item.id,predicted:row.predicted,error:row.error}))
    if (row.error) throw new Error('Evaluation stopped. Partial report saved; no automatic retry.')
  }
  report.completed=true; await atomic(values.output,report)
  console.log(JSON.stringify({completed:true,metrics:report.metrics,budget:ledger},null,2))
} finally { await lock.close(); await unlink(values.ledger+'.lock') }
