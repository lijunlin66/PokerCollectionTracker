// electron-store 封装 - 本地 JSON 持久化
import Store from 'electron-store'
import type { Card, CollectionData } from '../shared/types'
import { generateDeck } from '../shared/cardData'
import { validateCards } from '../shared/collectionData'

let storage: Store<CollectionData> | undefined

function getStorage(): Store<CollectionData> {
  // 延迟到 IPC 请求时读取文件：JSON 损坏或无权限时仍能启动界面并显示错误。
  if (!storage) {
    storage = new Store<CollectionData>({
      name: 'collection-data',
      clearInvalidConfig: false,
      defaults: {
        cards: generateDeck(),
        version: '1.0.0',
        updatedAt: new Date().toISOString()
      }
    })
  }
  return storage
}

export function getCards(): Card[] {
  const cards = getStorage().get('cards')
  if (validateCards(cards)) return cards
  // 保留原文件以便恢复，不能在读取失败时静默清空收藏。
  throw new Error('收藏数据格式无效，请备份数据文件后修复或导入有效备份')
}

export function saveCards(cards: Card[]): void {
  if (!validateCards(cards)) throw new Error('收藏数据必须包含完整且有效的 54 张牌')
  getStorage().set({ cards, updatedAt: new Date().toISOString() })
}

export function updateCard(cardId: string, data: Partial<Card>): Card | null {
  const cards = getCards()
  const index = cards.findIndex((c) => c.id === cardId)
  if (index === -1) return null
  if (!data || typeof data !== 'object' || Array.isArray(data) ||
      Object.keys(data).some((key) => !['isCollected', 'note', 'collectedAt'].includes(key))) {
    throw new Error('只能修改收集状态、备注与收集时间')
  }
  cards[index] = { ...cards[index], ...data }
  if (!cards[index].isCollected) cards[index].collectedAt = undefined
  saveCards(cards)
  return cards[index]
}

export function resetCollection(): Card[] {
  const fresh = generateDeck()
  saveCards(fresh)
  return fresh
}

export function getStore(): CollectionData {
  return { ...getStorage().store, cards: getCards() }
}
