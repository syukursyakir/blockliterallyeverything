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


### Merge completed and main verified

PR #1 merged at 2884b487230c28b62f58ecc9a7e5f2f7d59ba975 after latest-head PR
run 40848323490 passed. Post-merge main push run 40848861167 also PASSED: 53
unit + one Linux-only skip, eight browser tests, native smoke, installer build/
install, 11 fixture-provider installed scenarios. Release publication skipped.
Saved numeric summaries for both current-head and main runs. Workflow is enabled.

User said they thought the key was added. Rechecked safe metadata: main workflow
references the exact secrets.TYPESAFE_API_KEY; repository environments list is
empty. Secret listing remains inaccessible; no values accessed. Explained that
working Codex cloud binding does not configure a GitHub Actions repository secret.
Waiting for repository Actions key availability; no further paid/live retry.

Authoritative ledger remains unchanged at 42 after verified failed-run artifact
reconciliation; three attempts still fit. Handoff rewritten as current state to
remove stale permission/provider instructions and preserve next-action clarity.
This final evidence/handoff update is documentation only; use [skip ci] to avoid
another identical native build, with already-completed main checks recorded above.


## 2026-10-29 — Actions secret working; actual native cleanup bug

User added repository secret and asked to check. Dispatched main live run
40849807420 under retained authority lock. Secret preflight passed, two REAL
requests completed (7138 input tokens), then native runner crashed during cleanup:
Playwright application.process() getter called after close disposed dispatcher.
Primary report empty, so no fabricated native pass. Retrieved artifacts, recovered
profile ledger 44/$0.484442112/134310 and reconciled authoritative local ledger;
parent artifact wrapper was stale at 42. Completed job had ended its native process.

Fix caches the ChildProcess handle BEFORE close, writes primary outcome BEFORE
cleanup, and preserves existing conservative reconciliation. Regression tests
cover disposed process getter and signal termination. Added explicit one-request
positive_at_start protocol to use the LAST remaining approved reservation. This
checks positive present when session starts, not active-session content transition;
report states timing/protocol limits. Original full protocol still caps three.
No change to product runtime, defaults, model, thresholds or privacy behavior.
57 unit tests and build passed locally; native runner strict type check passed.
Next: push correction, opt-in one-call live Windows run, reconcile actual artifacts,
then merge after checks. No additional allowance, retries or release publication.


### Controlled live Windows pass and exhausted allowance

Run 40850770758 at 821b888 completed real capture/provider/cover/recovery and
artifact upload SUCCESSFULLY. Saved primary report passed=true: actual social
score .95, full 1024x768 visible/focused/topmost/fullscreen cover, button recovery
paused and removed cover, 951ms presentation-to-observed-cover including startup.
One synthetic positive-at-start scene; not general reliability or active-session
change timing. No capture/provider substitutions. Onboarding/profile was seeded.

A cancellation request during review arrived after those steps and marked the
OVERALL workflow cancelled. This status is retained in saved raw report, alongside
native step success; not represented as a green workflow. No further API calls to
recreate an otherwise passing report. Verified all native assertions and downloaded
report/wrapper/profile accounting. Reconciled local ledger to 45/$0.49545216/
137877 tokens, ~$0.005790834 estimated; restored local authority. ZERO additional
whole requests fit the $0.50 allowance. Asked user about a standing $3 cumulative
conservative allowance; question is not approval. No more paid work until answer.

PR #2 merged at 35fb5f71e92cbe582e6abf06f68e562dc0b6195e after regular Windows
run 40850774234 passed. Post-merge run 40851411369 is running. Added
windows-live-run-40850770758.json and LIVE-WINDOWS-RESULT.md with exact limits and
workflow-status caveat. Key now works: don't ask user to set it up again.
Product runtime/defaults/provider/threshold unchanged; no release published.


### Final post-merge verification

Main run 40851411369 at 35fb5f7 PASSED: 56 unit tests plus one intended Linux-only
skip, eight UI tests, real desktop smoke, installer build/install and all 11
fixture-provider installed scenarios. Release step skipped. Saved per-run summary.
All code/runner fixes merged; this final report/handoff commit is documentation
only and skips a redundant CI rerun. Key availability is resolved permanently for
this workflow unless credentials later change. Current allowance remains exhausted
at 45; user budget question is pending, no new cap assumed or paid work started.


## 2026-10-29 — standing $3 cumulative allowance approved

User explicitly answered Yes, use a $3 cumulative reservation cap. Migrated the
AUTHORITATIVE existing ledger from .50 to 3 under exclusive lock; preserved all
45 attempts/$0.49545216/137877 tokens and prior 62/64 metadata. Added dated
actual authorizationHistory; no reset, per-run allowance or hidden parallel cap.
Up to 227 additional attempts fit. Key already works; no repeated setup requests.

