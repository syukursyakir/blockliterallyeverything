import { expect, it } from 'vitest'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
it.skipIf(process.platform==='win32')('refuses a non-Windows host before reading keys, budgets or starting native tests',async()=>{
 const directory=await mkdtemp(path.join(tmpdir(),'ble-native-guard-'))
 try{
  const output=path.join(directory,'report.json'), ledger=path.join(directory,'budget.json')
  const result=spawnSync(process.execPath,['scripts/test-live-windows.mjs','--allow-cloud','--output',output,'--ledger',ledger],{encoding:'utf8',env:{...process.env,TYPESAFE_API_KEY:''}})
  expect(result.status).not.toBe(0);expect(result.stderr).toContain('No native test ran')
  await expect(readFile(ledger)).rejects.toThrow();await expect(readFile(output)).rejects.toThrow()
 }finally{await rm(directory,{recursive:true,force:true})}
})
