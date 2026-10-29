# First alpha validation

Recorded 2026-10-28; updated after publication testing on 2026-10-29.
This records observed checks, not a production-readiness claim.

## Passed in this Linux cloud workspace

| Check | Observed outcome |
| --- | --- |
| TypeScript, Vite and Electron-main build | Passed |
| Vitest policy, mocked desktop lifecycle and worker process recovery | 19 tests passed |
| Python worker boundary/protocol, installer and error recovery checks | 10 tests passed, no skips in worker environment |
| Playwright production-interface checks | 6 tests passed using installed system Chromium |
| Visual review | Dashboard and blocking cover screenshots opened and inspected |
| Real inference module import | Torch CPU, Transformers and upstream MSO1 imported |
| PyInstaller Linux worker bundle | Rebuilt successfully with torchvision; approximately 1,012 MB on disk without model weights |
| Frozen-worker protocol | Status and missing-model error responses verified |
| Frozen-worker real import diagnostic | Torch 2.15.0+cpu, Transformers 5.21.0, MSO1 successfully imported |
| Tray/application assets | PNG and ICO files verified after replacing an invalid initial tray PNG |
| Actual model download after publication | Passed; 1,894,253,321 bytes of hashed checkpoint/base assets |
| Actual source-worker inference | Passed on two benign images; about 5 seconds per image with four rules |
| Actual frozen Linux worker inference | Passed on the same two images; decisions matched the source worker |

The image boundary test explicitly uses a stub model to verify in-memory image
handling, score validation and cache cleanup. The browser desktop-bridge fixture
and Electron lifecycle tests also use explicit mocks. They do not demonstrate AI
accuracy, actual OS capture or enforcement.

## Feedback loop and independent reviews

Three independent agents reviewed native flow, worker integration and UI. Fixed
issues and added/reran relevant checks:

- Pausing during a pending model load no longer leaves model state stuck loading.
- A global block covers all monitors; other monitors are not left uncovered while
  capture pauses. Recovery remains available.
- Multi-monitor frames share their real capture-batch age; stale frames/results
  cannot be treated as current decisions.
- Failed navigation, cover load failure and renderer failure expose an error.
- Cover metadata is retrieved after mount, avoiding an event-subscription race.
- Manual test load failure leaves an error state rather than a permanent spinner.
- Upload/removal controls lock while an image test is pending.
- The primary Pause action works while the model is still loading.
- Offline loading uses explicit local_files_only parameters, avoiding imported
  environment-constant issues and preserving the reinstall repair flow.
- The Windows foreground-window handle uses pointer-width ctypes declarations.
- Worker request payloads, decoded image references and inference caches are
  released. Blank/protected capture errors close image handles.
- Model installs use revision-specific directories and an atomic manifest update.
- Windows packaging builds the worker first; licenses accompany packaged code.

Final source-review outcomes: native flow ACCEPT, UI no remaining review blocker,
worker ACCEPT for alpha scope. Reviewers explicitly did not certify real model
inference, Windows behavior or a production installer.

## Remaining blocked or unrun checks

1. **Reliable blocking:** model access and inference now work, but the two benign
   smoke images reveal false positives at the current 0.4 threshold. The dashboard
   incorrectly matches explicit content (0.4195), YouTube (0.9218), and social feeds
   (0.6040). The cat photo incorrectly matches social feeds (0.5394). No explicit
   positive examples were tested, so missed-violation performance is unknown.
   These results do not support relying on this model as a blocker yet. Actual
   Windows inference latency and peak model RAM remain unmeasured.
2. **Native desktop smoke in Linux:** Electron's verified runtime was installed,
   but the actual app could not run without a graphical display/GTK connection.
   Headless launch was attempted and failed at the missing display. This does not
   establish a Windows application defect or successful Windows execution.
3. **Windows:** actual capture, topmost/fullscreen covers, monitor/DPI changes,
   emergency shortcut and installer install/uninstall remain unrun. The workflow
   file has been written but has not run here. No Windows installer is certified.
4. **Release:** no signing certificate is configured. Check exact model revision
   licenses before redistributing weights. Some instruction-skill redistribution
   terms remain unresolved; those files are excluded from the application package.

## Saved environment configuration

