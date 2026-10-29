import { reserveCloud, validateLedger, type CloudLedger } from '../electron/jev.ts'

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
