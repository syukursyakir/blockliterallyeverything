# Adult-source extension and decoded-video results — 2026-10-29

Both requested gaps now have actual evidence: more source-declared adult images,
including new activity sources, and real decoded playback through native capture,
hosted Jev, full-screen cover and recovery. **95% reliability remains unproved.**
One initial playback miss remains unresolved; subsequent passes do not erase it.
No production rules, threshold, provider or runtime capture behavior changed.

## Frozen adult-source image extension

[Freeze record](adult-extension-freeze-2026-10-29.json) predates predictions;
[raw report](evaluation-adult-extension-2026-10-29.json) preserves labels, source
hashes, declarations, licenses, questions, scores and usage.

- 13/13 positive variants caught,0/2 false matches on non-explicit visible-part crops.
- Activity:3 new own-work video files, declared adult ages30/24/27, three different
  authors. Full/small/second-frame variants give9 positive inputs, not9 subjects.
- Anatomy:2 files, declared ages40/23, four full/small inputs. The40 source shares
  an earlier author/possibly subject, explicitly correlated. Only4 new author
  groups across the entire5-file extension; no independently verified identities.
- Negative face/arm and lower-leg/foot crops share positive-source families. These
  are specificity stress controls, not representative independent negatives.
- Named-platform policies had no false matches on these15 inputs. No platform
  positives were tested, so this adds no platform recall evidence.

Final prepared pixels were reviewed BEFORE labels/hash freeze and inference.
Sources state adult ages and reuse rights; this is not independent ID verification.
No convenient relabeling, prompt tuning or threshold increase. All variants remain
grouped by source/author. Small perfect counts do not establish population recall.

Earlier acquisition403 responses were diagnosed from their body as Wikimedia's
identifying User-Agent/robot-policy requirement. Honest project identification and
paced requests resolved them. No auth, content gate or network-policy bypass.

## First native trials with actual decoded playback

Each used a pinned licensed WebM, reviewed clip range, advancing media time and
decoded-frame count, actual Electron capture and real hosted Jev. Neutral content
was allowed before playback. Successful covers were visible/focused/topmost/
fullscreen with exact1024x768 display bounds; button recovery paused the session.
No panning still, capture/provider fixtures or raw-image publication.

| Declared adult source | Run | Outcome | Observed cover / score |
| --- | --- | --- | --- |
|44, retained source |40864903082 |Pass |3429ms /.98 |
|30, new source |40865647116 |Pass |3266ms /.98 |
|24, new source |40866001135 |Pass |4151ms /.88 |
|27, new source |40866332567 |FAILED |No cover within bounded protocol |

The first cohort was3/4 passing trials. Do not report it as4/4 because a later
repeat passed. Numerical reports are `windows-video-run-<run>.json` in this folder.
All new source files were used previously in the image extension; native trials
are integration repeats, not new independent accuracy observations.

## Unresolved first source27 miss and diagnosis

Run40866332567 allowed neutral plus two further checked frames without a cover;
checks3/blocks0, then its three-request sub-budget paused protection. The test
failed its20-second cover wait. Longer unbounded eventual detection was not tested.
It was NOT an auth failure or a stale-frame-discard outcome. Exact submitted frames
and numeric replies were not retained for that first run, so its cause is unknown.
Do not claim that capture, sampling, model inference or a production bug was fixed.

Added explicit opt-in pass-through audit: unchanged actual request/response, numeric
scores/hashes only in the report, submitted PNGs encrypted to the locally held RSA
key before artifact upload. No headers/credentials/provider error bodies retained.
Normal application runtime has no audit hook or new screenshot retention.

- Audited repeat40867576811 passed in4242ms, explicit.94. Its actual submitted
  positive PNG was decrypted/inspected only locally and visibly contains the
  activity. Neutral scored.01. This does not recover the failed run's images.
- Seven single-enabled-policy image diagnostics (six phases plus that already
  scored exact-frame replay) scored.94–.96 with the ORIGINAL wording. These are
  development/replay evidence using Node transport, not new native or held-out
  accuracy. Raw report: evaluation-video-diagnostic-baseline-2026-10-29.json.
- SIX preplanned audited replications40869174152 all passed,4205–4248ms,.94–.95.
  Only two distinct submitted positive-frame hashes occurred across the six;
  these are strongly correlated, not independent new images.
- To check audit/timing confounding, SIX separately preplanned UNINSTRUMENTED
  replications40870218075 all passed,4003–4161ms,.94–.95. No fetch wrapper/audit
  was installed in these trials. The original miss still remains in the record.

Across both series every trial used a fresh isolated profile and cumulative
accounting, with at most3 requests; the whole18-request worst case was preflighted.
Series never runs until success, keeps failures and stops remaining trials on
capture/provider/auth/accounting errors. All trial reports are embedded in the two
`windows-video-series-<run>.json` files. Every wrapper/report/profile budget agreed.

Source27 has one failed initial trial and13 subsequent passes. Across all four
positive sources there were16 successful native trials and one failure. These are
protocol-dependent, highly correlated trials on hosted Windows, not a representative
95% estimate. No causal fix or broad certification is established by nonreproduction.

## Actual safe-video negative control

Run40868363977 played the reviewed CC0 MDN flower WebM. Two fresh video checks
completed with zero blocks/covers; media time/frame count advanced and stop left
the session idle. Three total requests including neutral. This is one nonhuman
negative control, not general false-positive certification or a positive-block pass.

## Limits and current accounting

Controlled playback on one hosted display, limited licensed clips, seeded onboarding
and one trial per new source before diagnostic repetition. No physical Windows
device/mixed-DPI/multi-monitor/exclusive-game certification, no representative
continuous-video latency tail or missed-content guarantee. Artistic/clothed-body
false matches from older cohorts remain; this work did not hide or retune them.

Final authority:223 cumulative attempts,$2.455240704 reserved of approved3,
756421 reported tokens (~$0.031769682 estimated usage, separate from reservations).
Prior missing-ledger history retained.49 further maximum reservations fit.
Every remote budget reconciled sequentially; no lock/paid job remains. Raw source
files/decrypted pixels/private RSA key stay outside Git/public artifacts. No release.

Next reliability work should target new representative source families and capture
any new miss with explicit diagnostics, rather than repeat this same clip until a
desired rate appears. Keep the unexplained first miss open; do not invent a cause
or change rules/provider/threshold without a demonstrated failure and fresh checks.
