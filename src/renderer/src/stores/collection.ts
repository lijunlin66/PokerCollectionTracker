// 收藏数据 store - 状态管理 + IPC 持久化
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Card, CollectionStats, ExportFormat, Suit } from '@shared/types'
import {
  generateDeck,
  SUIT_ORDER,
  RANK_ORDER,
  jokerSortWeight
} from '@shared/cardData'

export type FilterSuit = Suit | 'all'
export type FilterStatus = 'all' | 'collected' | 'uncollected'
export type SortBy = 'default' | 'suitRank' | 'rankSuit' | 'collected'

export const useCollectionStore = defineStore('collection', () => {
  // ===== 状态 =====
  const cards = ref<Card[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const lastSavedAt = ref<string | null>(null)

  // UI 状态
  const filterSuit = ref<FilterSuit>('all')
  const filterStatus = ref<FilterStatus>('all')
  const searchQuery = ref('')
  const sortBy = ref<SortBy>('default')

  // ===== Actions =====

  /** 加载卡片数据 */
  async function loadCards(): Promise<void> {
    loading.value = true
    try {
      const data = await window.electronAPI.getCards()
      cards.value = data && data.length > 0 ? data : generateDeck()
    } catch (err) {
      console.error('加载数据失败:', err)
      cards.value = generateDeck()
    } finally {
      loading.value = false
    }
  }

  /** 切换单卡收集状态 */
  async function toggleCollect(cardId: string): Promise<void> {
    const card = cards.value.find((c) => c.id === cardId)
    if (!card) return
    card.isCollected = !card.isCollected
    card.collectedAt = card.isCollected ? new Date().toISOString() : undefined
    await markSaving()
    try {
      await window.electronAPI.updateCard(cardId, {
        isCollected: card.isCollected,
        collectedAt: card.collectedAt
      })
      lastSavedAt.value = new Date().toISOString()
    } catch (err) {
      console.error('保存失败:', err)
    } finally {
      saving.value = false
    }
  }

  /** 设置单卡收集状态（用于批量） */
  async function setCollected(cardId: string, isCollected: boolean): Promise<void> {
    const card = cards.value.find((c) => c.id === cardId)
    if (!card || card.isCollected === isCollected) return
    card.isCollected = isCollected
    card.collectedAt = isCollected ? new Date().toISOString() : undefined
  }

  /** 更新单卡备注 */
  async function updateNote(cardId: string, note: string): Promise<void> {
    const card = cards.value.find((c) => c.id === cardId)
    if (!card) return
    card.note = note.trim() || undefined
    await markSaving()
    try {
      await window.electronAPI.updateCard(cardId, { note: card.note })
      lastSavedAt.value = new Date().toISOString()
    } catch (err) {
      console.error('保存备注失败:', err)
    } finally {
      saving.value = false
    }
  }

  /** 批量标记：按花色或全部 */
  async function batchMark(
    target: FilterSuit,
    isCollected: boolean
  ): Promise<void> {
    const targets =
      target === 'all'
        ? cards.value
        : cards.value.filter((c) => c.suit === target)
    const now = new Date().toISOString()
    targets.forEach((c) => {
      c.isCollected = isCollected
      c.collectedAt = isCollected ? now : undefined
    })
    await markSaving()
    try {
      await window.electronAPI.saveCards(cards.value)
      lastSavedAt.value = now
    } catch (err) {
      console.error('批量保存失败:', err)
    } finally {
      saving.value = false
    }
  }

  /** 重置全部收集状态 */
  async function resetCollection(): Promise<void> {
    try {
      const fresh = await window.electronAPI.resetCollection()
      cards.value = fresh
      lastSavedAt.value = new Date().toISOString()
    } catch (err) {
      console.error('重置失败:', err)
    }
  }

  /** 批量标记当前 filteredCards 中的所有牌（对应当前筛选+搜索条件） */
  async function batchMarkFiltered(isCollected: boolean): Promise<void> {
    const ids = new Set(filteredCards.value.map((c) => c.id))
    const now = new Date().toISOString()
    cards.value.forEach((c) => {
      if (ids.has(c.id)) {
        c.isCollected = isCollected
        c.collectedAt = isCollected ? now : undefined
      }
    })
    await markSaving()
    try {
      await window.electronAPI.saveCards(cards.value)
      lastSavedAt.value = now
    } catch (err) {
      console.error('批量保存失败:', err)
    } finally {
      saving.value = false
    }
  }

  /** 导出数据 */
  async function exportData(format: ExportFormat): Promise<string | null> {
    return await window.electronAPI.exportData(format)
  }

  /** 导入数据 */
  async function importData(): Promise<boolean> {
    const merged = await window.electronAPI.importData()
    if (merged && merged.length > 0) {
      cards.value = merged
      lastSavedAt.value = new Date().toISOString()
      return true
    }
    return false
  }

  async function markSaving(): Promise<void> {
    saving.value = true
  }

  // ===== Getters =====

  /** 统计信息 */
  const stats = computed<CollectionStats>(() => {
    const total = cards.value.length
    const collected = cards.value.filter((c) => c.isCollected).length
    const bySuit: CollectionStats['bySuit'] = {
      spade: { total: 13, collected: 0 },
      heart: { total: 13, collected: 0 },
      diamond: { total: 13, collected: 0 },
      club: { total: 13, collected: 0 },
      joker: { total: 2, collected: 0 }
    }
    for (const c of cards.value) {
      if (c.isCollected) bySuit[c.suit].collected++
    }
    return {
      total,
      collected,
      percentage: total ? Math.round((collected / total) * 100) : 0,
      bySuit
    }
  })

  /** 应用筛选 + 搜索 + 排序后的卡片 */
  const filteredCards = computed<Card[]>(() => {
    let result = cards.value.slice()

    if (filterSuit.value !== 'all') {
      result = result.filter((c) => c.suit === filterSuit.value)
    }

    if (filterStatus.value === 'collected') {
      result = result.filter((c) => c.isCollected)
    } else if (filterStatus.value === 'uncollected') {
      result = result.filter((c) => !c.isCollected)
    }

    const q = searchQuery.value.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (c) =>
          c.displayName.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          (c.note ?? '').toLowerCase().includes(q)
      )
    }

    switch (sortBy.value) {
      case 'suitRank':
        result.sort(
          (a, b) =>
            SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit] ||
            RANK_ORDER[a.rank] - RANK_ORDER[b.rank] ||
            jokerSortWeight(a.id) - jokerSortWeight(b.id)
        )
        break
      case 'rankSuit':
        result.sort(
          (a, b) =>
            RANK_ORDER[a.rank] - RANK_ORDER[b.rank] ||
            SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit]
        )
        break
      case 'collected':
        result.sort((a, b) => {
          if (a.isCollected === b.isCollected) return 0
          return a.isCollected ? -1 : 1
        })
        break
      case 'default':
      default:
        // 保持默认顺序（generateDeck 的顺序）
        break
    }
    return result
  })

  /** 单卡备注查找 */
  function getCardById(id: string): Card | undefined {
    return cards.value.find((c) => c.id === id)
  }

  return {
    // state
    cards,
    loading,
    saving,
    lastSavedAt,
    filterSuit,
    filterStatus,
    searchQuery,
    sortBy,
    // getters
    stats,
    filteredCards,
    // actions
    loadCards,
    toggleCollect,
    setCollected,
    updateNote,
    batchMark,
    batchMarkFiltered,
    resetCollection,
    exportData,
    importData,
    getCardById
  }
})
