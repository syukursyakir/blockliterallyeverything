# Free flat-cut and safe-lookalike probe

30 October 2026. [Frozen scope](FLAT-CUT-PLAN.md),
[raw numeric report](free-flat-cuts-2026-10-30.json), runner
`lab/run-free-transitions.ts`. No model calls, observed page HTTP requests, native
Windows jobs or production changes. Financial authority remains260 reservations,
$2.862612480 of cumulative3,885390reported tokens;12maximum requests remain.
No paid job/lock, history untouched, no release.

## What the probe measures

Compare pre-PR9 comparator from pinned local Git object2a1aced with current production
at6c236ce, including each version's translation exception. New runner source is pinned
by its code hash in the report (it was authored after that production checkout).
Actual decoded known CC0 flower frames at six prospective phases, controlled black/
white/gray CSS flat renderings in two synthetic watch layouts and an unbranded local
player. Header/title/controls/layout remain. Five self-authored safe-lookalike pages
have prospectively labeled nonviolating content: notes, local sign-in, quotation-only
article, flower photo editor and file gallery. No model verified these labels.

A rejected comparison means the app would request a fresh check before using that
result. It does NOT mean a cover or a model false positive. These are screenshot
comparator decisions, not model classifications or measured real-session delays.
Browser1024x768 screenshots are resampled with Canvas2D to64px; Electron resizing,
physical display/capture, actual app timers and inference are not exercised.

## Observed tradeoff

| Transition | Comparisons | Pre-fix rechecks | Current rechecks | Additional rechecks |
| --- | ---: | ---: | ---: | ---: |
| Large watch player -> flat cut |18|18|18|0|
| Compact watch player -> flat cut |18|6|18|12|
| Unbranded local player -> flat cut |18|6|18|12|
| Five safe-page transitions |5|1|4|3|
| Flat -> detailed frame, all three layouts |54|30|30|0|
| Exact settled/steady controls |64|0|0|0|

In compact players, all six black and all six gray cuts add a recheck. Their global
means were roughly4.71–4.77% and2.64–2.82%, below8%. White cuts already exceeded8%
and were rejected by the old guard. All18large-player cuts already exceeded8%, so
those existing rechecks cannot be attributed to the new local-detail correction.

The three newly rejected safe transitions were a notes thumbnail becoming a
placeholder, a photo-editor preview clearing, and gallery thumbnails being removed.
The collapsed local sign-in form stayed eligible under both versions. The quotation
article collapse was rejected under both. These reveal the intended structural
ambiguity: legitimate detail disappearing can resemble switching away. They are not
five model-specificity trials and the three rechecks are not three false blocks.

All64exact steady controls stayed eligible:54flat-hold rows and10safe-page controls.
There are only19unique steady pairs. A single cut does not latch the comparator
into rejecting unchanged frames; actual next-check timing/cache/inference behavior
requires a separate session replay. No added rechecks were observed on the reverse
flat->detail transitions in this grid, although30were already globally rejected.

There are177rows but only132unique before/after hash pairs. The45duplicates are
repeated flat controls across phases. Six phases of one clip and related synthetic
layouts are correlated, not independent subjects or a representative cut rate.
Do not convert12/18 into the frequency of delays during ordinary browsing.

## Repeated-delay illustration and decision

The report includes an explicitly analytical three-boundary illustration, repeating
ONE compact black-cut pair: baseline eligibility3/3, current0/3. Reversing the pair
is current3/3 eligible. This shows phase-aligned repeated detail->flat boundaries
could repeatedly request rechecks. It is not a rendered timeline, real-time app/
cache test, measured native delay, observed natural incidence or extra independent
samples. It does not establish a real-world starvation rate.

Keep the production guard unchanged in this probe. The prior native switch-away
fix and moving-player passes remain in LOCAL-DETAIL-RESULTS.md; retain their limits.
These new counterexamples quantify conservatism, not a basis to tune thresholds
until the report looks better. Next useful work is FREE session replay with plausible
cut cadence and poll/response phases: measure accepted-check gaps and whether the
same-page violation can remain unblocked. Preserve switch-away controls. Only then
consider a small change with prospective validation, rather than weakening the
proven disappearing-player protection.

## Checks and reproduction

Strict runner TypeScript passed. Probe completed all177rows with assertions for
zero external HTTP and eligible exact steady controls. Separate actual CLI failure
checks confirmed existing report refusal/preservation and malformed-media rejection
before output/browser launch. Private review screenshots confirmed the player flat
rendering retains the surrounding watch UI and the safe pages match the fixtures.
Only numeric metadata/hashes are committed; review pixels remain outside Git.
No prior unit/model/Windows cohorts were rerun or counted as new evidence.

Example (existing pinned file only, no download):

```sh
node lab/run-free-transitions.ts --video /path/to/reviewed.webm --output work/new-flat-report.json
```

The runner verifies the pinned CC0 media hash and refuses an existing output.
Optional `--review NEW_PRIVATE_DIRECTORY` saves self-authored fixture screenshots;
normal production runtime is unaffected. No provider key is passed to the offline
browser. Public report contains renderer/version and exact code/media hashes.

Model false blocks, recall, arbitrary-rule behavior, user hardware and95% reliability
remain unmeasured by this probe. Source27 old miss and broader freshness limits are
not solved or explained here.
