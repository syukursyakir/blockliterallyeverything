# Session handoff

Read this, AGENTS.md, DESIGN.md, docs/WORKLOG.md and docs/APP-EVALUATION.md first.
This file is CURRENT state. WORKLOG.md/VALIDATION.md retain chronological history;
older statements there about providers, authorizations or missing tests can be superseded.

## Current priority and authorization

Prove detection and blocking reliability before UI polish or another release.
User prioritizes fewer missed violations over false blocks; no 95% claim is proved.
User explicitly authorized pushing/merging and enabling/running Windows CI.
PR #1 is MERGED into main at 2884b487230c28b62f58ecc9a7e5f2f7d59ba975:
https://github.com/syukursyakir/blockliterallyeverything/pull/1
No further permission is needed to continue that validation after its key is available.
Release publication remains disabled; do not overwrite v0.1.0-alpha.1.
Do not send third-party messages or start laptop remote access. Neither is authorized.

## Current live proof — key works; one controlled pipeline check passed

GitHub Actions secret is AVAILABLE and authenticates. User fixed it; DO NOT ask
for it again unless a real new auth failure occurs. No key values were extracted.
PR #2 merged the runner correction at 35fb5f71e92cbe582e6abf06f68e562dc0b6195e.
Read docs/LIVE-WINDOWS-RESULT.md and windows-live-run-40850770758.json.

Real Windows capture -> real Jev match .95 -> focused/topmost/fullscreen
1024x768 cover -> button recovery/paused session PASSED for ONE synthetic social
scene, positive already visible at session start. Observed 951 ms includes startup/
IPC/capture/poll overhead. Not an active-session transition or broad accuracy claim.

Overall run 40850770758 is CANCELLED: a cancellation request during review arrived
AFTER native step and artifact upload succeeded. Saved report passed=true and
all three budgets agree; preserve both facts, never relabel workflow green.
Earlier authenticated run 40849807420 made two calls then cleanup crashed because
application.process() was read after close; primary report was lost, not a pass.
Fix caches the process handle and saves outcome before cleanup. Regression covered.

User APPROVED a $3 CUMULATIVE conservative reservation cap on 2026-10-29.
Existing ledger migrated from .50 to 3 with authorizationHistory; all 45 attempts,
137877 reported tokens, $0.49545216 reservations and old 62/64 history preserved.
Up to 227 additional attempts fit (272 total). No new/reset allowance. No repeated
per-batch approval or key prompts within this cap. No release authorization.

Current work: validation/independent-corpus-20261029. Read docs/BROADER-EVALUATION.md.
48 fresh source-family cases, split BEFORE inference into development 24/held-out
24. Selected platform wording frozen before held-out. Held-out: explicit 6/6,
YouTube 3/3, social 4/4, no false blocks; sample too small for 95% claim. Twelve
correlated small-panel/injection/mixed-rule stress cases also passed. Two covered
body/swimwear development false positives remain; explicit rule unchanged.

Platform-only clarification now supported by new evidence: adopt starter text and
upgrade ONLY exact old stock strings on saved-preference load. Preserve custom
instructions, names, enabled flags and all other settings; no automatic capture.
Validator/user saves stay literal. 71 local tests/build and strict runner checks
passed. Reports/policy/frozen-selection hashes preserve the actual sequence.

Current ledger after static batches: 129 reservations, $1.420296192 of $3,
421419 reported tokens (~$0.017699598 estimated). No remote model job active.
Encrypted-only Windows capture run 40853592968 made NO model calls; decrypted
pixels/private RSA key stay under private local corpus, never Git/public images.

Next: full Windows neutral-to-positive transitions for real YouTube/real adult
reference plus social control. New live_scene choice keeps default synthetic
control, pins reviewed adult source hash and guards real YouTube loaded UI. No
new accuracy samples from these integration repeats. Freeze local paid work and
reconcile global ledger around EACH remote job. Do not overlap remote ownership.

## Verified Windows evidence

- PR run 40847626785 at f17aa9a PASSED: 53 unit tests, one Linux-only guard skip,
  eight UI, native desktop smoke, installer build/install and 11 installed-app
  scenarios. Saved report: docs/windows-extended-run-40847626785.json.
- Latest PR run 40848323490 at bea6f28 PASSED the same pipeline after the early
  secret guard update. Release publication was skipped.
- Post-merge push run 40848861167: PASSED the same full Windows pipeline.
  Numeric summary: docs/windows-ci-main-run-40848861167.json.
- PR #2 run 40850774234 passed after cleanup correction; local 57 tests/build passed.
- Main post-PR #2 run 40851411369 PASSED: 56 unit + one intentional skip,
  eight UI, desktop smoke, installer build/install and 11 fixture-provider scenarios.
- Live run 40847626764 FAILED at missing-key preflight. Numeric outcome is
  docs/windows-live-blocked-run-40847626764.json. Historical result; successful controlled live result is described above.

The 11 installed scenarios use fixture provider replies. They are real Windows
capture/storage/cover/recovery checks, NOT model-accuracy or live-provider proof.
One display and ordinary fullscreen; no mixed-DPI, multi-monitor, exclusive-game
or physical OS sleep/lock certification. Emitted lock/suspend signals stay separate.

## Detection evidence and unresolved errors

Five raw docs/evaluation-app*-2026-10-29.json reports preserve 42 paid attempts:
38 baseline inputs and FOUR candidate retests. Never combine settings or count
retests/size variants as independent held-out samples.

