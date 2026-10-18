<template>
  <div id="app">
    <AppHeader
      @export-json="onExport('json')"
      @export-csv="onExport('csv')"
      @import="onImport"
      @reset="onResetClick"
      @batch-mark="onBatchMark"
      @open-data-dir="onOpenDataDir"
    />

    <StatisticsPanel :stats="store.stats" />

    <FilterBar />

    <div v-if="store.error" class="app-error" role="alert">
      <span>{{ store.error }}</span>
      <button class="btn btn-sm" @click="store.loadCards">重新加载</button>
    </div>

    <main class="app-main">
      <div v-if="store.loading" class="app-loading">加载中...</div>
      <CardGrid
        v-else
        :cards="store.filteredCards"
        @toggle="store.toggleCollect"
        @edit-note="onEditNote"
      />
      <div v-if="!store.loading && store.filteredCards.length === 0" class="app-empty">
        没有匹配的卡片
      </div>
    </main>

    <StatusBar :stats="store.stats" />

    <SaveIndicator :show="store.saving" :saved-at="store.lastSavedAt" :error="store.error" />

    <NoteDialog
      v-if="noteTarget"
      :card="noteTarget"
      :saving="store.saving"
      :error="store.error"
      @save="onNoteSave"
      @close="noteTarget = null"
    />

    <ConfirmDialog
      v-if="confirmState"
      :title="confirmState.title"
      :message="confirmState.message"
      :confirm-text="confirmState.confirmText"
      :cancel-text="confirmState.cancelText"
      :show-cancel="confirmState.showCancel"
      :secondary-text="confirmState.secondaryText"
      :icon="confirmState.icon"
      :danger="confirmState.danger"
      @confirm="onConfirm"
      @secondary="confirmState?.onSecondary?.()"
      @cancel="confirmState?.onCancel?.(); confirmState = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCollectionStore } from './stores/collection'
import type { Card, ExportFormat } from '@shared/types'
import AppHeader from './components/AppHeader.vue'
import StatisticsPanel from './components/StatisticsPanel.vue'
import FilterBar from './components/FilterBar.vue'
import CardGrid from './components/CardGrid.vue'
import StatusBar from './components/StatusBar.vue'
import SaveIndicator from './components/SaveIndicator.vue'
import NoteDialog from './components/NoteDialog.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'

const store = useCollectionStore()

const noteTarget = ref<Card | null>(null)

interface ConfirmState {
  title: string
  message: string
  confirmText: string
  danger: boolean
  onConfirm: () => void
  cancelText?: string
  showCancel?: boolean
  onCancel?: () => void
  secondaryText?: string
  onSecondary?: () => void
  closeOnConfirm?: boolean
  icon?: string
}
const confirmState = ref<ConfirmState | null>(null)

function onConfirm(): void {
  const state = confirmState.value
  if (!state) return
  if (state.closeOnConfirm !== false) confirmState.value = null
  state.onConfirm()
}

onMounted(() => {
  store.loadCards()
})

async function onExport(format: ExportFormat): Promise<void> {
  const path = await store.exportData(format)
  if (path) {
    confirmState.value = {
      title: '导出成功',
      message: `数据已导出到：\n${path}`,
      icon: '✅',
      confirmText: '好的',
      secondaryText: '打开文件所在目录',
      danger: false,
      closeOnConfirm: true,
      onConfirm: () => {},
      onSecondary: () => {
        window.electronAPI.openPath(path)
      }
    }
  }
}

async function onImport(): Promise<void> {
  confirmState.value = {
    title: '导入数据',
    message: '导入将用文件内容覆盖当前收集状态，是否继续？',
    confirmText: '继续导入',
    cancelText: '取消',
    showCancel: true,
    danger: true,
    onConfirm: async () => {
      const ok = await store.importData()
      if (ok) {
        confirmState.value = {
          title: '导入成功',
          message: '收藏数据已成功导入并更新。',
          icon: '✅',
          confirmText: '好的',
          danger: false,
          onConfirm: () => {}
        }
      }
    }
  }
}

function onResetClick(): void {
  confirmState.value = {
    title: '重置收藏',
    message: '此操作将清空所有收集状态与备注，且不可恢复。确定要重置吗？',
    confirmText: '确认重置',
    cancelText: '取消',
    showCancel: true,
    danger: true,
    onConfirm: () => {
      store.resetCollection()
    }
  }
}

function onBatchMark(payload: { collected: boolean }): void {
  const count = store.filteredCards.length
  const action = payload.collected ? '标记为已收集' : '标记为未收集'
  confirmState.value = {
    title: '批量操作',
    message: `当前筛选范围共 ${count} 张牌，确定全部${action}吗？`,
    confirmText: '确认',
    cancelText: '取消',
    showCancel: true,
    danger: false,
    onConfirm: () => {
      store.batchMarkFiltered(payload.collected)
    }
  }
}

/** 打开用户数据目录（collection-data.json 所在） */
async function onOpenDataDir(): Promise<void> {
  const errMsg = await window.electronAPI.openUserDataDir()
  if (errMsg) {
    confirmState.value = {
      title: '无法打开目录',
      message: errMsg,
      danger: true,
      confirmText: '好的',
      onConfirm: () => {}
    }
  }
}

function onEditNote(card: Card): void {
  noteTarget.value = card
}

async function onNoteSave(cardId: string, note: string): Promise<void> {
  if (await store.updateNote(cardId, note)) noteTarget.value = null
}
</script>

<style scoped>
.app-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 24px;
  background: #fff0ee;
  color: var(--color-danger);
}
.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}
.app-loading,
.app-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--color-text-secondary);
  font-size: 16px;
}
</style>
