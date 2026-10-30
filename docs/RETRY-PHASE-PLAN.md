# Free retry-phase candidate — prospective timing holdout

30 October 2026. Second agent reviewed the session-replay result and approved ONE
free development experiment. No production edit or paid/native job at this stage.
Retain existing disappearing-detail comparator, fixture verdicts, ScreenCache,
timeout/deadline/cancel semantics. Authority remains260/$2.862612480/885390.

Candidate: after consecutive discarded results, add deterministic offsets250/500/
750/1000ms in a repeating cycle to the existing3000ms AFTER-response wait. Reset
cycle on accepted result or valid cache hit; session starts empty. No earlier-than-
configured request. This is deterministic phase perturbation, not random jitter or
a guarantee against adversarial alignment. It can delay a settled-cut retry by250ms
and change cache hit/request totals. Do not infer no extra billing from its rate bound.

Known576parameter grid and15controls are DEVELOPMENT inputs; compare current vs
candidate once, retaining every regression. New disjoint timing grid BEFORE execution:
period1700/4100/8300ms, flat dwell150/450/900ms, offsets10/35/60/85% of each period,
response180/550/850ms, static/moving fixture hashes and blocking/detection-only.
432parameter settings,864version-cases. Same synthetic frames and supplied scores;
this is a timing holdout, not new real-media or model-accuracy coverage. Some short
period/long dwell combinations are stress. No tuning candidate after inspecting it.

Promotion criteria for considering production wiring (not a deployment guarantee):
- No new60s blocking nonmatch where current matches in either grid.
- Preserve no stale positive on fresh/cached switch-away controls.
- Static/no-discard cache schedules and first decisions unchanged.
- Abort/deadline/cancel and independent stop during longer polling waits unchanged.
- Check reset/cycle arithmetic and one-discard+250ms effect in small assertions.
- Explicitly inspect every newly slower first match and all request-count changes,
  not merely removed phase locks. Report maximum regressions and tail censoring.
- Review results independently before any production edit. A simulator improvement
  alone is not evidence for real video. Wire and cross-check actual main only if
  justified; paid validation must remain prospectively bounded within retained cap.

No full-grid rerun until green, no model/guard/threshold tuning, no release.
