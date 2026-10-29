; Standard NSIS per-user installer. WriteUninstaller runs at install time,
; avoiding a Wine-only build step while keeping the Windows installer native.
!include "LogicLib.nsh"
!include "x64.nsh"
!include "WinVer.nsh"
Name "${PRODUCT_NAME}"
InstallDir "$LOCALAPPDATA\Programs\${PRODUCT_NAME}"
RequestExecutionLevel user
Icon "${PROJECT_DIR}/assets/icon.ico"
UninstallIcon "${PROJECT_DIR}/assets/icon.ico"
ShowInstDetails nevershow
ShowUninstDetails show
Page instfiles
UninstPage uninstConfirm
UninstPage instfiles
LoadLanguageFile "${NSISDIR}/Contrib/Language files/English.nlf"
!define REGKEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}"

Function .onInit
  ${IfNot} ${AtLeastWin10}
    MessageBox MB_OK|MB_ICONSTOP "This edition requires Windows 10 or newer."
    Abort
  ${EndIf}
  ${IfNot} ${RunningX64}
    MessageBox MB_OK|MB_ICONSTOP "This edition requires 64-bit Windows."
    Abort
  ${EndIf}
  System::Call 'kernel32::CreateMutexW(p 0, i 0, w "${APP_ID}.installer") p .r0 ?e'
  Pop $1
  ${If} $1 = 183
    MessageBox MB_OK|MB_ICONINFORMATION "The installer is already running."
    Abort
  ${EndIf}
  SetShellVarContext current
FunctionEnd

Section "Install"
  InitPluginsDir
  SetOutPath "$PLUGINSDIR"
  File /oname=app.7z "${APP_64}"
  CreateDirectory "$PLUGINSDIR\unpacked"
  SetOutPath "$PLUGINSDIR\unpacked"
  ClearErrors
  Nsis7z::Extract "$PLUGINSDIR\app.7z"
  IfErrors install_failed
  IfFileExists "$PLUGINSDIR\unpacked\${PRODUCT_FILENAME}.exe" 0 install_failed
  IfFileExists "$PLUGINSDIR\unpacked\resources\app.asar" 0 install_failed
  SetOutPath "$INSTDIR"
  ClearErrors
  CopyFiles /SILENT "$PLUGINSDIR\unpacked\*" "$INSTDIR"
  IfErrors install_failed
  File /oname=app.ico "${PROJECT_DIR}/assets/icon.ico"
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  IfErrors install_failed
  ClearErrors
  CreateShortCut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\${PRODUCT_FILENAME}.exe" "" "$INSTDIR\app.ico"
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}.lnk" "$INSTDIR\${PRODUCT_FILENAME}.exe" "" "$INSTDIR\app.ico"
  IfErrors install_failed
  ClearErrors
  WriteRegStr HKCU "${REGKEY}" "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr HKCU "${REGKEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "${REGKEY}" "Publisher" "Block Literally Everything contributors"
  WriteRegStr HKCU "${REGKEY}" "DisplayIcon" "$INSTDIR\app.ico"
  WriteRegStr HKCU "${REGKEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${REGKEY}" "UninstallString" '$\"$INSTDIR\Uninstall.exe$\"'
  WriteRegStr HKCU "${REGKEY}" "QuietUninstallString" '$\"$INSTDIR\Uninstall.exe$\" /S'
  WriteRegDWORD HKCU "${REGKEY}" "NoModify" 1
  WriteRegDWORD HKCU "${REGKEY}" "NoRepair" 1
  IfErrors install_failed
  Goto install_done
install_failed:
  MessageBox MB_OK|MB_ICONSTOP "Installation could not finish. Quit Block Literally Everything from its tray menu, check free disk space, then run this installer again." /SD IDOK
  SetErrorLevel 1
  Abort
install_done:
SectionEnd

Function .onInstSuccess
  ${IfNot} ${Silent}
    Exec '$\"$INSTDIR\${PRODUCT_FILENAME}.exe$\"'
  ${EndIf}
FunctionEnd

Function un.onInit
  SetShellVarContext current
FunctionEnd

Section "Uninstall"
  ; Leave the user's preferences, encrypted key and budget history intact.
  ; Install location is fixed; never recursively delete a registry-supplied path.
  StrCpy $INSTDIR "$LOCALAPPDATA\Programs\${PRODUCT_NAME}"
  SetOutPath "$TEMP"
uninstall_retry:
  ClearErrors
  RMDir /r "$INSTDIR"
  ${If} ${Errors}
    MessageBox MB_RETRYCANCEL|MB_ICONEXCLAMATION "Quit Block Literally Everything from its tray menu, then retry uninstalling." /SD IDCANCEL IDRETRY uninstall_retry
    SetErrorLevel 1
    Abort
  ${EndIf}
  Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
  Delete "$SMPROGRAMS\${PRODUCT_NAME}.lnk"
  DeleteRegKey HKCU "${REGKEY}"
SectionEnd
