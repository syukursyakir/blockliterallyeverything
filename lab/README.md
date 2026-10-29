# Visual-decision experiments

Development-only research, separate from the desktop app. The app does not send
screenshots to Jev. A Jev comparison is optional and requires a secure API key.

The corpus distinguishes a visible feed/player from text merely mentioning a
site. Synthetic screenshots are explicitly identified and cannot establish
real-browser accuracy. Non-sensitive public photos are cached outside Git and
retain their original licenses. No private or explicit images are collected.
Explicit-content checks initially measure false positives only; without labeled
adult-positive examples they cannot measure recall or certify that policy.

Experiments: original-vs-app parity, single-vs-batched question invariance, Noul
vs Choice with an unknown option, OmniJev 0.8B vs 2B, image-text classifier baseline,
and optional Jev 1.14 image preview. No threshold is tuned on the reported cases.

Images and weights live under /workspace/.cache/ble-evaluation. Numeric reports,
question text and corpus provenance may be committed; private screenshot data and
API credentials must never be committed.

## Results recorded on 2026-10-29

See [matched comparison](../docs/evaluation-summary-2026-10-29.md). Fourteen mostly
synthetic cases were run serially on four Linux CPU threads. Neither model size
nor answer format demonstrated reliable blocking. The 0.8B Noul run caught 3/3
YouTube cases but falsely blocked 9/10 labeled negatives; Choice caught 0/3.
SigLIP was faster but is a mutually exclusive text-similarity baseline, not an
independent arbitrary-rule judge. Explicit and cat rules have no positive cases
in this corpus. No production model or threshold was changed from these results.

The four-case visual-reference pilot caught both positives but blocked both
negatives too. Reference examples therefore did not resolve specificity here.
Parity matched original upstream on two inputs only; it checks the integration,
not model accuracy or all possible inputs. Windows live behavior remains untested.

The evaluator now verifies source hashes, records selected cases and normalized
input hashes, rejects mismatched comparisons, validates Choice probability schemas,
and keeps abstentions and invalid normalization separate from allow decisions.

The [harder Jev follow-up](../docs/evaluation-jev-hard-summary-2026-10-29.md)
is deliberately separate from the original suite. `node scripts/build-hard-corpus.mjs`
attempts fresh public captures and builds synthetic edge cases in the external
cache. Live captures initially have null labels and `needs_visual_label: true`;
inspect pixels and freeze labels before evaluation. Re-captures change hashes
and are a new experiment. The saved report embeds the inspected manifest and
capture failures; it does not claim real active-service positive coverage.
