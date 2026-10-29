# Session handoff — current state

Read AGENTS.md, DESIGN.md, docs/WORKLOG.md, docs/RELIABILITY.md and this file first.
WORKLOG.md and saved reports retain history; this file supersedes old missing-key,
permission and budget blockers. Do not repeat completed experiments as new evidence.

## Current continuation — warning merged, video evidence complete

PR #7 MERGED at3c2a80b931943164158683fd254df80514236455. SourceCI40898018412 and
main40898675905 PASSED79unit+oneintendedskip,9UI,native smoke,installer/install,
13fixture scenarios; release skipped. Warning tracks per-display movement delays;
no extension/provider/threshold change. Periodic checks target sustained distraction;
brief appearances between checks are acceptable per user.

PR #8 MERGED at9f2639695891ea7cff46fa6dbca0c08e81b6372d:
https://github.com/syukursyakir/blockliterallyeverything/pull/8. It is test-only
sustained-player tooling/evidence. Read SUSTAINED-VIDEO-RESULTS.md and raw linked JSON.
Original frozen three-trial cohort uses synthetic YouTube-like UI with actual1x
CC0 flower video, not real-service/new-source/independent accuracy evidence:
- Wide40898793801 PASSED4261ms/.94, decoded20->137, full cover/recovery,2calls.
- Compact40899628128 PASSED3277ms/.95, decoded21->108, cover/recovery,2calls.
- Compact switch40899997617 FAILED: positive.95 accepted after neutral replacement,
  zero changed-screen discards, one stale block,2calls. Preserve failure.
ONE separately frozen diagnostic40900883106 reproduced staleblock/.94,2calls.
Actual captured64px pair mean difference5.53% below8% global guard; postcapture
recorded121ms after replacement, response82ms after. This establishes the numeric acceptance path and supports localized-change
dilution; post-response pixels were not retained for semantic review, so native
compositor lag is not fully excluded. Original pair absent; its exact measurement
unknown. No production fix, threshold relaxation or older source27 causal claim.
No further paid trials planned. Next: prospectively assess localized-change handling
without starving ongoing video; do not rerun these cases as new independent evidence.

Current253/$2.785542144/860235tokens,19 max reservations left under cumulative3.
All8 new reservations/history reconciled from wrapper/report/profile chains, no paid
job/lock. Private authority /workspace/work/ble-real-2026-10-29/app-budget.json;
review key/captures /workspace/work/ble-sustained-2026-10-29 outside Git.
Direct cloud artifact storage denied403; read-only Actions recovery40899448984
verified first-run files without provider secret/calls. New single-trial log verifier
emits independently compared numeric chain; fixed six-trial protocol unchanged.
No network-policy bypass, no release. Raw report records recovery evidence source.
Test-only observer unit and strict runner tsc pass; original8 focused helpers pass.
SourceCI40900898602 atf4b644f PASSED80unit+oneintendedskip,9UI,native smoke,
installer/install,13fixtures; release skipped (adds observer unit).
Earlier source40898845707/40900022596 passed79unit+skip/9UI/13fixtures, same build/
installer/native smoke, release skipped. Main post-mergeCI40901874144 at9f26396
PASSED80unit+oneintendedskip,9UI,native smoke,installer/install,13fixtures; release
step verified skipped. Numeric summary docs/windows-ci-run-40901874144.json.
Warning merge and bounded video work COMPLETE with preserved stale-block limitation.
No further paid jobs or authority lock. Final follow-up changes continuity docs only.

## Periodic-check goal and movement-warning implementation

User clarified goal is interrupting sustained time-wasting: brief content appearing
between periodic screenshots is acceptable; frame-perfect video detection is not
required. User accepted clearer coverage reporting. Keep screenshot-only approach.
Working changes add per-display unresolved movement timestamps, a warning after15s,
and last-accepted-check age separately from request latency. New sessions reset
last-check timestamps; stop/error clear movement state. Accepted results or exact
valid cache hits clear only the relevant display. No guard/threshold/provider/
polling change; warning threshold is a UI choice, not a response guarantee.
Build/tsc passed; newly extended desktop lifecycle fixture and new focused Playwright
movement-warning test passed. Initial UI attempt used stale dist and failed; rebuilt
then passed. No full old suite rerun or Windows/live/provider test; no release/spend.
Warning change is merged in PR #7. Review scope is warning only; actual fast-motion
coverage and old source27 miss remain open. Native fixture is not Windows proof.

