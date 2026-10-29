# Broader source-separated evaluation — 2026-10-29

48 NEW source-family cases were labeled before inference and split into 24
development and 24 untouched held-out cases. Twelve later stress images reuse
known development sources and are reported separately, never as independent cases.
The existing provider/model and threshold 0.4 stayed fixed. Exact instructions,
labels, hashes, sources, exclusions and scores are preserved in the reports.

## Observed outcomes

| Cohort | Explicit caught / positives; false blocks / negatives | YouTube caught / positives; false blocks / negatives | Social caught / positives; false blocks / negatives |
| --- | --- | --- | --- |
| Development baseline, 24 | 5/5; 2/18 (one scope-ambiguous diagram) | 3/3; 1/21 | 5/5; 0/19 |
| Development platform clarification, SAME 24 | 5/5; 2/18 | 3/3; 0/21 | 5/5; 0/19 |
| Frozen selected rules, held-out 24 | 6/6; 0/18 | 3/3; 0/21 | 4/4; 0/20 |
| Development stress, 12 correlated variants | 3/3; 0/9 | 4/4; 0/8 | 4/4; 0/8 |

No labeled positive was missed in these cohorts. The held-out positives are still
TOO FEW to establish at least 95% recall: descriptive Wilson lower bounds are
about 61% for explicit, 44% for YouTube, 51% for social. They are not representative
population guarantees. Source/photographer/platform correlations remain; one agent
labeled the cases, not an independent human panel. Overall accuracy is not a
substitute for per-rule recall, false blocks and denominators.

## Data and capture limits

- Real YouTube source pages were captured on Windows after the cloud tunnel failed.
  Four populated search/channel pages, an empty branded homepage and a watch page
  were visible. The watch player required sign-in but showed YouTube chrome and
  recommendations: this tests browsing, NOT successful video playback.
- Nine new visible Instagram/TikTok feed/grid cases span the split. Dismissal used
  normal clicks on visible Close icons; no authentication/protection bypass.
- Thirteen new source-declared adult-photo cases include eleven explicit positives
  and two covered-body/swimwear boundary negatives. Ages/licenses/attribution were
  checked from source metadata before selection; ages are not independently ID
  verified. A multi-view collage counts as ONE source/person family.
- Negative sources include programming/health pages, other branded video services,
  fitness images and brand-name mentions without target interfaces.
- Five acquisition failures/incomplete pages were frozen as exclusions BEFORE
  inference: two Instagram rate limits, a blocked Reddit page, Pinterest error and
  a loading Khan page. They are not successful service-feed tests.
- A small medical breast diagram is explicit-scope ambiguous and counted separately,
  never silently as an allowed photographic case. See EVALUATION-POLICIES.md.

Raw public captures from Windows traveled as AES-GCM encrypted bytes, with the
AES key wrapped to a locally generated RSA public key. Private key stayed in the
local private corpus; neither raw screenshots nor that key were uploaded publicly.
Only encrypted capture/status artifact existed on GitHub. Images/provenance remain
under /workspace/work/ble-broader-2026-10-29, outside Git. Reports omit page-body
text; they retain source URLs, hashes and short label/rights information.

## Change supported by development and held-out evidence

The YouTube starter's unqualified “video playback” matched an Instagram feed.
The frozen clarification explicitly names YouTube browsing/watch/Shorts and excludes
other platforms. The social starter explicitly names Instagram/TikTok and excludes
YouTube/other players. It removed the development platform false match while
retaining positives; the held-out settings were frozen BEFORE held-out predictions.
The later stress set covered small panels, screenshot instructions and mixed rules.

These clarified platform instructions now become starter text. Loading saved
preferences upgrades ONLY exact untouched legacy strings; custom instructions,
names, enabled flags and other settings are preserved. Validation and saving user
edits remain literal. Startup does not enable capture; the activity log announces
starter clarification. The explicit rule and threshold are UNCHANGED, favoring
recall. Two covered/suggestive-body development cases still falsely match explicit;
no threshold increase or convenient relabeling hides those results.

This is an evidence-supported narrow wording fix, not automatic certification of
arbitrary English rules or a public release. The installed alpha is unchanged.

## Evidence files

- evaluation-broader-development-baseline-2026-10-29.json
- evaluation-broader-development-candidate-2026-10-29.json
- broader-selection-before-heldout-2026-10-29.json (settings and held-out hash/time)
- evaluation-broader-heldout-2026-10-29.json
- evaluation-broader-stress-2026-10-29.json

The first candidate retest is not an extra independent sample. Do not aggregate
its counts with baseline or held-out recall. If these held-out results guide any
further prompt changes, future acceptance needs new held-out sources.

Next integration work: full active-session neutral->positive transitions with
real YouTube and a previously reviewed, exact-hash adult reference, plus the
existing synthetic social control. Those are source repeats for integration,
not extra independent model-accuracy samples. No release publishing.
