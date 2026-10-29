# Large-motion blocking: evidence and correction

Prospective protocol: [LARGE-MOTION-PLAN.md](LARGE-MOTION-PLAN.md). Source repeats
are integration stress conditions, not new independent accuracy samples. Actual
hosted Windows capture and Jev, one1024x768 display; isolated seeded onboarding.
No release, model/preset/threshold/polling change or claim of95% reliability.

## Preserved baseline

| Condition | Run | Outcome |
| --- | --- | --- |
| Reviewed adult photograph moving +/-16vw every1131ms | [40884733211](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40884733211) | Pass,4144ms,explicit .98,full native cover and recovery; two calls |
| Real loaded YouTube page, same movement | [40885047863](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40885047863) | FAIL: two positive requests .97/.96 discarded for movement,zero covers; three-call bound exhausted |

Both keep the entire prepared image onscreen (max65vw/90vh,+/-16vw). This is large
translation of actual source screenshots, not scrolling a live page or decoded
video. Animation counts sampled after cover/failure are callbacks, not a count of
visible frames. Raw numeric reports retain settings/hashes/geometry/accounting:
[photo](windows-large-motion-run-40884733211.json),
[YouTube failure](windows-large-motion-run-40885047863.json).

The YouTube failure is explained by the existing mean-pixel freshness guard: both
model responses recognized the content but were discarded before matching/covering.
Only the initial neutral check was accepted. Encrypted actual submitted inputs were
privately decrypted and reviewed; the real YouTube page remained visible. Exact
post-response recaptures were not retained. This does NOT explain or erase the
older source27 one-off miss; that separate failure remains open.

## Correction and validation in progress

The original >8% changed-screen guard remains. A second check recognizes whole-view
horizontal or vertical translation over a uniform background at64px resolution:
aligned overlap mean RGB difference <=2%; every exposed/vacated strip pixel within
8 RGB levels of the original corner background; maximum half-frame displacement.
This requires content to remain onscreen. Cropped/vanished content, new exposed
pixels, unrelated replacement and changed background fail the translation check.
General scrolling, zoom, rotation and scene cuts are outside this correction.
Image comparison remains a heuristic, not semantic identity proof.

Five new unit tests cover those failure paths plus resampling/alpha/invalid inputs.
All80 local unit tests and application build passed; strict native runner tsc passed.
Free actual-scene browser smoke verified full-view movement and decoded4x playback.
It caught rate reset during media resource loading; setting playbackRate after seek
and checking its actual value prevents an erroneous accelerated-playback claim.
Private captured-positive pair matched translation; neutral-to-positive did not.

Native corrected-condition regression40886053424 pending, followed sequentially by
switch-away, accelerated adult30 and safe-flower controls from the frozen plan.
Do not claim these passed until linked numeric evidence and ledgers are reconciled.

Raw media and private key stay outside Git. Submitted frame packages encrypted
before artifact writes; reports contain only hashes/scores and numeric state.
Normal application runtime adds no intentional frame retention.