## Current user direction — screenshot-only

User declined the browser-extension direction after discussing TimeSlicer. Keep
screenshot-only detection; the assessment below is historical, not the active build
plan. User authorized the warning merge and bounded sustained-video checks described above.
Review found cloud checkLoop can repeatedly discard moving frames and return to
watching without a sustained-freshness warning; activity records individual discards
but the overview lacks accepted-decision age. Coverage warning is now implemented locally as described above; prioritize
prospective motion/switch-away evaluation before changing freshness.
Do not simply loosen the whole-screen difference threshold. Model reliability and
physical display limits remain open.

## Historical browser-context assessment (declined)

Read docs/BROWSER-CONTEXT-ASSESSMENT.md for the scoped continuation assessment.
The declined research proposal recommended local-only, opt-in observation with verified native
foreground/window/tab/document binding, minimal route categories and fresh stale-
message/switch-away checks. Current Jev interface is image-only; do not inject page
metadata into rules or bypass visual freshness. No extension or runtime change was
implemented. Present this concrete scope before architecture changes; collection,
Windows mapping/occlusion and eventual decision semantics remain unvalidated.
At that research stage no tests/model calls/release occurred; authority was245 THEN.
Use the current continuation/authoritative accounting above and below.

## Goal and authorization

Detection and native blocking reliability come before UI polish or release.
The user prioritizes fewer misses over false blocks. **95% reliability is NOT
established.** Arbitrary editable English rules are unvalidated.

User authorized pushing/merging and enabling/running Windows CI. Secret
TYPESAFE_API_KEY works in Actions and the scoped cloud environment; do not ask for
it again absent an actual auth failure. Never extract/print/copy key values.
User explicitly approved **$3 CUMULATIVE conservative reservations**, preserving
all prior counters/history. Continue useful bounded testing without per-batch
permission questions within this cap. No release publication, overwriting
v0.1.0-alpha.1, third-party messages or laptop remote access authorized.

## Latest completed fresh-family evidence

Read docs/FRESH-FAMILY-RESULTS.md and its frozen plan/raw reports FIRST. Two NEW
own-work, CC BY-SA source/author files, declared adult35/37, full/small prepared
variants pixel-reviewed and labeled BEFORE inference. Four variants caught(.74,
.80,.96,.96), zero platform false matches. TWO author/source groups, not four
independent subjects. No new explicit negatives/activity context/Windows accuracy.
Original settings hash46eb2974 unchanged; no tuning, app/provider change or release.

Initial attempt241 FAILED without a score; three cases unattempted. Retained original
partial report and reservation. Cause: ad-hoc direct bundle bypassed the EXISTING
proxy-aware scripts/evaluate-app.mjs wrapper. USE THAT WRAPPER; it already passes
--use-env-proxy. Free GET confirmed default Node timeout versus proxied200. Plan
amended BEFORE one controlled four-case run; all four then passed. Not a pristine
first-attempt4/4 cohort or five independent samples. No retry loop/key extraction.

At fresh-family completion authority245/$2.697461760/831497tokens;27 further maximum reservations fit THEN.
All before/report/authority counters matched, prior history preserved, NO paid job/
lock. Raw pixels private /workspace/work/ble-fresh-families-2026-10-29. Do not replay
these four cases as new independent evidence. Latest code remains merged PR #6,
validated at902565c; subsequent follow-ups are evidence/docs only.

## Completed large-motion correction (PR #6)