Added shared evaluation-budget validator with hard approved $3 upper bound,
updated static/native/preparation callers, and removed obsolete --init-budget
CLI path so absent files cannot initialize a fresh allowance. Added trust-boundary
cap/history tests. 65 unit tests/build and strict runner type checks passed.

Continuing source inventory and real public captures on local branch
validation/independent-corpus-20261029. New development/held-out split is by source
family before inference; don't call repeated frames/size variants independent.
No release, provider/default rule or threshold change. Collect labels/provenance
and freeze manifests BEFORE any new paid predictions.


### Public source acquisition and private capture transport

Cloud Chromium failed YouTube with ERR_TUNNEL_CONNECTION_FAILED (including mobile
and search URLs); no direct/proxy bypass attempted. Preparing capture-only Windows
job as an authorized platform fallback, with no Jev key or model calls. Screenshots
are encrypted (random AES-GCM key wrapped with local RSA public key); private RSA
key stays 0600 outside Git in /workspace/work/ble-broader-2026-10-29. Only encrypted
package and non-sensitive status artifact upload, never plaintext images. This
permits local pixel review before labeling/inference without public redistribution.
Round-trip/wrong-key/tamper/path tests and an actual public capture->encrypt->local
decrypt smoke passed. Capture targets restricted to explicit public HTTPS hosts,
no credentials/ports; isolated browser does not inherit TypeSafe key.

68 local unit tests and production build passed. Candidate new adult sources have
explicit adult declarations/free licenses; reject age-ambiguous sources and AI/
art-only images for real-photo coverage. Professional/source families kept together;
source labels are pending visual review, never inferred from filename alone.


### Broader frozen corpus and observed results

Windows capture-only run 40853592968 succeeded with 12 screenshots encrypted to
local RSA key; no API secret/model calls. Decrypted only locally. Real YouTube
search/channel/home/watch UI finally obtained; watch had bot sign-in overlay but
recommendations/chrome visible, no playback claim. Instagram rate-limit captures
excluded. Local public pages and eight actual IG grids (visible Close icons
clicked normally) plus thirteen reviewed adult-photo cases formed 48 cases.
Adult sources declared >=21 at capture; files with 18/19 age declarations or
uncertain provenance were not downloaded for this cohort. Source/photo families
assigned dev/held-out before inference; labels and hashes frozen before predictions.

Development 24 baseline caught 5/5 explicit, 3/3 YouTube, 5/5 social; false blocks
were two covered-body/suggestive photos and a YouTube match on Instagram. Candidate
platform clarification retained all positives and removed the platform false match.
Frozen settings/hash chosen using ONLY dev, then held-out 24: explicit6/6, video3/3,
social4/4 and zero false blocks. Confidence denominators remain far too small for
95% certification. Twelve later correlated development stress variants (small real
panels, screenshot instructions, mixed rules, benign mentions) all correct, not
extra independent subjects. Preserved raw reports and EVALUATION-POLICIES.md.

Adopting ONLY clarified platform starter text; explicit/threshold/provider unchanged.
Exact untouched old stock strings upgrade on preference load, with activity notice;
custom text/name/enabled/settings preserved. Validator/user edits remain literal.
Added meaningful migration regressions. 71 unit tests/build/strict runner type
checks passed. Added reviewed real source options to native preparation: guarded
public YouTube page and exact-hash age/licensed adult reference, with no raw image
artifacts or keys during prep. Actual adult-scene prep smoke passed with no calls.

Accounting after batches: 129 attempts, $1.420296192 reserved of 3, 421419 tokens,
~$0.017699598 estimated. Prior calls and authorization history retained. Next native
runs own authority sequentially; no parallel local paid work while remote is active.


### Full Windows live transitions with actual sources

Normal PR run40857750402 PASSED:70 unit +1 intentional Linux-only skip,8 UI,
native smoke, installer build/install and11 fixture-provider scenarios; no release.
YouTube full run40857749164 failed in preparation: insufficient loaded thumbnails
after a fixed2.5s wait; no inference step ran, downloaded budget artifact exactly
matched129. Replaced fixed delay with <=30s visible-loaded-thumbnail wait, retaining
HTTP/host/DOM guards. Node syntax check passed; real Windows retry passed.

Adult full run40858303368 PASSED: neutral allowed, actual reviewed exact-hash
licensed adult source painted during protection -> explicit score.98 -> complete
1024x768 focused/topmost/fullscreen cover -> button pause/recovery,4264ms observed.
YouTube retry40858537258 PASSED: real loaded public search page during protection,
score.93, same native cover/recovery assertions,3938ms observed. Each two calls.
No capture/provider substitution; isolated onboarding seeded; source repeats, not
new accuracy samples or hardware/latency-distribution certification. Raw screenshots
not uploaded; source/hash/provenance in saved numerical reports.

After these:133 attempts,$1.464336384 reserved of cumulative3,435752 tokens;
all three remote accounting copies matched and sequential authority reconciled.
Social synthetic full transition now owns authority; no parallel local paid calls.

