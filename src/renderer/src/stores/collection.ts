// 收藏数据 store - 状态管理 + IPC 持久化
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Card, CollectionStats, ExportFormat, Suit } from '@shared/types'
import {
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
  const error = ref<string | null>(null)
  const loaded = ref(false)
  let queue: Promise<unknown> = Promise.resolve()
  let pendingWrites = 0

  // UI 状态
  const filterSuit = ref<FilterSuit>('all')
  const filterStatus = ref<FilterStatus>('all')
  const searchQuery = ref('')
  const sortBy = ref<SortBy>('default')

  // ===== Actions =====

  // 串行执行读写及文件对话框操作，提交成功后再更新 UI。
  // 后续操作即使在前一次失败后也能继续，且不会提交 Vue Proxy。
  function enqueue<T>(label: string, action: () => Promise<T>, fallback: T, writes = false): Promise<T> {
    if (writes) {
      pendingWrites++
      saving.value = true
    }
    const result = queue.then(async () => {
      error.value = null
      try {
        return await action()
      } catch (err) {
        error.value = label + '：' + (err instanceof Error ? err.message : String(err))
        return fallback
      } finally {
        if (writes) saving.value = --pendingWrites > 0
      }
    })
    queue = result
    return result
  }

  function requireLoaded(): void {
    if (!loaded.value) throw new Error('请先成功加载收藏数据')
  }

  async function loadCards(): Promise<void> {
    loading.value = true
    await enqueue('加载失败', async () => {
      loaded.value = false
      cards.value = await window.electronAPI.getCards()
      loaded.value = true
    }, undefined)
    loading.value = false
  }

  async function persistCard(cardId: string, data: Partial<Card>): Promise<void> {
    const updated = await window.electronAPI.updateCard(cardId, data)
    if (!updated) throw new Error('未找到需要保存的卡片')
    const index = cards.value.findIndex((card) => card.id === cardId)
    if (index >= 0) cards.value[index] = updated
    lastSavedAt.value = new Date().toISOString()
  }

  function toggleCollect(cardId: string): Promise<boolean> {
    return enqueue('保存失败', async () => {
      requireLoaded()
      const card = getCardById(cardId)
      if (!card) return false
      const isCollected = !card.isCollected
      await persistCard(cardId, {
        isCollected,
        collectedAt: isCollected ? new Date().toISOString() : undefined
      })
      return true
    }, false, true)
  }

  function setCollected(cardId: string, isCollected: boolean): Promise<boolean> {
    return markIds([cardId], isCollected)
  }

  function updateNote(cardId: string, note: string): Promise<boolean> {
    return enqueue('保存备注失败', async () => {
      requireLoaded()
      await persistCard(cardId, { note: note.trim() || undefined })
      return true
    }, false, true)
  }

  function markIds(cardIds: string[], isCollected: boolean): Promise<boolean> {
    const ids = new Set(cardIds)
    return enqueue('批量保存失败', async () => {
      requireLoaded()
      const now = new Date().toISOString()
      let changed = false
      const next = cards.value.map((card) => {
        // 浅拷贝得到只包含标量字段的普通对象，IPC 可进行结构化克隆。
        const copy = { ...card }
        if (ids.has(card.id) && card.isCollected !== isCollected) {
          copy.isCollected = isCollected
          copy.collectedAt = isCollected ? now : undefined
          changed = true
        }
        return copy
      })
      if (!changed) return true
      if (!await window.electronAPI.saveCards(next)) throw new Error('数据未写入')
      cards.value = next
      lastSavedAt.value = now
      return true
    }, false, true)
  }

  function batchMark(target: FilterSuit, isCollected: boolean): Promise<boolean> {
    return markIds(cards.value.filter((card) => target === 'all' || card.suit === target)
      .map((card) => card.id), isCollected)
  }

  function batchMarkFiltered(isCollected: boolean): Promise<boolean> {
    // 点击时固定筛选范围，避免等待保存期间筛选条件变化影响操作对象。
    return markIds(filteredCards.value.map((card) => card.id), isCollected)
  }

  function resetCollection(): Promise<boolean> {
    return enqueue('重置失败', async () => {
      cards.value = await window.electronAPI.resetCollection()
      loaded.value = true
      lastSavedAt.value = new Date().toISOString()
      return true
    }, false, true)
  }

  function exportData(format: ExportFormat): Promise<string | null> {
    return enqueue('导出失败', () => window.electronAPI.exportData(format), null)
  }

  function importData(): Promise<boolean> {
    return enqueue('导入失败', async () => {
      const merged = await window.electronAPI.importData()
      if (!merged) return false
      cards.value = merged
      loaded.value = true
      lastSavedAt.value = new Date().toISOString()
      return true
    }, false, true)
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
    error,
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
