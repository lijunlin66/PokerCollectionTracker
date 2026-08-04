# 扑克牌收集记录应用 — 软件开发文档

## 一、项目概述

### 1.1 项目背景
扑克牌收藏爱好者需要一款便捷的工具来记录和追踪自己收集的扑克牌（含大小王共54张）的拥有情况。本项目旨在开发一款基于Windows平台的本地桌面应用，帮助用户高效管理扑克牌收藏数据。

### 1.2 项目目标
- 开发一款美观、简洁的Windows桌面应用
- 支持54张扑克牌（含大小王）的收集状态记录
- 数据完全存储在本地，保护用户隐私
- 提供直观的卡片展示和便捷的操作交互
- 支持自定义安装路径

### 1.3 目标用户
- 扑克牌收藏爱好者
- 需要记录多副扑克牌收集进度的用户


## 二、技术选型

### 2.1 核心技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | ≥ v18.0.0 | 运行时环境 |
| Electron | ≥ v28.0.0 | 桌面应用框架 |
| Electron Forge | ≥ v7.0.0 | 项目脚手架、打包与分发 |
| TypeScript | ≥ v5.0.0 | 类型安全的JavaScript超集 |
| Vue.js | ≥ v3.4.0 | 前端UI框架 |
| Vite | ≥ v5.0.0 | 构建工具 |
| electron-store | ≥ v8.0.0 | 本地数据持久化存储 |

### 2.2 技术选型说明
- **Electron**：允许使用HTML、CSS、JavaScript构建跨平台桌面应用，并提供丰富的原生API。
- **Electron Forge**：一体化工具，用于打包和分发，支持代码签名、安装程序制作。
- **electron-store**：轻量级本地存储，适合保存用户偏好和应用状态。
- **Vue3 + Vite**：高效开发体验，优秀性能。


## 三、功能需求

### 3.1 功能模块

#### 3.1.1 卡片数据管理
| 功能 | 描述 | 优先级 |
|------|------|--------|
| 54张卡片数据初始化 | 预置完整的54张扑克牌数据（4花色×13张+大小王） | P0 |
| 收集状态标记 | 每张卡片可标记为"已收集"/"未收集" | P0 |
| 批量标记 | 按花色或全部批量标记收集状态 | P1 |
| 备注功能 | 为单张卡片添加备注信息（如：品相、来源等） | P2 |

#### 3.1.2 收藏概览
| 功能 | 描述 | 优先级 |
|------|------|--------|
| 总览统计 | 显示总收集数、收集进度百分比 | P0 |
| 分类统计 | 按花色分别统计收集数量 | P1 |
| 进度可视化 | 进度条展示收集进度 | P1 |

#### 3.1.3 视图与交互
| 功能 | 描述 | 优先级 |
|------|------|--------|
| 网格视图 | 以卡片网格形式展示所有牌（6列） | P0 |
| 筛选功能 | 按花色筛选、按收集状态筛选 | P1 |
| 搜索功能 | 按牌面名称搜索 | P2 |
| 排序功能 | 按花色、点数排序 | P2 |

#### 3.1.4 数据持久化
| 功能 | 描述 | 优先级 |
|------|------|--------|
| 自动保存 | 数据变更自动保存至本地 | P0 |
| 数据导出 | 导出收藏数据为JSON或CSV格式 | P2 |
| 数据导入 | 从JSON或CSV文件导入数据 | P2 |
| 数据重置 | 一键重置所有收集状态 | P2 |

### 3.2 非功能需求
| 需求 | 描述 |
|------|------|
| 离线运行 | 完全本地运行，无需网络 |
| 响应速度 | 界面操作响应时间 < 100ms |
| 安装体积 | 安装包 < 150MB |
| 数据安全 | 数据存储于用户目录，不联网上传 |


## 四、系统设计

### 4.1 整体架构
Electron应用由主进程（Main Process）和渲染进程（Renderer Process）组成，通过IPC通信进行交互。主进程负责窗口管理、应用生命周期和系统菜单；渲染进程负责UI渲染、用户交互和状态管理（Pinia）。数据持久化通过electron-store实现，数据以JSON格式存储在本地。

