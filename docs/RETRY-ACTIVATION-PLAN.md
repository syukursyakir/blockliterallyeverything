# Activation-rich synthetic stress checks — prospective scope

30 October 2026; second-agent design review complete before execution. Same fixed
escalation-only policy from RETRY-ESCALATION-PLAN, no tuning, provider calls or
production edits yet. This is a deliberately locked/near-locked STRESS family,
not a natural cadence or new real-media/model holdout.

Periods3340/3760/4280ms with matching response=period-3000 (340/760/1280ms), flat
dwell120/280/560ms, offsets50 / (50+dwell/2) / (50+dwell+100), static/moving frame
bytes and blocking/detection-only.108settings/216current-versus-escalation cases.
First two offsets target flat cuts; third probes nearby clean/near-lock timing.
60s horizon, same cache/verdict/cancel conventions. Every candidate activation and
actually shifted subsequent poll (request/cache) must be distinguished from an
offset scheduled beyond observation end. No new60s nonmatch where current matches;
retain slower first decisions, stale switches, request deltas and censoring.

Only after independent results review wire reviewed helper into actual main on
branch, then test16single-display mocked control traces (original15 plus cancellation
while active retry waits) and2display acceptance/cache-vs-stalled-screen reset case.
Oldest unresolved per-display timestamp drives one global retry delay; individual
healthy screen cannot reset stalled other screen. Reset session start/stop/fail,
empty map or young unresolved age. First active offset250, cyclic0..3 thereafter.
No stale result may be forced through. Source comparator/provider/rules untouched.

A new installed Windows fixture may use supplied capture/provider replies plus
in-process clock manipulation to exercise timer wiring and real cover/recovery.
It is NOT real media/capture/provider/cadence proof. Full CI is authorized; no paid
model replay is needed for this arithmetic/IPC change. Budget260 unchanged; no release.
