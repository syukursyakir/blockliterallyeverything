import type { Scenario } from './session-replay.ts'

export const parityScenarios: Scenario[] = [
  { id: 'static-neutral-cache', kind: 'neutral', responseMs: 300, moving: false, detectionOnly: true },
  { id: 'static-positive-cache', kind: 'positive', responseMs: 300, moving: false, detectionOnly: true },
  { id: 'moving-positive-block', kind: 'positive', responseMs: 300, moving: true, detectionOnly: false },
  { id: 'settled-cut-block', kind: 'settled-cut', responseMs: 300, moving: true, detectionOnly: false },
  { id: 'settled-cut-observe', kind: 'settled-cut', responseMs: 300, moving: true, detectionOnly: true },
  { id: 'periodic-stress-observe', kind: 'periodic', periodMs: 2000, flatMs: 1500, offsetMs: 1500, responseMs: 1000, moving: true, detectionOnly: true },
  { id: 'drift-observe', kind: 'drift', flatMs: 500, offsetMs: 2750, responseMs: 300, moving: true, detectionOnly: true },
  { id: 'fresh-switch-block', kind: 'switch-fresh', responseMs: 300, moving: true, detectionOnly: false },
  { id: 'cached-return-observe', kind: 'cache-return', responseMs: 300, moving: true, detectionOnly: true },
  { id: 'brief-between-polls', kind: 'brief', responseMs: 300, moving: false, detectionOnly: false },
  { id: 'cancel-in-flight', kind: 'cancel', responseMs: 300, moving: true, detectionOnly: false, cancelAtMs: 3500 },
  { id: 'session-deadline', kind: 'deadline', responseMs: 300, moving: false, detectionOnly: true, sessionMs: 60000, horizonMs: 90000 },
  { id: 'provider-timeout', kind: 'timeout', responseMs: 10001, moving: true, detectionOnly: false },
  { id: 'below-timeout', kind: 'positive', responseMs: 9999, moving: true, detectionOnly: false },
  { id: 'explicit-phase-lock', kind: 'periodic', periodMs: 3200, flatMs: 200, offsetMs: 50, responseMs: 200, moving: true, detectionOnly: false },
]
export function gridScenarios(): Scenario[] {
  const scenarios: Scenario[] = []
  for (const kind of ['periodic', 'drift'] as const) for (const periodMs of kind === 'periodic' ? [2000, 5000, 10000] : [11000]) {
    for (const flatMs of [100, 500, 1500]) for (const phase of [0, 0.25, 0.5, 0.75]) for (const responseMs of [100, 300, 1000]) for (const moving of [false, true]) for (const detectionOnly of [false, true]) {
      scenarios.push({ id: [kind, periodMs, flatMs, phase, responseMs, moving ? 'moving' : 'static', detectionOnly ? 'observe' : 'block'].join('-'), kind, periodMs, flatMs, offsetMs: periodMs * phase, responseMs, moving, detectionOnly })
    }
  }
  return scenarios
}

export function timingHoldout(): Scenario[] {
  const scenarios: Scenario[] = []
  for (const periodMs of [1700, 4100, 8300]) for (const flatMs of [150, 450, 900]) for (const phase of [0.1, 0.35, 0.6, 0.85]) for (const responseMs of [180, 550, 850]) for (const moving of [false, true]) for (const detectionOnly of [false, true]) {
    scenarios.push({ id: ['holdout', periodMs, flatMs, phase, responseMs, moving ? 'moving' : 'static', detectionOnly ? 'observe' : 'block'].join('-'), kind: 'periodic', periodMs, flatMs, offsetMs: periodMs * phase, responseMs, moving, detectionOnly })
  }
  return scenarios
}

export function escalationHoldout(): Scenario[] {
  const scenarios: Scenario[] = []
  for (const kind of ['periodic', 'drift'] as const) for (const periodMs of kind === 'periodic' ? [2300, 4600, 9100] : [13000]) {
    for (const flatMs of [200, 650, 1100]) for (const phase of [0.15, 0.4, 0.65, 0.9]) for (const responseMs of [220, 650, 1250]) for (const moving of [false, true]) for (const detectionOnly of [false, true]) {
      scenarios.push({ id: ['escalation-holdout',kind,periodMs,flatMs,phase,responseMs,moving?'moving':'static',detectionOnly?'observe':'block'].join('-'),kind,periodMs,flatMs,offsetMs:periodMs*phase,driftPeriods:kind==='drift'?[2600,4300,6100]:undefined,responseMs,moving,detectionOnly })
    }
  }
  return scenarios
}