### 4.2 目录结构
poker-collection-tracker/
├── src/
│ ├── main/ # 主进程代码
│ │ ├── main.ts # 应用入口
│ │ ├── preload.ts # 预加载脚本
│ │ └── menu.ts # 应用菜单配置
│ ├── renderer/ # 渲染进程代码
│ │ ├── index.html # 主页面
│ │ ├── main.ts # 渲染进程入口
│ │ ├── App.vue # 根组件
│ │ ├── components/ # Vue组件
│ │ │ ├── CardGrid.vue # 卡片网格
│ │ │ ├── CardItem.vue # 单张卡片
│ │ │ ├── Statistics.vue # 统计面板
│ │ │ ├── FilterBar.vue # 筛选栏
│ │ │ └── Header.vue # 顶部导航
│ │ ├── stores/ # Pinia状态管理
│ │ │ └── collection.ts # 收藏数据store
│ │ ├── types/ # TypeScript类型定义
│ │ │ └── card.ts # 卡片数据类型
│ │ ├── utils/ # 工具函数
│ │ │ └── cardData.ts # 卡片数据生成
│ │ └── assets/ # 静态资源
│ │ ├── styles/ # 全局样式
│ │ └── icons/ # 图标资源
│ └── shared/ # 共享代码
│ └── constants.ts # 常量定义
├── resources/ # 资源文件
│ ├── icons/ # 应用图标
│ └── installer/ # 安装脚本
│ └── installer.nsh # NSIS自定义脚本
├── build/ # 构建输出
├── release/ # 打包输出
├── package.json
├── tsconfig.json
├── vite.config.ts # Vite配置
├── forge.config.ts # Electron Forge配置
└── README.md

text

### 4.3 数据模型