Social full control40858809731 PASSED, workflow green: neutral allowed -> synthetic
feed score.95 -> full focused/topmost cover -> button recovery,3902ms observed.
Two calls, all accounting copies agreed. All3 full transitions now passed, each
one trial on one display; not a95% claim or dynamic/hardware certification.
Normal latest PR CI40858351838 PASSED:70 unit +1 intentional skip,8 UI, native
smoke, installer build/install and11 fixture scenarios; release skipped.
Final cumulative authority:135 attempts,$1.48635648 reserved of3,442937 tokens,
~$0.018603354 estimated actual charge. Prior history retained, no remote job/lock.
137 further maximum reservations fit; no reset. Next larger independent positive
coverage plus dynamic-screen/hardware conditions. No release publication.

PR #3 MERGED at fdfdc5a39e2402ee5cc44a739b62255cde9825e3. Post-merge main
run40859115538 PASSED (verified final conclusion/log):70 unit +1 intentional
skip,8 UI, desktop smoke, installer build/install and11 fixture scenarios. Release
step skipped; existing public alpha assets still show original05:15 UTC updates.
Updated RELIABILITY.md current section to supersede obsolete audit prerequisites;
HANDOFF.md contains current cap/counters, completed runs and remaining gaps.
No paid test or remote authority lock remains. Final follow-up only continuity docs.


### Confirmatory extension and controlled-motion preparation

User authorized next independent cases/moving checks within existing3 cap. Read
current handoff/skills; no redo of completed batches. Frozen next protocol before
new inference. Encrypted-only Windows capture40860317868 obtained14 fresh pages;
local browser7 new IG grids. Five incomplete/private feeds excluded before calls.
New adult-declared source/API requests unavailable403; no bypass/download/positive
claim.21 labeled/hash-frozen cases, unchanged setting hash; raw report retained.
YouTube9/9, social7/7, zero platform false matches. Explicit1/21 matches against
frozen negatives, no positives. Full-resolution post-prediction inspection of MoMA
revealed tiny nude painted figures missed in initial contact-sheet labeling; keep
original result with caveat, not a clean ordinary-photo false positive. No tuning.
Cumulative after batch156,$1.717567488 reserved,517346 tokens.

Added live_motion pan (+/-12px continuous source-screenshot motion) and switch-away
during inference with actual capture/provider. Switching must discard changed frame,
recheck neutral, keep no cover, stop; not a positive-blocking pass. Unit helper
rejects mixed startup/motion modes; strict tsc passed. Pan run40860770322 owns
authority/lock; no local paid calls. No product/runtime/preset/provider changes.


### Controlled-motion outcomes and runner corrections

Pan40860770322 failed BEFORE API use: initial blank/protected capture, counters156
unchanged and all copies verified. Native show/focus can precede compositor paint;
runner now waits on varied actual capture pixels before starting, discards bytes in
memory, preserves production blank checks.16 focused unit tests/strict tsc passed.
Retry40861132261 PASSED with actual pinned adult source panning +/-12px:score.98,
4214ms observed, full cover+button recovery.271 animation callbacks sampled after
cover, not a visible-frame count. Two calls, accounting158. No real-video claim.

Switch-away40861359039 failed fresh-check assertion: restored exact initial neutral,
which legitimately reused30s cache; mode watching, checks1, blocks0, two new calls.
Preserved failure and reservations160. Changed neutral document, app cache unchanged.
Retry40861748575 PASSED: observed positive request, different neutral painted5ms
later, changed-frame discard and fresh neutral check, zero covers/blocks, clean stop.
Three calls. Discarded verdict not observable; not a positive-blocking result.
All report/wrapper/profile counters matched and reconciled sequentially.

Current163 attempts,$1.794637824 reserved of approved cumulative3,542374 tokens,
~$0.022779708 estimated usage.109 further maximum reservations fit; prior history
retained, no remote lock/paid job. No screenshots/keys public, no release. Rewrote
WINDOWS-LIVE-VALIDATION.md as current protocol; historical stale key/approval/cap
statements superseded to avoid repeating user setup or old work. PR #4 CI40861757089
PASSED (final logs verified):71 unit +one intentional skip,8 UI, desktop smoke,
installer build/install and11 fixture-provider scenarios; release skipped.

PR #4 MERGED at10a7ea4627ee578b6ae7d8486c97639950f88287. Post-merge main
run40862226406 PASSED (conclusion/step/log verified):71 unit +one intended skip,
eight UI, desktop smoke, installer build/install and11 fixture-provider scenarios.
Release step skipped. Consolidated HANDOFF.md so current stage/authority/remaining
gaps appear without obsolete permission/key blockers. No paid job/lock; counters163
unchanged. Final follow-up only continuity docs and numeric CI summary, no app change.
