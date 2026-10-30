# Remaining physical Windows check — no paid calls

Hosted Windows evidence cannot establish behavior on a particular physical PC.
This is the remaining deployment check that needs an operator at that machine;
no remote access or personal screenshot collection is implied or required.

Use the installer artifact `windows-jev-installer-unsigned` from the successfully
verified [main Actions run41033207441](https://github.com/syukursyakir/blockliterallyeverything/actions/runs/41033207441),
sourceae60ebed50433091a9c72aedbf2050a266abead1. Latest100unit/9UI/14installed
checks and limits are in SESSION-CONTROL-CHECKS.md. Earlier capture limits remain
in CAPTURE-TIMING-RESULTS.md. The old public
v0.1.0-alpha.1 release lacks newer changes; it is not the build being validated.
No new release was published. Record the Actions run/SHA and downloaded installer
SHA256 alongside Windows version, monitor resolution and scale.

For the existing bounded fixture suite, use one active physical display. This is
the suite's declared scope: its retry fixture explicitly requires one display.
Use Node24 and a checkout matching the tested source. From PowerShell in the repo:

```powershell
npm ci
$env:BLE_SMOKE_APP_EXE = 'C:\actual\installed\path\Block Literally Everything.exe'
npm run test:desktop:extended
Remove-Item Env:BLE_SMOKE_APP_EXE
```

Select the actual installed executable path; do not run a different existing alpha
by mistake. The suite creates an isolated temporary app profile and supplies fixture
provider replies plus explicitly labeled capture/clock faults. No real key or model
call is used, so it does not spend the retained five-reservation authority. It uses
real native capture/cover/storage/UI paths where not explicitly replaced by a fixture.
Do not enter a real provider key or start a separate real-cloud session for this check.
The suite displays reversible covers and verifies the Pause & return to app button;
keep other work saved before running it.

Retain `desktop-test-results/report.json` and the console result with the build/device
metadata. The suite also writes local UI/cover screenshots, including failure images;
review those locally before sharing anything. Do not automatically upload unrelated
screen content. Report every failure with its case name, not only the total count.

A pass is physical native-integration evidence with fixture decisions, not model
accuracy. It does not simulate actual Windows lock/sleep (those signals are emitted
in-process), certify mixed DPI/multiple displays or prove exclusive-fullscreen games.
Those require separately scoped physical scenarios. No cloud-budget reset, release,
new paid replay or screenshot-retention change is authorized by this procedure.
