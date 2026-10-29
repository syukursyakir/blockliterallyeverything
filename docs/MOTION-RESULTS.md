# Windows controlled-motion evidence — 2026-10-29

Frozen plan: [MOTION-COVERAGE-PLAN.md](MOTION-COVERAGE-PLAN.md).
Protocol and authority: [WINDOWS-LIVE-VALIDATION.md](WINDOWS-LIVE-VALIDATION.md).
No application runtime, provider, threshold or rule changes in this extension.

## Small continuous motion: passed

[Run40861132261](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40861132261)
completed successfully. [Raw report](windows-motion-run-40861132261.json).
Neutral content allowed, then the pinned reviewed licensed adult photograph
painted and continuously panned horizontally +/-12px. The animation counter showed271
callbacks when sampled just after cover observation (not frame-accurate timing). Actual screen capture and hosted Jev returned
explicit .98, followed by complete1024x768 visible/focused/topmost/fullscreen cover
and successful button recovery. Observed4214ms, including3-second polling and
automation delay, one trial. Two requests; three accounting copies agreed.

This is small motion of a source screenshot, not a playing video, large-scene
motion, repeat-trial latency distribution, independent accuracy case or hardware
certification. Source was already used in development; no recall sample added.

## First attempt: failed before provider use

[Run40860770322](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40860770322)
failed at initial neutral capture, before any request. [Raw report](windows-motion-run-40860770322.json)
preserves the app's blank/protected-capture error and unchanged156 counters.
All budget copies matched. Native window show/focus does not establish compositor
readiness; the runner now waits for varied pixels from actual capture before
starting. No provider/capture substitution or production blank-check relaxation.
Strict runner typecheck and16 focused unit tests passed; retry above passed.

## Switch-away control

First run40861359039 FAILED its fresh-neutral-check assertion.
[Raw report](windows-motion-run-40861359039.json): the positive stimulus was replaced
20ms after observing its request reservation, no blocks/error, watching state,
checks1 and two new calls. The test restored the exact initially checked neutral
frame, which can legitimately reuse the30-second exact-frame cache. Requiring a
new inference within15 seconds was an incorrect test assumption. Changed the
replacement to a distinct neutral document; app cache/runtime unchanged. Keep
this failed assertion and its two reservations, not a claimed full pass.

Retry [40861748575](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40861748575)
PASSED, workflow green. [Raw report](windows-motion-run-40861748575.json):
neutral allowed, positive request observed, different neutral painted5ms later,
changed-frame discard observed, fresh neutral checked. Zero blocks/covers, checks2,
three requests, then clean stop. Actual capture/provider, no substitutions.

The protocol exercises a real request on a known positive stimulus,
replace with neutral while status is checking, observe changed-frame discard and
fresh neutral check, with zero covers/blocks and clean stop. Discarded model verdict
is not exposed by the application; no assertion about its score is possible. This
control must stay separate from a successful positive-blocking result.

Final reconciled accounting:163 requests,$1.794637824 reserved of cumulative3,
542374 tokens (~$0.022779708 estimated API cost). All report/wrapper/profile copies
agreed per run, prior history preserved, no remote job/authority lock remains.
109 further conservative maximum reservations fit. No release.
