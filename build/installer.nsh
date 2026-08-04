; =========================================================
; PokerCollectionTracker NSIS 自定义脚本
; 功能：
;  1. 安装时弹窗询问是否创建桌面快捷方式 / 开始菜单快捷方式
;  2. 卸载时询问是否同时删除应用数据目录（收藏记录、备注、配置等）
;
; 设计说明：
;  - 不使用 MUI_PAGE_CUSTOMFUNCTION_SHOW/LEAVE，因为 electron-builder 的
;    NSIS 模板在 include 本脚本之后才声明 MUI 页面，!define 会泄漏到卸载页
;    导致 "Call must be used with function names starting with un." 错误。
;  - 改用 customInstall 宏 + MessageBox 方式，简单可靠，无 define 泄漏风险。
; =========================================================

; ----- 引入逻辑控制宏（${If} / ${Else} / ${EndIf}）-----
; customInstall/customUnInstall 宏内使用 ${If} 需要此头文件
!include LogicLib.nsh

; =========================================================
; 安装阶段：询问快捷方式
; =========================================================
!macro customInstall
  ; 保证 $APPDATA/$LOCALAPPDATA/$DESKTOP/$SMPROGRAMS 指向当前登录用户，而非管理员账户
  SetShellVarContext current
  ; 先清理 EB 可能自动创建的快捷方式（EB 配置中已关闭，这里兜底）
  Delete "$DESKTOP\${PRODUCT_FILENAME}.lnk"
  Delete "$SMPROGRAMS\${PRODUCT_FILENAME}.lnk"

  ; ---- 询问：桌面快捷方式 ----
  MessageBox MB_YESNO|MB_ICONQUESTION|MB_DEFBUTTON1 \
    "安装即将完成。$\n$\n是否创建桌面快捷方式？" \
    IDYES inst.doDesktop IDNO inst.askStartMenu

  inst.doDesktop:
    CreateShortCut "$DESKTOP\${PRODUCT_FILENAME}.lnk" \
      "$INSTDIR\${PRODUCT_FILENAME}.exe" \
      "" \
      "$INSTDIR\${PRODUCT_FILENAME}.exe" 0

  inst.askStartMenu:
  ; ---- 询问：开始菜单快捷方式 ----
  MessageBox MB_YESNO|MB_ICONQUESTION|MB_DEFBUTTON1 \
    "是否创建开始菜单快捷方式？" \
    IDYES inst.doStartMenu IDNO inst.doneShortcuts

  inst.doStartMenu:
    CreateShortCut "$SMPROGRAMS\${PRODUCT_FILENAME}.lnk" \
      "$INSTDIR\${PRODUCT_FILENAME}.exe" \
      "" \
      "$INSTDIR\${PRODUCT_FILENAME}.exe" 0

  inst.doneShortcuts:
!macroend

; =========================================================
; 卸载阶段：清理快捷方式 + 询问是否删除应用数据
; =========================================================
!macro customUnInstall
  ; 保证 $APPDATA/$LOCALAPPDATA/$DESKTOP/$SMPROGRAMS 指向当前登录用户，而非管理员账户
  SetShellVarContext current
  ; 1) 删除快捷方式
  Delete "$DESKTOP\${PRODUCT_FILENAME}.lnk"
  Delete "$SMPROGRAMS\${PRODUCT_FILENAME}.lnk"

  ; 2) 询问是否清除所有应用痕迹（数据目录）
  ;    MB_DEFBUTTON2：默认选中"否"，避免误删收藏数据
  MessageBox MB_YESNO|MB_ICONQUESTION|MB_DEFBUTTON2 \
    "是否同时删除所有应用数据？$\n$\n将删除以下内容：$\n  • 收藏记录$\n  • 卡片备注$\n  • 应用配置$\n$\n数据目录：$APPDATA\${PRODUCT_FILENAME}$\n$\n此操作不可恢复，请谨慎选择。" \
    IDYES un.delAppData IDNO un.skipAppData

  un.delAppData:
    ; 注意：Electron userData 目录通常为 %APPDATA%\<app name>，其中 <app name> 可能是
    ;  - productName（${PRODUCT_FILENAME}），也可能是 package.json 的 name（${APP_PACKAGE_NAME}）
    ; 因此两种目录都尝试删除，确保无残留。

    ; Roaming AppData（electron-store 的 JSON 默认在此目录下）
    RMDir /r "$APPDATA\${PRODUCT_FILENAME}"
    RMDir /r "$APPDATA\${APP_PACKAGE_NAME}"

    ; Local AppData：Electron 缓存 / Crashpad / GPUCache
    RMDir /r "$LOCALAPPDATA\${PRODUCT_FILENAME}"
    RMDir /r "$LOCALAPPDATA\${APP_PACKAGE_NAME}"
    ; Crashpad/GPUCache 等已包含在上面的目录清理中，无需单独处理

    ; 注册表中可能残留的运行时状态
    DeleteRegKey HKCU "Software\${PRODUCT_FILENAME}"
    DeleteRegKey HKCU "Software\${APP_PACKAGE_NAME}"
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_FILENAME}"
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_PACKAGE_NAME}"

    Goto un.skipAppData

  un.skipAppData:
!macroend
