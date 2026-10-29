# Project work log

Read HANDOFF.md and RELIABILITY.md first. Append dated entries after meaningful
work: goal, inspected/changed paths, checks actually run, evidence, limitations,
and next action. Never mark old test results as newly executed. Keep screenshots,
keys and budget ledgers out of this log. This file is the continuity record;
VALIDATION.md retains the longer historical narrative.

## Earlier work — summarized from committed evidence

- Built Electron/React Windows alpha, rules, cloud consent, encrypted key setup,
  detection-only and blocking modes, native cover/recovery and persistent budget.
- Compared local OmniJev 0.8B/2B and SigLIP; documented serious errors. User chose
  hosted Jev. Initial/harder Jev image suites are exploratory, mostly synthetic;
  explicit-positive recall remains unmeasured. See RELIABILITY.md for counts.
- Windows run 40822062404 built/installed and published v0.1.0-alpha.1. User
  reports installing/using it; this is not a measured accuracy study.
- Extended Windows run 40824967950 at 2c1eec2 passed 45 unit, eight UI and 11
  installed-app scenarios. It caught a work-area cover gap; native fullscreen
  with resizable/fullscreenable fixed it. Saved JSON/screenshot are in docs/.
  Provider replies were fixtures; corrected installer remains a CI artifact.
- 8233d13 recorded Windows evidence; 952a9f0 saved the prior handoff. Existing
  public release was not updated to the fullscreen fix.

## 2026-10-29 — resume and reliability evidence audit

User direction: prove detection/blocking reliability before UI polish; keep a
clear log so later agents do not repeat unrelated work. No publishing authorized.

Completed:
- Read remote handoff and cloned main into /workspace/blockliterallyeverything
  at 952a9f0. Preserved the earlier empty checkout under
  /workspace/work/blockliterallyeverything-empty-checkout.
- Read HANDOFF.md, AGENTS.md, DESIGN.md, VALIDATION.md and Ponytail skill;
  inspected hosted app request/policy/capture code, lab evaluator/scoring/client,
  raw Jev results, smoke report and Windows scenario report.
- Recomputed initial/harder per-rule counts from raw rows with Python. Confirmed
  zero explicit positives, no real active-service positive coverage, and lab/app
  prompt differences. Actual app request code has only a two-image live smoke.
- Checked corpus/ledger availability: original corpus manifest exists; default
  lab ledger is absent despite historical 62/64 reservations. Do not recreate it
  as empty or spend against assumed unused capacity.
- Added RELIABILITY.md with evidence map, gaps and ordered validation work;
  updated HANDOFF.md and AGENTS.md to make these records discoverable.
- Corrected stale current-provider wording in lab summaries without changing
  historical results.

Checks: raw JSON counts recomputed; documentation links and diff checked. No
build, unit/UI/Windows suite or model inference rerun for documentation-only work.
No paid calls, product code changes, pushes, releases or environment changes.

Next: recover accounting/confirm an authorized bounded evaluation budget, inventory
and extend labeled real cases, then evaluate through the actual hosted app code.
See RELIABILITY.md for exact sequence. No 95% reliability claim is established.


## 2026-10-29 — actual-app evaluation with real public examples

Authorization: user asked to proceed using real examples where possible, then
explicitly approved a separate $0.50 conservative-reservation budget. No publish.

Completed:
- Installed pinned npm dependencies (ignore-scripts); used isolated public-page
  Playwright captures. Eleven reviewed live images include actual Instagram NASA
  grid and two TikTok views; failed YouTube pages retained as failures. Added an
  archived real YouTube search screenshot as a separately labeled supplement.
- Froze labels before inference. Kept ambiguous signup/error/embedded-interface
  boundaries separate. Reused 14 existing images as REGRESSION, not new holdout.
- Added lab/app-evaluation.ts, lab/run-app-evaluation.ts and
  scripts/evaluate-app.mjs. They import the actual hosted app request/parser and
  matcher, validate hashes/labels/bounds, preserve budget before sending, stop on
  errors without retries, and save partial reports, raw scores and intervals.
- Added scripts/capture-validation-public.mjs with empty-directory protection;
  captures and budget remain outside Git. Added /work/ ignore for local scratch.
- Ran 25 main + one supplementary live request, no retries or repeated batch.
  Raw reports: docs/evaluation-app-2026-10-29.json and
  docs/evaluation-app-archived-2026-10-29.json. Video caught 4/4; social 5/5;
  social falsely matched synthetic YouTube Shorts (0.54). Explicit had no positives.
  No prompt, threshold or provider change was made to hide that error.
