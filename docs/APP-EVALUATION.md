# Actual app detection evaluation — 2026-10-29

The counts below are historical. Later frozen adult-source and actual-video results
are in [ADULT-VIDEO-RESULTS.md](ADULT-VIDEO-RESULTS.md); HANDOFF.md is current.

26 live hosted requests completed through the actual app's cloudQuestions(),
requestJev()/parseJev() and matchingRule(). All three starter rules were enabled,
threshold stayed 0.4, Jev stayed jev-1.14.0. No prompt/threshold/provider changes
were made after seeing results. Transport was Node 24 HTTPS via the session proxy,
not Electron net.fetch. No Windows capture or cover was exercised in this run.

## Results

| Evidence group | Cases | Video catches / positives | Social catches / positives | Explicit catches / positives |
| --- | ---: | ---: | ---: | ---: |
| New public live browser captures | 11 | unmeasured (0 positives) | 3/3 | unmeasured (0 positives) |
| Reused synthetic/app regression cases | 14 | 3/3 | 2/2 | unmeasured (0 positives) |
| Archived real YouTube interface screenshot | 1 | 1/1 | unmeasured (0 positives) | unmeasured (0 positives) |

Across all groups: video 4/4 caught, 0/19 false blocks, three ambiguous;
social 5/5 caught, 1/19 false blocks, two ambiguous; explicit 0/26 false blocks
but ZERO positive coverage. These are case counts, not a reliable 95% claim.
Repeated services and related pages are correlated. None is a final untouched
held-out acceptance suite. Labels were visually reviewed and frozen before calls;
there was no independent second labeler. Small perfect counts have wide confidence
intervals (saved with each report); do not advertise them as general accuracy.

Real positives were TikTok Explore cards, a TikTok short-video view, and NASA's
Instagram post grid after dismissing signup. The separate real YouTube screenshot
is an archived search-results interface served by Wikimedia, NOT a working live
YouTube feed or video. Main YouTube pages failed in this environment. A YouTube
embed showed error 153; an Instagram signup overlay hid most of the grid; an
article embedded a YouTube screenshot. Those policy-boundary cases were labeled
ambiguous in advance and excluded from binary scoring for the affected rule.

The real negative cases included ordinary GitHub/MDN pages, a generic HTML flower
player, Instagram article/logo, clothed running and competitive-swimming imagery.
These do not establish comprehensive explicit-content specificity.

### Observed error worth retaining

`regression-youtube-shorts`: synthetic screenshot visibly labeled YouTube/Shorts.
Video score 0.92 (correct); social score 0.54 (false match against the preset that
names Instagram and TikTok). This would wrongly cover it with ONLY the social
preset enabled. With all presets enabled, the correct video rule wins globally;
that does not erase the per-rule error. No prompt fix or higher threshold has
been adopted from this one case. Preserve it for any future scoped fix.

## Evidence and accounting

- [Main raw report](evaluation-app-2026-10-29.json): 25 cases, scores, labels,
  input hashes, exact settings/questions, source/bundled-code hashes, intervals,
  captured provenance and failed capture attempts.
- [Supplementary raw report](evaluation-app-archived-2026-10-29.json): one new
  reviewed archived YouTube screenshot; original batch was NOT rerun.
- Total: 26 requests, 79,707 reported input tokens, estimated $0.003347694 at the
  recorded $0.042/million input-token rate. This is an estimate, not a billing
  statement. $0.286261248 is reserved, not charged, under the user-approved NEW
  $0.50 reservation cap. At most 19 additional attempts fit that remaining cap.
- New ledger: `/workspace/work/ble-real-2026-10-29/app-budget.json`. Never initialize
  another fresh ledger to evade this allowance. Old 62/64 history is retained as
  metadata; the old ledger remains missing. The app's userData ledger is separate.
- Source public captures and reviewed images remain outside Git under
  `/workspace/work/ble-real-2026-10-29/`. Third-party rights retained; no image
  redistribution/publication. New manifest: `reviewed/manifest.json`; supplementary
  manifest: `archived-manifest.json`. Raw reports embed metadata so missing images
  cannot silently be replaced with different pixels.
- Request median is about 150 ms and maximum about 496 ms for the main batch.
  These exclude capture, checking interval, freshness rejection and native cover.
  They are NOT Windows intervention times.

## Reuse the runner, do not restart the experiments

Node 24 and `npm ci --ignore-scripts` dependencies were used. No new dependency.
The runner bundles with existing esbuild; the real app modules are imported,
not copied. All presets are enabled deliberately to measure each policy.