PR #6 MERGED at902565c1d86ca743a89ab5cf020268f12736fd9b:
https://github.com/syukursyakir/blockliterallyeverything/pull/6
Source branch validation/large-motion-20261029 completed; final source47d7e40.
Read docs/LARGE-MOTION-PLAN.md and docs/LARGE-MOTION-RESULTS.md FIRST.
Photo pan-wide40884733211 PASSED4144ms/.98. YouTube pan-wide40885047863 FAILED:
Jev .97/.96, both discarded due screen movement, no cover. Confirmed freshness
translation failure, NOT old source27 miss. Added bounded whole-frame axis translation
recognition over uniform padding; original8% guard otherwise unchanged,2% aligned
comparison and clean exposed/vacated strips. Cropped/vanished/new content rejected.
Native regression40886053424 PASSED3937ms/.93; observable40886564146 PASSED3991ms/
.93 with translatedView1 proving corrective branch was needed. Full cover/recovery.
Switch-away40886917348 PASSED: positive.98 discarded after neutral replacement,
newneutral.01 allowed, zero covers, three calls.4x adult30 run40887260295 PASSED
4017ms/.95, actualrate4/decoded counters advanced, cover/recovery; two calls.
Safe4x40887744347 FAILED predefined two-fresh-video-check requirement: two video
scores.02; one discarded/one accepted, zero blocks, then3-call bound paused. Not
false positive or safe-control pass. End/failure media state absent in original
report; future runner now records it. Do not retry to obtain green. General fast
video freshness remains limited; translated full-view fix does not solve it.
At PR #6 completion240/$2.642411520/817330tokens reconciled;32 max reservations fit THEN.
Use current authoritative accounting at the top; do not revert to240/245.
NO paid job/authority lock.80 local units/build/strict runner tsc pass.13 installed
fixture scenarios include forced translation/replacement/cropped capture regressions
(NOT AI accuracy). CI40887372936 at995ce3c PASSED79unit+oneintendedskip,8UI,native
smoke,installer/install,13scenarios. Final source CI40888553162 at47d7e40 PASSED
same full sequence (logs verified), earlier40887734346 also passed. Release skipped.
Post-merge main CI40889272599 at902565c PASSED same full pipeline (logs verified),
live_detection=false,
publish_alpha=false/release skipped. Numeric summary docs/windows-ci-main-run-40889272599.json.
Manual dispatch: squash default commit body inherited historical [skip ci]
markers so automatic push CI was skipped. FUTURE SQUASH MERGES: supply an explicit
clean commit_message to avoid inheriting skip markers; do not rewrite main history. Earlier40886736737/40886699772 failed new
fixture window lookup race, corrected using existing painted-cover helper.
Local free4x multi-loop smoke verified playback; future failure media snapshot added.
Original misses retained. No model/preset/threshold/poll interval change or release.

## Prior completed adult/video continuation (PR #5)

PR #5 MERGED atdf6bf402dc572d01dfbfa68d5c6ef8f39151d8d6:
https://github.com/syukursyakir/blockliterallyeverything/pull/5
Branch validation/adult-video-20261029 is completed. Validation source59ec29c. Read docs/ADULT-VIDEO-RESULTS.md and raw linked JSON FIRST.
Both requested gaps have evidence; do NOT restart acquisition or replay these trials.

New15-image frozen extension:13 explicit positive variants caught, two safe
visible-part crops allowed. Five licensed source-declared adult files: ages40/23
anatomy,30/24/27 activity videos. Three new activity authors plus one new anatomical
author;40 file shares earlier author/possibly subject. Variants NOT independent
subjects. Robot/User-Agent403 fixed compliantly with honest project identifier and
pacing, no bypass. Original settings/policy/threshold/provider unchanged.

REAL decoded playback: source44 run40864903082 passed3429ms/.98; source30
40865647116 passed3266ms/.98; source24 40866001135 passed4151ms/.88. Full native
cover and recovery; pinned byte hashes, media time and decoded frames advance.
Source27 first40866332567 FAILED: two further accepted nonmatching checks after
neutral, no cover; third-request sub-budget exhausted. Initial frames/scores absent;
CAUSE UNKNOWN, no claimed fix. Keep this miss and first cohort3/4 count intact.
Audited repeat40867576811 passed4242ms/.94; actual submitted image privately
reviewed, positive visible. Seven single-enabled-policy phase/replay diagnostics
scored.94–.96, not new independent accuracy or native evidence. Six fixed audited
replications40869174152 all passed; only two distinct positive hashes across six.
Six fixed UNINSTRUMENTED comparisons40870218075 also passed. Source27 total one
miss then13 passes, no causal diagnosis; across4 clips,16/17 native positive trials
passed. These are correlated, not a representative95% estimate. No speculative
threshold/prompt/provider change to hide the nonreproduced failure.

