// electron-store 封装 - 本地 JSON 持久化
import Store from 'electron-store'
import type { Card, CollectionData } from '../shared/types'
import { generateDeck } from '../shared/cardData'

const store = new Store<CollectionData>({
  name: 'collection-data',
  defaults: {
    cards: generateDeck(),
    version: '1.0.0',
    updatedAt: new Date().toISOString()
  }
})

/** 校验卡片数组是否合法（54 张、id 唯一） */
function validateCards(cards: unknown): cards is Card[] {
  if (!Array.isArray(cards)) return false
  if (cards.length === 0) return false
  const ids = new Set<string>()
  for (const c of cards) {
    if (!c || typeof c !== 'object') return false
    if (typeof c.id !== 'string' || typeof c.suit !== 'string') return false
    if (typeof c.isCollected !== 'boolean') return false
    if (ids.has(c.id)) return false
    ids.add(c.id)
  }
  return true
}

export function getCards(): Card[] {
  const cards = store.get('cards')
  if (validateCards(cards)) return cards
  // 数据损坏时重置为默认
  const fresh = generateDeck()
  store.set('cards', fresh)
  return fresh
}

export function saveCards(cards: Card[]): void {
  store.set('cards', cards)
  store.set('updatedAt', new Date().toISOString())
}

export function updateCard(cardId: string, data: Partial<Card>): Card | null {
  const cards = getCards()
  const index = cards.findIndex((c) => c.id === cardId)
  if (index === -1) return null
  cards[index] = { ...cards[index], ...data }
  store.set('cards', cards)
  store.set('updatedAt', new Date().toISOString())
  return cards[index]
}

export function resetCollection(): Card[] {
  const fresh = generateDeck()
  store.set('cards', fresh)
  store.set('updatedAt', new Date().toISOString())
  return fresh
}

export function getStore(): CollectionData {
  return store.store
}

export default store
