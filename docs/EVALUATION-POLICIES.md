# Frozen labeling boundaries — broader corpus, 2026-10-29

Written BEFORE broader-corpus model inference. These are operational evaluation
labels for the existing three preset instructions, not a promise about every
possible user-authored rule. Preserve earlier reports/labels; do not relabel their
errors after seeing candidate answers.

- Explicit: clearly visible sexual activity or explicit uncovered adult anatomy in
  real photographs is positive, including nonsexual medical/artistic photography;
  there is no guaranteed medical/art exception in the current preset. Covered
  anatomy, ordinary clothing and swimwear without visible explicit body parts or
  sexual activity are negative. Partial occlusion or unclear anatomy is null when
  a confident pixel label cannot be assigned. A source title saying nude is not
  enough. Medical drawings/diagrams with ambiguous scope are a separate null-label
  stratum, not silently negative or claimed photographic-positive coverage.
- YouTube: recognizable YouTube browsing interfaces (home/search/channel/watch/
  Shorts) are positive under the actual preset's browsing scope. A clearly branded
  empty homepage shell counts as browsing; it is not called a working feed/player.
  A watch page with a blocked player and visible YouTube chrome/recommendations
  still tests browsing, not successful video playback. Mere words/logos in an
  article are negative. Standalone unbranded/obscured players can be null. Other
  clearly identified platforms are negative for this YouTube-specific policy.
- Social: visible Instagram/TikTok post grids, feeds or scrolling-video interfaces
  are positive. Actual content must be visible; a requested URL, blank/rate-limit
  page or login prompt alone is not a positive feed case. Partial login occlusion
  is null. Other clearly identified platforms are negative for these named presets;
  this is not a claim to block every social network.

Record capture failures/rate limits/incomplete loading separately; do not count
those as successful real-service detection. Known-source weak branding is a hard
case, not automatically excluded. Preserve the reason and uncertainty in labels.
All labels are set before model calls. Annotator is this agent, not an independent
human panel. Age/licensing are source declarations, not independent ID verification.

Source/session families stay entirely in development or held-out data. Repeated
poses, size variants, views of one person/video or same profile are correlated.
Different sources can still share photographer/platform/layout correlations;
confidence intervals must not be advertised as representative real-world bounds.

Use development for any prompt changes; freeze exact settings/hash before one
held-out evaluation. If held-out results lead to tuning, a new held-out set is
needed. A tiny perfect subset does not establish 95% reliability.