Baseline: explicit 8/8 input positives, 0/30 false blocks; video 4/4 with TWO false
matches on non-YouTube activity frames, 0 misses in this tiny set; social 7/7 with
one false Shorts match. Ambiguous video/social cases are excluded and preserved.
Explicit positives span FOUR source families (three source-declared adult anatomy
photos plus one adult educational activity-video frame), with related size variants.
No broad sexual-content recall estimate or 95% reliability claim is supported.

Earlier four-case candidate reduced one TikTok score .78 -> .50. Later broader
development/held-out and stress evidence is in BROADER-EVALUATION.md; only platform
stock wording is clarified, custom rules and explicit threshold/provider unchanged.

## Retained accounting — do not reset

Authoritative ledger: /workspace/work/ble-real-2026-10-29/app-budget.json
Approved cumulative allowance: $3 conservative reservations; prior 62/64 history is
preserved separately and the old lab ledger is missing, not zero.
Current: 45 reservations, $0.49545216 reserved, 137877 input tokens,
~$0.005790834 estimated charge at migration. 227 additional attempts fit the
approved $3 ceiling; update counts after each batch. Prior exhausted .50 cap
is historical, not the current limit.

The missing-secret run preserved 42. The cleanup-failed authenticated run added
two reservations (44), recovered from its isolated profile. The successful bounded
live test added one (45); all wrapper/profile/report counters matched. Local
authority was restored; migration to $3 preserved those counters and history.
Copies under ignored work/windows-live-preflight and work/windows-live-run-* are
NON-AUTHORITATIVE. Never use one as a fresh allowance.

Before any remote dispatch: freeze local paid work, hold a durable authority lock,
pass the exact retained ledger JSON, then reconcile downloaded numeric artifacts
before releasing authority. If interrupted, preserve lock and recover from the
isolated app ledger; never blindly retry or reset. File locks cannot lock a second
copy on another machine. The user-authorized extension is cumulative to $3, never $3 per run or per machine.

## Current next work within the authorized $3 ceiling

No repeated secret prompt. Broader independent source-separated development and
untouched held-out coverage is still required for a 95% detection target. Candidate
wording is unadopted; do not hide misses/false blocks by moving thresholds.

Full live protocol remains neutral-to-positive while already active, maximum three
attempts. Explicit positive_at_start mode uses one request and reports startup/
transition limits. Docs/WINDOWS-LIVE-VALIDATION.md explains execution and authority.
There is one controlled live pass; no repeated-trial, hardware or latency guarantee.

Do not rerun completed image batches, old local-model comparisons or fixture tests
and relabel them as new accuracy evidence. Do not reset/recreate the budget.

## Product and implementation context

Windows-first Electron/React/shadcn focus blocker; user has installed the alpha
and likes its dark UI. Current user-selected provider is hosted TypeSafe Jev
1.14.0 experimental images, with explicit screenshot consent. Optional local
OmniJev had serious errors; do not silently change providers or use cloud invisibly.
Default explicit scope is sexual activity and explicit nudity; no medical/art
exception guarantee. Arbitrary editable English rules remain unvalidated.

- src/shared.ts: presets/settings validation/matchingRule; threshold .4, interval
  three seconds, explicit preset enabled, video/social disabled, detection-only.
- electron/main.ts: session/capture/freshness/full-display cover, encrypted key,
  persisted budget; stale/error states pause, not count as safe. A match covers
  ALL connected monitors. Ctrl+Shift+F12/button/native-close/tray Pause recover.
- electron/jev.ts: fixed endpoint/model, real request/prompt/parser, no retries.
- electron/screen-cache.ts: exact unchanged-screen skip up to 30 seconds.
- lab/app-evaluation.ts + run-app-evaluation.ts: actual-app image evaluator;
  --settings records experiments; scripts/evaluate-app.mjs is the entry point.
- lab/run-windows-live.ts, scripts/test-live-windows.mjs and
  scripts/prepare-windows-live.mjs: opt-in native runner and preparation.
- .github/workflows/windows.yml: regular Windows build/tests and gated live job.

No intentional screenshot retention in normal runtime; consented hosted frames
leave the device and provider terms apply. Test corpus files remain outside Git.
Cloud key is not bundled or automatically present on the user's laptop.

Public installer v0.1.0-alpha.1 was NOT replaced and lacks the newer tested
fullscreen sizing fix; corrected installers exist as CI artifacts. Do not claim
an auto-update. Existing release publisher clobbers the old tag: new release/version
strategy and explicit release authorization are needed before using it.

## Files, checks and continuity

Corpora/manifests: /workspace/work/ble-real-2026-10-29,
ble-followup-2026-10-29, ble-activity-2026-10-29 and ble-candidate-2026-10-29.
Source declarations/licenses, hashes, labels and exact questions are in reports.
Adult image bytes and keys are excluded from Git/public artifacts.

Local 57 unit tests/build and runner type/bundle checks passed. Latest PR Windows
log verified 56 passes plus one intended Linux-only skip, eight UI and 11 native
fixture scenarios. Use Ponytail full and relevant skills; smallest complete change, actual failure checks, no speculative rewrite.
Append actual outcomes to WORKLOG.md and update this current state after work.
Do not reconfigure/republish the managed environment or repeat old setup work.
