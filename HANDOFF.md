# Session handoff

Read this, AGENTS.md, DESIGN.md and docs/VALIDATION.md before continuing.

## Current product and user

Windows-first desktop focus blocker, Electron + React/shadcn. User wants a normal
installable app, not a website or developer setup. Dark first, Vercel-inspired,
mostly existing shadcn primitives; Ponytail full is the default coding skill.
User prefers autonomous implementation and test/fix/retest loops over repeated
questions. Do not send messages to third parties. No laptop remote access is
configured; user has explicitly asked about it, not authorized starting it.

Original aim was fully local image decisions and arbitrary plain-English blocking
rules. User explicitly chose hosted TypeSafe Jev for the current prototype after
local OmniJev accuracy was poor. Do not silently change providers. Missing blocked
content matters more to the user than false blocks. Explicit-content default is
sexual activity and explicit nudity. Do not promise arbitrary-rule reliability,
bypass resistance, hidden-tab inspection or zero screenshot exposure.

The user installed the alpha on their own Windows laptop, successfully used it,
and likes the UI. They initially did not understand detection-only mode or what to
do next; clearer mode/status/next-action guidance remains a product opportunity.
They said the popup could use changes but have not specified a redesign. Do not
invent their desired popup behavior. Latest work was their request to expand
GitHub Windows testing first, rather than control their laptop.

## Repository and delivery

- Repository: https://github.com/syukursyakir/blockliterallyeverything
- Remote branch main. Local branch is work; pushes used HEAD:main. No force pushes.
- Latest app/test commit: 2c1eec2. Latest evidence/docs commit before this handoff: 8233d13.
- Published alpha: https://github.com/syukursyakir/blockliterallyeverything/releases/tag/v0.1.0-alpha.1
- Working download: https://github.com/syukursyakir/blockliterallyeverything/releases/download/v0.1.0-alpha.1/BlockLiterallyEverything-0.1.0-setup.exe
- Workspace file/ZIP links opened an unusable ChatGPT preview. Use real HTTPS
  GitHub downloads for delivery, not /workspace links to binaries.
- Current public alpha and user's installed copy do NOT contain the latest
  fullscreen cover fix. The successful latest run has a corrected installer
  artifact, not a newly published release. Do not claim it auto-updated the user.

Default installer is Jev-only, approximately 121 MiB, Windows 10+/x64, per-user
NSIS with shortcuts, Apps & Features uninstall entry and first-run onboarding.
No Node/Python/model download is needed for users. Unsigned; Windows may warn.
installer/windows.nsi uses supported custom NSIS and install-time WriteUninstaller.
Linux Wine bootstrap attempts failed; native Windows CI now builds and installs.
Optional full local edition is npm run dist:win:local on Windows; unverified here.

## Implementation map

- src/App.tsx: dashboard, rules, test lab, activity, settings and blocking screen.
- src/Onboarding.tsx: consent, encrypted key, neutral-image verification, presets,
  editable conservative cap, detection-only completion. No capture auto-start.
- src/shared.ts: settings validation, migration, verdict validation and IPC types.
- electron/main.ts: capture/session/cover lifecycle, IPC guards, encrypted key and
  persistent budget storage. Supports standard --user-data-dir for profile isolation.
- electron/jev.ts: fixed endpoint/model, per-rule Noul questions, strict response
  validation, reservation accounting. Jev images are experimental.
- electron/screen-cache.ts: exact unchanged-screen skip for up to 30s; blank capture
  and coarse image-change checks. No pixel storage in the cache.
- electron/worker.ts + worker/: optional local OmniJev. Child does not inherit the
  TypeSafe key. Cloud-only packaged edition does not launch/include this worker.
- scripts/test-installed-desktop.mjs: extended Windows checks, fixtures explicitly
  injected by the Playwright main-process debugger; no production test backdoor.

Jev credentials: TYPESAFE_API_KEY may be supplied securely in the cloud environment.
Check readiness using the environment plugin; do not print values or paste keys.
Desktop Windows key uses Electron safeStorage (DPAPI), never returned in snapshots.
The cloud key is not bundled or automatically available on the user's laptop.

