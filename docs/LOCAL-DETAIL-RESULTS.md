# Localized disappearance correction: results

30 October 2026. [Prospective plan](LOCAL-DETAIL-PLAN.md),
[freeze](local-detail-freeze-2026-10-30.json). Preserve the original stale-block
failures40899997617/40900883106 and their limitations in SUSTAINED-VIDEO-RESULTS.md.
This is a corrective integration regression, not new independent accuracy coverage.

## Change and development checks

The original8% global RGB difference remains. On64px captures, an8x8 patch at4px
strides flags detailed-to-flat collapse: max channel variance>=400 before,<=4 after,
mean RGB difference>=10%. Whole-view translation still requires its original clean
padding and2% aligned mean, plus absence of local detail loss AFTER alignment.
This closes a second dilution gap: initial app-loop regression failed because tiny
vanished content could pass the translation exception even after the new local check.
The shared comparator fix preserves fully visible translations and rejects that
vanished region. The initial failed test is retained in WORKLOG.md, not hidden.

Three new unit tests cover localized removal below global threshold, actual detail-
preserving changes/translation, alpha/resampling, invalid buffers and similarly
detailed replacements outside this heuristic. Extended app-loop fixture verifies
stale positive rejection, no cover, and fresh-neutral recovery.21 affected local
tests, build and strict runner TypeScript passed. Free development scan caught20/20
compact removals that global mean missed and added zero rejections in106 sampled
motion pairs across two layouts. [Raw scan](local-detail-development-2026-10-30.json).
One known clip, development use and browser resampling; not a native accuracy estimate.

## Fixed three-trial native cohort at795faf1

Actual hosted Windows capture/Jev, one1024x768 display, isolated seeded profiles,
known decoded CC0 flower media inside synthetic YouTube-like UI. Only video rule
is enabled; no explicit/social score claim. Screenshot-only, original provider,
model, instructions, threshold.4 and interval3s. No speculative provider/rule tuning.

| Condition | Run | Result |
| --- | --- | --- |
| Compact player switch-away during inference | [40985539094](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40985539094) | PASS:positive.94 discarded, fresh neutral.02, zero blocks/covers, clean stop;3calls |
| Compact sustained moving player | [40985739418](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40985739418) | PASS:3341ms/.95, full cover/recovery, no new discard;2calls |
| Large sustained moving player | [40985950475](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40985950475) | PASS:4287ms/.96, full cover/recovery, no new discard;2calls |

Switch-away required corrective branch usage BEFORE calls: `localDetailLoss:1`
and `changedDuringAnalysis:1` establish the newly added path was needed. Actual
positive->postresponse capture mean was5.476%, below the old8% guard, followed by
a fresh real neutral.02 result. This exercises the fix instead of merely obtaining
a pass through a large global difference. Original failed trials remain failures.
Post-response pixels themselves are not retained for semantic review; native
compositor timing/physical display limits are not retrospectively certified.

Sustained compact/large decoded counters advanced21->110 and20->138 at actual1x.
Both covers were visible/focused/topmost/fullscreen at exact display bounds, then
button recovery paused the session and removed covers. Timing is appearance after
animation callbacks to automation-observed cover, including polling/IPC, not an
external frame-accurate timing or a latency distribution. Both localDetailLoss and
changedDuringAnalysis counts were zero in these two trials.

Raw numeric chains, scores/hashes and runtime/cover facts:
[switch](windows-local-detail-switch-40985539094.json),
[compact](windows-local-detail-compact-40985739418.json),
[large](windows-local-detail-wide-40985950475.json).
All conditions reuse known media/source/UI. They do not add independent people,
real YouTube browsing, explicit-video accuracy or95% certification. No fourth trial.

## Accounting, engineering CI and limits

Seven new reservations,253->260; report/wrapper/profile compared independently in
runner logs and exact before/history checked before atomic local reconciliation.
Final260 reservations,$2.862612480 of approved cumulative3,885390reported tokens
(~$0.03718638 observed-token estimate, not bills or missing historical usage).
Prior62 missing-ledger history and original approval retained;12 maximum further
reservations fit. No active paid job or authority lock, no extra trials to get green.
Actual submitted frames encrypted before artifact writes, private key outside Git;
production runtime adds no intentional screenshot retention.

Source WindowsCI40985540342 at795faf1 PASSED83unit+oneintendedskip,9UI,native smoke,
installer build/install and13installed fixture scenarios; release skipped.
[Numeric summary](windows-ci-run-40985540342.json). Fixture CI is not model accuracy.
Post-merge verification will be recorded after merge. No release or laptop access.

This is a narrow heuristic correction. Normal video cuts to flat scenes can lose
detail and delay decisions; similarly detailed replacements or subtle/low-contrast
changes may escape. Original source27 miss is not diagnosed/fixed. Representative
fast motion/cuts, arbitrary editable rules, physical multiple monitors/DPI/games,
user hardware and95% reliability remain unproved. Next useful work: free prospective
flat-cut/safe-lookalike tests to quantify extra discards before any broader change.
