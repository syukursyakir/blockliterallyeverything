# Live Windows acceptance protocol — pending execution

Status: NOT RUN. This Linux workspace cannot establish a Windows result. Existing
Windows fixture tests and the image-only live reports are separate evidence.
Do not log this plan as a passing test or repeat the old simulated-provider suite
and call it live inference. No laptop remote access is configured or authorized.

## Build and account prerequisites

Use a Windows build from at least app commit 2c1eec2, containing the full-display
cover fix. The existing public v0.1.0-alpha.1 installer predates that fix. A tested
installer artifact exists in run 40824967950, subject to artifact retention; verify
its provenance rather than assuming the public installer is current. Any fresh
build/test branch push or release needs explicit authorization; none was made.

Use an interactive Windows session with the app, explicit cloud screenshot consent
and a securely entered key. The cloud key is not installed on the user's laptop.
Close private windows on EVERY connected display before starting. Start with one
display; later multi-monitor/DPI/fullscreen checks are separate cases. Do not
configure unattended remote access to carry out this plan.

Record the existing app and provider budget BEFORE testing. The current cloud
experiment allowance has nine further conservative requests available after 36
retained reservations (see HANDOFF.md). A Windows test must not silently start a
second allowance or reset app accounting. Keep the provider cap. The visible app
budget persists; a controlled Windows run needs an explicit accounting plan before
using this remaining cloud allowance. Connection verification also consumes a call.
No automatic retries or long unattended sessions.

## Prepared opt-in runner (NOT RUN on Windows)

`lab/run-windows-live.ts` and `scripts/test-live-windows.mjs` implement a first
single-display live check. They do not replace net.fetch or desktopCapturer. An
isolated profile is seeded with configuration/onboarding state (so this does NOT
test onboarding). The real app ledger is seeded from retained accounting, with a
three-request maximum sub-budget. The test starts on a neutral screen, then paints
one reviewed positive while the session is already running, verifies native cover
bounds/topmost/focus and button recovery, stops the app, and reconciles its ledger.
No screenshots or credentials are written into the result. The profile is kept
for recovery; a reconciliation/process-stop failure retains the budget lock.

Prerequisites: Windows, Node 24, built app (`npm ci`, `npm run build`), source corpus
pixels, a separately securely provisioned TypeSafe key in TYPESAFE_API_KEY, and
exclusive access to the retained ledger. Do not extract the cloud credential or
assume it is usable on Windows. When transferring the ledger between machines,
STOP all cloud testing first; only one copy may be authoritative, and Windows
results must be reconciled back before any further cloud calls. File locks only
coordinate processes on the SAME filesystem; they cannot lock a second copy.
No Windows run or transfer is authorized/executed merely by writing this runner.

Example after the prerequisites/accounting are explicitly arranged:

```powershell
node scripts/test-live-windows.mjs --allow-cloud --corpus C:/validation/manifest.json --case instagram-esa --ledger C:/validation/app-budget.json --output C:/validation/live-windows-01.json
```

Use a fresh output/profile path; the runner refuses reuse. If installed-app testing
is desired, BLE_SMOKE_APP_EXE must point to the verified corrected executable.
A failed/aborted run may consume reservations; do not retry automatically. The
initial runner intentionally requires one display. It checks button recovery;
other recovery modes remain separate cases. Timing is automation-observed after
two animation-frame callbacks to observed painted cover, not external frame-accurate
measurement. No native result is available yet. Linux guard test, type check,
bundling and syntax checks are implementation checks only.

## Frozen configuration

Record app version/commit and installer SHA-256, Windows version, CPU, displays,
resolution and scaling, provider/model, exact rule text, threshold, interval and
existing budget counters. Start at the unchanged preset threshold 0.4 and default
three-second interval. Enable ONE rule at a time to expose cross-rule mistakes.
A low-confidence rule-specific false match must not be hidden by another rule.

Use consented, known-labeled public examples. Prefer the existing non-sensitive
social-feed captures for initial pipeline checks. Metadata/hashes are in the live
reports; the pixels remain in the retained corpus. Do not upload private browsing
or redistribute the anatomical photographs through public test artifacts.

## Minimum sequence and observations

1. Start in detection-only mode on a known negative, then display the selected
   positive. Record what appeared and when, the first matching activity event,
   any error, and counters before/after. Confirm no cover appears in this mode.
   Pause immediately after the observation; do not leave inference running.
2. Pause, open Model & settings, disable Detection-only mode, save, then start
   on a known negative. Display the same positive and keep it stable. Record time
   from the first fully painted positive frame to a fully painted native cover.
   Confirm the correct rule and complete display/taskbar coverage. Request latency
   and time from clicking Start are NOT this measurement.
3. Use Pause & return to app. Confirm cover release AND paused session, without
   assuming that resuming an unchanged positive should be allowed. In a separate
   bounded attempt, verify Ctrl+Shift+F12 recovery. Native close/tray recovery has
   fixture evidence already; expand live checks only when justified.
4. Negative control: with only the social rule enabled, show ordinary work and
   YouTube Shorts. The synthetic Shorts case has a known social false match;
   preserve that result if reproduced rather than relabeling it or raising the
   threshold to hide it. A small real social panel is a positive control.
5. Later, with separate case IDs and budget: moving video, transient content,
   a foreground change during inference, a second monitor, mixed DPI and ordinary
   fullscreen. Exclusive-fullscreen games and OS lock/sleep need actual OS/device
   checks; emitted signals do not count.