Saved install_script and start_skill in the environment draft. Added custom
network destinations ui.shadcn.com, huggingface.co, *.huggingface.co and *.hf.co,
preserving the package-manager preset. Saving a draft did not apply this network
policy to the original running machine. The user subsequently published the
environment; the new instance reports current, enforced unrestricted networking,
and model downloads succeeded. No secret/API key was required. This testing turn
did not reapply old configuration or publish anything.

## Next acceptance checks

Address the demonstrated semantic false positives, then evaluate representative
images and measure false blocks, missed violations and capture-to-cover latency.
Do not infer accuracy from runtime smoke checks or the upstream GPU benchmark. On Windows,
exercise the complete capture -> decision -> cover -> recovery loop, then build
and test the unsigned installer. Keep detection-only mode as the initial default.

## Follow-up improvements while Windows testing is pending

- Fixed worker timeout messages being overwritten by cancellation during cleanup.
- Retired child-process progress cannot overwrite current worker status.
- Closed worker stdin pipes are handled without an unhandled stream-error crash.
- Request payloads cannot replace the trusted protocol ID/method.
- Added crash/restart, timeout, stale-message and protocol-envelope regression tests.
- Independent follow-up review reproduced a closed-stdin EPIPE crash; the handler
  now retires and kills the worker safely. The reviewer reran all 5 worker-process
  lifecycle tests and accepted the fixes, with no remaining blocker in that scope.
- Model download, load, disk-space and connection errors now suggest specific
  recovery actions without echoing proxy credentials or image information.
- Added npm run test:desktop to the Windows workflow. This launches the actual
  Electron app with isolated preferences and checks real IPC, nonblank screen
  thumbnails, the native topmost cover and recovery. It does not mock AI decisions.
  Script syntax and the Playwright Electron API were verified here; Windows
  execution remains pending, so this is not another claimed passing Windows check.

## Real model tests after publication — 2026-10-29

- Fixed an installer bug: cache metadata exclusion examined absolute path parts,
  excluding every model file when the chosen data directory itself lived below
  .cache. It now checks paths relative to each model directory. Regression passed.
- Transformers 5.4 could not read the released nested image-processor config.
  Updated the locked runtime to Transformers 5.21.0 and added CPU torchvision
  0.29.2. Real model loading and inference succeeded with Torch 2.15.0+cpu.
- OmniJev revision: 3c9aa908f3c9d3f3ccf16bb281ee705d9e98252f.
- Qwen base revision: 2fc06364715b967f1860aea9cf38778875588b17.
- The downloaded model and base LICENSE files both declare Apache-2.0 terms.
- Four CPU threads; roughly 7–8 seconds cold load and 5 seconds per image for four
  rules in this Linux cloud instance. This excludes capture and scheduling delay
  and is not a consumer-laptop or Windows benchmark.
- A public COCO cat image and this project's dashboard screenshot were used. No
  private screens or explicit images were collected. Cat scores were 0.7766 for
  the cat image and 0.0522 for the dashboard. That is a narrow positive/negative
  visual smoke check, not proof of general accuracy.
- Source and frozen-worker reports are model-smoke-2026-10-29.json and
  model-smoke-2026-10-29-packaged.json. The frozen worker produced identical scores.
- Longer question clarification worsened these two checks and took longer; it was
  rejected and reverted. The report retains exact questions and outcomes in
  model-smoke-2026-10-29-clarified.json. This does not establish that all question
  clarification harms all tasks.
- Two further diagnostic question formats (short generic rule and direct preset
  questions) also retained serious benign-image false positives. They were not
  adopted. See model-question-framing-2026-10-29.json. These experiments do not
  establish calibrated thresholds or fix the lack of explicit-positive testing.
- Do not hide these failures by increasing the threshold without a representative
  evaluation: doing so could increase misses, contrary to the user's priority.
  Detection-only remains the default. Independent review agreed the runtime works
  while reliable blocking remains unproven.

## Extended experimental comparison — 2026-10-29

[Full matched results](evaluation-summary-2026-10-29.md) cover 14 mostly synthetic
screens, OmniJev 0.8B/2B Noul and Choice formats, and a SigLIP2 similarity baseline.
These are exploratory fixtures, not real-world reliability estimates. Neither
explicit nor cat recall is measured because this corpus has no positive cases.
OmniJev 0.8B Noul caught 3/3 YouTube positives but falsely blocked 9/10 negatives;
Choice caught 0/3. The 2B model did not establish a reliable alternative and took
about 10–17 seconds per four-rule image on this Linux CPU. SigLIP took about
0.21 seconds but made both false blocks and social-content misses. It uses a
mutually exclusive similarity classification, so its task differs from OmniJev.

