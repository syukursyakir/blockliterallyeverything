# New decoded-media integration: two passes, one bounded freshness failure

30 October 2026. Three frozen native conditions completed with actual Windows
capture and hosted Jev, seven total calls. Production behavior was unchanged.
Second agent reviewed the plan, sampled labels, free preflight, source/accounting
freeze and each result before the next trial. No release or paid reruns.

| Condition | Windows run | Outcome | Evidence |
| --- | --- | --- | --- |
| Large synthetic watch page | 41012509122 | Pass | video .93;3300ms to observed native cover; full cover/button recovery;2calls |
| Compact synthetic watch page | 41012799291 | Pass | video .94;3274ms to observed native cover; full cover/button recovery;2calls |
| Unbranded nonsexual control | 41013029918 | **Fail: two-fresh-check bound** | explicit .01/.05/.03;one accepted video check, one discarded;0blocks;3calls, planned trial cap reached |

## What these results establish

The new source is the pinned Sintel trailer, CC BY3.0 Blender Foundation / Durian
Open Movie Project,20–38s at1x. Attribution: Sintel, copyright Blender Foundation,
durian.blender.org. Rights source and hash are in NATURAL-CUTS-PLAN.md and
lab/reviewed-videos.json. Logos/trademarks are excluded from its license. Raw media,
review screenshots and private keys are outside Git; no plaintext submitted-frame
artifact. Three conditions share ONE source/group and existing synthetic layouts.
This is broader media integration, not independent accuracy or real YouTube proof.

Both positive trials accepted initial neutral .02, then matched the video rule.
Large playback advanced22→93 decoded frames, media20.343→23.287s at cover; compact
23→92,20.342→23.258s. All covers were visible, focused, topmost and fullscreen with
exact1024×768 display bounds. Button recovery removed the cover and paused the
session. Timing includes3s polling, capture, provider and automation/IPC overhead;
one instrumented trial each, not external frame-accurate latency or a distribution.

Both covers appeared BEFORE23.875s, the first listed large scene-score candidate.
Do not claim their later natural cuts, black transition, or15s degraded-retry branch
were exercised. All changed-screen/local-detail/translation/retry-adjustment counts
were zero in those two trials. Supplied media contains natural edits but successful
initial blocking alone does not establish fresh-decision coverage across them.

## Preserve the failed safe control

Native safe trial required TWO accepted fresh video checks after initial neutral,
zero blocks and clean stop. Only ONE video check was accepted. Explicit scores were
.01(neutral),.05(first video accepted),.03(second video discarded). No model false
block occurred, but zero blocks does not make this a passed control.

The second video response was discarded after a large screen change during analysis:
actual observed64px capture-pair mean RGB difference22.7618%, versus3.2290% for the
prior accepted video pair. Activity confirms one changed-screen discard, no local-
detail/translation/late-adjustment activity. Media advanced22→515 decoded frames,
including a loop of the18s segment, while the runner waited for the second accepted
check. Capture records lack per-capture media timestamps, so do not assign this to
one specific edit or exclude compositor/timing effects from numeric data alone.

At the next attempted poll, the deliberately configured THREE-CALL TRIAL LIMIT was
reached and protection visibly entered error/pause before a fourth provider request.
This was not cumulative$3 exhaustion, provider transport failure, a classification
false positive or a clean successful negative-control stop. The short bounded run
never reached15s of unresolved discards; it did not test the escalation fallback.
No guard/rule/threshold/cap was loosened and no trial repeated to replace the failure.

## Provenance, privacy and accounting

Scope/labels/code frozen before paid calls in NATURAL-CUTS-PLAN.md and
natural-cuts-freeze-2026-10-30.json; all native trials used source
ebadcd74060e623eb50989fa22646da17602f603. Author reviewed full-trailer and0.5s range
contact sheets; second reviewer independently reviewed the range contact sheet
before inference: clothed fantasy characters/dragon/action, no sex or
explicit nudity visible in samples. Agent review is not an independent human panel
or exhaustive per-frame annotation. W3C bunnyWebM404/directory403 acquired no media
or model call; Sintel used a different public source, no access bypass.

Free offline Chromium preflight passed all3 context mappings, source hash,1x decoded
advance and actual37.5+→<21s loop, with zero external playback/provider requests.
Its exact local poster/manifest hashes are saved; Windows regenerated platform-
rendered posters and saved its actual hashes separately. Strict affected-runner
TypeScript and preparation syntax passed. Initial tsc invocation used wrong module
flags; corrected esnext/bundler/ignoreConfig check passed. HTMLVideoElement type-only
annotation emitted byte-identical preflight JS; no additional independent experiment.

Existing pass-through audit was selected BEFORE calls at reviewer's request:
original provider request/response and actual capture remain; encrypted submitted
frames plus numeric scores/hashes/timestamps saved. Private key stays outsideGit.
Instrumentation may affect timing. Audit reports contain no error. Windows log
encoding rendered the attribution copyright symbol as mojibake; original UTF-8
source metadata and attribution above retained, numeric/hash evidence unaffected.

In-run verifier compared report/wrapper/isolated profile before emitting numeric
VERIFIED_ACCOUNTING through standard Actions logs; direct storage download was not
needed or bypassed. Local manager checked exact before state, retained prior usage/
authorization history, monotonic counters, cumulativecap3 and source SHA, then
atomically reconciled authority before removing its durable lock after EACH trial.

260→262→264→267 reservations;885390→892571→899760→910488 tokens.
Final conservative reservations$2.93968281600001 under original cumulative$3 cap;
SEVEN new requests, not nine maximum. Original prior/migration history intact, no
paid job/authority lock. FIVE maximum reservations remain. Reservations are not bills.

## Source CI and next work

PR11 preserves test tooling/evidence only. Windows sourceCI41013150612 at
0cc5c3a5e0e503f1395adda12a01c906081a1932 PASSED95unit+1intendedskip,9UI,
14installedfixture scenarios, native desktop smoke and installer build/install.
Release step skipped; summary windows-ci-run-41013150612.json. Final reviewer
independently checked final claims and CI and approved merge after the documented
wording corrections. PR11 merged696ced359a198492ad92b5f050b2fb27c0ce636e.
Postmerge mainCI41013682785 passed the same95unit+1skip,9UI,14installedfixtures,
native smoke and installer build/install, release skipped. Saved summary
windows-ci-run-41013682785.json; second reviewer independently verified main
logs/fixture proof and final267authority/history/no lock. No release publication.
Do not present sourceCI fixtures as extra model accuracy. One hosted display and
seeded onboarding do not certify physical hardware, multi-monitor/DPI, exclusive
fullscreen, arbitrary English rules or95% reliability. Earlier source27 miss remains
unexplained. These positive successes do not erase the failed safe freshness bound.

Next useful work: FREE native-capture sequence across the complete cut segment,
with media/capture timestamp alignment, to distinguish where response-sized gaps
cross changes. Preserve privacy and actual capture; no new paid replay or threshold
optimization on these consumed conditions. Physical deployment remains separate.

Evidence: natural-cuts-preflight-2026-10-30.json; natural-cuts-freeze-2026-10-30.json;
windows-natural-cuts-{wide,compact,safe}-RUNID.json; NATURAL-CUTS-REVIEWS.md.
