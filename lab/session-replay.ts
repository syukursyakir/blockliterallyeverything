import { createHash } from 'node:crypto'
import { ScreenCache, changedSubstantially, lostLocalDetail, sameTranslatedFrame } from '../electron/screen-cache.ts'

export type Scenario = {
  id: string; kind: 'periodic' | 'drift' | 'neutral' | 'positive' | 'settled-cut' | 'switch-fresh' | 'cache-return' | 'brief' | 'cancel' | 'deadline' | 'timeout'
  responseMs: number; moving: boolean; detectionOnly: boolean; periodMs?: number; flatMs?: number; offsetMs?: number
  horizonMs?: number; cancelAtMs?: number; sessionMs?: number
}
export type Comparator = { changedSubstantially: typeof changedSubstantially; sameTranslatedFrame: typeof sameTranslatedFrame; lostLocalDetail?: typeof lostLocalDetail }
export const currentComparator: Comparator = { changedSubstantially, sameTranslatedFrame, lostLocalDetail }
export function frameAt(s: Scenario, at: number) {
  const onset = s.responseMs + 50, relative = at - onset
  let state: 'detail' | 'flat' | 'neutral' = 'neutral', variant = 0
  if (s.kind !== 'neutral' && relative >= 0) {
    state = 'detail'
    if (s.kind === 'periodic' || s.kind === 'drift') {
      let phase = relative + (s.offsetMs ?? 0)
      if (s.kind === 'periodic') phase %= s.periodMs!
      else { phase %= 11000; for (const period of [2100, 3700, 5200]) { if (phase < period) break; phase -= period } }
      if (phase < s.flatMs!) state = 'flat'
    } else if (s.kind === 'settled-cut' && relative >= 3100) state = 'flat'
    else if ((s.kind === 'switch-fresh' || s.kind === 'cache-return') && relative >= 3100) { state = 'neutral'; variant = s.kind === 'switch-fresh' ? 1 : 0 }
    else if (s.kind === 'brief') state = relative >= 200 && relative < 1200 ? 'detail' : 'neutral'
  }
  const pixels = new Uint8Array(64 * 64 * 4)
  for (let i = 0; i < pixels.length; i += 4) { pixels[i] = pixels[i + 1] = pixels[i + 2] = 15; pixels[i + 3] = 255 }
  const set = (x: number, y: number, color: number) => { const i = (y * 64 + x) * 4; pixels[i] = pixels[i + 1] = pixels[i + 2] = color }
  if (state === 'neutral') {
    for (let y = 40; y < 44; y++) for (let x = 4 + variant * 2; x < 24 + variant * 2; x++) if (x % 4 < 2) set(x, y, 190)
  } else {
    for (let y = 2; y < 5; y++) for (let x = 3; x < 35; x++) if (x % 4 < 2) set(x, y, 220)
    if (state === 'detail') for (let y = 14; y < 30; y++) for (let x = 4; x < 30; x++) set(x, y, (Math.floor(x / 2) + Math.floor(y / 2) + (s.moving ? Math.floor(at / 200) : 0)) % 2 ? 180 : 60)
    if (s.moving) pixels[(63 * 64 + 63) * 4] = 25 + Math.floor(at / 40) % 200
  }
  return { state, positive: state !== 'neutral', pixels, hash: createHash('sha256').update(pixels).digest('hex') }
}
export type ReplayEvent = { at: number; kind: 'request' | 'accepted' | 'discard' | 'cache' | 'pending' | 'timeout' | 'cancel' | 'deadline'; capturedState?: string; responseState?: string; positive?: boolean; stale?: boolean }
export function replay(s: Scenario, comparator: Comparator = currentComparator, discardOffsetsMs: readonly number[] = []) {
  for (const value of [s.responseMs, s.horizonMs ?? 60000, s.sessionMs ?? 120000, s.cancelAtMs ?? 0, s.offsetMs ?? 0]) if (!Number.isFinite(value) || value < 0) throw new Error('Replay durations must be finite and nonnegative.')
  if (s.responseMs <= 0 || (s.sessionMs ?? 120000) <= 0) throw new Error('Response/session duration must be positive.')
  if (s.kind === 'periodic' || s.kind === 'drift') {
    const period = s.kind === 'periodic' ? s.periodMs : 2100
    if (!Number.isFinite(period) || period! <= 0 || !Number.isFinite(s.flatMs) || s.flatMs! <= 0 || s.flatMs! >= period!) throw new Error('Flat dwell must be positive and shorter than its period.')
  }
  if (discardOffsetsMs.some(n => !Number.isFinite(n) || n < 0 || n > 1000)) throw new Error('Experimental offsets must stay within0..1000ms.')
  const cache = new ScreenCache(), events: ReplayEvent[] = []
  const horizon = s.horizonMs ?? 60000, stopAt = Math.min(s.sessionMs ?? 120000, s.cancelAtMs ?? Infinity)
  let at = 0, end = horizon, ended = 'horizon', delayedSince: number | null = null, warningMs = 0, firstWarningAt: number | null = null
  let consecutive = 0, maxConsecutive = 0
  const clearDelay = (time: number) => {
    if (delayedSince !== null && time >= delayedSince + 15000) { firstWarningAt ??= delayedSince + 15000; warningMs += time - (delayedSince + 15000) }
    delayedSince = null
  }
  while (at <= horizon) {
    if (stopAt <= at) { end = stopAt; ended = s.cancelAtMs === stopAt ? 'cancel' : 'deadline'; events.push({ at: end, kind: ended as 'cancel' | 'deadline' }); break }
    const before = frameAt(s, at)
    if (!cache.shouldCheck('one', before.hash, at)) {
      events.push({ at, kind: 'cache', capturedState: before.state }); clearDelay(at); consecutive = 0; at += 3000; continue
    }
    events.push({ at, kind: 'request', capturedState: before.state, positive: before.positive })
    const finish = at + Math.min(s.responseMs, 10000)
    if (stopAt <= finish && stopAt <= horizon) { end = stopAt; ended = s.cancelAtMs === stopAt ? 'cancel' : 'deadline'; events.push({ at: end, kind: ended as 'cancel' | 'deadline' }); break }
    if (finish > horizon) { events.push({ at: horizon, kind: 'pending' }); break }
    if (s.responseMs >= 10000) { end = finish; ended = 'timeout'; events.push({ at: finish, kind: 'timeout' }); break }
    const after = frameAt(s, finish)
    const changed = comparator.changedSubstantially(before.pixels, after.pixels)
    const local = !changed && (comparator.lostLocalDetail?.(before.pixels, after.pixels, 64) ?? false)
    const discarded = (changed || local) && !comparator.sameTranslatedFrame(before.pixels, after.pixels, 64)
    if (discarded) {
      events.push({ at: finish, kind: 'discard', capturedState: before.state, responseState: after.state, positive: before.positive })
      delayedSince ??= finish; consecutive++; maxConsecutive = Math.max(maxConsecutive, consecutive)
    } else {
      cache.mark('one', before.hash, finish)
      events.push({ at: finish, kind: 'accepted', capturedState: before.state, responseState: after.state, positive: before.positive, stale: before.positive && !after.positive })
      clearDelay(finish); consecutive = 0
      if (before.positive && !s.detectionOnly) { end = finish; ended = after.positive ? 'blocked-positive' : 'stale-block'; break }
    }
    at = finish + 3000 + (discarded && discardOffsetsMs.length ? discardOffsetsMs[(consecutive - 1) % discardOffsetsMs.length] : 0)
  }
  // Stop timers also fire while waiting for the next poll, even beyond the final loop iteration.
  if (ended === 'horizon' && stopAt <= horizon) { end = stopAt; ended = s.cancelAtMs === stopAt ? 'cancel' : 'deadline'; events.push({ at: end, kind: ended as 'cancel' | 'deadline' }) }
  clearDelay(end)
  const fresh = events.filter(e => e.kind === 'accepted'), uses = events.filter(e => e.kind === 'accepted' || e.kind === 'cache')
  const gaps = (items: ReplayEvent[]) => {
    const times = items.map(e => e.at), closed = times.slice(1).map((t, i) => t - times[i])
    const initial = times[0] ?? end, terminal = end - (times.at(-1) ?? 0)
    return { closedMaxMs: closed.length ? Math.max(...closed) : null, initialCensoredMs: initial, terminalCensoredMs: terminal, maxIncludingCensoredMs: Math.max(initial, terminal, ...closed) }
  }
  const firstMatch = fresh.find(e => e.positive)
  return { scenario: s, ended, observationEndMs: end, requests: events.filter(e => e.kind === 'request').length, accepted: fresh.length, discards: events.filter(e => e.kind === 'discard').length, cacheHits: events.filter(e => e.kind === 'cache').length, maxConsecutiveDiscards: maxConsecutive, firstMatchAtMs: firstMatch?.at ?? null, onsetToFirstMatchMs: firstMatch ? firstMatch.at - (s.responseMs + 50) : null, staleMatches: fresh.filter(e => e.stale).length, firstWarningAtMs: firstWarningAt, warningMs, freshGaps: gaps(fresh), observationGaps: gaps(uses), events }
}
