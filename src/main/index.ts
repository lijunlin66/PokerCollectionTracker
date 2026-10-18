// 主进程入口 - 窗口管理 + IPC 处理
import { app, BrowserWindow, ipcMain, dialog, Menu, shell } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { getCards, saveCards, updateCard, resetCollection, getStore } from './store'
import { cardsToCsv, parseImport } from '../shared/collectionData'
import type { Card, ExportFormat } from '../shared/types'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    title: '扑克牌收藏追踪器',
    icon: join(__dirname, '../../resources/icon.ico'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  // 外链在系统浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // 开发环境加载 dev server，生产加载本地文件
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function createMenu(): void {
  const isMac = process.platform === 'darwin'
  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac
      ? ([{
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        }] as Electron.MenuItemConstructorOptions[])
      : []),
    {
      label: '文件',
      submenu: [isMac ? { role: 'close' } : { role: 'quit' }]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// ===== IPC 处理 =====

ipcMain.handle('get-cards', () => {
  return getCards()
})

ipcMain.handle('save-cards', (_event, cards: Card[]) => {
  saveCards(cards)
  return true
})

ipcMain.handle(
  'update-card',
  (_event, cardId: string, data: Partial<Card>) => {
    return updateCard(cardId, data)
  }
)

ipcMain.handle('reset-collection', () => {
  return resetCollection()
})

ipcMain.handle('export-data', async (_event, format: ExportFormat) => {
  const data = getStore()
  const cards = data.cards
  const dateStr = new Date().toISOString().slice(0, 10)

  if (format === 'csv') {
    const result = await dialog.showSaveDialog({
      title: '导出收藏数据 (CSV)',
      defaultPath: `poker-collection-${dateStr}.csv`,
      filters: [{ name: 'CSV', extensions: ['csv'] }]
    })
    if (result.canceled || !result.filePath) return null
    const csv = cardsToCsv(cards)
    writeFileSync(result.filePath, '\ufeff' + csv, 'utf-8') // BOM for Excel
    return result.filePath
  } else {
    const result = await dialog.showSaveDialog({
      title: '导出收藏数据 (JSON)',
      defaultPath: `poker-collection-${dateStr}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (result.canceled || !result.filePath) return null
    writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf-8')
    return result.filePath
  }
})

// 在系统文件管理器中打开目录（如指定文件则高亮选中该文件）
ipcMain.handle('shell:open-path', async (_event, pathOrFile: string | undefined) => {
  if (!pathOrFile) {
    // 打开 userData 目录（应用数据保存位置）
    return shell.openPath(app.getPath('userData'))
  }
  try {
    const fs = require('fs') as typeof import('fs')
    const path = require('path') as typeof import('path')
    const target = path.resolve(String(pathOrFile))
    let dirOrFile = target
    if (fs.existsSync(target) && fs.statSync(target).isFile()) {
      // 文件: 在资源管理器中显示并选中 (Windows)，否则回退到打开所在目录
      const dir = path.dirname(target)
      try {
        // showItemInFolder: 在文件夹中高亮选中
        shell.showItemInFolder(target)
        return '' // 空串表示成功
      } catch {
        dirOrFile = dir
      }
    }
    // shell.openPath 的 Promise 语义：返回空字符串表示成功，非空为错误信息
    return await shell.openPath(dirOrFile)
  } catch (err) {
    return err instanceof Error ? err.message : String(err)
  }
})

// 快速打开：应用数据目录 / 安装目录 / 指定文件所在目录
ipcMain.handle('shell:open-user-data-dir', async () => {
  return await shell.openPath(app.getPath('userData'))
})

ipcMain.handle('import-data', async () => {
  const result = await dialog.showOpenDialog({
    title: '导入收藏数据',
    properties: ['openFile'],
    filters: [
      { name: '数据文件', extensions: ['json', 'csv'] },
      { name: 'JSON', extensions: ['json'] },
      { name: 'CSV', extensions: ['csv'] }
    ]
  })
  if (result.canceled || result.filePaths.length === 0) return null
  const filePath = result.filePaths[0]
  const ext = filePath.toLowerCase().split('.').pop()

  try {
    const content = readFileSync(filePath, 'utf-8')
    const merged = parseImport(content, ext ?? '')
    saveCards(merged)
    return merged
  } catch (err) {
    dialog.showErrorBox(
      '导入失败',
      `无法解析文件：\n${filePath}\n\n错误：${err instanceof Error ? err.message : String(err)}`
    )
    return null
  }
})

// ===== 应用生命周期 =====

app.whenReady().then(() => {
  createMenu()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
