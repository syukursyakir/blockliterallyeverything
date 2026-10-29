# Block Literally Everything

A Windows-first, image-decision blocker with Jev cloud and optional local AI. Dark React/shadcn desktop UI,
editable plain-English rules, image test lab, timed sessions and a reversible
blocking cover. No browser extension required. Jev mode sends screenshots and enabled rules to TypeSafe only after explicit consent.

**Status: experimental first alpha.** UI, policy, worker protocol and mocked
desktop lifecycle checks pass in Linux. Actual OmniJev inference now runs through
both the source and packaged Linux worker, but benign test images produced false
blocks. Windows capture/topmost behavior and the Windows installer remain unrun.
Do not rely on this as a pornography filter or tamper-resistant lockout yet.

## What is implemented

- Editable rules, three starter presets, local settings and sensitivity controls.
- Detection-only mode by default, then optional blocking sessions.
- Jev 1.14 cloud image decisions (experimental), secure key entry, consent, spending estimates and a persistent conservative budget cap.
- Optional local OmniJev-0.8B worker with image input and per-rule probabilities.
- Unchanged screens skip cloud calls for up to 30 seconds. Requests run serially; pause aborts in-flight cloud work. No automatic HTTP retry.
- Model download with immutable revision resolution and local file checksums.
- Manual image tests; no image history or intentional screenshot file storage.
- Screen capture across displays; a match covers all displays until you pause.
- Visible errors, worker timeouts, stale-result checks, tray controls and emergency
  pause with **Ctrl+Shift+F12**. Closing the settings window leaves the tray running.
- Session ends, lock, sleep and display changes pause protection.

Rules are experimental, including the presets. Screenshots cannot inspect hidden
tabs, establish every website's identity, or infer personal intent reliably.
Detection is reactive: content can be visible before a decision. The requested
few-seconds reaction time is a target, not a measured hardware guarantee. The
interval is a delay after each scan, with inference time added.

The 2026-10-29 real Linux CPU smoke check took about five seconds per image with
four rules, before capture/scheduling delay, and incorrectly flagged benign
content. See docs/model-smoke-2026-10-29.json and the validation notes. It does not
yet meet the intended reliable, few-seconds blocking experience.

## Install on Windows

Use **BlockLiterallyEverything-0.1.0-setup.exe** from the built artifacts. Double-click
to install the Jev edition for your account; it adds shortcuts and opens a first-use
guide. No terminal, Node.js, Python or model download is required for users.
Setup covers encrypted key entry, explicit cloud consent, a generated-image
connection check, presets and detection-only mode. It never starts capture itself.
See [Windows setup](docs/QUICKSTART-WINDOWS.md). This alpha is unsigned and the
cross-built installer still needs real Windows installation/runtime verification.

## Develop on Windows

