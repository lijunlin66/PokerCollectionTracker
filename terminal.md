# 终端命令手册（Windows PowerShell）

> 说明：PowerShell 5.x 不支持用 `&&` 串联命令，请按下方「分步」方式执行；所有命令在项目根目录 `E:\Code\trae_projects\PokerTrack` 下运行。

---

## 0. 环境检查（首次运行）

```powershell
# 确认 Node.js >= 18、npm >= 9
node --version
npm --version

# 进入项目目录
cd E:\Code\trae_projects\PokerTrack
```

---

## 1. 安装依赖

```powershell
# 国内网络：推荐设置 Electron 淘宝镜像（可显著加快下载，仅需执行一次，写在项目级 .npmrc 中不会影响全局）
# @echo: ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ 可在 PowerShell 设置环境变量
$env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"

npm install
```

> 如果遇到 `ECONNRESET` 或下载超时：设置上方镜像变量后再次执行 `npm install`。

---

## 2. 开发模式运行（热更新 HMR）

```powershell
# 1) 确保已安装依赖（见上）
# 2) 启动开发模式
npm run dev
```

启动成功后会自动打开 Electron 应用窗口，修改 Vue 组件/TypeScript 代码会自动热重载。

退出：在终端按 `Ctrl + C`，或直接关闭 Electron 窗口。

---

## 3. 类型检查与产物构建（不打包安装包）

```powershell
# 构建三端产物（main / preload / renderer）+ Vue+TS 类型检查
npm run build
```

- 产物输出目录：`out/`
- 通过表示：无 TS 报错，屏幕打印 `built in xxxms` 三条（main/preload/renderer）

如需单独检查某一端类型：

```powershell
# 仅检查渲染进程（Vue + TS）
npm run typecheck:web

# 仅检查主进程 / preload
npm run typecheck:node
```

---

## 4. 重新生成应用图标

```powershell
npm run icon
```

生成：
- `resources/icon.ico`（多尺寸，供 electron-builder 使用）
- `resources/icon.png`（256×256 预览）

> 替换图标：用自己的 `.ico` 覆盖 `resources/icon.ico` 即可。

---

## 5. 打包 NSIS 安装包（.exe 安装程序，支持自定义安装路径）

```powershell
# （可选）国内网络镜像
$env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"

# 执行构建 + 打包
npm run dist
```

产物位置：
```
dist\PokerCollectionTracker Setup 1.0.0.exe    ← NSIS 安装包（双击运行安装）
dist\win-unpacked\                              ← 未打包的解压版目录（可直接运行其中 PokerCollectionTracker.exe）
```

安装特点：
- **非 one-click**：弹出安装向导
- **可自定义安装路径**：安装过程中可修改默认目录
- **创建桌面快捷方式 + 开始菜单入口**：默认启用
- 安装包体积约 75~85 MB（满足 <150 MB 要求）

---

## 6. 仅打包「解压版」目录（不生成安装包，调试用）

```powershell
npm run dist:dir
```

产物：`dist\win-unpacked\`，无需安装，双击 `PokerCollectionTracker.exe` 即可运行。

---

## 7. 构建产物仅预览（先打包后运行，模拟生产环境）

```powershell
# 1) 构建
npm run build
# 2) 预览运行
npm run preview
```

---

## 8. 常见问题

| 问题 | 解决方式 |
|------|----------|
| Electron 下载失败 / ECONNRESET / 超时 | 在 PowerShell 执行 `$env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"` 后重试对应命令 |
| `npm run dist` 报告 ico 缺失 | 执行一次 `npm run icon` 重新生成图标 |
| 类型检查报错 TS2305 / TS2345 | 先执行 `npm run build`，它会在同一行同时执行构建 + 类型检查；如有报错按提示修复 |
| 安装包文件被占用，dist 失败 | 关闭已打开的安装向导 / `win-unpacked` 中运行的 EXE，重新执行 |
| 应用启动白屏 / 报错 | 在 Electron 中按 `F12` 打开开发者工具查看控制台；开发模式下终端也会打印主进程日志 |

---

## 9. 功能自测清单（启动应用后验证）

1. **54 张牌**：网格应为 9 行 × 6 列 = 54 张（黑桃红心方块梅花各 13 + 大小王）
2. **点击切换**：点击一张牌，背景变绿，右下角出现"保存中→已保存"提示
3. **批量标记**：顶部选择范围（全部/某花色）→ 点「标记已收集」→ 弹确认 → 对应牌全部变绿
4. **筛选**：按花色标签、按状态（已收集/未收集）分别过滤
5. **搜索**：搜索框输入 `A` 应显示 4 张 A；输入「品」会命中含该字的备注
6. **排序**：下拉切换 4 种排序方式
7. **备注**：鼠标悬停卡片，右上角出现 ✎ 图标 → 点开编辑 → 保存后卡片角标变为 📝，重启应用仍存在
8. **导出导入**：顶部「导出 JSON」保存文件 → 「导入」选该文件 → 弹窗确认后数据恢复
9. **重置**：顶部「重置」→ 确认弹窗 → 全部变白
10. **数据持久化**：关闭应用重开，上一轮的收集状态/备注应保留
11. **统计更新**：切换收集状态时顶部进度条/百分比实时变化，某花色收集齐出现 ✓ 标记
