// A fixed diagnostic replication plan, never an until-success or network-retry loop.
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises'
import {spawnSync} from 'node:child_process'
import path from 'node:path'
import {validateEvaluationBudget} from '../lab/evaluation-budget.ts'
import {nativeBudget} from '../lab/native-process.ts'
if(process.platform!=='win32')throw new Error('Interactive Windows required.')
const args=process.argv.slice(2),index=args.indexOf('--trials'),trials=index<0?1:Number(args[index+1])
if(index>=0)args.splice(index,2)
const value=flag=>args[args.indexOf(flag)+1]
if(!args.includes('--output') || !args.includes('--ledger') || ![1,6].includes(trials))throw new Error('Requires --output --ledger and trials1 or6.')
const output=value('--output'),ledgerFile=value('--ledger')
const initial=validateEvaluationBudget(JSON.parse(await readFile(ledgerFile,'utf8')))
nativeBudget(initial.current,initial.capUsd,args.includes('--positive-at-start'),trials)
if(trials===1){const run=spawnSync(process.execPath,['scripts/test-live-windows.mjs',...args],{stdio:'inherit',env:process.env});process.exit(run.status??1)}
const summary={scope:'Six preplanned diagnostic replications of one known intermittent miss. Correlated trials, not independent accuracy. Continue only reconciled bounded detection misses; stop on capture/provider/accounting errors.',budgetBefore:initial.current,budgetAfter:initial.current,trials:[]}
for(let i=1;i<=trials;i++){
 const trialOutput=path.join(path.dirname(output),'series','trial-'+i,'report.json')
 await mkdir(path.dirname(trialOutput),{recursive:true})
 const trialArgs=[...args];trialArgs[trialArgs.indexOf('--output')+1]=trialOutput
 const run=spawnSync(process.execPath,['scripts/test-live-windows.mjs',...trialArgs],{stdio:'inherit',env:process.env})
 const report=JSON.parse(await readFile(trialOutput,'utf8'))
 const budget=validateEvaluationBudget(JSON.parse(await readFile(ledgerFile,'utf8')))
 if(report.accountingError || JSON.stringify(report.budgetBefore)!==JSON.stringify(summary.budgetAfter) || JSON.stringify(report.budgetAfter)!==JSON.stringify(budget.current) || budget.current.requests-report.budgetBefore.requests>3)throw new Error('Series accounting uncertain; stop and recover, no next trial.')
 summary.budgetAfter=budget.current
 summary.trials.push({trial:i,passed:report.passed,failedPhase:report.failedPhase,cloudRequests:budget.current.requests,report:path.relative(path.dirname(output),trialOutput)})
 await writeFile(output+'.series.json.tmp',JSON.stringify(summary,null,2)+'\n',{mode:0o600});await rename(output+'.series.json.tmp',output+'.series.json')
 const boundedMiss=report.failedPhase==='wait-for-cover' && report.lastStatus?.error?.startsWith('Jev budget limit reached.') && budget.current.requests-report.budgetBefore.requests===3
 if(!report.passed && !boundedMiss)throw new Error('Unexpected native/provider/capture failure; remaining planned replications stopped.')
 if(run.status!==0 && report.passed)throw new Error('Runner exit disagrees with saved pass; stop.')
}
if(summary.trials.some(t=>!t.passed))process.exitCode=1