```bash
# Dry-run: validate all labels, paths, hashes and PNG bounds; no key or calls.
node scripts/evaluate-app.mjs --corpus /absolute/path/manifest.json --output /absolute/path/new-report.json

# New reviewed cases only, using the RETAINED approved ledger. No auto-retries.
node scripts/evaluate-app.mjs --corpus /absolute/path/new-manifest.json --output /absolute/path/new-report.json --ledger /workspace/work/ble-real-2026-10-29/app-budget.json --allow-cloud
```

`--init-budget` was used once with explicit user authorization. Existing-ledger
initialization, missing/corrupt/exhausted ledgers, report overwrite and concurrent
ledger locks fail. Entire-run budget is checked before requests. Every request
reserves atomically before sending, failed requests retain reservations, and a
partial report is saved after each result. Do not delete a lock while a run is active.

To capture a fresh public corpus when needed (no model calls):
`node scripts/capture-validation-public.mjs /absolute/path/NEW-empty-directory`.
It refuses to overwrite a dataset. Captures have null labels and must be visually
reviewed before evaluation. Recapturing the same URL creates new pixels, not an
exact replay. Do not count source-session variants as independent coverage.

## Checks and next actions

51 unit tests passed, including six new evaluator tests covering input integrity,
app threshold decisions, missing-positive/error metrics, and offline CLI budget
failure paths. Production build passed. Capture/runner syntax checks passed.
No UI changes; UI and native Windows suites were not rerun. No publication.

Next evidence priority:
1. Lawful, adult-only, appropriately licensed explicit-positive evaluation data,
   with documented scope and private handling. Do not substitute clothed people,
   brand names or generic art for positive coverage.
2. More independent real service sessions, especially working live YouTube,
   Instagram/TikTok layouts and small/moving content; source-separated held-out
   cases. Stay inside retained budget; request additional budget only if needed.
3. Actual Windows live detection -> complete cover -> recovery, measuring time
   from content appearance. Existing fixture CI remains separate evidence.
4. Diagnose demonstrated misses/false matches, tune only on development data, and
   evaluate frozen settings on untouched held-out cases. No 95% claim until supported.


## Follow-up — first adult-nudity positive coverage

Ten NEW inputs were evaluated through the unchanged actual app request code;
see [raw follow-up report](evaluation-app-followup-2026-10-29.json).

- Explicit nudity: 6/6 detected, comprising full-size and small-panel variants of
  THREE source photographs. These are real, nonsexual anatomical photographs,
  not generated nudes. Source descriptions declare ages 22, 21 and adult middle
  age; public-domain/CC BY-SA 4.0 provenance and attribution are in the report.
  Age statements are source declarations, not independently verified identities.
  Explicit nudity is positive under the current preset with no medical exception.
- Full-size and small-panel scores were 0.95–0.98. Small panels occupied roughly
  114–180 by 201–260 pixels on a 1280 by 900 composited neutral research canvas.
  Composition/size variants are related tests, NOT six independent subjects.
- Yoga and beach-volleyball/swimwear article captures were correctly allowed.
- Two real social captures were detected. The requested Instagram handle was a
  personal public profile; no space-agency identity is claimed. The TikTok URL
  rendered the SAME cleaning/cat clip as the previous batch, now with different
  chrome, so it is a correlated layout repeat rather than a new content subject.
- No false blocks or errors in these ten cases. No sexual-activity images were
  evaluated. This narrow anatomical-nudity success does not certify pornography,
  sexual-activity recall, arbitrary rules or 95% real-world reliability.

Cumulative across all THREE raw reports: 36 calls, explicit 6/6 positives caught
with 0/30 false blocks; video 4/4 with 0/29 false blocks (three ambiguous); social
7/7 with 1/27 false blocks (two ambiguous). These aggregate input counts must not
be treated as independent real-world samples. Prior cases were not rerun.

Current retained ledger: 36 reservations, $0.396361728 reserved of $0.50;
112,314 reported input tokens, estimated $0.004717188. At most NINE further
attempts fit; there is no new budget. Ledger path is unchanged. The old reports'
budget snapshots intentionally describe their original completion times.

New images and reviewed manifest: `/workspace/work/ble-followup-2026-10-29/manifest.json`.
Original images, prepared variants and provenance remain there, outside Git.
Third-party photographs are not copied into public artifacts. Search/metadata
scratch is in ignored `work/explicit-sourcing/`; source provenance is embedded in
the numerical report so a later agent can verify the actual selection.

No product code or thresholds changed in this follow-up. The preceding 51 unit
checks/build are existing results, not newly rerun tests. Raw-result/ledger/count
and documentation checks were performed for this data-only follow-up.

The next missing integration gate is [live Windows acceptance](WINDOWS-LIVE-VALIDATION.md).
That protocol is prepared and explicitly UNRUN; an interactive Windows desktop
and coordinated remaining accounting are required. Sexual-activity positives,
more independent adult sources, broader service sessions and a source-separated
held-out acceptance set also remain missing. Preserve the known Shorts false
match when investigating future changes; do not tune on a final acceptance set.