Install Node.js 24. For optional local inference also install [uv](https://docs.astral.sh/uv/getting-started/installation/).
Use this checkout; no separate worktree is needed.

```powershell
npm ci
npm run dev:desktop
```

In **Model & settings**, choose **Jev cloud**, save your TypeSafe API key, enable
screenshot consent, review the budget, and save changes. Keep a provider-side
spending cap on the key too. The key is OS-encrypted in Electron's per-user app
data, never returned through IPC; cloud development can alternatively use the
`TYPESAFE_API_KEY` environment binding. Removing the saved key does not remove an
inherited environment key. A secure OS encryption backend is required to save keys.
Cloud mode needs no Python runtime or model download in development.

**Budget reserved** is a conservative lifetime cap, not a billed amount: each
attempt reserves 262,144 input tokens at the documented $0.042/M rate (about
$0.01101), including failures/cancellations. Most tested calls cost far less.
The cap persists across sessions and restarts; raising it is explicit. Completed
usage estimates appear separately. Check provider billing for actual charges and
rate changes; a provider-side cap is the hard safeguard. A $3 reservation cap
allows about 272 attempts even if actual charges are much lower. Do not delete
the ledger to reset spending history. Read errors pause cloud protection.

For **Local AI**, run `npm run worker:setup`, select local mode, save, and download
the model. This downloads both the OmniJev
checkpoint and Qwen3.5 base model, requires internet and several GB of free disk,
and resolves their immutable revisions before downloading. Subsequent model loads
use local files only. No API key is required for these public model repositories.

Start by editing rules, saving, and testing images in **Test lab**. Then start a
detection-only session. Disable detection-only mode and save when you want covers.
The cover's **Pause & return to app** action stops the session. This intentionally
prioritizes a safe recovery path over strict lockout in the first version.

Model data and settings live in Electron's per-user app data directory. Model
updates use revision-specific folders; a failed update does not replace the old
manifest. Old model revisions are not deleted automatically. Restart before
reinstalling a loaded model. `BLE_PYTHON` can select a developer Python executable;
packaged builds use their bundled worker instead.

## Build a Windows installer

The default installer is the lightweight Jev edition and excludes the local Python/PyTorch worker. Run on Windows, or cross-build the NSIS package in Linux:

```powershell
npm run dist:win
```

This builds the UI/main process and a self-contained NSIS installer under
`release/`, using the supported custom NSIS script at installer/windows.nsi. The
script installs per user, adds shortcuts, registers an uninstaller, preserves app
data, checks Windows 10+/x64 and launches onboarding. For the optional full local
edition, run `npm run dist:win:local` on Windows; that path bundles the Python
worker and needs uv/PyInstaller. It cannot cross-compile the worker from Linux. This packaging path requires validation on Windows before distribution.
No signing certificate is configured. Developer installers are unsigned and may
show Windows SmartScreen warnings; production signing is a separate release step.

The Windows workflow runs checks and packages an unsigned installer artifact. It
does not publish a release, upload screenshots or certify model accuracy. A
workflow file on disk has not run until the repository is pushed and Actions runs.

## Checks

```powershell
npm run build
npm test
npm run test:worker
npx playwright install chromium
npm run test:ui
npm run test:desktop
```

`npm run dev` opens a browser UI preview, not screen protection. It deliberately
disables real detection and clearly labels the limitation. Playwright uses an
installed system Chromium when available or its own installed browser otherwise.
Set `BLE_TEST_BROWSER` to another compatible Chromium executable if needed.

`test:desktop` requires a graphical desktop (Windows CI or your Windows machine).
It launches the real Electron process with isolated temporary preferences, checks
the real IPC bridge and screen thumbnails, and opens/dismisses a topmost cover.
It does not download a model or fake AI decisions. Its Windows execution has not
yet been observed in this Linux environment.

## Privacy and safety of recovery

In **Jev mode**, screenshots or selected test images and enabled rule text go
through HTTPS to the fixed TypeSafe endpoint. The API is pinned to Jev 1.14.0's
experimental image support. Provider retention/data-handling terms apply; the app
cannot promise provider-side deletion. Images are held in memory, not saved by
the app. Sessions capture all connected displays; stop the session before viewing
private material. Manual tests upload the chosen image only after consent. Pause,
lock, sleep, timeout, budget, network or capture errors stop ongoing protection.
Aborting a request cannot undo an upload or provider charges already incurred.

In **local mode**, images travel from Electron to a private child process through stdin, are decoded
in memory and discarded after each request. No HTTP inference server is opened.
Model caches and request payloads are cleared; multi-image panel files are not
used. Activity keeps only the latest 80 metadata events in memory. UI test traces
use synthetic fixtures. The OS can still page memory, hibernate or write dumps;
this is not an absolute forensic no-disk guarantee.

Capture failures, near-uniform frames and model errors pause protection and
show an error. A blank-frame heuristic cannot identify every protected capture. They never count as a successful safe classification. Audio may
continue underneath a cover. This version does not terminate apps, alter DNS,
install drivers, or prevent an administrator from stopping it.

See [validation notes](docs/VALIDATION.md), [third-party notices](THIRD_PARTY.md),
and [project design](DESIGN.md).

## Jev integration checks

The current build passes TypeScript/production build, 45 unit tests and eight UI
tests (including consent/key controls). The actual desktop TypeScript request code
was tested against Jev on two synthetic fixtures: YouTube scored 0.92, ordinary
work notes 0.02 for the YouTube rule. The UI/IPC cloud lifecycle is tested with a
mock transport. Real Electron networking, Windows OS key encryption, capture and
fullscreen topmost behavior still need a Windows run. The source request smoke
is not a Windows certification. See docs/desktop-jev-request-smoke-2026-10-29.json.

First-launch onboarding and installer packaging were added after the request
smoke. Eight native onboarding tests cover prerequisites, neutral-only validation,
completion/restart persistence, failed verification, encrypted-key failures and
marker-write recovery. The Windows CI workflow now builds/installs the Jev edition
and checks the installed Electron shell; that workflow is prepared but has not
been executed here.
