# Optional Jev image comparison

Verified official sources on 2026-10-29:

- https://docs.typesafe.ai/images.md — image inputs supported by Jev 1.13 and 1.14
  behind TypeSafe-Danger-Zone-Images: true. TypeSafe explicitly labels images
  experimental / not production-ready. The general model table still says text;
  use the specific image documentation and verify account access with one call.
- https://docs.typesafe.ai/models.md — jev-1.14.0, $0.042 per million input tokens,
  output tokens free. Images count toward input tokens. Default per-request
  context is 64k; optional long context is not enabled by this harness.

Initially no TypeSafe credential was present. The published environment now reports the secure binding ready. A user_provided secure secret
requirement named TYPESAFE_API_KEY, scoped to api.typesafe.ai, was saved in the
environment draft. Enter its value only through environment settings, save/publish,
and verify readiness. Do not put a key in chat, the source tree, commands, or reports.

The standalone lab client is opt-in via --backend jev --allow-cloud and sends only
the explicitly selected public/synthetic corpus images to TypeSafe. The desktop app now offers its own separately consented Jev backend and persistent app-data budget. This lab client remains independent from app settings.

Budget: preserve the provider-side $3 key limit. The harness additionally reserves
262,144 input tokens at the documented rate before each call (a conservative bound
above the default context), keeps reservations for failures/timeouts, persists the
ledger across runs, sends at most 64 calls, and never retries automatically. The
maximum configured reservation total is about $0.705. Billing estimates depend on
the verified rate; the provider-side key cap is the hard account safeguard.

```bash
worker/.venv/bin/python lab/evaluate.py --backend jev --allow-cloud \
  --formats noul choice --limit 1 --output docs/evaluation-jev-smoke.json
```

Start with that one case, verify schema/account support and reported usage, then
run the fixed corpus if it succeeds. The smoke test and full comparison have now completed; see docs/evaluation-jev-2026-10-29.json.

## Recorded run — 2026-10-29

One successful smoke request plus 28 matched requests completed. An earlier sandbox-blocked attempt retained its reservation. The ledger therefore records 30 reservations, 29 successful usage reports and 79,619 input tokens (estimated $0.003344 at the documented rate). Reservations total $0.3303; these are budget accounting, not actual charges. The 28-request comparison estimate is $0.003241. No private screenshots were sent.

Both Noul and Choice matched every non-ambiguous label across 14 mostly synthetic images; video and social each have one ambiguous case excluded from scoring. Explicit and cat policies have negative-only coverage. Typical HTTP round trips were about 0.19 seconds, excluding preparation and Windows capture/enforcement. This is preliminary evidence, not production accuracy.

The desktop TypeScript request smoke added two successful calls, bringing lab reservations to 62/64 and reported total input tokens to 187,163 (estimated $0.007861). The app has a separate budget ledger under userData; its key must be set on the user’s own machine. The cloud environment key is not embedded or distributed.
