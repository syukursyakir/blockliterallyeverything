# TimeSlicer: original blocker, pivot, and relevance to this project

Researched29 October2026 from public first-party pages, founder comments and
archived pages. These establish what the company documented, not independently
verified implementation or accuracy. No app/extension was installed, no account
created, no messages sent, no provider calls made and no project code changed.

## The original2025 blocker had TWO input paths

The [2025 privacy policy archived8 September2025](https://web.archive.org/web/20250908220353/https://www.timeslicer.app/privacy-policy)
(policy marked last updated11 July2025) explicitly describes:

- Desktop: captures screenshots to identify distracting activities, temporarily
  holds them in RAM and securely sends them to OpenAI for processing. It says the
  images are not permanently stored. It does not identify the exact model,
  resolution, cadence, freshness checks, thresholds or failure handling.
- Chrome extension: processes visible text from the active tab to determine
  distractions; says extracted text is not retained beyond immediate analysis.

The [founder's original launch discussion](https://www.producthunt.com/p/timeslicer/timeslicer)
explains the decision/enforcement path: an LLM classifies active-tab content relative
to user goals, then a full-screen visual overlay blocks distraction. Desktop support
was also advertised for games, Discord and other applications outside Chrome.
Goals, schedules and skip lists were configurable. Founder examples distinguish
YouTube programming tutorials from unrelated entertainment and allow Reddit lead
research while blocking off-topic subreddits. These are examples/claims, not tests.

The same discussion describes strict/full-screen versus friendlier popup behavior,
and a wrong-block recovery requiring an8–10-word phrase. It claims local or OpenAI
processing with zero data retention. Do NOT carry that old claim into present-day
privacy descriptions: later documented architecture/retention changed.

The [archived2025 homepage](https://web.archive.org/web/20250908220018/https://www.timeslicer.app/)
corroborates goal-aligned, context-aware blocking and the tutorial-versus-cat-video
positioning. [Product Hunt launches](https://www.producthunt.com/products/timeslicer/launches)
lists the blocker launch on4 September2025 and the work-diary launch on25 July2026.

## Current2026 product: task/work tracking, with blocking still present

The [current homepage](https://www.timeslicer.app/) emphasizes automatic work
tracking for remote teams, task names/hours, Linear/Jira matching and Claude
integration. It is a shift in positioning; it does not establish that blocking was
removed. The current privacy policy and release notes still describe blocking.

The [current privacy policy](https://www.timeslicer.app/privacy-policy), updated
9 October2026, is much more specific about inputs and cloud processing:

- App names and window titles; browser extension reads active-page URL/title and
  up to500 characters of visible page text. It describes filtering sensitive sites
  and attempting redaction. These are claims about safeguards, not guarantees.
- AI coding-assistant prompts and local git history support work labeling. Some
  desktop-app text sources require opt-in/OS permission.
- Optional macOS window snapshots use LOCAL text recognition. At most a single
  image every few minutes, capped at150/day; the policy says images stay on the
  device, are never written to disk and are discarded after OCR. Extracted text
  is used as other screen text. This is NOT the old desktop raw-image-to-OpenAI
  path, and this snapshot cadence is NOT a documented blocking poll interval.
- OpenAI labels tasks; Google Gemini classifies focus versus distraction. The
  policy describes short TEXT excerpts sent to model providers and deletion after
 30 days, with no training under their agreements. Local storage does not mean
  local AI inference. Exact deployed model versions are not disclosed here.
- Work history/text are stored locally (SQLite/JSONL). Optional team summaries are
  encrypted before relay; this is separate from model-provider processing.

The [data-use summary](https://www.timeslicer.app/data-usage) and
[plain-language explanation](https://www.timeslicer.app/blog/your-data) agree on
these distinctions; the policy governs. The marketing phrase “no screenshots”
should be read with the optional local snapshot/OCR explanation, not as evidence
that no image ever enters RAM.

[Release notes](https://www.timeslicer.app/releases) support continued blocking:
1.8.0 says pausing tracking leaves blocking running;1.8.3 describes section-specific
site rules and local blocking history;1.7.8 introduces optional macOS snapshot OCR.
These are dated features of the current product, not proof of2025 internals.

## What we can usefully learn

The original architecture already combined text-based browser detection and visual
desktop detection. Our screenshot-to-cloud-to-native-cover path is therefore similar
to the original DESKTOP path; TimeSlicer was not solely a text-only blocker. Its
browser path had an additional signal we currently lack.

A browser-context signal could help identify a visible YouTube/social page despite
moving video pixels: the URL/page text may remain stable while pixels change. This
is a design hypothesis for OUR system, not measured proof, and it does not establish
visual nudity detection when page metadata is uninformative. Foreground/tab identity,
stale metadata, consent and minimal data handling would still need design/testing.

Suggested next step after handoff: assess a small opt-in browser-context experiment
alongside the existing visual detector, with explicit scope and fresh tests. Keep
user-selected Jev; this research does not authorize switching to OpenAI/Gemini,
adding transcript/git collection, installing their extension or redesigning UI.
Do not treat building a browser extension as an already accepted implementation.

The reviewed public sources do not provide a reproducible95% benchmark, native
fast-motion/scene-cut evaluation or sufficient implementation details to copy their
freshness strategy. No public reason for the pivot was established in this review.
Do not infer that the pivot proves their blocking failed or succeeded. Preserve
our actual misses, guards and prospective evaluation discipline.

## Research checkpoint

No implementation changes or evaluation spend during this research. Main contains
PR #6 merged motion correction and later evidence/docs. Authority remains245
reservations,$2.697461760 of cumulative3,831497 reported tokens;27 further maximum
reservations fit. No paid job/lock. Physical hardware, general fast-video freshness,
old source27 unexplained miss and95% reliability remain open. Read HANDOFF.md for
current state; do not rerun old cases as new independent evidence.