Screenshots/rules leave the device in explicitly consented Jev mode while a session
runs or a chosen test image is analyzed. Provider data-handling terms apply. No
intentional screenshot files in normal runtime. Capture all connected displays.
Provider-side key cap remains necessary; app budget reserves conservatively per
attempt, includes uncertain failures, persists across restarts; completed usage
estimates are separate. Never silently reset a corrupted ledger or retry HTTP calls.
Ctrl+Shift+F12, recovery button, native close and tray Pause release covers.

## Verified tests and latest fix

Successful Windows run at tested commit 2c1eec2:
https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40824967950

45 unit tests, eight browser UI tests, baseline native desktop smoke, installer
build/install, and ALL 11 extended installed-app scenarios passed. Saved report:
docs/windows-extended-2026-10-29.json; screenshot:
docs/images/windows-fullscreen-cover.png. GitHub artifacts contain full evidence
and the corrected installer.

The suite caught a real cover sizing bug: ordinary Windows bounds clamped to the
work area (720px versus 768px display). Fullscreen on a non-resizable window still
failed. Current fix uses resizable:true, fullscreenable:true, setFullScreen(true)
on the frameless cover before topmost. Native tests then verified full bounds,
focus, real Win32 emergency keystrokes, button/native close recovery and errors.
No other visual popup redesign was implemented.

Extended checks verify actual Windows key encryption/reload, first-launch setup
and retry, detection-only matches without covers, cover above an ordinary
fullscreen fixture, native close/shortcut recovery, request cancellation and a real
10-second timeout, errors, blank/missing capture rejection, persisted cap/history,
and corrupted-ledger refusal. Provider replies and capture faults are fixtures;
lock/suspend are emitted signals. No live key, provider request or charge in CI.
This is NOT a model-accuracy test. Runner has ONE display; no mixed-DPI/multi-monitor,
exclusive-fullscreen games or real OS sleep/lock guarantee.

## Model experiments, not production accuracy

lab/ holds exploratory local/hosted image comparisons; raw reports in docs/.
Jev matched non-ambiguous labels on 14 mostly synthetic initial images and a
15-image follow-up (including six live public captures). Active real-service feed
positives were not obtained in the follow-up; login/blank pages must not count as
feed successes. Explicit-positive recall remains unmeasured. Unbranded players
showed ambiguity. Local 0.8B/2B runs had serious false blocks/misses. Hosted requests
were fast in this environment, not a universal Windows latency guarantee.
Earlier app TypeScript request smoke used two real provider calls successfully.
The separate lab ledger had 62/64 retained reservations at last recorded check;
previous experiments estimated less than one cent. Do not reset it or assume more
paid calls are authorized beyond the prior $3 safeguard and retained cap.

## Workflows and next work

Use npm run build, npm test, npm run test:ui locally as appropriate. No graphical
Windows desktop is available in the cloud shell. npm run test:desktop:extended
requires Windows. Workflow .github/workflows/windows.yml runs on main pushes and
uploads evidence even on failures. No release replacement for ordinary pushes.
Publishing requires explicit workflow_dispatch publish_alpha=true; CURRENT
publisher targets and CLOBBERS v0.1.0-alpha.1, so change version/tag strategy before
using it for a new update. Do not overwrite the existing release casually.

GitHub source/API access and pushes worked. Direct cloud gh release asset upload
returned HTTP401 at uploads.github.com despite API access; the Windows workflow's
GITHUB_TOKEN uploaded successfully. No need to expose or extract tokens to fix it.

No active implementation remains pending from the previous task. User is asking
about a fresh-chat handoff. Good next work, when requested: clarify current mode
and next action in UI, gather specific popup feedback, or prepare a separately
versioned update containing the tested fix. No environment publishing/reconfiguration
is needed for handoff. Earlier user explicitly said not to republish/reapply old
environment changes; preserve that.