A four-case visual-reference pilot caught both YouTube examples and falsely
blocked both negative examples. No production threshold or backend was changed.
Original upstream and app boundary scores matched exactly on two inputs, including
a single-vs-batched cat question. This is narrow integration evidence only.

Evaluation schema/coverage fixes were audited against preserved raw answers;
selected case IDs, source and prepared hashes are retained in the reports.
Seventeen worker/evaluation unit tests pass. Jev image support is experimental;
its opt-in standalone client has a persistent reservation ledger and a 64-call
cap (about $0.705 at the documented rate), with a provider-side $3 key cap still
required. No paid requests have been sent; the secure key is absent.

### Hosted Jev follow-up

The secure binding became ready after publication. Jev 1.14.0 experimental image API completed the matched 14-case suite in Noul and Choice formats. Both matched every non-ambiguous label: 3/3 video positives with 0/10 false blocks and 2/2 social positives with 0/11 false blocks. Explicit and cat recall remain unmeasured. HTTP round-trip upper medians were about 0.19 seconds; capture/preparation/enforcement are excluded. The full comparison estimated $0.003241; all successful calls including smoke estimated $0.003344. These hosted results do not change the app’s local backend. See lab/JEV.md and the raw report.

### Harder-case Jev follow-up

[Separate results and limitations](evaluation-jev-hard-summary-2026-10-29.md)
cover 15 additional inputs: six public live captures, eight synthetic edge cases,
and one previously used public cat photo. Labels were inspected before inference.
Both formats matched all non-ambiguous labels. Video/social positives remain
synthetic; live YouTube captures failed, Instagram was login/marketing, and TikTok
rendered blank. Real cat positives were detected. Noul and Choice disagreed on
an unbranded player; its policy label was kept ambiguous rather than scored.
Explicit recall and arbitrary-English-rule generality remain unmeasured. No
production backend or threshold changed. All successful API experiments estimate
$0.007648 total; the persistent ledger retains 60 of 64 allowed reservations.

## Desktop Jev backend — current implementation

The user selected Jev for the current prototype. The app now has explicit Jev/local
selection, cloud screenshot consent, OS-encrypted key entry, fixed HTTPS endpoint,
validated Noul replies for every enabled rule, 10-second timeout, serial requests,
unchanged-screen skipping up to 30 seconds, pause cancellation and persistent
conservative budget accounting. Existing local preferences migrate to local mode
without enabling cloud consent. Keys are not exposed to IPC snapshots, activity
or the optional local Python worker. A provider-side cap remains necessary.

37 unit tests and seven Playwright UI tests pass, including mocked cloud IPC,
consent and key-input handling. Source review identified blank-capture parity,
stale-session cache writes and backend-readiness switching; these were fixed.
Two actual calls using the desktop TypeScript request/prompt/parser code via Node
transport returned YouTube 0.92 for a synthetic YouTube page and 0.02 for ordinary
notes. This does not verify Electron net.fetch, Windows secure storage, capture,
fullscreen overlays or a Windows installer. No graphical desktop is available
here. Historical statements above that the app remains local describe the earlier
lab-only experiments; this section supersedes them for current behavior.

## Consumer installer and first launch

The Jev edition now has a self-contained per-user NSIS Windows installer; it
excludes the Python/PyTorch runtime and model weights. A supported custom NSIS
script uses install-time WriteUninstaller, standard shortcuts/Apps & Features
metadata, platform checks, error handling and preserved userData. The Linux Wine
bootstrap failed, so the build uses NSIS's public script customization rather
than private toolchain patches. This is cross-compilation, not a Windows run.

First launch requires explicit consent, OS-encrypted key save, a neutral generated
image verification, rule selection and detection-only completion; it never starts
screen capture itself. A durable marker keeps incomplete setup visible across
restarts. Existing valid preferences migrate as already onboarded. The cloud-only
edition hides local setup. Eight new mocked native onboarding tests and one new
UI test cover the flow, bringing totals to 45 unit and eight UI tests. The Windows
workflow includes silent install plus a real packaged-shell smoke, still unrun
here. No signing certificate is configured.