Safe actual CC0 flower playback40868363977 passed two fresh checks, zero covers,
clean stop (three requests including neutral). Not positive-blocking evidence.
Audit is optional test-runner pass-through only: no modified request/response;
actual input frames encrypted before file/artifact output, scores/hashes only in
report, private RSA key local. Normal runtime has no new retention behavior.
Series supports one or SIX fixed trials, full18-request worst-case preflight and
max3 each; preserves every failure, stops unexpected capture/provider/accounting
errors, never an until-success/network-retry loop. Reconcile every profile/summary.

At PR #5 completion authority was223 attempts,$2.455240704 reserved of cumulative3,
756421 tokens (~$0.031769682 estimated usage);49 further max reservations fit THEN.
Those budgets reconciled sequentially. Use current authoritative accounting at the top, not these
historical223 or stale182 snapshots from chronological logs. Final source CI40872034255 PASSED:74 unit +one intended
skip,8 UI, native smoke, installer build/install and11 fixture scenarios; no release.
Local18 focused tests and strict runner/evaluator tsc passed. Main post-merge
CI40872805425 PASSED the same full pipeline, release skipped; saved numeric summary
is docs/windows-ci-main-run-40872805425.json. PR #5 validation work is completed.

## Prior completed repository stage (PR #4)

PR #4 MERGED into main at10a7ea4627ee578b6ae7d8486c97639950f88287:
https://github.com/syukursyakir/blockliterallyeverything/pull/4
Source branch validation/motion-coverage-20261029 is completed, not pending work.
Earlier PR #3 merged atfdfdc5a39e2402ee5cc44a739b62255cde9825e3:
https://github.com/syukursyakir/blockliterallyeverything/pull/3

PR #4 Windows CI40861757089 PASSED:71 unit +one intended Linux-only guard skip,
eight UI, desktop smoke, installer build/install and11 fixture-provider scenarios.
Post-merge main CI40862226406 PASSED the same full pipeline; release skipped.
Summary: docs/windows-ci-main-run-40862226406.json. No release.
Earlier main CI40859115538 passed before PR #4 (70 unit +one skip, same rest).
Ordinary CI uses fixture replies for native scenarios; it is NOT model accuracy.
Local16 focused unit tests and strict native-runner tsc passed for PR #4.

Public v0.1.0-alpha.1 installer was NOT replaced and lacks newer tested fullscreen
sizing fixes. CI-built installers are artifacts, not an auto-update. Existing
publisher clobbers the old tag; explicit release authorization and a new version/
release strategy are required before using it.

## Detection evidence — preserve strata and caveats

Read docs/BROADER-EVALUATION.md and docs/CONFIRMATORY-RESULTS.md with raw JSON.

- Earlier38 baseline app inputs +four candidate retests: explicit8/8 positives
  (related sizes/four source families); platform cross-rule false matches found.
  These are development evidence, not independent acceptance coverage.
- Broader48 fresh source/session cases split development24/held-out24 BEFORE
  inference. Platform wording selected with development ONLY and exact settings/
  manifest hash frozen before held-out. Held-out caught explicit6/6, YouTube3/3,
  social4/4; no false blocks. Too few positives for a95% claim. Twelve later
  correlated panel/injection/mixed-rule stress variants passed; not extra subjects.
- Only platform starter text was clarified. Exact old stock instructions upgrade
  on saved-preference load; custom text/names/enabled flags/settings preserved.
  Validator/user edits stay literal. Explicit instruction, threshold.4 and provider
  unchanged. Two covered/suggestive-body development false positives remain.
