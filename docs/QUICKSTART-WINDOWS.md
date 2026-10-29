# Install the Windows app

[Download BlockLiterallyEverything-0.1.0-setup.exe](https://github.com/syukursyakir/blockliterallyeverything/releases/download/v0.1.0-alpha.1/BlockLiterallyEverything-0.1.0-setup.exe) — not the source ZIP. This is the
64-bit Windows 10/11 Jev edition. It includes the desktop runtime: you do not need
Node.js, PowerShell commands, Python, or a local AI download.

1. Download the installer, then double-click it. It installs for your Windows
   account without an administrator prompt, adds desktop/Start-menu shortcuts,
   and opens the app. This experimental build is unsigned, so Windows may show
   an unknown-publisher or SmartScreen warning.
2. The first-launch guide explains cloud image analysis. Save your own TypeSafe
   API key and explicitly enable cloud consent. The key you configured in the
   development cloud is not included in the installer.
3. Click **Verify connection**. This sends a generated neutral test image, not a
   screenshot of your desktop. The paid request is counted in your app budget.
4. Choose presets, review the summary and click **Finish setup**. Nothing starts
   automatically. Detection-only mode is enabled for the first session.
5. Click **Start focus session** when ready, then open YouTube if you enabled that
   rule. Check **Activity** for matches. Try ordinary and blocked screenshots in
   **Test lab** too. Pause before viewing private material.
6. To enable covers, pause, open **Model & settings**, disable detection-only and
   save. **Ctrl+Shift+F12**, tray Pause, or **Pause & return to app** releases a cover.

Jev sessions send screenshots of all connected displays and enabled rules to
TypeSafe. Manual tests upload the chosen image. Provider data-handling terms
apply. The key is stored using Windows encryption and is not shown again.

The conservative budget is cumulative across sessions/restarts. Reserved amounts
include failed requests and are not actual billed charges; completed usage
estimates appear separately. Keep a provider-side cap too. If verification fails,
the guide lets you correct the key or explicitly raise an exhausted app cap and
retry. Aborting cannot undo uploads or charges already incurred.

Quit from the tray menu to exit completely. Windows **Installed apps** can
uninstall the app. Preferences, encrypted key and budget history are preserved;
remove the saved API key in the app before uninstalling if you want it cleared.

The published installer was built and installed by the [Windows CI run](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/40822062404). It passed first-launch onboarding, IPC, screen thumbnails, topmost-cover and recovery checks. Live screenshot-to-Jev enforcement, OS key encryption with your account, and fullscreen behavior still need testing on your own PC. Jev image support remains
experimental; neither real-feed accuracy nor explicit-content recall is certified.