- New retained ledger: /workspace/work/ble-real-2026-10-29/app-budget.json.
  26 attempts, $0.286261248 reserved of $0.50, 79,707 reported input tokens,
  ~$0.003347694 estimated usage. Original 62/64 usage kept as metadata, NOT reset.
- Added docs/APP-EVALUATION.md with results, reproduction commands, accounting
  and gaps; updated handoff/reliability references.

Checks actually run: 51 unit tests passed (six new evaluator tests); build passed;
five offline CLI budget safeguards passed, then retained as automated coverage;
script syntax and documentation/diff checks. No new UI/native Windows run.

Limits: tiny correlated development corpus, synthetic regression cases, no
explicit-positive recall, no untouched held-out benchmark, no live Windows chain.
Current public installer remains unchanged. No push/release/environment change.

Next: read APP-EVALUATION.md; obtain suitable explicit-positive data and expand
independent real-service cases, then live Windows timing. Use retained remaining
allowance (at most 19 attempts); do not rerun completed batches without a reason.


## 2026-10-29 — adult-nudity positives and further real captures

User asked to continue. Used the existing approved $0.50 allowance; no new budget.

Completed:
- Consulted current handoff/evidence, checked secret readiness and retained ledger.
- Sourced three real nonsexual anatomical photographs from Wikimedia Commons.
  Descriptions declare adult ages (22, 21, adult middle age); licenses are public
  domain or CC BY-SA 4.0. Stored provenance/attribution and source/prepared hashes.
  No model-identity or independent age verification is claimed.
- Visually reviewed full and small-panel views; froze positive explicit-nudity
  labels before inference. No medical exception exists in the current preset.
  Three full images plus three compositions are THREE source families, not six
  independent examples. Photographs remain in private local corpus, outside Git.
- Captured/reviewed yoga, beach volleyball, another public Instagram grid and
  TikTok. Detected that the requested TikTok topic served the same prior clip;
  marked correlated repeat. Did not claim the Instagram handle was an agency.
- Ran TEN new live calls through the existing runner, unchanged model/prompt/
  threshold: six nudity positives detected (scores .95–.98), two social positives
  detected, yoga/swimwear negatives allowed, no errors/false blocks in this batch.
  Saved docs/evaluation-app-followup-2026-10-29.json; did not repeat old batches.
- Updated APP-EVALUATION.md, RELIABILITY.md and HANDOFF.md. Prepared
  docs/WINDOWS-LIVE-VALIDATION.md with concrete build/settings/accounting/timing
  and recovery protocol, explicitly UNRUN. No speculative native success claim.

Accounting: unchanged ledger /workspace/work/ble-real-2026-10-29/app-budget.json;
36 total reservations, $0.396361728 of $0.50, 112,314 reported input tokens,
~$0.004717188 estimated charge. NINE further attempts fit. Do not reset/reinitialize.
New corpus: /workspace/work/ble-followup-2026-10-29/manifest.json. Numerical report
embeds source/license/age declarations; no image bytes are committed.

Checks: completed report counts, label/hash integrity, ledger and combined metrics
verified; documentation links/diff checked. No source-code changes in this turn;
The initial 51-unit/build pass was from preceding turn; see additional runner checks below. No UI/native Windows run,
source push, release, environment change or third-party messages.

Remaining: live Windows content->Jev->full cover->recovery timing needs an actual
Windows desktop. Sexual-activity positives and broad independent/held-out coverage
remain missing. No 95% reliability claim. Follow the prepared native protocol and
retained cap; do not publish to obtain Windows testing without authorization.


### Same follow-up — prepared native live runner, not Windows evidence

Added lab/run-windows-live.ts and scripts/test-live-windows.mjs to make the next
integration test concrete. It runs only with explicit --allow-cloud on Windows,
uses real capture/provider calls, an isolated seeded profile, a maximum three-call
sub-budget, a neutral-to-positive transition during a live session, native cover
checks and button recovery. It reconciles retained accounting after confirmed
process exit; uncertainty retains the lock/profile. No sensitive screenshot output.
No replacement provider replies, captures or production app backdoor were added.

Added a Linux platform-guard test. Actually ran 52 unit tests (passed), strict
standalone TypeScript checking of the native runner, esbuild bundle/syntax checks,
and production build (passed). These do NOT execute Windows or certify the new
runner's native behavior. Updated WINDOWS-LIVE-VALIDATION.md with prerequisites,
command and the exclusive ledger-transfer rule. A second filesystem copy cannot
be coordinated by a local lock. No key was transferred or Windows run started.


## 2026-10-29 — autonomous continuation; remaining Windows access gate

User asked to continue and only return for needed input. Continued within retained
cap; did not publish or contact third parties.

