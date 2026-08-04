// 预加载脚本 - 通过 contextBridge 安全暴露 IPC API
import { contextBridge, ipcRenderer } from 'electron'
import type { Card, ExportFormat } from '../shared/types'

const electronAPI = {
  /** 读取全部卡片 */
  getCards: (): Promise<Card[]> => ipcRenderer.invoke('get-cards'),
  /** 全量保存卡片 */
  saveCards: (cards: Card[]): Promise<boolean> => ipcRenderer.invoke('save-cards', cards),
  /** 增量更新单张卡片 */
  updateCard: (cardId: string, data: Partial<Card>): Promise<Card | null> =>
    ipcRenderer.invoke('update-card', cardId, data),
  /** 重置所有收集状态 */
  resetCollection: (): Promise<Card[]> => ipcRenderer.invoke('reset-collection'),
  /** 导出数据（json/csv），返回保存路径或 null */
  exportData: (format: ExportFormat): Promise<string | null> =>
    ipcRenderer.invoke('export-data', format),
  /** 导入数据（json/csv），返回合并后的卡片数组或 null */
  importData: (): Promise<Card[] | null> => ipcRenderer.invoke('import-data'),
  /**
   * 在系统文件管理器中打开路径
   * - 若 pathOrFile 为空：打开应用数据存储目录（collection-data.json所在目录）
   * - 若传的是文件：在资源管理器中高亮选中该文件；失败则回退到打开所在目录
   * - 若传的是目录：直接打开目录
   * 返回空串表成功，非空为错误信息
   */
  openPath: (pathOrFile?: string): Promise<string> =>
    ipcRenderer.invoke('shell:open-path', pathOrFile),
  /** 打开应用用户数据目录（%APPDATA%下的Electron app userData） */
  openUserDataDir: (): Promise<string> => ipcRenderer.invoke('shell:open-user-data-dir')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (非隔离模式回退)
  window.electronAPI = electronAPI
}

export type ElectronAPI = typeof electronAPI
