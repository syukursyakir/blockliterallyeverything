# Sustained moving-player blocking and stale-result control

Prospective [plan](SUSTAINED-VIDEO-PLAN.md) and
[freeze](sustained-video-freeze-2026-10-29.json). Screenshot-only periodic checks;
brief appearances between checks are acceptable for the user's sustained-distraction
goal. No provider, rule, threshold, polling or production freshness change.

## Original three-trial cohort — preserve the failure

| Condition | Run | Observed outcome |
| --- | --- | --- |
| Large moving player, synthetic YouTube-like watch interface | [40898793801](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40898793801) | PASS:4261ms/.94, complete native cover and recovery; two requests |
| Compact moving player, same interface | [40899628128](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40899628128) | PASS:3277ms/.95, complete native cover and recovery; two requests |
| Compact player replaced by different neutral document during analysis | [40899997617](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40899997617) | FAIL:stale positive.95 accepted, one block, zero changed-screen discards; two requests |

Both positive trials verified neutral first, actual1x WebM decode, advancing media
and decoded frame counters (20->137 and21->108), visible/focused/topmost/fullscreen
cover matching1024x768 display bounds, then button recovery/paused session. Appearance
to observed cover includes polling and automation overhead; not frame-accurate timing
or a latency distribution. Both were within roughly3–4.3seconds in these conditions.

These are TWO correlated new scene layouts using the SAME known CC0 flower media
inside a self-authored YouTube-like UI. Not a real YouTube page, a new source/author,
independent accuracy samples or new explicit-content coverage. Only the video starter
rule was enabled; do not infer explicit/social scores. The flower alone is not the
positive; the deliberately presented watch-interface context is. Raw reports:
[large](windows-sustained-wide-40898793801.json),
[compact](windows-sustained-compact-40899628128.json),
[original stale failure](windows-sustained-switch-40899997617.json).

The failed control observed the second reservation while checking, replaced the
positive with a different neutral document16ms later, then found blocked/checks2/
blocks1. No changed-screen or translation event was recorded. The request audit
contains neutral.02 and positive.95. Original post-response recapture pixels/timing
were not retained, so that report alone cannot distinguish whole-screen mean
comparison dilution from paint/capture timing. Preserve this failure independently
of later diagnosis. It is a stale-block failure, not an uncaught sustained-positive.

## Supplementary diagnostic

A single separate diagnostic was frozen AFTER the failure and BEFORE another call
in [diagnostic freeze](sustained-diagnostic-freeze-2026-10-29.json). Optional test-only
pass-through observation adds request/response times and pairwise64px RGB difference
for actual1280px captures, without substituting requests, responses or sources.
Bounded small bitmaps remain in RAM; only numeric metadata is output. Existing
actual submitted-frame audit encrypts pixels before artifact writes. No new screenshot
retention in production. Unit verifies source passthrough, difference agreement,
record bound and audit-error isolation. The original failure remains in the cohort.

[Diagnostic40900883106](windows-sustained-diagnostic-40900883106.json) FAILED the
same stale-result requirement, positive.94 accepted, one block, no discard; two calls.
Neutral replacement was painted17ms after the reservation observation, response
returned82ms after replacement, and post-response capture was recorded121ms after
replacement. Its measured64px whole-screen mean RGB difference from the positive
capture was0.055251416973 (5.53%), below the production8% guard. Therefore the guard
accepted this captured pair without consulting translation, matching the zero-discard
activity and stale block. This directly demonstrates global-mean dilution in the
controlled diagnostic. Original run's exact capture pair remains absent; do not
pretend its numeric difference was measured too. Native compositor timestamps are
observational; no independent physical-display recording was taken.

The delayed capture was not simply recorded before the documented replacement.
The diagnostic adds observation overhead; it reproduces the failure and identifies
the comparison limitation, not a representative frequency. No cause/fix is claimed
for the older adult source27 miss. Do not lower the threshold speculatively: a more
sensitive global difference can also discard valid ongoing-video decisions. Next
work is a prospectively tested localized-change strategy that preserves sustained
moving-player detection and switch-away protection. No production fix in this PR.
No further paid trial was run; original and diagnostic failures remain visible.

## Accounting and engineering checks

The original three trials used6 reservations,245->251, all report/wrapper/profile
chains compared and local authority atomically reconciled; prior usage/history
preserved. Authority after original cohort:$2.763522048 of approved cumulative3,
853050reported tokens. Supplementary diagnostic has at most3 further reservations;
final reconciled authority is253 reservations,$2.785542144 of cumulative3,
860235reported tokens (~$0.03612987 observed-token estimate, not bills). All four
report/wrapper/profile chains agree; eight total new reservations, prior history
preserved, no paid job or authority lock. Nineteen maximum reservations still fit.
The supplementary repeat is diagnostic, not an extra independent acceptance case.

Direct artifact storage returned403 in the resumed cloud environment. The lock
remained held until normal read-only Actions recovery40899448984 downloaded the
first run's artifact and compared all three files; numeric evidence then came through
Actions logs. Recovery has no provider secret or inference and cannot publish. Later
single-trial jobs perform the same verification before emitting numeric chain logs.
Both successful comparisons and profile-mismatch/token-regression rejection were
checked. Fixed six-trial accounting is unchanged and excluded from this verifier.

Warning PR #7 merged at3c2a80b after sourceCI40898018412 passed. Main40898675905 also
passed79unit+oneintendedskip,9UI,native smoke,installer/install and13fixture scenarios;
release skipped. Source follow-ups40898845707 and40900022596 passed that sequence.
These CI fixture decisions are not model accuracy or proof that the stale-block
failure is fixed. Final diagnostic-sourceCI40900898602 atf4b644f PASSED80unit+oneintendedskip,9UI,
native smoke,installer/install and13fixture scenarios; release step verified skipped.

No release, extension or laptop access. Older source27 unexplained miss, general
fast-motion freshness, representative accuracy, physical display/hardware limits
and95% reliability remain open. Screenshot inputs and private review key remain
outside Git; reports contain hashes/numeric state/provenance only.
