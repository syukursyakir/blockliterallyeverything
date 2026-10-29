# Live Windows validation protocol

Current results: [LIVE-WINDOWS-RESULT.md](LIVE-WINDOWS-RESULT.md).
Current authority/counters: HANDOFF.md and the retained ledger. This protocol
supersedes earlier missing-key, exhausted-$0.50 and unexecuted-plan statements;
chronological outcomes remain in WORKLOG.md and saved run reports.

The user authorized pushing/merging and Windows Actions validation. Actions secret
TYPESAFE_API_KEY works; do not request it again absent an actual auth failure.
The approved reservation ceiling is **$3 cumulative**, with all previous attempts
and missing-ledger history retained. No release publication or laptop remote access.
Do not overwrite the existing v0.1.0-alpha.1 release; its installed executable lacks
newer tested changes. Test builds use the checkout, not that old installer.

## Real path and isolated state

`lab/run-windows-live.ts`, `scripts/test-live-windows.mjs` and
`scripts/prepare-windows-live.mjs` use actual Electron capture and hosted Jev.
No provider/capture replacement. Windows, Node24, a built checkout, source pixels,
securely configured key and one controlled display are required. The isolated
profile seeds configuration and onboarding, so onboarding is NOT tested here.
Use a new output/profile directory; reusing previous profiles is refused.

Prepare supports the synthetic social control, a guarded actual public YouTube
search screenshot, and a previously reviewed licensed adult source with exact
byte-hash/provenance checks. Preparation makes no model calls. No private browsing.
The native runner waits for a varied real capture before starting the session;
this handles native-window compositor startup, not provider errors or real blank
screens. Pixels are discarded in memory without screenshot files or uploads.
The app's own blank/protected-capture rejection remains active.

Baseline full mode: neutral frame must be allowed, then a reviewed positive is
painted while protection is already active. Assert matched rule, visible/focused/
topmost/fullscreen native cover with exact display bounds, button recovery and
paused session. Timing runs from two animation-frame presentation callbacks to
automation-observed cover, including three-second polling and IPC; not externally
frame-accurate timing. One trial does not establish median or tail latency.

## Protocol variants

- Default `--motion none`: full active-session transition, maximum3 reservations.
- `--positive-at-start`: explicit single-reservation startup-only protocol. It does
  not establish content-change timing in an already-active session.
- `--motion pan`: full transition with the reviewed screenshot continuously panning
  horizontally +/-12px inside96% viewport bounds. Assert the animation advanced
  more than10 animation callbacks when sampled after cover observation, then
  normal cover/recovery checks. This counter is not a visible-frame measurement.
  This is limited screenshot motion, not actual playback or large-motion proof.
- `--motion switch-away`: after neutral is allowed and the positive stimulus starts
  a real request, replace it with a DIFFERENT neutral document while status is checking (restoring
  the identical previously checked frame can legitimately reuse its cache). Require
  changed-frame discard activity, a subsequent neutral check, zero blocks/covers
  and clean stop. This is a stale-result negative control, NOT a positive-blocking
  pass. The discarded verdict is not observable; do not assert its model score.

Motion modes require full protocol and reject mixing with positive-at-start. All
full modes retain a three-request maximum sub-budget; failures are outcomes, not
permission to retry with reset counters. Never count budget/provider errors as safe.
Other modes of recovery, live moving-video, physical sleep/lock, mixed-DPI,
multi-monitor and exclusive-fullscreen tests remain separate work.

## Exclusive accounting across machines

The authoritative local ledger is `/workspace/work/ble-real-2026-10-29/app-budget.json`.
Never initialize another allowance. Local copies and remote profiles are not fresh
budgets. Before dispatch, stop local paid work and create an exclusive durable
`.lock` beside authority, recording the intended remote run and exact before state.
Pass that exact retained JSON to `retained_budget`. File locks coordinate only
one filesystem; remote ownership must be managed explicitly.

Workflow: dispatch existing `windows.yml` at the test ref with `live_detection=true`,
`publish_alpha=false`, selected `live_scene`, `live_motion` and exact retained budget.
Set `positive_at_start` only for that explicit protocol. Key goes through the Actions
secret, never chat, Git, input JSON or log output. Live job skips installer/release
work, uses readonly contents permissions and rejects publishing. Capture-only mode
is separate and has no provider secret; only encrypted pixels leave that runner.

After a completed run, download numerical artifacts, inspect outcome AND accounting.
Verify wrapper, report budgetAfter and isolated profile ledger agree, counters never
regress, cap stays respected and previous history remains intact. Atomically reconcile
local authority before removing its lock. Preparation failure may leave only an
unchanged wrapper; confirm the inference step never ran before releasing authority.
On a crash, empty primary report or accounting disagreement, retain the lock and
recover from the isolated profile after proving the native process has stopped.
Do not blindly retry, reset or use a stale snapshot. No parallel paid local/remote work.

## Evidence and acceptance

Save numerical report with workflow ID/conclusion, source/prepared/manifest hashes,
provenance, settings, OS/display/runtime, matched rule, cover properties, recovery,
timing method and before/after budgets. Raw captures/private keys are not public
artifacts. Preserve failed acquisition, blank captures, unknowns, timeouts and errors;
fix demonstrated causes and rerun only affected checks. Ordinary installed CI uses
fixture provider replies and must stay distinct from live model evidence.

Update HANDOFF.md and WORKLOG.md after meaningful outcomes. Static source repeats
in native tests are integration evidence, not new independent accuracy samples.
Use new representative source families and prospective labels to expand recall
coverage. No arbitrary-rule, 95%-reliability or hardware guarantee is established.