Use an external stopwatch for an initial manual observation and label its timing
precision. A proper measured timing run needs frame-presentation and cover-ready
instrumentation or a consented recording of only the controlled test scene. Do
not fabricate exact millisecond latency from an Activity timestamp. Repeated
trials are necessary for a median/tail claim and must fit an authorized budget.

## Record format

For each case: ID, date/time/timezone, operator, build/hash, exact settings,
source/prepared image hash or public URL/session identity, expected outcome,
observed detection and matched rule, complete-cover outcome, timing method and
latency (or unmeasured), recovery action/outcome, error, before/after accounting,
and any deliberately retained non-sensitive evidence.

Failures, missing captures, provider errors and timeouts remain visible outcomes.
Do not remove them from the report denominator or count an API error as safe.
Update WORKLOG.md and HANDOFF.md only with what actually ran. Publishing remains
separate from validation.

## Prepared GitHub execution path — needs user input

The EXISTING windows.yml now has a local opt-in `live_detection` dispatch input
and an isolated read-only live job. It skips the ordinary installer/release job,
rejects publish_alpha=true, uses a synthetic self-authored scene created on the
runner, and uploads ONLY numerical report/accounting (including recovery ledger),
not screenshot files, secrets, settings profiles or the adult corpus. It uses real
Windows capture and the real provider. Its synthetic scene is an integration
fixture, not extra real-service accuracy evidence.

scripts/prepare-windows-live.mjs validates an exact retained accounting snapshot
from BLE_RETAINED_BUDGET, refuses an existing output directory and performs no
model calls. Local preparation was exercised with Chromium; generated input was
inspected. A COPY under ignored work/windows-live-preflight is non-authoritative.

Current retained budget has THREE attempts remaining after 42 reservations. Do
not use the older nine-attempt figure above (historical). Before remote dispatch,
freeze local paid work, hold an in-flight authority marker/lock, pass the exact
current ledger JSON to retained_budget, and reconcile the run artifact before
releasing authority or starting further requests. An interrupted remote run can
retain charges: do not retry or use stale local counters. Three attempts bound
one initial-negative -> positive -> cover/recovery trial; median/tail timing still
requires a later authorized budget.

Necessary user input:
- Earlier instruction forbids publishing. Permission is needed to push a test-only
  branch and run Windows Actions; no installer/release publication is proposed.
- The managed cloud key is scoped to TypeSafe and is not a GitHub Actions secret.
  A read-only `gh secret list --json name` probe failed HTTP 403 (integration lacks
  access); no secret values were accessed or transferred. User must provision or
  confirm a capped TYPESAFE_API_KEY Actions secret securely in repository settings.
  Do not paste a key into chat or dispatch inputs.

After that, dispatch the existing workflow file at the test branch ref with
live_detection=true, publish_alpha=false and the exact retained_budget JSON.
Do not create a release or push main. The workflow uses only the secret during
its live invocation; builds and unrelated test steps do not receive it.

54 unit tests, build, candidate dry-run tests, prep execution, YAML structure/
release-isolation checks and runner checks passed locally. Windows execution and
its native runner behavior remain UNRUN; no Actions run was dispatched.


## Attempted execution: configuration block, not a native result

User authorized pushing/merging and dispatch. PR #1 was opened and regular Windows
run [40847626785](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40847626785)
passed all 11 fixture-provider installed scenarios, 53 unit tests (one Linux-only
guard skipped), eight UI tests, desktop smoke and installer build/install.

The [live run 40847626764](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40847626764)
failed at key preflight: Actions supplied an EMPTY TYPESAFE_API_KEY. No native
session or provider call ran; downloaded accounting exactly matched 42 retained
requests and $0.462422016. Local authority was restored after verification.
There is no live inference-to-cover result. Numerical evidence is in the two
run-specific JSON files in docs/. No release was published.

Workflow now checks the key before setup/build. Configure the repository ACTIONS
SECRET securely, not an ordinary variable or only the cloud-environment binding:
https://github.com/syukursyakir/blockliterallyeverything/settings/secrets/actions

No secret-administration access is available through the integration (403).
Do not put values in chat, dispatch inputs or Git. After user confirms the actual
Actions secret is available, use the retained ledger and authority protocol for
one controlled dispatch. No automatic retries while the configuration is unchanged.


PR #1 is now merged (2884b48). Latest PR run 40848323490 and post-merge main run
40848861167 both passed the full ordinary Windows suite. Workflow is enabled;
no release was published. The live secret blocker is unchanged. New main workflow
references the exact repository/organization secret; no GitHub environments exist.
Only the user can supply the secret with the currently available permissions.


## Current result: secret available and a bounded live pass

Read [LIVE-WINDOWS-RESULT.md](LIVE-WINDOWS-RESULT.md). Secret availability is FIXED.
The first authenticated run exposed a cleanup bug, now corrected and regression
covered. PR #2 is merged. Explicit positive_at_start=true mode performs one real
request rather than the default three-attempt full protocol; the prepared image
is visible BEFORE session start, so it does not prove active-session change timing.

Run 40850770758 native step and artifact upload succeeded, saved passed=true and
all reconciled budgets. A late cancellation request after those steps made the
overall workflow cancelled; JSON preserves that caveat. Full cover/recovery were
verified. No need to rerun merely for a green overall status. No 95% claim.

The allowance is EXHAUSTED at 45/$0.49545216. Do not start another live or image
request until a new cap is authorized. A $3 cumulative conservative allowance
question is pending, NOT approved. No further secret entry is needed.
