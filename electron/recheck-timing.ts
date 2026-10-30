// Vary only already-degraded retries; keep ordinary polling and freshness guards intact.
export function recheckTiming(baseMs: number, now: number, oldestUnresolved: number | null, phaseIndex: number) {
  if (!Number.isFinite(baseMs) || baseMs < 1000 || baseMs > 30000 || !Number.isFinite(now) ||
      (oldestUnresolved !== null && !Number.isFinite(oldestUnresolved)) ||
      !Number.isSafeInteger(phaseIndex) || phaseIndex < 0 || phaseIndex > 3) throw new Error('Invalid recheck timing state.')
  if (oldestUnresolved === null || now - oldestUnresolved < 15000) return { waitMs: baseMs, phaseIndex: 0, adjusted: false }
  return { waitMs: baseMs + [250, 500, 750, 1000][phaseIndex], phaseIndex: (phaseIndex + 1) % 4, adjusted: true }
}
