# Reviewed retry-phase mitigation: evidence and limits

30 October 2026. User requested autonomous checks with a second agent after each
meaningful step. Review checkpoints: SESSION-REPLAY-REVIEWS.md. No real provider
calls or evaluation-budget change in this continuation; no release. Original260/
$2.862612480/885390 history remains,12max reservations left.

## Finding and rejected candidate

SESSION-REPLAY-PLAN froze a synthetic one-display scheduler with actual ScreenCache,
pre-PR9/current pixel comparators, complete nonblank fixtures and capture-latched
supplied .95/.02 replies. Poll wait3s starts after response, cache marks only accepted
capture bytes for30s, and blocking stops at first match. Detection-only separately
observes longer traces. These are NOT real media, model predictions, native capture,
provider latency distributions or continuous semantic-coverage guarantees.

1152grid version-cases plus30controls: current4/288blocking settings had no matching
acceptance by60s (two periodic schedules duplicated static/moving), pre-fix0/288.
The explicit phase-lock control also reproduced in actual main with mocked capture,
transport, filesystem and time:19requests,18discards,only initial neutral accepted.
15current-main control traces matched simulation. A59s terminal observation gap is
right-censored synthetic evidence, not a measured protection outage or miss rate.
Static cache control fresh gap30.3s differs from accepted/cache-observation gap3.3s.

The immediate-discard phase candidate was REJECTED. It removed known locks but made
20/216new timing settings slower, worst+9.2s/16.85s after onset and extra requests.
Negative evidence retained in retry-phase-immediate*.json, not hidden by later work.

## Chosen conservative policy

Only after15s of unresolved screen-change discards (the existing delayed-check
warning threshold), vary the following wait by250/500/750/1000ms cyclically. Normal
configured wait remains a lower bound; timeout/errors still pause without retry.
When recovery leaves no overdue display flags (or the session resets), the cycle
resets. A healthy display alone does not clear another display’s delayed state.
Never accept a discarded/stale result
or weaken the screenshot comparator. These are deterministic phase shifts, not
random jitter or a guarantee that every adversarial alignment will break.

Use the oldest unresolved display flag AFTER processing all displays; a healthy
screen's acceptance/cache use cannot reset a stalled other screen. One global wait
affects the next loop, including healthy displays, by at most1extra second once
already degraded. UI settings explains that possibility. Physical multiple displays,
mixed DPI and real-world timer/capture behavior remain unproved.

RETRY-ESCALATION-PLAN froze this policy before a fresh timing grid. Development1008
parameter settings includes the consumed earlier holdout: blocking504current4no-match
->0, with no slower previously successful first matches. New576parameter timing
holdout has ZERO escalations; it confirms healthy invariance under those assumptions,
not general rescue behavior. Detection-only first matches similarly preserved.
Activation metadata reconstructed with exact equality against all recorded metrics;
not an additional independent experiment. Development10offsets actually shifted
9requests and1cached poll; explicit control1request shifted. Repeated computation
for metadata/trace verification is disclosed, not additional accuracy evidence.

## Activation-rich checks and actual app integration

RETRY-ACTIVATION-PLAN prospectively froze108deliberate lock/near-lock settings,
216version-cases. Blocking54: current36no-match->0;36activated52offsets and52shifted
requests. Observe54:39activated64offsets,58shifted requests/3cached polls and3offsets
whose next poll fell beyond the horizon. No new nonmatch or slower prior successful
first match in this set. Late recovery reached30.66s after onset: fallback recovery,
not few-seconds blocking. These timings are synthetic assumptions, not native stats.

Initial stress computation ABORTED on an audit-counter reset assertion3250!=3500;
policy correctly reset while reconstruction did not. Reviewer approved audit-only
fix, original zero-byte output/error marker retained, corrected computation saved
to a NEW output. Not a pristine first execution or policy/input retuning.

Reviewed helper/main integration then passed16selected actual-main mocked traces,
including cancel during an active adjusted wait. One two-display logical fixture
forces healthy-screen fresh acceptance mid-cycle and cache use while the other
remains stalled; actual waits retain3250/3500/3750/4000cycle. Source comparator,
provider/model/rules/threshold/consent/key handling unchanged. No actual-paid cases
were replayed.13focused tests, application build, TypeScript and fixture syntax pass.
Actual initial/main parity traces and raw grids are linked below.

New installed Windows check uses controlled capture/provider replies and a main-JS
clock jump16s BEFORE recording capture age; real timers remain. It requires the
identified adjusted poll callback to schedule/fire, third fixture inference after
it, then real native cover/button recovery. Clock/timer restoration occurs in finally
after pausing. This is timer/IPC/native-cover wiring, NOT real media/provider or
native polling cadence/latency. Final source Windows CI41004046093 atb688023
PASSED95unit+1intendedskip,9UI,14installedfixtures, desktop smoke and installer
build/install. Release step skipped. Numeric proof: scheduled1250ms callbackid0
fired1252ms after scheduling; thirdfixture request48ms after firing;3requests/
6captures. Native cover/button recovery assertions passed. Prior source
CI41003753513 atadcfef1 also passed the same sequence before log-only addition.
Saved numeric summaries windows-ci-run-41003753513.json and
windows-ci-run-41004046093.json. Second agent independently reviewed final logs/proof and approved merge.

## Evidence index and next work

- session-replay-2026-10-30.json; session-main-parity-2026-10-30.json (original current-only15)
- retry-phase-immediate-2026-10-30.json and summary (rejected)
- retry-escalation-2026-10-30.json; retry-escalation-activation-audit-2026-10-30.json
- retry-activation-stress-2026-10-30.json; retry-activation-incomplete-2026-10-30.json
- retry-escalation-main-parity-2026-10-30.json (wired16controls)

Report initial/terminal censoring separately; when there are no observations they
can overlap, so never sum them as disjoint time. Potential warning intervals derive
from first unresolved discard+15s; they are not React-rendered UI measurements.
Static/moving synthetic variants and related schedules are not independent subjects.
No95% claim, original source27 miss explanation, hardware or arbitrary-rule guarantee.
After CI/review, next useful evidence is genuinely representative cut/motion content
and real deployment conditions; preserve remaining model allowance for useful tests.