#### Card 接口
```typescript
// src/renderer/types/card.ts

export type Suit = 'spade' | 'heart' | 'diamond' | 'club' | 'joker';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  id: string;                     // 唯一标识，如 'spade_A'
  suit: Suit;                     // 花色
  rank: Rank;                     // 点数
  displayName: string;            // 显示名称，如 'A♠'
  isCollected: boolean;           // 是否已收集
  note?: string;                  // 备注
  collectedAt?: string;           // 收集时间 ISO 8601
}

export interface CollectionStats {
  total: number;                  // 总卡片数 (54)
  collected: number;              // 已收集数
  percentage: number;             // 收集百分比
  bySuit: {
    [key in Suit]: {
      total: number;
      collected: number;
    };
  };
}
存储数据结构 (JSON)
json
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
4.4 卡片数据集生成
typescript
// src/renderer/utils/cardData.ts

const SUITS = ['spade', 'heart', 'diamond', 'club'] as const;
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
const SUIT_SYMBOLS = { spade: '♠', heart: '♥', diamond: '♦', club: '♣' };

export function generateDeck(): Card[] {
  const cards: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({
        id: `${suit}_${rank}`,
        suit,
        rank,
        displayName: `${rank}${SUIT_SYMBOLS[suit]}`,
        isCollected: false,
      });
    }
  }
  cards.push({
    id: 'joker_big',
    suit: 'joker',
    rank: 'JOKER',
    displayName: '🃏大王',
    isCollected: false,
  });
  cards.push({
    id: 'joker_small',
    suit: 'joker',
    rank: 'JOKER',
    displayName: '🃏小王',
    isCollected: false,
  });
  return cards;
}
4.5 IPC通信设计
typescript
// src/main/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getCards: () => ipcRenderer.invoke('get-cards'),
  saveCards: (cards: Card[]) => ipcRenderer.invoke('save-cards', cards),
  updateCard: (cardId: string, data: Partial<Card>) => 
    ipcRenderer.invoke('update-card', cardId, data),
  resetCollection: () => ipcRenderer.invoke('reset-collection'),
  getStats: () => ipcRenderer.invoke('get-stats'),
  exportData: () => ipcRenderer.invoke('export-data'),
  importData: (filePath: string) => ipcRenderer.invoke('import-data', filePath),
});
五、UI/UX设计
5.1 设计原则
简洁美观：干净整洁的视觉风格，柔和的色彩搭配

一目了然：卡片状态通过颜色/图标直观区分

操作便捷：点击即切换收集状态，无需复杂操作

5.2 界面布局说明
顶部导航栏：应用标题，右侧显示统计按钮和重置按钮

统计面板：显示总进度条，按花色显示收集数量（如 ♠ 10/13）

筛选栏：全部、黑桃、红心、方块、梅花、王，以及搜索框

卡片网格：6列网格展示卡片，卡片显示牌面和收集状态标记

底部状态栏：总张数、已收集张数、收集进度百分比

5.3 色彩方案
用途	颜色	色值
主色	深蓝	#1a2332
背景	浅灰	#f5f6fa
卡片-未收集	白色	#ffffff
卡片-已收集	淡绿	#e8f5e9
卡片-悬停	淡蓝	#e3f2fd
黑桃/梅花	黑色	#2d3436
红心/方块	红色	#e74c3c
大王	金色	#f39c12
小王	银色	#bdc3c7
边框	浅灰	#dfe6e9
5.4 交互设计
交互	反馈
点击卡片	切换收集状态，卡片背景色变化，动画过渡
悬停卡片	轻微上浮阴影效果
点击筛选标签	高亮选中标签，卡片网格过滤刷新
点击重置	弹出确认对话框，防止误操作
数据变更	自动保存，右下角显示"已保存"提示
六、开发实施计划
6.1 开发环境配置
系统要求

Windows 10/11（开发与运行环境）

Node.js ≥ v18.0.0

npm ≥ v9.0.0 或 yarn ≥ v1.22.0

项目初始化命令

bash
npx create-electron-app@latest poker-collection-tracker --template=vite-typescript
cd poker-collection-tracker
npm install
npm install electron-store
npm install vue@3.4.0 pinia
npm install -D @vitejs/plugin-vue
npm run start
6.2 开发阶段划分
阶段	周期	内容
阶段一：项目搭建	第1周	项目初始化、目录结构、开发环境配置
阶段二：数据层	第1-2周	卡片数据模型、electron-store配置、数据读写API
阶段三：UI开发	第2-4周	卡片网格、统计面板、筛选栏、交互逻辑
阶段四：功能完善	第4-5周	备注功能、数据导入导出、重置功能
阶段五：测试与打包	第5-6周	功能测试、性能优化、安装包制作
6.3 关键代码示例
Pinia Store (状态管理)
typescript
// src/renderer/stores/collection.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Card, CollectionStats } from '../types/card';
import { generateDeck } from '../utils/cardData';

export const useCollectionStore = defineStore('collection', () => {
  const cards = ref<Card[]>([]);
  const loading = ref(false);

  const loadCards = async () => {
    loading.value = true;
    try {
      const data = await window.electronAPI.getCards();
      cards.value = data.length ? data : generateDeck();
    } catch (error) {
      console.error('加载数据失败:', error);
      cards.value = generateDeck();
    } finally {
      loading.value = false;
    }
  };

  const toggleCollect = async (cardId: string) => {
    const card = cards.value.find(c => c.id === cardId);
    if (card) {
      card.isCollected = !card.isCollected;
      card.collectedAt = card.isCollected ? new Date().toISOString() : undefined;
      await window.electronAPI.updateCard(cardId, {
        isCollected: card.isCollected,
        collectedAt: card.collectedAt,
      });
    }
  };

  const stats = computed<CollectionStats>(() => {
    const total = cards.value.length;
    const collected = cards.value.filter(c => c.isCollected).length;
    return {
      total,
      collected,
      percentage: total ? Math.round((collected / total) * 100) : 0,
      bySuit: {
        spade: { total: 13, collected: cards.value.filter(c => c.suit === 'spade' && c.isCollected).length },
        heart: { total: 13, collected: cards.value.filter(c => c.suit === 'heart' && c.isCollected).length },
        diamond: { total: 13, collected: cards.value.filter(c => c.suit === 'diamond' && c.isCollected).length },
        club: { total: 13, collected: cards.value.filter(c => c.suit === 'club' && c.isCollected).length },
        joker: { total: 2, collected: cards.value.filter(c => c.suit === 'joker' && c.isCollected).length },
      },
    };
  });

  return { cards, loading, loadCards, toggleCollect, stats };
});
App.vue (根组件)
vue
<!-- src/renderer/App.vue -->
<template>
  <div id="app">
    <Header />
    <Statistics :stats="store.stats" />
    <FilterBar @filter="applyFilter" @search="applySearch" />
    <CardGrid :cards="filteredCards" @toggle="store.toggleCollect" />
    <StatusBar :stats="store.stats" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCollectionStore } from './stores/collection';
import Header from './components/Header.vue';
import Statistics from './components/Statistics.vue';
import FilterBar from './components/FilterBar.vue';
import CardGrid from './components/CardGrid.vue';
import StatusBar from './components/StatusBar.vue';

const store = useCollectionStore();
const filterSuit = ref<string | null>(null);
const searchQuery = ref('');

const filteredCards = computed(() => {
  let result = store.cards;
  if (filterSuit.value) {
    result = result.filter(c => c.suit === filterSuit.value);
  }
  if (searchQuery.value) {
    result = result.filter(c => c.displayName.includes(searchQuery.value));
  }
  return result;
});

const applyFilter = (suit: string | null) => {
  filterSuit.value = suit;
};

const applySearch = (query: string) => {
  searchQuery.value = query;
};

onMounted(() => {
  store.loadCards();
});
</script>
main.ts (主进程)
typescript
// src/main/main.ts
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import Store from 'electron-store';
import { Card } from '../renderer/types/card';
import { generateDeck } from '../renderer/utils/cardData';

const store = new Store({
  name: 'collection-data',
  defaults: {
    cards: generateDeck(),
    version: '1.0.0',
  },
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../../resources/icons/icon.ico'),
  });
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC 处理
ipcMain.handle('get-cards', () => {
  return store.get('cards');
});

ipcMain.handle('update-card', (event, cardId: string, data: Partial<Card>) => {
  const cards = store.get('cards') as Card[];
  const index = cards.findIndex(c => c.id === cardId);
  if (index !== -1) {
    cards[index] = { ...cards[index], ...data };
    store.set('cards', cards);
    store.set('updatedAt', new Date().toISOString());
    return cards[index];
  }
  return null;
});

ipcMain.handle('reset-collection', () => {
  const cards = generateDeck();
  store.set('cards', cards);
  store.set('updatedAt', new Date().toISOString());
  return cards;
});

ipcMain.handle('export-data', async () => {
  const result = await dialog.showSaveDialog({
    title: '导出收藏数据',
    defaultPath: `poker-collection-${new Date().toISOString().slice(0,10)}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (!result.canceled && result.filePath) {
    const data = store.store;
    require('fs').writeFileSync(result.filePath, JSON.stringify(data, null, 2));
    return result.filePath;
  }
  return null;
});
6.4 打包与安装配置
Electron Forge 配置 (forge.config.ts)
typescript
import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { VitePlugin } from '@electron-forge/plugin-vite';

