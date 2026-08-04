<template>
  <header class="app-header">
    <div class="header-title">
      <span class="logo">🃏</span>
      <div>
        <h1>扑克牌收藏追踪器</h1>
        <p class="subtitle">记录你的 54 张扑克牌收集进度</p>
      </div>
    </div>

    <div class="header-actions">
      <div class="batch-group">
        <span class="batch-hint" :title="'当前批量作用范围：' + currentFilterLabel">
          批量 · {{ currentFilterLabel }}
        </span>
        <button class="btn btn-sm" @click="$emit('batch-mark', { collected: true })">
          标记已收集
        </button>
        <button class="btn btn-sm" @click="$emit('batch-mark', { collected: false })">
          标记未收集
        </button>
      </div>

      <div class="divider"></div>

      <button class="btn btn-sm" @click="$emit('export-json')">导出 JSON</button>
      <button class="btn btn-sm" @click="$emit('export-csv')">导出 CSV</button>
      <button class="btn btn-sm" @click="$emit('import')">导入</button>
      <button class="btn btn-sm btn-subtle" title="打开收藏数据保存目录" @click="$emit('open-data-dir')">
        📂 打开数据目录
      </button>
      <div class="divider"></div>
      <button class="btn btn-sm btn-danger" @click="$emit('reset')">重置</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCollectionStore } from '../stores/collection'
import { SUIT_SYMBOLS, SUIT_NAMES } from '@shared/cardData'

defineEmits<{
  (e: 'export-json'): void
  (e: 'export-csv'): void
  (e: 'import'): void
  (e: 'reset'): void
  (e: 'batch-mark', payload: { collected: boolean }): void
  (e: 'open-data-dir'): void
}>()

const store = useCollectionStore()

/** 批量操作范围提示：结合 FilterBar 中的 filterSuit + filterStatus */
const currentFilterLabel = computed(() => {
  const parts: string[] = []
  if (store.filterSuit === 'all') {
    parts.push('全部花色')
  } else {
    parts.push(
      `${SUIT_SYMBOLS[store.filterSuit]}${SUIT_NAMES[store.filterSuit]}`
    )
  }
  if (store.filterStatus === 'collected') parts.push('已收集')
  else if (store.filterStatus === 'uncollected') parts.push('未收集')
  return parts.join(' · ')
})
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: var(--color-primary);
  color: #fff;
  flex-wrap: wrap;
  gap: 12px;
}
.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo {
  font-size: 32px;
  line-height: 1;
}
.header-title h1 {
  font-size: 18px;
  font-weight: 600;
}
.subtitle {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 2px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.batch-group {
  display: flex;
  align-items: center;
  gap: 6px;
}
.batch-hint {
  font-size: 12px;
  opacity: 0.7;
  margin-right: 2px;
  white-space: nowrap;
}
.divider {
  width: 1px;
  height: 22px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 4px;
}
.header-actions .btn {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  color: #fff;
}
.header-actions .btn:hover {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.4);
}
.header-actions .btn-danger {
  background: rgba(231, 76, 60, 0.25);
  border-color: rgba(231, 76, 60, 0.6);
}
.header-actions .btn-danger:hover {
  background: var(--color-danger);
}
.header-actions .btn-subtle {
  background: rgba(52, 152, 219, 0.18);
  border-color: rgba(52, 152, 219, 0.45);
  color: #fff;
}
.header-actions .btn-subtle:hover {
  background: rgba(52, 152, 219, 0.35);
  border-color: rgba(52, 152, 219, 0.7);
}
</style>
