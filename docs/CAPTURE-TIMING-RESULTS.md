# Native video capture timing: motion sensitivity, no new production fix

30 October 2026. One free Windows cohort completed all three layouts, with441 actual
native captures and zero inference sessions or model calls. The original budget file
is byte-for-byte unchanged. The second agent reviewed scope, source, raw evidence,
line-ending validation and analysis. Production guards remain unchanged: these
results show their sensitivity to changing pixels, not a new demonstrated defect.

## Measured gaps and guard decisions

The frozen nominal response-sized gaps were200/800/1600ms, paired to the FIRST later
observed capture and allowing150ms overshoot. With150ms target capture slots, actual
median gaps were approximately **300/900/1650ms**. These are capture-reception gaps,
not actual provider latencies, app poll intervals or compositor exposure times.

Each entry is rejected pairs / measured pairs. A rejection means recheck would be
required by the existing guard, not a model false block or an observed missed block.

| Layout | Actual median≈300ms (requested200) | Actual median≈900ms (requested800) | Actual median≈1650ms (requested1600) |
| --- | --- | --- | --- |
| Large synthetic watch page |17/145|58/141|74/136|
| Compact synthetic watch page |2/145|10/141|12/136|
| Unbranded local player |45/145|87/141|119/136|

There were147 captures and441 requested pair rows PER layout. All1323 rows remain:
1266 measured,57 horizon-censored, zero out-of-tolerance. Each nominal gap had147
requested rows, with2/6/11 right-censored rows per layout respectively. None were
silently dropped or counted as passes. No sampling slots were skipped. All441 exact
self-comparison controls remained eligible. Raw samples and per-file source hashes
are preserved in native-capture-timing-41016095774.json; descriptive distributions
and independent pairing assertions are in capture-timing-summary-2026-10-30.json.

Actual measured gap ranges were265–338ms /870–949ms /1613–1684ms across layouts.
Acquisition(getSources) ranged20.6–72.5ms, median38.2–39.8ms by layout; full media-
query/acquisition/resize/query brackets ranged27.3–78.9ms. Reception cadence medians
were149.7–150.5ms. Each sequence covered about22.05s wall time and observed one
18s media loop with decoded frames advancing. A loop does not prove every individual
frame was captured; sampled frames and their timing brackets remain the evidence.

All24 compact-layout rejections across gap sets triggered local detail loss, with
zero global-mean triggers there. Large/unbranded rejections were mostly global mean
changes. These overlapping pairs are not24 independent failures. Different player
geometry changes how much of the screen moves or loses detail; it does not establish
semantic correctness, natural-frequency estimates or general reliability rates.
No translation exception applied. No guard threshold, prompt or inference provider
was tuned on these consumed media conditions.

## What was actually captured

Windows workflow41016095774 at1b698d58df2a26b54f2b34510aba7c949839cea7 completed
one continuous sequence per existing wide/compact/unbranded layout. The built actual
Electron app used a fresh isolated profile, stayedidle with0checks/0cloudRequests,
and never started protection. New fullscreen media scene stayed visible/focused;
no hide/show around captures, clock injection, provider or capture substitution.
One hosted1024×768 display,scale1; actual production acquisition options1280×1280
screen thumbnail, primarydisplay mapping and native64×64 resize/bitmap path.

Existing pinned Sintel trailer20–38s at1x, same rights and sampled labels as
NATURAL-CUTS-PLAN/RESULTS. Attribution: Sintel, copyright Blender Foundation,
durian.blender.org, CC BY3.0 project content; logos/trademarks excluded. All three
conditions share one source and existing synthetic layouts. No real YouTube or
new independent model-accuracy subject. Media clocks/decoded counts were sampled
before acquisition and after resize, with monotonic and epoch timestamps. They
bracket IPC/acquisition but do NOT establish which compositor-exposed frame produced
each bitmap. Do not assign exact cuts from bracket midpoints or retrospectively
identify the pixels from the earlier failed paid safe trial.

This diagnostic did not run the app's3s scheduler,cache,inference or15s degraded
retry fallback; pair eligibility is only the production comparator's numeric result.
It cannot establish accepted-decision gaps, successful covers or actual model
latency. The prior paid safe control's failed two-fresh-check bound stays FAILED.
No result here turns it into a clean negative-control pass or explains one exact
edit as its cause. Previous positive covers also remain earlier than the listed
large-cut candidate; this investigation does not retroactively change their scope.

## Evidence integrity and implementation checks

The job received no provider secret or retained allowance and rejected mixed modes;
all inference/capture/recovery/ordinary installer jobs were skipped in this run.
Pixels stayed in RAM, with only numeric metadata/hashes/decisions serialized. No
screenshot/base64 frame, personal profile or raw media was uploaded. Native process
exit verified. OS caches/paging/dumps still preclude an absolute RAM-privacy promise.

The chunked standard-log report reconstructed with exact original SHA256
713e4fc9187422cbac114485b38bc77bc38bfb2cef59291cbd9478efe4e83c40
(excluding trailing file newline), no wire-encoding repair. Initial collector
source-hash assertion failed: all five Windows source-file hashes used CRLF checkout,
while frozen local source used LF. Reviewer independently verified that EACH reported
hash equals the exact frozen bytes converted to CRLF. Collector then accepted only
exact LF or that explicitly computed CRLF equivalent, preserving original hashes
and per-file match kind. No raw data changed and no capture repeated. Future runner
now emits both raw and normalized-LF hashes; metadata only, not a capture-policy fix.

Three new focused pairing tests passed: first-at-or-after choice, inclusive tolerance
and censor denominators, invalid/nonmonotonic input. Strict affected-runner types,
bundling, syntax and workflow gates passed. Actual preparation CLI pinned download,
no-overwrite refusal and Linux native-refusal checks passed without model calls.
Source review caught and fixed a missing timing exclusion in the inference-job gate
before any run. Final source CI/review/merge status will be recorded below.

## Outcome and remaining limits

This completes the free capture investigation, including implementation and review.
It supports conservative freshness behavior under real decoded-media motion and
player-size differences. It does not justify weakening guards that prevent stale
blocks. Original authority267/$2.93968281600001/910488tokens,3cap and prior/migration
history are byte-identical to the frozen authority; no lock, FIVE maximum reservations
remain unused. No paid retry, release or production change in this milestone.

Physical multi-display/DPI/exclusive-fullscreen behavior, representative independent
model accuracy, arbitrary user rules,95% reliability and original source27 miss
remain open. Further tuning needs prospective new evidence and a defined tradeoff,
not repeats of this clip. The useful next deployment milestone is explicitly scoped
physical Windows testing; hosted results cannot certify the user's machine.