const config: ForgeConfig = {
  packagerConfig: {
    icon: './resources/icons/icon',
    name: 'PokerCollectionTracker',
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'PokerCollectionTracker',
      setupIcon: './resources/icons/icon.ico',
      iconUrl: 'https://example.com/icon.ico',
    }),
    new MakerZIP({}, ['win32']),
  ],
  plugins: [
    new VitePlugin({
      build: [
        { entry: 'src/main/main.ts', config: 'vite.main.config.ts' },
        { entry: 'src/main/preload.ts', config: 'vite.preload.config.ts' },
        { entry: 'src/renderer/index.html', config: 'vite.renderer.config.ts' },
      ],
    }),
  ],
};

export default config;
NSIS自定义脚本 (build/installer.nsh) 支持自定义安装路径
nsh
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Header\orange.bmp"
!define MUI_PAGE_CUSTOMFUNCTION_LEAVE "ValidateInstallDir"
!define MUI_DIRECTORYPAGE_TEXT_TOP "选择安装目录"
!define MUI_DIRECTORYPAGE_TEXT_DESTINATION "目标文件夹"

InstallDir "$PROGRAMFILES\PokerCollectionTracker"

Function ValidateInstallDir
  ${If} $INSTDIR == ""
    MessageBox MB_OK|MB_ICONEXCLAMATION "请选择有效的安装目录"
    Abort
  ${EndIf}
