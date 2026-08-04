<template>
  <section class="filter-bar">
    <div class="suit-tabs">
      <button
        v-for="tab in suitTabs"
        :key="tab.value"
        class="suit-tab"
        :class="{ active: store.filterSuit === tab.value }"
        @click="store.filterSuit = tab.value"
      >
        <span class="tab-symbol" :style="{ color: tab.color }">{{ tab.symbol }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <div class="filter-right">
      <div class="status-group">
        <button
          v-for="opt in statusOptions"
          :key="opt.value"
          class="status-tab"
          :class="{ active: store.filterStatus === opt.value }"
          @click="store.filterStatus = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>

      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="store.searchQuery"
          type="text"
          placeholder="搜索牌面 / 备注..."
          class="search-input"
        />
        <button v-if="store.searchQuery" class="clear-btn" @click="store.searchQuery = ''">
          ✕
        </button>
      </div>

      <select v-model="store.sortBy" class="sort-select" title="排序方式">
        <option value="default">默认顺序</option>
        <option value="suitRank">花色→点数</option>
        <option value="rankSuit">点数→花色</option>
        <option value="collected">已收集优先</option>
      </select>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useCollectionStore } from '../stores/collection'
import type { Suit } from '@shared/types'

const store = useCollectionStore()

const suitColorMap: Record<Suit | 'all', string> = {
  all: 'var(--color-primary)',
  spade: 'var(--color-spade)',
  heart: 'var(--color-heart)',
  diamond: 'var(--color-diamond)',
  club: 'var(--color-club)',
  joker: 'var(--color-joker-big)'
}

const suitTabs = [
  { value: 'all', label: '全部', symbol: '☰', color: suitColorMap.all },
  { value: 'spade', label: '黑桃', symbol: '♠', color: suitColorMap.spade },
  { value: 'heart', label: '红心', symbol: '♥', color: suitColorMap.heart },
  { value: 'diamond', label: '方块', symbol: '♦', color: suitColorMap.diamond },
  { value: 'club', label: '梅花', symbol: '♣', color: suitColorMap.club },
  { value: 'joker', label: '王', symbol: '🃏', color: suitColorMap.joker }
] as const

const statusOptions = [
  { value: 'all', label: '全部' },
  { value: 'collected', label: '已收集' },
  { value: 'uncollected', label: '未收集' }
] as const
</script>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #fff;
  border-bottom: 1px solid var(--color-border);
  gap: 16px;
  flex-wrap: wrap;
}
.suit-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.suit-tab {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 16px;
  background: var(--color-bg);
  font-size: 13px;
  color: var(--color-text-secondary);
  border: 1px solid transparent;
}
.suit-tab:hover {
  background: var(--color-card-hover);
}
.suit-tab.active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
.suit-tab.active .tab-symbol {
  color: #fff !important;
}
.tab-symbol {
  font-size: 14px;
  font-weight: bold;
}
.filter-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.status-group {
  display: flex;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.status-tab {
  padding: 6px 12px;
  font-size: 12px;
  background: #fff;
  color: var(--color-text-secondary);
  border-right: 1px solid var(--color-border);
}
.status-tab:last-child {
  border-right: none;
}
.status-tab.active {
  background: var(--color-accent);
  color: #fff;
}
.search-box {
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 8px;
  font-size: 12px;
  opacity: 0.6;
}
.search-input {
  padding: 6px 26px 6px 26px;
  width: 180px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
}
.search-input:focus {
  border-color: var(--color-accent);
}
.clear-btn {
  position: absolute;
  right: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
  padding: 2px;
}
.clear-btn:hover {
  color: var(--color-danger);
}
.sort-select {
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: #fff;
  outline: none;
}
.sort-select:focus {
  border-color: var(--color-accent);
}
</style>
