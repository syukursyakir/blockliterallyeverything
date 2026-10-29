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

## Correction and validation

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

Native corrected-condition regression[40886053424](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40886053424)
PASSED3937ms/.93 with full cover/recovery and two requests. It did not record
translation branch usage, so its pass alone is not causal-path proof.

One further preplanned observable regression[40886564146](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40886564146)
PASSED3991ms/.93, full cover/recovery and two requests. Crucially, `translatedView:1`
proves the original change check fired AND the new translation check accepted the
complete view before blocking. This exercises the actual corrective branch, not
merely a lucky low-motion sample. Both passes retained alongside the original miss:
[first](windows-large-motion-run-40886053424.json),
[observable](windows-large-motion-run-40886564146.json).

Switch-away[40886917348](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40886917348)
PASSED: real submitted positive scored .98, was replaced with DIFFERENT neutral,
was discarded; fresh neutral .01 allowed. Zero covers/blocks and clean stop, three
calls. This directly checks the correction preserves stale-result rejection:
[raw](windows-large-motion-run-40886917348.json).

Accelerated adult30[40887260295](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40887260295)
PASSED4017ms/.95, actual playbackRate4, decoded counter314->1038, complete native
cover/recovery, two requests. Source repeats are not new independent subjects:
[raw](windows-large-motion-run-40887260295.json). Media counters are decoded frames,
not a measured visible frame rate. This clip required no translation exception.

Accelerated safe-flower[40887744347](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40887744347)
FAILED the predefined two-fresh-check requirement. Both real video inputs scored
explicit .02; one accepted, one discarded for screen change. Checks2 includes the
initial neutral; zero blocks/covers, then three-request sub-budget paused. This is
a bounded freshness-control failure, NOT a model false positive or a safe-control
pass. [Raw](windows-large-motion-run-40887744347.json). Actualrate4/media advancement
verified at start; end/failure media metadata was not collected in this run. The
runner now records a numeric media snapshot on failure for future diagnosis.

No paid flower run preceded the free loop-repair check; short-source end could
otherwise pause the test stimulus after seek. Resuming playback on seek completion
passed four local4x samples across multiple loops before dispatch. Provider/app
inference unchanged by this scene fix. No retry of the failed safe control or
threshold change. General fast-video freshness remains limited.
Installed fixture CI now adds two deterministic scenarios: translation must use
the new branch and block/recover; unrelated replacement and cropped movement must
be discarded without adding a block. These are pipeline regression tests, not
real-provider accuracy or real-capture proof for the injected frames.

Raw media and private key stay outside Git. Submitted frame packages encrypted
before artifact writes; reports contain only hashes/scores and numeric state.
Normal application runtime adds no intentional frame retention.

## Accounting, regression CI and remaining limits

This continuation used17 reservations,223->240, all report/wrapper/profile chains
reconciled sequentially. AT THIS PHASE completion:$2.642411520 of approved3,817330tokens
(~$0.03432786 observed-token estimate, not billing or missing old usage).32 further
maximum reservations fit; prior62/64 missing-ledger history preserved separately.
No active paid job or authority lock at phase completion. Later fresh-family
accounting supersedes this snapshot; see HANDOFF.md, never restore old counters.

Local80 unit tests/build/strict runner tsc passed. Windows79 unit+one intendedskip,
eight UI, native smoke, installer and13 fixture scenarios passed at995ce3c in
40887372936. Final source CI[40888553162](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40888553162)
at47d7e40 PASSED the same sequence, logs verified; release skipped. Earlier final
production source40887734346 also passed. PR #6 merged at902565c. Post-merge main
CI[40889272599](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40889272599)
PASSED same full sequence, release skipped ([summary](windows-ci-main-run-40889272599.json)).
Manually dispatched with live_detection/publish_alpha FALSE: squash
body inherited historical CI-skip markers, so automatic push CI did not start. Intermediate40886699772/40886736737 failed a NEW test's
window lookup race after blockedstatus but before coverpage ready; corrected by
reusing the existing painted-cover wait helper. These were not model failures.

The correction is narrow: whole-view axis translation over uniform background.
General nonrigid/fast motion can still discard real results. Rapid cuts, partly
occluded/transient content, mixed DPI/multiple physical displays/games and user
hardware are unproved. Original source27 miss remains unexplained. Neither these
correlated cases nor prior small corpora establish95%. No release was published,
and the old alpha installer remains unchanged.
