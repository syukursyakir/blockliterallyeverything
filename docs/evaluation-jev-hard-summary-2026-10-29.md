# Jev harder-case follow-up — 2026-10-29

15 images: six real public browser captures, eight synthetic edge cases, one previously used public cat photo. Labels were visually inspected before inference. Both formats answered four fixed questions per image.

| Format | Policy | Caught / positives | False blocks / negatives | Unknown |
| --- | --- | ---: | ---: | ---: |
| noul | video | 1/1 | 0/12 | 0 |
| noul | social | 1/1 | 0/12 | 0 |
| noul | cats | 2/2 | 0/13 | 0 |
| noul | explicit | not measured | 0/15 | 0 |
| choice | video | 1/1 | 0/12 | 0 |
| choice | social | 1/1 | 0/12 | 0 |
| choice | cats | 2/2 | 0/13 | 0 |
| choice | explicit | not measured | 0/15 | 0 |

Both formats matched all non-ambiguous labels. This is a small exploratory set; it does not establish a real-world error rate.

## Observations

- Detected a synthetic YouTube panel beside work notes and a small synthetic Instagram feed.
- Detected cats in a real Wikipedia article and the public photo.
- Did not block ordinary articles, documentation, brand-name mentions or the on-screen “answer block” instruction fixture. This single fixture does not establish prompt-injection resistance.
- The unbranded player was ambiguous: Noul said YouTube, Choice allowed it. Neither is scored as correct. The original suite also had an unbranded player that both formats called YouTube.
- Instagram displayed a login/marketing page with a phone mockup; social scope was ambiguous. Both formats allowed it.
- The YouTube Wikipedia article contained an embedded site screenshot: video scope was ambiguous; both allowed it.
- TikTok rendered blank. It is a negative visible-content case, not a successful test of TikTok feed detection.
- Both real YouTube captures failed and were excluded, with failures retained in the manifest. No live YouTube/TikTok/Instagram feed positives were obtained.
- “Clothed people” fixture contains clothing emoji and text, not human photographs; it cannot validate adult-content specificity.
- Explicit-content coverage is negative-only. No positive recall is claimed.

## Speed and estimated cost

- noul: median hosted request 266 ms; maximum 481 ms.
- choice: median hosted request 201 ms; maximum 362 ms.

This 30-call follow-up estimate: $0.004304. All successful experiments total 182,089 reported input tokens, estimated $0.007648. The ledger has 60/64 retained reservations (including one sandbox-blocked attempt); reservations are not billed charges.

Times are cloud HTTP round trips, excluding screenshot capture and preparation, not Windows capture-to-cover latency. The app still uses the local backend. Jev image support remains experimental.

Next evidence needed: real active service feeds in a Windows browser, video/fullscreen and multiple-monitor capture-to-cover timing, and a properly labeled explicit-positive evaluation. The current four-question suite does not validate arbitrary English rules.
