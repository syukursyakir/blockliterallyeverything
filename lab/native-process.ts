import { reserveCloud, validateLedger, type CloudLedger } from '../electron/jev.ts'
import { readFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'

// Playwright's application.process() getter becomes unusable after close().
export function nativeExitGuard(application: { process(): { exitCode: number | null; signalCode: string | null } }) {
  const child = application.process()
  return () => child.exitCode !== null || child.signalCode !== null
}
export function nativeBudget(ledger: CloudLedger, cap: number, positiveAtStart: boolean) {
  const maximumRequests = positiveAtStart ? 1 : 3
  let planned = validateLedger(ledger)
  for (let i = 0; i < maximumRequests; i++) planned = reserveCloud(planned, cap)
  return { maximumRequests, limitUsd: planned.reservedUsd }
}

export function nativeMotion(value: string | undefined, positiveAtStart: boolean) {
  const motion = value ?? 'none'
  if (!['none', 'pan', 'switch-away', 'video'].includes(motion) || (positiveAtStart && motion !== 'none')) throw new Error('Motion requires the full active-session protocol and a recognized mode.')
  return motion as 'none' | 'pan' | 'switch-away' | 'video'
}

export async function nativeVideo(root: string, file: string | undefined, sha256: string | undefined) {
  if (!file || !/^[a-zA-Z0-9_-]+\.webm$/.test(file) || !sha256 || !/^[a-f0-9]{64}$/.test(sha256)) throw new Error('Video requires a pinned local WebM basename and SHA256.')
  const full=path.join(root,file)
  if ((await stat(full)).size>12*1024*1024) throw new Error('Reviewed video exceeds size bound.')
  const bytes=await readFile(full)
  if (bytes.subarray(0,4).toString('hex')!=='1a45dfa3' || createHash('sha256').update(bytes).digest('hex')!==sha256) throw new Error('Reviewed video bytes changed.')
  return bytes
}

export function nativeVideoRange(start=10,end=25) {
  if(!Number.isFinite(start) || !Number.isFinite(end) || start<0 || end<=start || end>300 || end-start>30)throw new Error('Reviewed playback range must be finite, ordered and at most30 seconds.')
  return {start,end}
}