- New21 confirmatory cases used unchanged settings and labels/hashes frozen before
  calls. YouTube9/9 and social7/7 (all Instagram) caught, no platform false matches;
  one ambiguous empty subscriptions shell excluded from video binary scoring.
  Shared platform templates/topics remain correlated; no independence guarantee.
- New explicit stratum has ZERO positives and1/21 matches against frozen negatives.
  Full-resolution follow-up found tiny nude painted figures at MoMA grid bottom
  missed in contact-sheet annotation. Original label/result retained with caveat:
  not a clean ordinary-clothing false-positive example. Do not quietly relabel it
  or advertise a pristine specificity result. Art-scope needs prospective labels.
- Four TikTok skeletons and an empty/private Instagram profile excluded BEFORE
  inference. New adult-source requests returned403, no image/positive obtained.
  No source-access bypass or new TikTok/explicit-positive coverage claimed.

Labels were set by this agent, not an independent human panel. Adult provenance is
source-declared, not ID verification. Do not tune on used held-out data and still
call it untouched. Do not increase thresholds or relabel errors to hide misses.

## Real Windows integration proof

Read docs/LIVE-WINDOWS-RESULT.md, docs/MOTION-RESULTS.md and run-specific JSON.
All actual capture and hosted Jev, isolated seeded profiles/onboarding, one hosted
1024x768 display. Source repeats are integration tests, not new accuracy samples.

Full already-active neutral->positive->native cover->button recovery PASSED:
- 40858303368: real reviewed licensed adult source, pinned hash, explicit.98,
 observed4264ms, two requests.
- 40858537258: real loaded public YouTube search page, video.93,3938ms, two calls.
- 40858809731: synthetic social control,.95,3902ms, two calls.
All covers visible/focused/topmost/fullscreen with exact display bounds; recovery
removed cover and paused session. Timing includes three-second polling/IPC, one
trial per input; no median/tail, hardware or frame-accurate guarantee.

Controlled-motion extension:
- 40861132261 pan PASSED: same reviewed adult screenshot continuously +/-12px,
 explicit.98,4214ms, complete cover and button recovery.271 animation callbacks
 sampled after cover, not visible-frame measurement or actual video playback.
- 40861748575 switch-away PASSED: known positive stimulus request observed,
 DIFFERENT neutral document painted5ms later, changed-frame discard and fresh
 neutral check observed, zero covers/blocks, clean stop. Three requests. Discarded
 verdict not observable, no score claim; this is a negative stale-result control.

Failed attempts retained:
- 40857749164 YouTube preparation insufficient thumbnails before any call; added
 bounded loaded-thumbnail wait, then full retry passed.
- 40860770322 initial pan failed blank/protected initial capture before calls,
 counters156 unchanged. Runner now waits for varied actual capture pixels before
 starting; no runtime blank-check relaxation/provider or capture substitution.
- 40861359039 first switch failed fresh-check assertion: restored identical initial
 neutral frame within30s cache lifetime. Watching/checks1/blocks0, two calls.
 Corrected test to DIFFERENT neutral, cache/runtime unchanged; retry above passed.
- 40850770758 historical startup-only synthetic social native step/report PASSED
 (.95,951ms) but overall workflow CANCELLED after artifact upload. Preserve both
 facts; not already-active-session timing. No rerun just to relabel workflow green.
- 40849807420 authenticated cleanup failure lost primary report; counters recovered,
 NOT a claimed pass. PR #2 cached child handle before close/saved report before
 cleanup.40847626764 earlier empty-secret preflight is superseded, not current.

Mixed DPI, multiple monitors, exclusive games, physical OS sleep/lock, repeated
latency distributions and representative large/fast-motion video reliability unproved.
Actual controlled decoded-video playback now has evidence in the current section.
Installed fixture tests/emitted OS signals do not certify these conditions.

## Authoritative accounting — never reset

/workspace/work/ble-real-2026-10-29/app-budget.json
Current253 reservations,$2.785542144 of approved cumulative3,860235 input tokens,
~$0.036129870 estimated usage at.042/million. Reservations are not bills; old missing
62/64 history remains separately preserved, not zero.19 more maximum reservations
fit (272 total). Migration from.50 to3 retained45 attempts/137877 tokens and explicit
authorizationHistory. No remote paid job or authority lock remains.

