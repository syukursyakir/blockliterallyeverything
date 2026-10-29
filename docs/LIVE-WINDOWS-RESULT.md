# Live Windows result — 2026-10-29

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

ZERO further whole-request reservations fit this allowance. No retries or new
paid experiments without a new authorization. A question is pending about a $3
cumulative conservative reservation ceiling for broader independent evaluation;
that ceiling is NOT approved merely because the question was asked.

Next evidence: source-separated independent/held-out cases, active-session
negative-to-positive transition with retained result, and broader Windows hardware/
display conditions. Keep model accuracy and mechanical integration evidence separate.