FunctionEnd
package.json 中的构建配置片段
json
"build": {
  "win": {
    "target": "nsis",
    "icon": "resources/icons/icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "perMachine": true,
    "allowToChangeInstallationDirectory": true,
    "include": "build/installer.nsh"
  }
}
构建安装包命令
bash
npm run make          # 使用 Electron Forge
# 或
npm run dist          # 若使用 electron-builder
生成的安装包位于 out/make/ 或 release/ 目录。

七、测试计划
7.1 单元测试
测试对象	框架	覆盖内容
数据模型	Vitest	卡片数据生成、数据验证
Store逻辑	Vitest	状态变更、计算属性
工具函数	Vitest	统计计算、数据转换
7.2 集成测试
测试场景	验证内容
数据持久化	数据变更后重启应用数据是否保留
IPC通信	主进程与渲染进程通信是否正常
导入导出	数据导出后再导入是否完整
7.3 UI测试
测试场景	验证内容
卡片点击	点击卡片是否正确切换状态
筛选功能	各筛选条件是否正确过滤卡片
统计更新	数据变更后统计是否实时更新
响应式	窗口缩放时界面是否自适应
7.4 兼容性测试
Windows 10 21H2+

Windows 11 22H2+

屏幕分辨率：1366×768 及以上

八、部署与发布
8.1 安装包分发
生成 Windows 安装程序 (.exe)

安装包支持用户自定义安装路径

提供桌面快捷方式和开始菜单入口

8.2 版本管理
遵循语义化版本规范 (SemVer)：

主版本号：重大功能变更或不兼容的API修改

次版本号：新功能添加，向下兼容

补丁版本号：Bug修复

8.3 发布检查清单
□ 所有功能测试通过
□ 安装包在纯净Windows环境下测试通过
□ 自定义安装路径功能正常
□ 应用图标正确显示
□ 应用名称和版本号正确
□ 数据迁移方案（如有版本升级）
九、风险与应对
风险	影响	应对措施
Electron 安装包体积过大	用户体验差	使用压缩优化，排除不必要的依赖
数据文件损坏	用户数据丢失	实现数据备份机制，启动时验证数据完整性
Node.js 版本兼容性	开发环境问题	使用 .nvmrc 锁定版本，文档明确版本要求
Windows 权限问题	安装失败	安装程序请求管理员权限，提供便携版选项
十、附录
10.1 完整依赖清单 (package.json)
json
{
  "name": "poker-collection-tracker",
  "version": "1.0.0",
  "main": ".vite/build/main.js",
  "scripts": {
    "start": "electron-forge start",
    "make": "electron-forge make",
    "dist": "electron-builder"
  },
  "dependencies": {
    "electron-store": "^8.1.0",
    "vue": "^3.4.0",
    "pinia": "^2.1.0"
  },
  "devDependencies": {
    "@electron-forge/cli": "^7.3.0",
    "@electron-forge/maker-squirrel": "^7.3.0",
    "@electron-forge/maker-zip": "^7.3.0",
    "@electron-forge/plugin-vite": "^7.3.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "electron": "^28.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "electron-builder": "^24.9.1"
  }
}