Before a remote paid run: freeze local paid work, create durable authority `.lock`
with before state/run identity, pass EXACT current retained JSON, run sequentially.
After completion, verify report/wrapper/profile counters agree, are monotonic and
within cap; atomically reconcile local authority BEFORE removing lock. If interrupted,
keep lock/recover isolated profile after process exit. A file lock cannot lock a
second machine's copy. Never use ignored work copies as fresh authority or blindly
retry failed runs. docs/WINDOWS-LIVE-VALIDATION.md is the current protocol.

## Next useful work

Actual adult-positive extension and decoded-video work are DONE with limits in
ADULT-VIDEO-RESULTS.md. Keep the unresolved FIRST source27 miss open. Thirteen later
passes, including six uninstrumented, did not reproduce it; absent original frames,
do not invent a cause/fix or burn the budget repeating the same successful clip.
Future new misses should use explicit controlled diagnostics. Do not ask for a new
key: successful real calls and completed audit already rule out the old setup issue.

Read LARGE-MOTION-RESULTS first: confirmed whole-view translation failure is fixed
and directly exercised; real switch-away preserved. Safe4x control still failed
freshness bound (not classification). Do not repeat these seven native runs as new
accuracy evidence. Original source27 miss remains unknown, not fixed by translation.
Two more photo-source groups are now tested in FRESH-FAMILY-RESULTS; do not redo
that acquisition or count size variants as independent subjects. For a95% target,
next useful coverage is genuinely new representative source/author
families (including other adult activity contexts), prospective labels, hard safe
lookalikes and clearer annotation/second review, plus large/fast video motion and
real hardware/display conditions. Three targeted adult-declared couple/context metadata queries yielded no NEW
usable source beyond the retained44 clip; cache is other-activity-metadata.json
in the private adult-video work directory. No extra images or calls from that probe.
Do NOT inflate counts with related frames or
replay the15-case extension, seven diagnostics or either six-trial series as new
acceptance evidence. No UI redesign, release or threshold/provider change without
a demonstrated cause and meaningful fresh validation. Current evidence does not
certify95% and installed alpha is unchanged. No laptop/physical-device access is
authorized; do not imply hosted Windows certifies the user's machine.

## Implementation and private files

Windows-first Electron/React/shadcn, dark UI. User-selected hosted TypeSafe Jev
jev-1.14.0 experimental images; screenshot consent required. Do not silently switch
to local OmniJev, which had documented serious errors. Defaults threshold.4,
interval3s, session25min, explicit enabled/video-social disabled, detection-only.

src/shared.ts: settings/presets/matcher/exact starter upgrade.
electron/main.ts: screen capture/freshness/all-display cover/encrypted key/budget.
electron/jev.ts: fixed request/parser/reservations, no retries.
electron/screen-cache.ts: exact unchanged30s cache,8% mean pixel freshness check.
lab/run-app-evaluation.ts: actual request/matcher fixed-image evaluation.
lab/run-windows-live.ts: real native full/startup/pan/switch-away/decoded-video controls.
scripts/test-live-series.mjs: fixed one/six-trial diagnostic orchestration.
lab/reviewed-videos.json: pinned media/ranges/provenance; no raw media in Git.
.github/workflows/windows.yml: ordinary CI, gated live and encrypted capture-only.

Normal runtime has no intentional screenshot retention; hosted consented frames
leave device, provider terms apply, OS paging/dumps prevent absolute guarantees.
Cloud key is not bundled or automatically installed on the user's laptop.
Corpora under /workspace/work/ble-real-2026-10-29, ble-broader-2026-10-29 and
ble-motion-coverage-2026-10-29, ble-adult-video-2026-10-29 plus earlier dirs.
Encrypted-only capture runs40853592968/40860317868 made NO model calls. Decrypted
pixels/private RSA key remain local outside Git/public artifacts. Raw reports
include source URLs/hashes/licensing/provenance, no raw image bytes or credentials.
Append meaningful outcomes/limits/next work to WORKLOG.md and keep this file current.
