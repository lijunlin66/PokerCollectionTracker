// 共享类型定义 - 同时被主进程与渲染进程使用

export type Suit = 'spade' | 'heart' | 'diamond' | 'club' | 'joker'
export type Rank =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'
  | 'JOKER'

export interface Card {
  /** 唯一标识，如 'spade_A' */
  id: string
  /** 花色 */
  suit: Suit
  /** 点数 */
  rank: Rank
  /** 显示名称，如 'A♠' */
  displayName: string
  /** 是否已收集 */
  isCollected: boolean
  /** 备注（品相、来源等） */
  note?: string
  /** 收集时间 ISO 8601 */
  collectedAt?: string
}

export interface SuitStat {
  total: number
  collected: number
}

export interface CollectionStats {
  /** 总卡片数 (54) */
  total: number
  /** 已收集数 */
  collected: number
  /** 收集百分比 0-100 */
  percentage: number
  /** 按花色统计 */
  bySuit: Record<Suit, SuitStat>
}

/** 持久化存储结构 */
export interface CollectionData {
  cards: Card[]
  version: string
  updatedAt: string
}

/** 导出文件格式 */
export type ExportFormat = 'json' | 'csv'
