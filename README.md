# 🃏 扑克牌收藏追踪器

> 一款基于 Electron + Vue 3 + TypeScript 的 Windows 桌面应用，用于记录和追踪 54 张扑克牌（含大小王）的收集进度。数据完全本地存储，保护隐私，离线可用。

![platform](https://img.shields.io/badge/platform-Windows%2010%2F11-blue)
![electron](https://img.shields.io/badge/Electron-31-brightgreen)
![vue](https://img.shields.io/badge/Vue-3.4-brightgreen)
![typescript](https://img.shields.io/badge/TypeScript-5.3-blue)
![license](https://img.shields.io/badge/license-MIT-green)

---

## ✨ 功能特性

### 🎴 卡片管理
- **54 张牌完整数据**：4 花色 × 13 张 + 大小王，预置初始化
- **按花色分组展示**：黑桃 / 红心 / 方块 / 梅花 / 王，各组独立换行，带分组进度
- **点击切换收集状态**：点击卡片即时切换已收集 / 未收集，带过渡动画
- **单卡备注**：每张牌可记录品相、来源等信息（P2）
- **批量标记**：按当前筛选范围一键标记已收集 / 未收集（P1）

### 📊 统计与概览
- **总览统计**：总收集数 + 收集百分比（P0）
- **分类统计**：按花色显示 `♠ 10/13` 形式的进度（P1）
- **进度条可视化**：顶部进度条实时反映收集进度（P1）
- **花色完成标记**：某花色收集齐全时显示 ✓

### 🔍 视图与交互
- **6/7 列响应式网格**：随窗口宽度自动调整列数
- **筛选**：按花色 + 按收集状态（全部 / 已收集 / 未收集）双重筛选（P1）
- **搜索**：按牌面名称、ID、备注内容模糊搜索（P2）
- **排序**：4 种排序方式 — 默认 / 按花色点数 / 按点数花色 / 按收集状态（P2）

### 💾 数据持久化
- **自动保存**：每次变更自动写入本地，右下角显示"已保存"提示（P0）
- **JSON / CSV 导入导出**：跨设备迁移数据（P2）
- **一键重置**：带确认弹窗，防误操作（P2）
- **打开数据目录**：顶部按钮直接打开收藏数据所在文件夹

### 📦 安装与分发
- **NSIS 安装包**：支持自定义安装路径
- **快捷方式询问**：安装完成时弹窗询问是否创建桌面 / 开始菜单快捷方式
- **卸载痕迹清除**：卸载时询问是否一并删除收藏数据目录，可选彻底清除应用痕迹
- **安装体积**：约 77 MB（满足 < 150 MB 要求）

---

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [Electron](https://www.electronjs.org/) | ≥ 31 | 桌面应用框架 |
| [Vue 3](https://vuejs.org/) | ≥ 3.4 | 渲染进程 UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | ≥ 5.3 | 类型安全 |
| [Vite](https://vitejs.dev/) | ≥ 5.4 | 构建工具 |
| [electron-vite](https://electron-vite.org/) | ≥ 2.3 | Electron + Vite 集成 |
| [Pinia](https://pinia.vuejs.org/) | ≥ 2.1 | 状态管理 |
| [electron-store](https://github.com/sindresorhus/electron-store) | 8.2 | 本地数据持久化 |
| [electron-builder](https://www.electron.build/) | ≥ 25 | 打包与分发 |

---

## 📁 项目结构

```
PokerTrack/
├── src/
│   ├── main/                      # 主进程
│   │   ├── index.ts               # 应用入口、窗口管理、IPC 处理
│   │   └── store.ts               # electron-store 持久化封装
│   ├── preload/
│   │   └── index.ts               # contextBridge 安全暴露 IPC API
│   ├── renderer/                  # 渲染进程（Vue 3）
│   │   ├── index.html
│   │   └── src/
│   │       ├── App.vue            # 根组件
│   │       ├── main.ts            # 渲染进程入口
│   │       ├── components/        # Vue 组件
│   │       │   ├── AppHeader.vue      # 顶部导航
│   │       │   ├── StatisticsPanel.vue# 统计面板
│   │       │   ├── FilterBar.vue      # 筛选栏
│   │       │   ├── CardGrid.vue       # 卡片网格（按花色分组）
│   │       │   ├── CardItem.vue       # 单张卡片
│   │       │   ├── StatusBar.vue      # 底部状态栏
│   │       │   ├── NoteDialog.vue     # 备注编辑弹窗
│   │       │   ├── ConfirmDialog.vue  # 确认弹窗
│   │       │   └── SaveIndicator.vue  # 保存提示
│   │       ├── stores/
│   │       │   └── collection.ts      # Pinia store
│   │       ├── assets/styles/
│   │       │   └── global.css         # 全局样式 + CSS 变量
│   │       └── types/
│   │           └── electron.d.ts      # Electron API 类型声明
│   └── shared/                    # 主/渲染进程共享
│       ├── types.ts               # Card / CollectionStats 类型
│       └── cardData.ts            # generateDeck() 卡片数据生成
├── build/
│   └── installer.nsh              # NSIS 自定义脚本（快捷方式询问 + 卸载数据清除）
├── resources/
│   ├── icon.ico                   # 应用图标（多尺寸）
│   └── icon.png                   # 图标 PNG
├── scripts/
│   └── generate-icon.js           # 图标生成脚本
├── electron-builder.yml           # electron-builder 配置
├── electron.vite.config.ts        # electron-vite 构建配置
├── tsconfig*.json                 # TypeScript 配置（三套）
└── package.json
```

---

## 🚀 快速开始

### 环境要求

- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0
- **Windows 10 21H2+** 或 **Windows 11 22H2+**

### 安装依赖

```powershell
# 国内网络建议先设置 Electron 镜像
$env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"

npm install
```

### 开发模式（热更新）

```powershell
npm run dev
```

启动后会自动打开 Electron 窗口，修改代码自动热重载。

### 类型检查与构建

```powershell
npm run build
```

构建三端产物（main / preload / renderer）+ Vue + TypeScript 类型检查，输出到 `out/`。

### 自动化回归测试

```powershell
npm test
```

测试覆盖 CSV 多行备注往返、JSON/CSV 导入校验、完整牌组校验、保存失败、连续操作顺序和批量筛选范围。测试使用隔离的存储与 IPC 替身，不读取或改写实际收藏数据。

导入文件必须包含有效且不重复的卡片 ID，以及 `true` / `false` 收集状态。部分牌组导入会将未提供的牌恢复为未收集；任何无效行都会使整次导入失败，不覆盖当前收藏。读取本地数据失败时会保留原文件并显示错误，可打开数据目录备份、修复后重新加载。

### 打包安装包

```powershell
npm run dist
```

生成 NSIS 安装包：`dist\PokerCollectionTracker Setup 1.0.0.exe`（约 77 MB）。

### 重新生成图标

```powershell
npm run icon
```

---

## 🎨 设计规范

### 色彩方案

| 用途 | 颜色 | 色值 |
|------|------|------|
| 主色（深蓝） | — | `#1a2332` |
| 背景（浅灰） | — | `#f5f6fa` |
| 卡片-未收集 | 白色 | `#ffffff` |
| 卡片-已收集 | 淡绿 | `#e8f5e9` |
| 卡片-悬停 | 淡蓝 | `#e3f2fd` |
| 黑桃 / 梅花 | 黑色 | `#2d3436` |
| 红心 / 方块 | 红色 | `#e74c3c` |
| 大王 | 金色 | `#f39c12` |
| 小王 | 银色 | `#bdc3c7` |

### 交互反馈

| 交互 | 反馈 |
|------|------|
| 点击卡片 | 切换收集状态，背景色过渡动画 |
| 悬停卡片 | 轻微上浮 + 阴影 |
| 数据变更 | 右下角"保存中 → 已保存"提示 |
| 危险操作 | 弹出确认对话框（重置、批量覆盖、导入） |

---

## 📦 安装与卸载

### 安装

1. 双击 `PokerCollectionTracker Setup 1.0.0.exe`
2. 选择安装路径（支持自定义）
3. 安装完成时弹窗询问：
   - 是否创建桌面快捷方式
   - 是否创建开始菜单快捷方式

### 卸载

1. 通过控制面板或开始菜单卸载
2. 卸载完成时弹窗询问：
   - **选「否」（默认）**：仅卸载程序文件，保留收藏数据，下次重装仍可见
   - **选「是」**：彻底清除所有应用痕迹，包括：
     - `%APPDATA%\PokerCollectionTracker\`（收藏数据）
     - `%LOCALAPPDATA%\PokerCollectionTracker\`（缓存）
     - 注册表残留项

---

## 📊 数据存储

数据文件位置：

```
%APPDATA%\PokerCollectionTracker\collection-data.json
```

JSON 结构示例：

```json
{
  "cards": [
    {
      "id": "spade_A",
      "suit": "spade",
      "rank": "A",
      "displayName": "A♠",
      "isCollected": true,
      "note": "品相完美",
      "collectedAt": "2026-08-01T10:30:00.000Z"
    }
  ],
  "version": "1.0.0",
  "updatedAt": "2026-08-04T14:20:00.000Z"
}
```

---

## 🧪 自测清单

- [ ] 54 张牌正确显示（4 花色 × 13 + 大小王）
- [ ] 点击卡片切换收集状态，背景变绿
- [ ] 右下角"已保存"提示出现
- [ ] 顶部进度条与百分比实时更新
- [ ] 按花色分组显示，各组带 `♠ 10/13` 进度
- [ ] 筛选（花色 + 状态）+ 搜索 + 排序正常
- [ ] 批量标记作用于当前筛选范围
- [ ] 备注编辑后重启应用仍保留
- [ ] JSON / CSV 导入导出往返一致
- [ ] 重置操作带确认弹窗
- [ ] 「打开数据目录」按钮打开正确路径
- [ ] 关闭重开应用，数据持久化
- [ ] 安装包支持自定义路径
- [ ] 安装完成询问快捷方式
- [ ] 卸载询问是否清除数据

---

## 📜 脚本命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式（HMR 热更新） |
| `npm run build` | 类型检查 + 构建产物 |
| `npm test` | 运行数据与保存流程回归测试 |
| `npm run typecheck` | 主进程、预加载与渲染进程类型检查 |
| `npm run dist` | 构建 + 打包 NSIS 安装包 |
| `npm run icon` | 重新生成应用图标 |

---

## 📄 许可证

MIT License © 2026 PokerTrack

---

## 🔗 相关链接

- [开发命令手册](./terminal.md)
- [需求文档](./task.md)