A native live runner has now been prepared (lab/run-windows-live.ts and
scripts/test-live-windows.mjs); it is NOT Windows evidence yet. After this addition,
52 unit tests, standalone native-runner strict type checking, bundle/syntax checks
and production build passed. No Windows execution, key transfer, push or release.
Follow WINDOWS-LIVE-VALIDATION.md for accounting and execution prerequisites.

## Activity probe and platform-boundary candidate

Two NEW static inputs from one licensed, source-declared adult (44) educational
video were evaluated: a reviewed frame and its small-panel variant. Both matched
the explicit rule (0.97 and 0.96). This is first narrow sexual-activity evidence,
not a video/motion test or a sexual-content recall estimate. The source-declared
age/licensing and hashes are in [the activity report](evaluation-app-activity-2026-10-29.json).
The obscured default video preview was excluded; an additional reviewed frame was
not sent. Files remain outside Git under `/workspace/work/ble-activity-2026-10-29/`.

The baseline YouTube rule ALSO falsely matched these non-YouTube inputs (0.43 and
0.62). Its wording includes unqualified “video playback”; the platform boundary
is ambiguous. We tested a candidate explicitly limiting YouTube to YouTube and
Instagram/TikTok to those platforms. Four development retests, saved separately
in [the candidate report](evaluation-app-candidate-2026-10-29.json), produced:

| Input | Baseline affected score | Candidate affected score | Result |
| --- | ---: | ---: | --- |
| YouTube Shorts synthetic | social 0.54 | social 0.02 | Known false social match removed on this case |
| Adult activity full frame | video 0.43 | video 0.06 | Known false YouTube match removed on this case |
| Real TikTok Explore | social 0.78 | social 0.50 | Still detected at 0.4, but reduced margin |
| Archived YouTube search | video 0.92 | video 0.92 | Positive retained |

Candidate is NOT ADOPTED into product defaults. Recall matters most, the TikTok
score fell, and four reused cases cannot establish the tradeoff. The small activity
variant was not retested with candidate wording. Scores are not calibrated
probabilities. Keep the candidate for broader independent/held-out evaluation;
do not raise thresholds or overwrite saved user rules to hide these errors.

The evaluator now accepts `--settings /path/to/settings.json`, validates all three
starter IDs are enabled, and records exact experimental settings/prompts. No
provider, default preset, threshold, or existing user-settings behavior changed.
Do not merge candidate counts into baseline accuracy totals.

Baseline-only now has 38 attempts: explicit 8/8 input positives across FOUR source
families (three anatomical + one activity), 0/30 false blocks; video 4/4 with 2/31
false blocks and three ambiguous; social 7/7 with 1/29 false blocks and two
ambiguous. These are correlated development counts, not a 95% claim. Four candidate
RETESTS bring total accounting to 42, not 42 independent baseline examples.

Retained allowance: 42 requests, $0.462422016 reserved, 127,172 input tokens,
~$0.005341224 estimated. THREE attempts remain, reserved in the plan for the
Windows integration gate. No more image experiments should consume them silently.
The authoritative ledger remains at its original path. Other local preflight
copies are non-authoritative and must never be used as a fresh allowance.


## Windows execution update

Regular Windows CI now passed the current validation code (run 40847626785):
53 unit tests, one Linux-only skip, eight UI, desktop smoke, installer build/
install and 11 fixture-provider scenarios. Numeric report is
[windows-extended-run-40847626785.json](windows-extended-run-40847626785.json).

The live dispatch stopped before native launch because Actions received an empty
TYPESAFE_API_KEY; [blocked outcome](windows-live-blocked-run-40847626764.json).
No provider call or extra reservation occurred. Retained accounting is still
42 requests, with THREE available. Need the exact repository Actions secret
configured securely; there is no live Windows timing result yet. No release.


## First retained live native evidence

The Actions secret now works. [Live result](LIVE-WINDOWS-RESULT.md) verifies real
Windows capture -> real Jev social match -> full display cover -> button recovery
for one synthetic positive-at-session-start case. Observed 951ms includes startup
and observation; not a representative latency or accuracy claim. Overall workflow
cancelled during final housekeeping after successful native step/upload; report
passed=true and all accounting was independently reconciled. No fake green run.

Two real requests from the earlier cleanup-failed run plus this one-request pass
bring accounting to 45 reservations/$0.49545216/137877 tokens (~$0.005790834
estimated). These native attempts are NOT additional fixed-corpus accuracy samples.
Current allowance exhausted. Do not reset or spend again until new cap authorized.
