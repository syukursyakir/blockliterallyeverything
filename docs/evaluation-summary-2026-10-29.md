# Fixed-corpus comparison

Small, mostly synthetic suite. Counts describe these cases only. No policy thresholds were tuned on this suite.
Explicit-content examples are negative-only, so no explicit-content recall or overall safety ranking is reported.

| Model / format | Upper median seconds/image | Policy | Caught / positives | False blocks / negatives | Unknown / labeled |
| --- | ---: | --- | ---: | ---: | ---: |
| SigLIP2 base (similarity baseline) / similarity | 0.21 | video | 3/3 | 3/10 | 0/13 |
| SigLIP2 base (similarity baseline) / similarity | 0.21 | social | 1/2 | 5/11 | 0/13 |
| SigLIP2 base (similarity baseline) / similarity | 0.21 | explicit | not measured | 0/14 | 0/14 |
| OmniJev 0.8B / noul | 4.51 | video | 3/3 | 9/10 | 0/13 |
| OmniJev 0.8B / noul | 4.51 | social | 2/2 | 7/11 | 0/13 |
| OmniJev 0.8B / noul | 4.51 | explicit | not measured | 11/14 | 0/14 |
| OmniJev 0.8B / choice | 7.98 | video | 0/3 | 0/10 | 0/13 |
| OmniJev 0.8B / choice | 7.98 | social | 0/2 | 0/11 | 2/13 |
| OmniJev 0.8B / choice | 7.98 | explicit | not measured | 0/14 | 0/14 |
| OmniJev 2B / noul | 10.32 | video | 3/3 | 7/10 | 0/13 |
| OmniJev 2B / noul | 10.32 | social | 2/2 | 2/11 | 0/13 |
| OmniJev 2B / noul | 10.32 | explicit | not measured | 0/14 | 0/14 |
| OmniJev 2B / choice | 17.26 | video | 0/3 | 2/10 | 10/13 |
| OmniJev 2B / choice | 17.26 | social | 0/2 | 1/11 | 9/13 |
| OmniJev 2B / choice | 17.26 | explicit | not measured | 1/14 | 10/14 |
| Jev 1.14.0 (hosted experimental images) / noul | 0.19 | video | 3/3 | 0/10 | 0/13 |
| Jev 1.14.0 (hosted experimental images) / noul | 0.19 | social | 2/2 | 0/11 | 0/13 |
| Jev 1.14.0 (hosted experimental images) / noul | 0.19 | explicit | not measured | 0/14 | 0/14 |
| Jev 1.14.0 (hosted experimental images) / choice | 0.19 | video | 3/3 | 0/10 | 0/13 |
| Jev 1.14.0 (hosted experimental images) / choice | 0.19 | social | 2/2 | 0/11 | 0/13 |
| Jev 1.14.0 (hosted experimental images) / choice | 0.19 | explicit | not measured | 0/14 | 0/14 |

Unknown decisions are kept separate. A policy that covers unknowns can increase both catches and false blocks; see each report’s cover_unknown metrics.
Ambiguous provenance cases are not forced into a correct/incorrect label. A website mentioned in settings/article text is a negative for viewing that site.
Local timings measure Linux CPU preprocessing/inference with four threads. Jev timings measure hosted HTTP round trips from this environment and exclude image preparation. Neither measures Windows end-to-end intervention time.
