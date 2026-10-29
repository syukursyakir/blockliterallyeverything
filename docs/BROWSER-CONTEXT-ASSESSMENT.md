# Browser-context experiment assessment

29 October 2026. Design assessment only, following TIMESLICER-RESEARCH.md and
current source at 61160dc (production detector from 902565c). No extension,
architecture change, provider request, installation or new accuracy evidence.

## Recommendation

Assess foreground binding before adding browser context to decisions. The smallest
useful first prototype is an opt-in, local-only observer on one Windows display,
one supported Chromium browser and controlled public/test pages. It must not send
metadata to Jev or change matches, visual freshness, covers, defaults or consent.
Building that prototype remains a proposed next step, not completed implementation.

Stable page identity might help recognize YouTube/social interfaces while video
pixels move. It cannot establish visible sexual activity/nudity, distinguish an
Instagram feed from every other Instagram page, or prove the same image remains
visible. URL-only blocking would change editable-rule semantics. Custom rules and
explicit detection stay outside this first experiment.

## Existing integration boundaries inspected

- electron/main.ts checkLoop captures displays, calls inferCloud, recaptures and
  rejects changed pixels unless sameTranslatedFrame accepts whole-view translation.
  Generation cancellation, 15-second age limit, capture failures and recovery must
  remain intact. Its cloud path currently has no native foreground identity probe;
  the optional local worker context does not supply one for Jev.
- electron/jev.ts requestJev accepts PNG bytes and rules. cloudQuestions explicitly
  judges visible image content; there is no established metadata request contract.
  Rendering metadata into an image or injecting it into rule instructions would
  change the experiment and needs separate prospective validation.
- src/shared.ts rules remain editable. Platform rule IDs alone do not establish
  stock wording; custom edits must never silently become domain blocklists.
- electron/preload.ts IPC is for the app renderer, not a browser extension bridge.
  A new external input surface requires authentication and schema validation.
- Current cover enforcement covers all displays. A future context result bound to
  one foreground window is not evidence about every display or background tabs.

## Proposed first observation scope

Use a manually enabled, unpacked test extension with narrowly scoped test-host
permissions and a Windows native-messaging observer. Prefer native messaging over
an unauthenticated localhost listener. Pin the extension origin in the host manifest,
validate bounded messages and do not expose application control methods. Packaging,
host registration and Chromium-specific behavior require implementation verification.

Start with origin and a normalized route category (home/search/watch/shorts/feed/
other/unknown), plus ephemeral document, navigation, tab and browser-window IDs and
monotonic sequence. Do not persist full URLs, query strings, titles, visible text,
page screenshots or raw IDs. Search queries, titles and DOM text are unnecessary
for the first identity question and can contain private information. Revisit title/
text only if a measured gap justifies separate consent and a bounded data contract.
Exclude incognito and unsupported hosts; do not access history or inactive tabs.

Browser window IDs and focused/active flags alone do not prove Windows foreground
identity or visibility. Establish a verified mapping to the foreground native HWND
and process instance; do not use title matching as proof. Bind records to an observer
session, navigation epoch and sequence, timestamped on host receipt. Invalidate on
blur, navigation (including SPA and history), tab replacement, minimize, disconnect,
lock and suspend. Dropped events require bounded heartbeat expiry; exact expiry is
a proposed engineering parameter to freeze before tests, not a reliability guarantee.
If robust window mapping cannot be established, stop at a feasibility report.

An active tab can be occluded by another window, a browser dialog or another app;
foreground binding does not resolve every visibility condition. The observer records
unknown for unsupported/ambiguous cases. No context observation may override the
visual guard, count as a safe classification or suppress screenshot checks.

Keep observation data in bounded memory. Save only predefined scenario IDs, timing,
valid/unknown transitions and reason enums. Avoid content-derived hashes of private
URLs as a substitute for minimization. Inspect diagnostics/crash paths before
claiming no intentional retention; OS paging/dumps prevent absolute guarantees.

## Fresh prospective checks, after prototype scope is accepted

Freeze implementation hash, supported browser/OS version, event contract, heartbeat
expiry, cases and expected transitions before running. Use new controlled pages,
not the completed model cohorts. No paid calls are needed for this phase.

| Scenario | Required observation |
| --- | --- |
| Foreground allowed test page, then new platform test page | Correct current identity; timing from visible transition recorded |
| Moving player on same page | Identity remains usable only while the same foreground binding remains valid |
| Switch tab or navigate during delayed observation | Prior epoch invalidated; delayed old messages rejected |
| Same-URL reload, SPA/history and tab replacement | New document/epoch; old record never revived |
| Two browser windows, same titles/URLs; another app foreground | Native mapping distinguishes windows; background record unusable |
| Minimize, occlude, lock/suspend, disconnect, heartbeat loss | Unknown/invalidation recorded; no inferred safe result |
| Malformed, oversized, replayed or unauthorized messages | Rejected without content logging or app control |
| Disabled consent, incognito, unsupported host | No page-context collection |

Retain all failures. Report foreground misbindings, stale acceptance, unknown time
and transition delay separately; fixtures prove protocol behavior, not real Windows
mapping. Any observed misbinding/stale acceptance blocks progression to enforcement.
A passing small protocol suite is not a 95% accuracy or bypass-proof claim.

## Decision after observation

If foreground identity and data minimization are viable, present observed results
before choosing a decision path. Local route predicates would support a narrower,
explicit platform policy; arbitrary English classification would require a verified
Jev metadata interface and fresh provider evaluation. Neither is authorized by
TimeSlicer research alone. Keep the image detector as a separate signal, preserve
switch-away rejection, and do not treat unchanged metadata as visual freshness.

No existing tests were rerun for this document. Budget unchanged: 245 reservations,
$2.697461760 of cumulative $3, 831497 reported tokens, 27 maximum reservations left
per current handoff; no paid job started. Original source27 miss, safe4x freshness
failure, representative accuracy and physical hardware/display limits remain open.
