# Live Windows result — 2026-10-29

Subsequent controlled-motion/stale-result outcomes and later accounting are in
[MOTION-RESULTS.md](MOTION-RESULTS.md); HANDOFF.md is the current authority summary.

## Full active-session transitions

Real adult-reference run [40858303368](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40858303368)
PASSED, workflow green. [Numeric report](windows-live-run-40858303368.json):
neutral frame allowed, then reviewed/pinned licensed adult image painted while
protection already active; explicit score .98, full-display focused/topmost cover,
button recovery. Observed content-to-cover 4264 ms, one trial, including configured
three-second polling and automation delay. Two requests; wrapper/profile/report
accounting agree. This reuses a development source, not new accuracy evidence.

YouTube run 40857749164 stopped during page preparation before any API call.
The page had insufficient visible loaded thumbnails after a fixed 2.5-second wait.
Budget artifact unchanged at129. Preparation now waits up to30 seconds for two
visible loaded thumbnails; it still fails closed if unavailable. No screenshots
or keys are in numerical artifacts. Retry [40858537258](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40858537258)
PASSED, workflow green. [Numeric report](windows-live-run-40858537258.json):
real loaded public YouTube search page, neutral->positive during active protection,
YouTube score .93, full focused/topmost cover and button recovery. Observed3938ms,
one trial. Two requests; wrapper/profile/report counters agree at133 requests,
$1.464336384 reservations,435752 tokens. Source is a development repeat.
Do not count acquisition failures as model misses or passes.

Synthetic social full control [40858809731](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40858809731)
PASSED, workflow green. [Numeric report](windows-live-run-40858809731.json):
neutral allowed, then active-session synthetic feed -> score .95 -> complete native
cover -> button recovery. Observed 3902 ms, one trial; two requests.

All three full checks passed on one hosted display. They validate the actual
capture/provider/cover/recovery path with controlled static images, including two
real-source screenshots. They do not establish broad detection recall, repeated
latency distributions, live moving-video handling, physical lock/sleep, mixed DPI,
multi-monitor or exclusive fullscreen behavior. No new release was published.

Current reconciled accounting: 135 attempts, $1.48635648 reserved of cumulative $3,
442937 reported tokens (~$0.018603354 estimated API usage). Prior usage/history
preserved; no remote authority lock remains. 137 additional maximum reservations
fit. Regular PR CI40858351838 passed:70 unit +1 intentional skip,8 UI and11
installed fixture scenarios, build/install/smoke; release step skipped.

## First startup-only check (historical)

Historical first live result below. The user subsequently approved a **$3 cumulative**
reservation cap; the old exhausted $0.50 limit and pending-question text below are
superseded. Current counters/ownership are in HANDOFF.md and the authoritative ledger.
Broader static results: [BROADER-EVALUATION.md](BROADER-EVALUATION.md).

The GitHub Actions key is now available and authenticates successfully. Do not
ask the user to add it again unless an actual future authentication failure occurs.

A real Windows capture -> hosted Jev -> native cover -> button recovery check
PASSED. [Saved numerical report](windows-live-run-40850770758.json) is the evidence.

| Observation | Result |
| --- | --- |
| Test input | Self-authored synthetic Instagram-like feed, already visible when session starts |
| Capture / provider | Real Electron screen capture and real Jev request; no substitutes |
| Model match | Social feeds; returned score 0.95 at threshold 0.4 |
| Native cover | Full 1024 × 768 display; visible, focused, topmost and fullscreen |
| Recovery | Button removed cover and paused session |
| Observed presentation-to-cover | 951 ms, one trial, includes session start/IPC/capture/observation |
| Test profile | Isolated and seeded; onboarding not tested here |

This is ONE synthetic scene on ONE hosted display. It is not a 95% accuracy
claim, real-service generalization, active-session change test, latency median/
tail measurement, mixed-DPI/multi-monitor result, or exclusive-game certification.

## Run status and earlier failure

- Run 40849807420: secret gate passed, two real requests completed. Runner then
  called Playwright application.process() after close disposed its dispatcher.
  Cleanup crashed before final report persistence. Recovered counters from its
  isolated profile; do not claim the lost primary result passed.
- Fix caches the child process handle BEFORE close and persists the primary
  outcome BEFORE cleanup. Regression tests reproduce the disposed getter failure.
- Run 40850770758: native test step and artifact upload completed successfully;
  saved report has passed=true, complete cover details, recovery and reconciled
  accounting. A cancellation requested during review arrived after those steps,
  so overall workflow status is CANCELLED. That status is preserved in the JSON;
  it is not relabeled as a green workflow. No additional paid run was performed
  merely to change that overall status.
- PR #2 merged the correction at 35fb5f71e92cbe582e6abf06f68e562dc0b6195e after
  ordinary PR Windows run 40850774234 passed. Product defaults/provider/threshold
  remain unchanged. No release publication.

## Accounting

Authoritative ledger remains `/workspace/work/ble-real-2026-10-29/app-budget.json`.
Both remote wrapper and isolated profile agree, and local authority was restored:
45 reservations, $0.49545216 reserved of the approved $0.50, 137877 reported input
tokens, approximately $0.005790834 estimated API usage. Reservations are not bills.
The preceding 62/64 history remains separate and was not reset.

At this historical point the $0.50 allowance was exhausted. The later explicit
$3 cumulative approval preserved every counter and prior history; it did not reset
the allowance. Continue within that approved cap without repeated budget questions.

Next evidence: source-separated independent/held-out cases, active-session
negative-to-positive transition with retained result, and broader Windows hardware/
display conditions. Keep model accuracy and mechanical integration evidence separate.