- Sourced a CC BY-SA adult educational activity video (source declares adult 44,
  self-taken). Obscured default thumbnail was excluded; used a reviewed frame and
  its small-panel variant, with frozen labels. No video bytes/images in Git.
- Two actual-app baseline calls detected explicit activity (.97/.96), but exposed
  false YouTube matches (.43/.62) on non-YouTube video. Saved activity raw report.
- Added explicit --settings support to the evaluator, preserving app request and
  parser code. Tested a platform-specific wording candidate on FOUR known cases:
  Shorts social false match .54->.02; activity YouTube false match .43->.06;
  archived YouTube positive retained; real TikTok social .78->.50 (still caught).
  Candidate NOT adopted because recall tradeoff is unproven and score margin
  shrank. Product preset strings were restored before final checks; no saved rule
  migration, threshold or provider change. Raw candidate report remains separate.
- Prepared opt-in live_detection job in existing Windows workflow, guarded against
  release publication, with minimum contents:read and secret only on real-live
  invocation. Ordinary installer job skipped for live mode. Added preparation
  script for self-authored synthetic scene and retained ledger COPY; no model calls.
  The actual native capture/provider are NOT mocked. No screenshots/whole profiles
  are uploaded. Recovery ledger metadata is retained for interrupted-run accounting.
- Exercised scene preparation locally using system Chromium. No native Windows
  run. Default manifest generation is integration-only, not real-feed evidence.
- Read-only GitHub secret-NAME probe failed HTTP403; integration cannot inspect
  Actions secrets. No secret values were read, copied, posted or transferred.
- Need input to authorize a test branch push/Windows Actions under the earlier
  no-publishing instruction, and securely provision/confirm capped Actions key.
  No workflow dispatched, source pushed, release published or remote access started.

Accounting: 42 total attempts (38 baseline + 4 candidate retests), $0.462422016
reserved, 127,172 reported input tokens, ~$0.005341224 estimated. THREE attempts
left; preserve for Windows. Source corpus/activity and candidate settings/manifest
are under /workspace/work/ble-activity-2026-10-29 and ble-candidate-2026-10-29.
Global authority stays /workspace/work/ble-real-2026-10-29/app-budget.json; ignored
work/windows-live-preflight/budget.json is a non-authoritative dry preparation copy.

Checks: 54 unit tests passed; build passed; dry-run verifies settings reach actual
question builder and invalid disabled-policy experiments refuse before calls;
script syntax, preparation run, YAML parse/live release-isolation/secret-scope,
runner type checking, report and ledger consistency checks passed. Native Windows
execution remains unrun. Need input only for that concrete next gate.

Prepared local branch validation/live-windows-20261029 to preserve the concrete
reviewable changes. Local commit only; no remote push or Actions dispatch.


## 2026-10-29 — authorized push/merge and Windows execution

User explicitly approved pushing/merging and enabling the prepared Windows test,
and confirmed the Actions secret. No release publication is proposed. Proceeding
on validation/live-windows-20261029. Added safe failure-phase/status diagnostics
to native runner before first execution; no provider bodies, key or screenshots.
Freeze local paid requests while remote ledger authority is active. Reconcile
actual numeric evidence before retrying, merging or releasing that authority.


### Windows runs and budget reconciliation

- Pushed authorized validation branch; opened PR #1. Enabled existing workflow
  and dispatched live mode with publish_alpha=false. Held local budget authority
  lock while GitHub owned its snapshot; no parallel paid work occurred.
- Regular PR Windows run 40847626785 passed at f17aa9a: 53 unit, 1 intentionally
  Linux-only guard skipped, 8 UI, real desktop smoke, installer build/install,
  all 11 installed fixture-provider scenarios. Downloaded/verified numeric report;
  saved docs/windows-extended-run-40847626785.json. Release step was SKIPPED.
- Live run 40847626764 failed because Actions TYPESAFE_API_KEY was empty. Runner
  guard stopped BEFORE native launch/network: zero provider calls. No fake pass.
  Downloaded numeric budget artifact via GitHub connector after direct gh artifact
  redirect was forbidden. Its counters exactly equal local: 42, $0.462422016,
  127172 tokens. Reconciled and removed local authority lock. No reset or spend.
- Saved docs/windows-live-blocked-run-40847626764.json. Added earlier missing-key
  workflow check so another unavailable-secret dispatch stops before build/setup.
  Key is scoped only to preflight and live invocation, never ordinary build/tests.
- User confirmation did not make the secret available to Actions. Need exact
  repository Actions secret configured securely; managed cloud key is separate.
  Do not extract/copy a proxy credential or retry identical missing configuration.
- Publication remains disabled; nothing replaced the public alpha. Merge of
  validation tooling is authorized; live integration remains blocked, not proved.
